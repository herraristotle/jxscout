---
name: idor-researcher
description: Tests HTTP requests for IDOR (Insecure Direct Object Reference) by identifying sensitive parameters and applying substitution, duplicate-parameter, array, and path-traversal techniques. Use when testing for IDORs, unauthorized access, or when the user asks to research IDORs on a request.
---

# IDOR Researcher

## When to use

- Testing a request for IDOR vulnerabilities.
- User asks to check for IDORs or unauthorized access via parameter manipulation.
- Assessing whether changing parameters could lead to accessing another user's data.

## Pre-check: Is this request interesting for IDOR?

Before testing, determine if the request has **sensitive parameters** that, if changed without proper access control, could expose another user's data. Sensitive parameters typically include:

- Identity: `id`, `userId`, `user_id`, `accountId`, `account_id`, `customerId`, `callerId`, `ownerId`, `orgId`, `tenantId`, `sessionId`
- Resource keys: `orderId`, `invoiceId`, `documentId`, `reportId`, `contextKey`, `key`, `token`, `uuid`
- Path segments that look like IDs (numeric, UUIDs, slugs)
- There might be other interesting parameters, you should understand if it's sensitive based on the request context

If the request has **no such parameters** (e.g. only static config, public catalog, or non-user-scoped data), skip testing and log:

```
Skipping because request is not interesting.
```

Do not create a repeater folder or run the repeater for uninteresting requests.

## Setup when the request is interesting

1. Use your repeater skill to setup a playground and test the interesting request

## Sensitive parameters: where to look

- **Query string**: `?userId=123&orderId=456`
- **Path**: `/api/users/123/orders` or `/api/orders/abc-uuid`
- **Body**: JSON fields like `userId`, `id`, `contextKey`, `callerId`; form body `user_id=123`
- **Headers**: custom headers that carry IDs (e.g. `X-User-Id`, `X-Tenant-Id`)

Extract the **authorized value(s)** from the original request (e.g. the logged-in user's ID or the resource ID the user is allowed to see). For testing you need at least one **other value** (e.g. another user/resource ID); use a known or guessed value (e.g. ±1, another UUID from context, or a placeholder like `999999`).

## Techniques to run

For each sensitive parameter identified, apply these in order. Compare responses to the baseline (status code and whether the response body changes in a way that suggests different data or access).

### 1. Direct substitution (standard IDOR check)

- Replace the parameter value with another user's or resource's ID.
- If the response is 200 (or success) and returns data that should not be accessible (e.g. another user's data), treat as a potential IDOR.

### 2. Duplicate parameter (authorized + other value, different orders)

- Send the **same parameter name more than once**: once with the authorized value and once with another value.
- Try both orders:
  - `param=authorizedValue&param=otherValue`
  - `param=otherValue&param=authorizedValue`
- For JSON body, try duplicate keys if the stack accepts them (some parsers take first or last).
- If the server uses one of the values and returns data for the "other" identity, treat as a potential IDOR.

### 3. Array instead of single value

- Send the parameter as an array:
  - Query: `param[]=authorizedValue&param[]=otherValue` or `param=authorizedValue&param=otherValue`
  - JSON: `"param": ["authorizedValue", "otherValue"]`
- Check if the response includes data for multiple identities or for the non-authorized one; 200 with such data suggests weak access control.

### 4. Path traversal in parameter or path (`<id>/../<id>`)

- If the ID appears in the **URL path** (e.g. `/api/users/123/profile`), try:
  - `123/../456` or `123%2f..%2f456` (and variants) so the resolved path might refer to another ID.
- If the ID appears in a **query or body parameter**, try values like `authorizedId/../otherId` or `authorizedId%2f..%2fotherId`.
- If the response is **200** and returns data, there may be a **secondary context traversal** (path or parameter) that resolves to another resource; treat as a potential IDOR.

## When something interesting is found

- **Create a finding** with kind `potential-idor`, referencing the request:

```bash
jxscout-pro-v2 -c create-finding --kind potential-idor --severity <low|medium|high> --description "<Short description: what was changed and what was observed>" --dedup-key "<endpoint_or_file>-<param>-<technique>" --metadata '{"file_path":"<path_to_req_file>","param":"<param_name>","technique":"<substitution|duplicate_param|array|path_traversal>"}'
```

- Add the finding to your in-memory list for `notes.txt`.

Severity guidance: **high** if clear cross-user data exposure; **medium** if behavior suggests weak access control (e.g. last/first value wins); **low** if only subtle or context-dependent.

## End of testing: notes.txt

After all techniques are done for the request, create a file **notes.txt** in the **repeater task folder** (the folder that contains the .req you used, e.g. `repeater/idor_<short_context>/notes.txt`). Contents:

- One line per finding: parameter, technique, and brief outcome (e.g. "userId: duplicate_param (other first) → 200 with other user data").
- If nothing interesting was found, state that: "No potential IDOR observed for the tested parameters."

## Summary workflow

1. **Assess**: Sensitive params? No → log "Skipping because request is not interesting." and stop.
2. **Setup**: Ensure .req is under repeater (copy if needed), run baseline.
3. **Test**: For each sensitive param, run: substitution → duplicate param (both orders) → array → path traversal.
4. **Record**: For each interesting result, create a finding (kind `potential-idor`) and add to notes list.
5. **Finish**: Write `notes.txt` in the repeater folder with findings (or "No potential IDOR observed...").
