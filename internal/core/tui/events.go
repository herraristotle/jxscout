package tui

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/francisconeves97/jxscout/internal/core/database"
	tea "github.com/charmbracelet/bubbletea"
)

// registerEventCommands adds the Pro v2 Events screen capabilities:
// list/filter events, inspect failures, retrigger single or bulk events.
func (t *TUI) registerEventCommands() {
	t.RegisterCommand(Command{
		Name:        "events",
		ShortName:   "ev",
		Description: "List pipeline events with filters (Pro v2 Events screen)",
		Usage:       "events [subscriber=<name>] [status=<pending|processing|completed|failed|retry>] [page=<n>] [page-size=<n>]",
		Execute: func(args []string) (tea.Cmd, error) {
			subscriber := ""
			status := ""
			page := 1
			pageSize := 20

			for _, arg := range args {
				key, value, ok := strings.Cut(arg, "=")
				if !ok {
					return nil, fmt.Errorf("invalid argument %q, expected key=value", arg)
				}
				switch key {
				case "subscriber":
					subscriber = value
				case "status":
					status = value
				case "page":
					n, err := strconv.Atoi(value)
					if err != nil {
						return nil, fmt.Errorf("invalid page: %s", value)
					}
					page = n
				case "page-size":
					n, err := strconv.Atoi(value)
					if err != nil {
						return nil, fmt.Errorf("invalid page-size: %s", value)
					}
					pageSize = n
				default:
					return nil, fmt.Errorf("unknown argument: %s", key)
				}
			}

			db, err := database.GetDatabase(t.jxscout.GetOptions().ProjectName)
			if err != nil {
				return nil, err
			}
			defer db.Close()

			where := []string{"1=1"}
			queryArgs := []any{}
			if subscriber != "" {
				where = append(where, "p.subscriber = ?")
				queryArgs = append(queryArgs, subscriber)
			}
			if status != "" {
				where = append(where, "p.status = ?")
				queryArgs = append(queryArgs, status)
			}
			filter := strings.Join(where, " AND ")

			var total int
			if err := db.Get(&total, "SELECT COUNT(*) FROM event_processing p WHERE "+filter, queryArgs...); err != nil {
				return nil, fmt.Errorf("failed to count events: %w", err)
			}

			rows := []struct {
				EventID    int64  `db:"event_id"`
				Name       string `db:"name"`
				Subscriber string `db:"subscriber"`
				Status     string `db:"status"`
				RetryCount int    `db:"retry_count"`
				Error      *string `db:"error_message"`
				CreatedAt  string `db:"created_at"`
			}{}
			listArgs := append(append([]any{}, queryArgs...), pageSize, (page-1)*pageSize)
			err = db.Select(&rows, `
				SELECT p.event_id, e.name, p.subscriber, p.status, p.retry_count, p.error_message, p.created_at
				FROM event_processing p JOIN events e ON e.id = p.event_id
				WHERE `+filter+` ORDER BY p.event_id DESC LIMIT ? OFFSET ?`, listArgs...)
			if err != nil {
				return nil, fmt.Errorf("failed to list events: %w", err)
			}

			totalPages := (total + pageSize - 1) / pageSize
			t.writeLineToOutput(fmt.Sprintf("\nEvents (page %d of %d, total %d):\n", page, totalPages, total))
			if subscriber != "" || status != "" {
				t.writeLineToOutput(fmt.Sprintf("Filters: subscriber=%s status=%s\n", subscriber, status))
			}
			for _, r := range rows {
				line := fmt.Sprintf("event=%d  %s  subscriber=%s  status=%s  retries=%d  %s",
					r.EventID, r.Name, r.Subscriber, r.Status, r.RetryCount, r.CreatedAt)
				if r.Error != nil && *r.Error != "" {
					line += fmt.Sprintf("  error=%s", truncateStr(*r.Error, 80))
				}
				t.writeLineToOutput(line)
			}
			if total == 0 {
				t.writeLineToOutput("No events matched.")
			} else {
				t.writeLineToOutput("\nCommands: events-show <event_id> | events-retry <event_id> | events-retry subscriber=<name> status=failed [path=<file_path>]")
			}
			return nil, nil
		},
	})

	t.RegisterCommand(Command{
		Name:        "events-show",
		ShortName:   "evs",
		Description: "Show full details of an event (payload, error)",
		Usage:       "events-show <event_id>",
		Execute: func(args []string) (tea.Cmd, error) {
			if len(args) != 1 {
				return nil, fmt.Errorf("usage: events-show <event_id>")
			}
			eventID, err := strconv.ParseInt(args[0], 10, 64)
			if err != nil {
				return nil, fmt.Errorf("invalid event id: %s", args[0])
			}

			db, err := database.GetDatabase(t.jxscout.GetOptions().ProjectName)
			if err != nil {
				return nil, err
			}
			defer db.Close()

			var payload, name string
			if err := db.Get(&payload, "SELECT payload FROM events WHERE id = ?", eventID); err != nil {
				return nil, fmt.Errorf("event %d not found", eventID)
			}
			_ = db.Get(&name, "SELECT name FROM events WHERE id = ?", eventID)

			rows := []struct {
				Subscriber string  `db:"subscriber"`
				Status     string  `db:"status"`
				RetryCount int     `db:"retry_count"`
				Error      *string `db:"error_message"`
			}{}
			if err := db.Select(&rows, "SELECT subscriber, status, retry_count, error_message FROM event_processing WHERE event_id = ?", eventID); err != nil {
				return nil, err
			}

			t.writeLineToOutput(fmt.Sprintf("\nEvent %d (%s)\nPayload: %s\n", eventID, name, truncateStr(payload, 2000)))
			for _, r := range rows {
				line := fmt.Sprintf("  subscriber=%s status=%s retries=%d", r.Subscriber, r.Status, r.RetryCount)
				if r.Error != nil {
					line += fmt.Sprintf("\n    error: %s", *r.Error)
				}
				t.writeLineToOutput(line)
			}
			return nil, nil
		},
	})

	t.RegisterCommand(Command{
		Name:        "events-retry",
		ShortName:   "evr",
		Description: "Retrigger an event (single id) or bulk by subscriber/status/path filters",
		Usage:       "events-retry <event_id>  |  events-retry subscriber=<name> [status=<status>] [path=<file_path substring>]",
		Execute: func(args []string) (tea.Cmd, error) {
			if len(args) == 0 {
				return nil, fmt.Errorf("usage: events-retry <event_id> or events-retry subscriber=<name> [status=...] [path=...]")
			}

			// single event id
			if len(args) == 1 && !strings.Contains(args[0], "=") {
				eventID, err := strconv.ParseInt(args[0], 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid event id: %s", args[0])
				}
				db, err := database.GetDatabase(t.jxscout.GetOptions().ProjectName)
				if err != nil {
					return nil, err
				}
				defer db.Close()

				res, err := db.Exec(`
					UPDATE event_processing
					SET status = 'pending', retry_count = 0, error_message = NULL, next_attempt = NULL, finished_at = NULL
					WHERE event_id = ?`, eventID)
				if err != nil {
					return nil, fmt.Errorf("failed to retrigger: %w", err)
				}
				n, _ := res.RowsAffected()
				t.writeLineToOutput(fmt.Sprintf("Retriggered event %d (%d subscriber queues reset)\n", eventID, n))
				return nil, nil
			}

			// bulk mode
			subscriber := ""
			status := "failed"
			pathFilter := ""
			for _, arg := range args {
				key, value, ok := strings.Cut(arg, "=")
				if !ok {
					return nil, fmt.Errorf("invalid argument %q", arg)
				}
				switch key {
				case "subscriber":
					subscriber = value
				case "status":
					status = value
				case "path":
					pathFilter = value
				default:
					return nil, fmt.Errorf("unknown argument: %s", key)
				}
			}
			if subscriber == "" {
				return nil, fmt.Errorf("bulk retry requires subscriber=<name>")
			}

			db, err := database.GetDatabase(t.jxscout.GetOptions().ProjectName)
			if err != nil {
				return nil, err
			}
			defer db.Close()

			where := "p.subscriber = ?"
			queryArgs := []any{subscriber}
			if status != "" {
				where += " AND p.status = ?"
				queryArgs = append(queryArgs, status)
			}
			if pathFilter != "" {
				where += " AND e.payload LIKE ?"
				queryArgs = append(queryArgs, "%"+pathFilter+"%")
			}

			res, err := db.Exec(`
				UPDATE event_processing
				SET status = 'pending', retry_count = 0, error_message = NULL, next_attempt = NULL, finished_at = NULL
				FROM events e
				WHERE e.id = event_processing.event_id AND `+where, queryArgs...)
			if err != nil {
				return nil, fmt.Errorf("failed to bulk retrigger: %w", err)
			}
			n, _ := res.RowsAffected()
			t.writeLineToOutput(fmt.Sprintf("Retriggered %d events (subscriber=%s status=%s path~=%s)\n", n, subscriber, status, pathFilter))
			return nil, nil
		},
	})
}

func truncateStr(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max] + "..."
}
