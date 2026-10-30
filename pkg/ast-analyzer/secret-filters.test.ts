import { describe, it, expect } from "vitest";
import {
  calculateEntropy,
  looksLikeHash,
  looksLikeJsIdentifier,
  isFalsePositive,
  assessConfidence,
} from "./secret-filters";

describe("calculateEntropy", () => {
  it("returns 0 for empty string", () => {
    expect(calculateEntropy("")).toBe(0);
  });

  it("returns high entropy for random alphanumeric strings", () => {
    // Realistic API key: many distinct characters
    expect(calculateEntropy("wJalrXUtnFEMI7MDb4PEbXfwEUCzI9Yh0")).toBeGreaterThan(
      4
    );
  });

  it("returns low entropy for repetitive strings", () => {
    expect(calculateEntropy("aaaaaaaaaaaaaaaa")).toBe(0);
  });
});

describe("looksLikeHash", () => {
  it("detects MD5-length hex", () => {
    expect(looksLikeHash("d41d8cd98f00b204e9800998ecf8427e")).toBe(true);
  });

  it("detects SHA1-length hex", () => {
    expect(
      looksLikeHash("da39a3ee5e6b4b0d3255bfef95601890afd80709")
    ).toBe(true);
  });

  it("detects SHA256-length hex", () => {
    expect(
      looksLikeHash(
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      )
    ).toBe(true);
  });

  it("rejects non-hex and wrong-length strings", () => {
    expect(looksLikeHash("AKIAYQNLOY7A4KOUQGGM")).toBe(false);
    expect(looksLikeHash("sk-ant-api03-abc123")).toBe(false);
    expect(looksLikeHash("d41d8cd98f00b204e9800998ecf8427")).toBe(false);
  });
});

describe("looksLikeJsIdentifier", () => {
  it("rejects camelCase function names", () => {
    expect(looksLikeJsIdentifier("componentWillUnmount")).toBe(true);
  });

  it("rejects PascalCase class names", () => {
    expect(looksLikeJsIdentifier("ClassElementKeywords")).toBe(true);
  });

  it("rejects long lowercase JS names", () => {
    expect(looksLikeJsIdentifier("getdirectories")).toBe(true);
  });

  it("keeps realistic mixed keys that are not identifiers", () => {
    expect(looksLikeJsIdentifier("wJalrXUtnFEMI/K7MDENG")).toBe(false);
  });
});

describe("isFalsePositive", () => {
  const noopType = "generic_pattern";

  it("rejects placeholder values", () => {
    expect(isFalsePositive("YOUR_API_KEY_HERE", noopType, "")).toBe(true);
    expect(isFalsePositive("CHANGEME", noopType, "")).toBe(true);
    expect(isFalsePositive("${API_KEY}", noopType, "")).toBe(true);
    expect(isFalsePositive("{{template_var}}", noopType, "")).toBe(true);
    expect(isFalsePositive("sk_test_abc12345", noopType, "")).toBe(true);
  });

  it("rejects known-safe strings", () => {
    expect(isFalsePositive("application/json", noopType, "")).toBe(true);
    expect(isFalsePositive("text/html", noopType, "")).toBe(true);
  });

  it("rejects CSS hex colors", () => {
    expect(isFalsePositive("#ff5733", noopType, "")).toBe(true);
  });

  it("rejects version strings", () => {
    expect(isFalsePositive("1.2.3", noopType, "")).toBe(true);
    expect(isFalsePositive("v2.0.0", noopType, "")).toBe(true);
  });

  it("rejects URL paths that are not secrets", () => {
    expect(isFalsePositive("/changepassword", noopType, "")).toBe(true);
    expect(isFalsePositive("/api/resetpassword", noopType, "")).toBe(true);
  });

  it("rejects data URIs", () => {
    expect(
      isFalsePositive("data:image/png;base64,aaaabbbbccccdddd", noopType, "")
    ).toBe(true);
  });

  it("rejects values in a data-uri context", () => {
    expect(
      isFalsePositive(
        "aaaabbbbccccdddd1111",
        noopType,
        "src = data:image/png;base64,aaaabbbbccccdddd1111"
      )
    ).toBe(true);
  });

  it("rejects minified variable names", () => {
    expect(isFalsePositive("e", noopType, "")).toBe(true);
    expect(isFalsePositive("aBc2", noopType, "")).toBe(true);
  });

  it("rejects repetitive low-entropy junk", () => {
    expect(isFalsePositive("aaaaaaaaaaaaaaaa", noopType, "")).toBe(true);
  });

  it("rejects file paths", () => {
    expect(isFalsePositive("/usr/local/bin/node", noopType, "")).toBe(true);
  });

  it("rejects documentation URLs", () => {
    expect(
      isFalsePositive("https://stackoverflow.com/questions/123", "generic", "")
    ).toBe(true);
  });

  it("accepts realistic secret values", () => {
    expect(
      isFalsePositive("AKIAYQNLOY7A4KOUQGGM", "aws_api_key", "")
    ).toBe(false);
    expect(
      isFalsePositive(
        "sk-proj-4fJkqL8xR2mNwYzT9bVcXdEfGhJkLmNoPqRsTuVwXyZ0123456789abcd",
        "openai_api_key",
        ""
      )
    ).toBe(false);
  });

  it("accepts high-entropy unknown-format strings", () => {
    expect(
      isFalsePositive("Xk29fjDm3pQzL7vBnRtY6wHs", "generic", "")
    ).toBe(false);
  });

  it("keeps doc URLs for token/key pattern types", () => {
    // A URL containing a token-looking segment under a "token" type should
    // NOT be auto-rejected as documentation
    expect(
      isFalsePositive(
        "https://example.com/ghp_abcdefghij1234",
        "github_token",
        ""
      )
    ).toBe(false);
  });
});

describe("assessConfidence", () => {
  it("gives high confidence to known-prefix types with strong entropy", () => {
    const entropy = calculateEntropy("AKIAYQNLOY7A4KOUQGGM");
    expect(assessConfidence("aws_api_key", "AKIAYQNLOY7A4KOUQGGM", entropy)).toBe(
      "high"
    );
  });

  it("downgrades high-prefix types with weak entropy", () => {
    // Repetitive-ish AKIA key
    const entropy = calculateEntropy("AKIAAAAAAAAAAAAAAAAA");
    expect(
      assessConfidence("aws_api_key", "AKIAAAAAAAAAAAAAAAAA", entropy)
    ).not.toBe("high");
  });

  it("applies length-aware thresholds to unknown types", () => {
    // Short high-entropy string: strict threshold (>= 3.8 for high)
    const shortHigh = "qK9zX2vB7nR4mW8s";
    expect(
      assessConfidence("generic", shortHigh, calculateEntropy(shortHigh))
    ).toBe("high");

    // Low-entropy short string: info
    expect(assessConfidence("generic", "abababababababab", 2.0)).toBe("low");
  });
});
