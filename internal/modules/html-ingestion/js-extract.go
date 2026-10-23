package htmlingestion

import (
	"log/slog"
	"net/url"
	"strings"

	"github.com/francisconeves97/jxscout/internal/core/common"
	"github.com/francisconeves97/jxscout/internal/core/errutil"

	"github.com/PuerkitoBio/goquery"
)

type extractedJS struct {
	scriptURLs    []string // script URLs
	inlineScripts []string // actual scripts that were inlined
}

func extractJS(htmlContent string, baseURLRaw string, log *slog.Logger) (extractedJS, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		return extractedJS{}, errutil.Wrap(err, "failed to read document")
	}

	baseURL, err := url.Parse(baseURLRaw)
	if err != nil {
		return extractedJS{}, errutil.Wrap(err, "failed to parse url")
	}

	scriptURLs := extractJavascriptURLs(doc, baseURL, log)
	inlineScripts := extractInlineJavascript(doc)

	return extractedJS{
		scriptURLs:    scriptURLs,
		inlineScripts: inlineScripts,
	}, nil
}

func extractJavascriptURLs(doc *goquery.Document, baseURL *url.URL, log *slog.Logger) []string {
	urls := []string{}

	basePath := ""

	// base will replace the base href of the page. this is hacky but might work in most cases?
	doc.Find("base").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}

		basePath = href
	})

	doc.Find("script").Each(func(i int, selection *goquery.Selection) {
		src, exists := selection.Attr("src")
		if !exists {
			return
		}

		if common.IsRelativePath(src) {
			path, err := url.JoinPath(basePath, src)
			if err != nil {
				log.Warn("skipping script with unjoinable relative src", "src", src, "base", basePath, "error", err)
				return
			}

			url := &url.URL{
				Scheme: baseURL.Scheme,
				Host:   baseURL.Hostname(),
				Path:   path,
			}

			urls = append(urls, url.String())
		} else {
			parsedURl, err := url.Parse(src)
			if err != nil {
				log.Warn("skipping script with unparsable src", "src", src, "error", err)
				return
			}

			if parsedURl.Scheme == "" {
				parsedURl.Scheme = "https"
			}

			urls = append(urls, parsedURl.String())
		}
	})

	return urls
}

func extractInlineJavascript(doc *goquery.Document) []string {
	inlineJS := []string{}

	doc.Find("script").Each(func(i int, s *goquery.Selection) {
		_, exists := s.Attr("src")
		if exists {
			return
		}

		t, exists := s.Attr("type")
		if exists && (t == "application/ld+json" || t == "application/json") {
			return
		}

		content := s.Text()
		if content == "" {
			return
		}

		inlineJS = append(inlineJS, content)
	})

	return inlineJS
}
