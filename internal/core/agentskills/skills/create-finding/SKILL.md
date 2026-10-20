---
name: create-finding
description: Creates jxscout findings via CLI (kind, severity, description, dedup_key, metadata). Use when recording a security finding, saving a vulnerability or issue to the project, or when the user asks to create a finding.
---

# Create Finding

## When to use

- Recording a security finding or vulnerability for the current project.
- Saving an issue (e.g. secret, PII, bug) so it is tracked and deduplicated.
- User asks to create a finding or log a finding.

When creating a finding from or related to a file, include the file path in the `--metadata` JSON (e.g. `"file_path":"path/to/file"`).

## Command

From the project root:

```bash
jxscout-pro-v2 -c create-finding --kind <kind> --severity <severity> [options]
```

**Project name**: Do not pass `--project-name` unless the user explicitly specifies it. The project is taken from the environment (e.g. env var). If the project name is unknown and the user did not specify it, ask the user for it before running.

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--kind` | Yes | Finding type, e.g. `secret`, `pii`, `vulnerability`, `idor`, `xss`. |
| `--severity` | Yes | One of: `low`, `medium`, `high`, `critical`. |
| `--description` | No | Human-readable description of the finding. |
| `--dedup-key` | No | Key used to deduplicate findings of the same kind. If the same `kind` + `dedup_key` already exists, the command returns success with no new ID and message "Finding was deduplicated (already exists)". Use a stable value (e.g. endpoint + param, or issue identifier) so repeated runs do not create duplicates. |
| `--metadata` | No | JSON object for extra data (e.g. `"{\"url\":\"https://...\",\"param\":\"id\"}"`). When the finding comes from a file, include `file_path` with the path where it was found. Must be valid JSON. |

## Examples

```bash
jxscout-pro-v2 -c create-finding --kind idor --severity high --description "User can access other users' coupons" --dedup-key "GET /coupons?id"
```

```bash
jxscout-pro-v2 -c create-finding --kind vulnerability --severity critical --description "SQL injection in search" --dedup-key "search" --metadata '{"endpoint":"/api/search","param":"q"}'
```

```bash
jxscout-pro-v2 -c create-finding --kind secret --severity high --description "Hardcoded API key in config" --dedup-key "config-api-key" --metadata '{"file_path":"repeater/stack_trace_leak_respuestas_rapidas/original.res"}'
```

## Output

JSON to stdout:

- **Created**: `{"success":true,"finding_id":<id>,"message":"Finding created with ID: <id>"}`
- **Deduplicated**: `{"success":false,"finding_id":null,"message":"Finding was deduplicated (already exists)"}`

Errors (invalid severity, invalid JSON metadata, missing project, etc.) are reported via stderr/error output.
