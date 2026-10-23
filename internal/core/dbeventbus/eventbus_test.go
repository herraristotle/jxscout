package dbeventbus

import (
	"context"
	"errors"
	"log/slog"
	"sync/atomic"
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestDB creates an in-memory DB and a context that is cancelled before
// the DB is closed, so the bus pollers stop cleanly instead of logging
// "database is closed" errors after the test returns.
func setupTestDB(t *testing.T) (*sqlx.DB, context.Context) {
	t.Helper()

	db, err := sqlx.Open("sqlite3", "file:testdb?memory=true&cache=shared&_busy_timeout=10000&_journal=WAL&_synchronous=NORMAL&_txlock=immediate")
	require.NoError(t, err)
	db.SetMaxOpenConns(1)

	ctx, cancel := context.WithCancel(context.Background())

	// Cleanups run LIFO: cancel first (stops pollers/workers), then close DB.
	t.Cleanup(func() {
		db.Close()
	})
	t.Cleanup(cancel)

	return db, ctx
}

func TestEventBus_BasicOperations(t *testing.T) {
	db, ctx := setupTestDB(t)
	bus, err := NewEventBus(db, slog.Default())
	require.NoError(t, err)

	t.Run("publish and subscribe single event", func(t *testing.T) {
		var receivedEvent atomic.Bool
		handler := func(context.Context, []byte) error {
			receivedEvent.Store(true)
			return nil
		}

		err := bus.Subscribe(ctx, "test_topic", "test_queue", handler, Options{
			Concurrency:       1,
			MaxRetries:        3,
			Backoff:           func(retry int) time.Duration { return time.Millisecond },
			PollInterval:      10 * time.Millisecond,
			HeartbeatInterval: time.Second,
		})
		require.NoError(t, err)

		require.NoError(t, bus.Publish(ctx, db, "test_topic", map[string]string{"test": "data"}))

		require.Eventually(t, receivedEvent.Load, 5*time.Second, 10*time.Millisecond)
	})

	t.Run("publish multiple events", func(t *testing.T) {
		var receivedCount atomic.Int64
		handler := func(context.Context, []byte) error {
			receivedCount.Add(1)
			return nil
		}

		err := bus.Subscribe(ctx, "multi_topic", "multi_queue", handler, Options{
			Concurrency:       1,
			MaxRetries:        3,
			Backoff:           func(retry int) time.Duration { return time.Millisecond },
			PollInterval:      10 * time.Millisecond,
			HeartbeatInterval: time.Second,
		})
		require.NoError(t, err)

		for i := 0; i < 5; i++ {
			require.NoError(t, bus.Publish(ctx, db, "multi_topic", map[string]int{"count": i}))
		}

		require.Eventually(t, func() bool {
			return receivedCount.Load() >= 5
		}, 10*time.Second, 20*time.Millisecond)
	})
}

func TestEventBus_ErrorHandling(t *testing.T) {
	db, ctx := setupTestDB(t)
	bus, err := NewEventBus(db, slog.Default())
	require.NoError(t, err)

	t.Run("retriable error handling", func(t *testing.T) {
		var attemptCount atomic.Int64
		handler := func(context.Context, []byte) error {
			attempt := attemptCount.Add(1)
			if attempt < 3 {
				return NewRetriableError(errors.New("temporary error"))
			}
			return nil
		}

		err := bus.Subscribe(ctx, "retry_topic", "retry_queue", handler, Options{
			Concurrency:       1,
			MaxRetries:        5,
			Backoff:           func(retry int) time.Duration { return time.Millisecond },
			PollInterval:      time.Second,
			HeartbeatInterval: time.Second,
		})
		require.NoError(t, err)

		require.NoError(t, bus.Publish(ctx, db, "retry_topic", map[string]string{"test": "data"}))

		require.Eventually(t, func() bool {
			return attemptCount.Load() >= 3
		}, 20*time.Second, 50*time.Millisecond)

		assert.Equal(t, int64(3), attemptCount.Load())
	})

	t.Run("non-retriable error handling", func(t *testing.T) {
		var attemptCount atomic.Int64
		handler := func(context.Context, []byte) error {
			attemptCount.Add(1)
			return errors.New("permanent error")
		}

		err := bus.Subscribe(ctx, "fail_topic", "fail_queue", handler, Options{
			Concurrency:       1,
			MaxRetries:        3,
			Backoff:           func(retry int) time.Duration { return time.Millisecond },
			PollInterval:      time.Second,
			HeartbeatInterval: time.Second,
		})
		require.NoError(t, err)

		require.NoError(t, bus.Publish(ctx, db, "fail_topic", map[string]string{"test": "data"}))

		require.Eventually(t, func() bool {
			return attemptCount.Load() >= 1
		}, 10*time.Second, 50*time.Millisecond)

		// Give the bus a chance to (incorrectly) retry a non-retriable error.
		time.Sleep(2 * time.Second)
		assert.Equal(t, int64(1), attemptCount.Load())
	})
}

func TestEventBus_Concurrency(t *testing.T) {
	db, ctx := setupTestDB(t)
	bus, err := NewEventBus(db, slog.Default())
	require.NoError(t, err)

	t.Run("multiple subscribers same topic", func(t *testing.T) {
		var subscriber1Count atomic.Int64
		var subscriber2Count atomic.Int64

		handler1 := func(context.Context, []byte) error {
			subscriber1Count.Add(1)
			return nil
		}
		handler2 := func(context.Context, []byte) error {
			subscriber2Count.Add(1)
			return nil
		}

		// HeartbeatInterval must stay well above SQLite's CURRENT_TIMESTAMP
		// granularity (1s), otherwise in-flight events look stale and get
		// reset to pending, causing repeated delivery.
		opts := Options{
			Concurrency:       2,
			MaxRetries:        3,
			Backoff:           func(retry int) time.Duration { return time.Millisecond },
			PollInterval:      10 * time.Millisecond,
			HeartbeatInterval: time.Second,
		}
		require.NoError(t, bus.Subscribe(ctx, "concurrent_topic", "queue1", handler1, opts))
		require.NoError(t, bus.Subscribe(ctx, "concurrent_topic", "queue2", handler2, opts))

		for i := 0; i < 10; i++ {
			require.NoError(t, bus.Publish(ctx, db, "concurrent_topic", map[string]int{"count": i}))
		}

		require.Eventually(t, func() bool {
			return subscriber1Count.Load() >= 10 && subscriber2Count.Load() >= 10
		}, 20*time.Second, 20*time.Millisecond)
	})

	t.Run("high concurrency processing", func(t *testing.T) {
		var processedCount atomic.Int64

		handler := func(context.Context, []byte) error {
			processedCount.Add(1)
			time.Sleep(10 * time.Millisecond)
			return nil
		}

		require.NoError(t, bus.Subscribe(ctx, "high_concurrency_topic", "high_concurrency_queue", handler, Options{
			Concurrency:       10,
			MaxRetries:        3,
			Backoff:           func(retry int) time.Duration { return time.Millisecond },
			PollInterval:      100 * time.Millisecond,
			HeartbeatInterval: 5 * time.Second,
		}))

		for i := 0; i < 50; i++ {
			require.NoError(t, bus.Publish(ctx, db, "high_concurrency_topic", map[string]int{"count": i}))
		}

		require.Eventually(t, func() bool {
			return processedCount.Load() >= 50
		}, 30*time.Second, 50*time.Millisecond)
	})
}
