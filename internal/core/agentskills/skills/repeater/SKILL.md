---
name: repeater
description: Sends raw HTTP from .req files via jxscout repeater and inspects responses for security research. Use when testing HTTP requests, modifying request files to achieve a security goal, or when the user mentions repeater, .req/.res, or raw HTTP testing.
---

# jxscout Repeater

## When to use

- Security research: try payloads, headers, or parameter changes until a goal is reached (e.g. trigger error, bypass, different status).
- Testing raw HTTP: send a request from a file and inspect the raw response.
- Iterating on a request: edit the .req file, re-run, check the new .res or stdout.

## Command

From the project root:

```bash
jxscout-pro-v2 -c repeater <req_file>
```

`<req_file>` is the path to a file containing a single raw HTTP request (method, path, headers, blank line, optional body). The file extension does not need to be `.req`.

## Output

- **stdout**: raw HTTP response (status line, headers, body).
- **Files**: for each request sent, the repeater writes two files next to the input file:
  - `<basename>_<YYYYMMDDHHMMSS>_<status>.req` — request that was sent
  - `<basename>_<YYYYMMDDHHMMSS>_<status>.res` — response received

Example: sending `repeater/sql_injection/original.req` can create `repeater/sql_injection/original_20260208155236_500.req` and `original_20260208155236_500.res`.

## When the request file is outside repeater/

If the original .req file is **not** in the `repeater/` folder:

1. Create a directory inside `repeater/` with an appropriate name for the task and some context on the endpoint being tested (e.g. `repeater/sql_injection_on_endpoint_xyz/`, `repeater/sql_injection_on_endpoint_xyz/`).
2. Copy the .req file into that folder and name it `original.req`.
3. Use `repeater/<task_name>/original.req` as the request file for the repeater command and for all subsequent edits.

## Request file format

The request files are just plain HTTP files. They contain the exact bytes for sending raw HTTP requests. Depending on your goal you might want to send a malformed request.

IMPORTANT:
**Content-Length**: Do not recompute or update the `Content-Length` header when editing the body. The repeater sets it automatically from the actual body before sending.

## Workflow for security research

1. Start from an existing .req in `repeater/` (e.g. `repeater/sql_injection/original.req`). If the .req is elsewhere, first create a task folder under `repeater/`, copy the file there as `original.req`, then use that path.
2. Run: `jxscout-pro-v2 -c repeater <req_file>` on the original request file to save the original response.
3. Check stdout and/or the new .res file for status, headers, and body.
4. Edit the original .req depending on your goal.
5. Re-run the same command with the same (modified) file.
6. Repeat until the goal is met (e.g. 500 for SQLi, 200 for bypass, expected error message).

IMPORTANT: never create any new file other than the original, simply edit the original one and use the command to repeat requests.

Always edit the same source .req (e.g. `original.req`) for each iteration so history stays in the generated `*_<timestamp>_<status>.req`/`.res` pairs.
