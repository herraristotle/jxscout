package monitoring

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// Cron is a minimal 5-field cron parser (minute hour day-of-month month day-of-week)
// supporting "*", lists ("1,15"), ranges ("1-5") and steps ("*/15", "1-30/5").
type Cron struct {
	minute, hour, dom, month, dow map[int]bool
}

func ParseCron(expr string) (*Cron, error) {
	fields := strings.Fields(strings.TrimSpace(expr))
	if len(fields) != 5 {
		return nil, fmt.Errorf("cron expression must have 5 fields, got %d: %q", len(fields), expr)
	}
	c := &Cron{}
	var err error
	if c.minute, err = parseField(fields[0], 0, 59); err != nil {
		return nil, fmt.Errorf("minute: %w", err)
	}
	if c.hour, err = parseField(fields[1], 0, 23); err != nil {
		return nil, fmt.Errorf("hour: %w", err)
	}
	if c.dom, err = parseField(fields[2], 1, 31); err != nil {
		return nil, fmt.Errorf("day-of-month: %w", err)
	}
	if c.month, err = parseField(fields[3], 1, 12); err != nil {
		return nil, fmt.Errorf("month: %w", err)
	}
	if c.dow, err = parseField(fields[4], 0, 6); err != nil {
		return nil, fmt.Errorf("day-of-week: %w", err)
	}
	return c, nil
}

func parseField(field string, min, max int) (map[int]bool, error) {
	result := map[int]bool{}
	for _, part := range strings.Split(field, ",") {
		step := 1
		rangePart := part
		if idx := strings.Index(part, "/"); idx >= 0 {
			rangePart = part[:idx]
			s, err := strconv.Atoi(part[idx+1:])
			if err != nil || s <= 0 {
				return nil, fmt.Errorf("invalid step in %q", part)
			}
			step = s
		}

		lo, hi := min, max
		if rangePart != "*" {
			if idx := strings.Index(rangePart, "-"); idx >= 0 {
				a, err1 := strconv.Atoi(rangePart[:idx])
				b, err2 := strconv.Atoi(rangePart[idx+1:])
				if err1 != nil || err2 != nil {
					return nil, fmt.Errorf("invalid range %q", rangePart)
				}
				lo, hi = a, b
			} else if rangePart != "*" {
				v, err := strconv.Atoi(rangePart)
				if err != nil {
					return nil, fmt.Errorf("invalid value %q", rangePart)
				}
				lo, hi = v, v
			}
		}

		if lo < min || hi > max || lo > hi {
			return nil, fmt.Errorf("value out of range [%d,%d]: %q", min, max, part)
		}
		for v := lo; v <= hi; v += step {
			result[v] = true
		}
	}
	return result, nil
}

// Next returns the next time this cron matches after t (checked at minute granularity).
func (c *Cron) Next(t time.Time) time.Time {
	t = t.Truncate(time.Minute).Add(time.Minute)
	for i := 0; i < 366*24*60; i++ { // search up to a year
		if c.minute[t.Minute()] && c.hour[t.Hour()] && c.month[int(t.Month())] &&
			(c.dom[t.Day()] || c.dow[int(t.Weekday())]) {
			return t
		}
		t = t.Add(time.Minute)
	}
	return time.Time{}
}
