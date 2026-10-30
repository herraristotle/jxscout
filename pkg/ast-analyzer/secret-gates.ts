// Proximity/context gates for context-sensitive secret patterns + the
// combined match-treatment used by the secrets tree analyzer.
// Gate design ported from jsrip's `pattern_contexts` (core/patterns.py):
// format-only patterns (raw hex strings, GUID-ish values) only fire when
// the value is named like a key/secret — a LEFT-ONLY window, because in
// `name = "value"` the identifier always precedes the value, so text after
// the match can only supply false context (e.g. a following `iv = ...`
// relabelling a key).

import { isFalsePositive, looksLikeHash, calculateEntropy, assessConfidence } from "./secret-filters";

// Per-pattern proximity regex. Two alternatives per gate:
//   snake/bare  — keyword preceded by start-of-string or a non-alphanumeric
//                 (`key =`, `AES_KEY =`, `x_encryption_Key =`), case-insensitive.
//   camelCase   — keyword capitalised and glued to a preceding lowercase run
//                 (`encryptioKey =`, `apiKey`), case-SENSITIVE so that
//                 `monkey =` and `div =` do not slip through.
export const patternContexts: Record<string, RegExp> = {
  // Pairs must match the names used in the secrets patterns table.
  aes_hex_key_contextual: new RegExp(
    "(?:(?:^|[^A-Za-z0-9])(?i:key|secret|encrypt|cipher|aes|password)" +
    "|[a-z0-9](?:Key|Secret|Encrypt|Cipher|Aes|Password))\\s*[=:]"
  ),
  aes_hex_iv_contextual: new RegExp(
    "(?:(?:^|[^A-Za-z0-9])(?i:iv|nonce|encrypt|cipher|aes)" +
    "|[a-z0-9](?:Iv|IV|Nonce|Encrypt|Cipher|Aes))\\s*[=:]"
  ),
};

export const contextuallyGated = Object.keys(patternContexts);

export function passesProximityGate(
  patternName: string,
  fullSourceAtLeft: string
): boolean {
  const gate = patternContexts[patternName];
  if (!gate) return true;
  return gate.test(fullSourceAtLeft);
}

// Combined treatment for one candidate secret match.
export interface SecretEvaluation {
  keep: boolean;
  confidence?: "high" | "medium" | "low" | "info";
  entropy?: number;
}

export function evaluateSecretCandidate(
  // Secret pattern name, e.g. "aws_api_key".
  patternName: string,
  // The raw secret candidate value from the literal node.
  value: string,
  // Source text immediately preceding the literal in the sentence (we trim
  // trailing whitespace and the quote char so that `key = "val"` reads out).
  precedingSource: string,
  // Optional broader context up to a few hundred chars around the literal.
  context = ""
): SecretEvaluation {
  // Proximity gate for context-gated patterns (hex keys/IVs etc)
  if (!passesProximityGate(patternName, precedingSource)) {
    return { keep: false };
  }

  // Skip obvious content hashes unless the pattern itself is hash-shaped or
  // the gate has already proven naming adjacency (aes_hex_* entries).
  const gated = patternName in patternContexts;
  if (looksLikeHash(value) && !gated) {
    return { keep: false };
  }

  // Multi-layer false-positive filter.
  if (isFalsePositive(value, patternName, context)) {
    return { keep: false };
  }

  const entropy = calculateEntropy(value);
  return { keep: true, entropy, confidence: assessConfidence(patternName, value, entropy) };
}
