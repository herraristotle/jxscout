package common

import (
	"crypto/sha256"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"time"
	"unicode"

	"github.com/francisconeves97/jxscout/internal/core/errutil"
	"github.com/francisconeves97/jxscout/pkg/constants"
)

func StrPtr(s *string) string {
	if s == nil {
		return ""
	}

	return *s
}

func NormalizeURL(rawURL string) string {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		slog.Warn("failed to parse URL, using raw value", "url", rawURL, "error", err)
		return rawURL
	}

	parsedURL.Fragment = ""
	parsedURL.RawFragment = ""
	parsedURL.RawQuery = ""
	parsedURL.ForceQuery = false

	parsedURL.Path = strings.TrimSuffix(parsedURL.Path, "/")

	return parsedURL.String()
}

func NormalizeHTMLURL(rawURL string) (string, error) {
	if strings.TrimSpace(rawURL) == "" {
		return "", nil
	}

	htmlPath, err := url.JoinPath(NormalizeURL(rawURL), "(index).html")
	if err != nil {
		return "", errutil.Wrap(err, "failed to join html path with (index).html")
	}

	return htmlPath, nil
}

// jsPatterns are compiled once: isLikelyJavaScript runs on every ingested
// response, and matching recompiled regexes dominated its cost.
var jsPatterns = []*regexp.Regexp{
	regexp.MustCompile(`\bfunction\s+[\w$]+\s*\(`), // function declarations
	regexp.MustCompile(`\b(const|let|var)\s+[$A-Za-z_]\w*\s*[=;]`), // variable declarations
	regexp.MustCompile(`\bif\s*\(.*\)\s*\{`),                       // if statements
	regexp.MustCompile(`\bfor\s*\(.*\)\s*\{`),                      // for loops
	regexp.MustCompile(`\bwhile\s*\(.*\)\s*\{`),                    // while loops
	regexp.MustCompile(`=>`),                                       // arrow functions
	regexp.MustCompile(`\$\{[^}]*\}`),                              // template literals
}

// isLikelyJavaScript reports whether a decoded body looks like JS source.
// The variable-declaration pattern requires an assignment or terminator so
// prose such as "Please let us know" does not match.
func isLikelyJavaScript(str string) bool {
	for _, pattern := range jsPatterns {
		if pattern.MatchString(str) {
			return true
		}
	}
	return false
}

type ContentType = string

const (
	ContentTypeHTML = "HTML"
	ContentTypeJS   = "JS"
)

func DetectContentType(content *string) ContentType {
	mimeType := http.DetectContentType([]byte(*content))

	if strings.Contains(mimeType, "html") {
		return ContentTypeHTML
	}

	if strings.Contains(mimeType, "text/plain") && isLikelyJavaScript(*content) {
		return ContentTypeJS
	}

	return ""
}

func IsRelativePath(str string) bool {
	u, err := url.Parse(str)
	if err == nil && u.Host != "" {
		return false
	}

	return true
}

func Hash(content string) string {
	hasher := sha256.New()
	hasher.Write([]byte(content))
	return fmt.Sprintf("%x", hasher.Sum(nil))
}

func GetHome() string {
	home, err := os.UserHomeDir()
	if err != nil {
		home = os.Getenv("HOME")
	}

	return home
}

func GetWorkingDirectory(projectName string) string {
	return filepath.Join(GetHome(), "jxscout", projectName)
}

func GetPrivateDirectoryRoot() string {
	return filepath.Join(GetHome(), ".jxscout")
}

func GetPrivateDirectory(projectName string) string {
	return filepath.Join(GetHome(), ".jxscout", projectName)
}

func FileExists(filePath string) (bool, error) {
	info, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		return false, nil
	}
	if err != nil {
		return false, errutil.Wrap(err, "failed to check if file exists")
	}
	return !info.IsDir(), nil
}

func ExponentialBackoff(retry int) time.Duration {
	// Base delay of 1 second
	baseDelay := time.Second

	// Calculate exponential delay: base * 2^retry
	// Cap at 1 hour to prevent excessive delays
	maxDelay := time.Hour

	delay := baseDelay * time.Duration(1<<uint(retry))
	if delay > maxDelay {
		return maxDelay
	}

	return delay
}

func AppendAll[T any](slices ...[]T) []T {
	// Calculate total length
	totalLen := 0
	for _, s := range slices {
		totalLen += len(s)
	}

	// Pre-allocate the result slice
	result := make([]T, 0, totalLen)

	// Append all slices
	for _, s := range slices {
		result = append(result, s...)
	}

	return result
}

// stolen from https://github.com/BishopFox/jsluice/blob/main/analyzer.go#L70
func IsProbablyHTML(source []byte) bool {
	for _, b := range source {
		if unicode.IsSpace(rune(b)) {
			continue
		}

		if b == '<' {
			return true
		}
		break
	}

	return false
}

func NormalizePathForDBCheck(filePath string) string {
	if runtime.GOOS == "windows" && len(filePath) >= 2 && filePath[1] == ':' {
		// Normalize drive letter to uppercase for comparison, assuming DB stores uppercase
		driveLetter := strings.ToUpper(string(filePath[0]))
		filePath = driveLetter + filePath[1:]
	}

	return filePath
}

func GetProjectName() (string, error) {
	projectNamePath := filepath.Join(GetPrivateDirectoryRoot(), "current_project")
	content, err := os.ReadFile(projectNamePath)
	if err != nil {
		if os.IsNotExist(err) {
			return constants.DefaultProjectName, nil
		}
		return "", errutil.Wrap(err, "failed to read current project name")
	}
	return strings.TrimSpace(string(content)), nil
}

func UpdateProjectName(projectName string) error {
	projectNamePath := filepath.Join(GetPrivateDirectoryRoot(), "current_project")

	// Ensure the directory exists
	if err := os.MkdirAll(filepath.Dir(projectNamePath), 0755); err != nil {
		return errutil.Wrap(err, "failed to create directory for project name file")
	}

	if err := os.WriteFile(projectNamePath, []byte(projectName), 0644); err != nil {
		return errutil.Wrap(err, "failed to write project name")
	}

	return nil
}

func ToPtr[T any](v T) *T {
	return &v
}
