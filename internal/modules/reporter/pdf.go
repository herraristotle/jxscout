package reporter

import (
	"bytes"
	"fmt"
	"strings"
)

// Minimal single-page-per-sheet PDF writer (PDF 1.4, base-14 font, no deps).
// Enough for a text report; anything richer needs a real PDF library.

const (
	pdfPageWidth  = 595 // A4 at 72dpi
	pdfPageHeight = 842
	pdfMargin     = 50
	pdfLineHeight = 14
	pdfPageLines  = (pdfPageHeight - 2*pdfMargin) / pdfLineHeight
)

func buildPDF(lines []string) []byte {
	pages := paginate(lines)
	// Objects: 1 catalog, 2 pages, 3 font, then (page, contents) pairs.
	pageObjID := func(i int) int { return 4 + i*2 }

	var buf bytes.Buffer
	offsets := map[int]int{}
	writeObj := func(id int, body string) {
		offsets[id] = buf.Len()
		fmt.Fprintf(&buf, "%d 0 obj\n%s\nendobj\n", id, body)
	}

	buf.WriteString("%PDF-1.4\n")
	buf.WriteString("%\xe2\xe3\xcf\xd3\n")

	kids := make([]string, len(pages))
	for i := range pages {
		kids[i] = fmt.Sprintf("%d 0 R", pageObjID(i))
	}
	writeObj(1, "<< /Type /Catalog /Pages 2 0 R >>")
	writeObj(2, fmt.Sprintf("<< /Type /Pages /Kids [%s] /Count %d >>",
		strings.Join(kids, " "), len(pages)))
	writeObj(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")

	for i, pageLines := range pages {
		var stream bytes.Buffer
		stream.WriteString("BT\n")
		fmt.Fprintf(&stream, "/F1 10 Tf\n%d TL\n%d %d Td\n",
			pdfLineHeight, pdfMargin, pdfPageHeight-pdfMargin)
		for _, line := range pageLines {
			fmt.Fprintf(&stream, "(%s) Tj\nT*\n", escapePDFText(line))
		}
		stream.WriteString("ET\n")
		content := stream.String()

		writeObj(pageObjID(i), fmt.Sprintf(
			"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %d %d] "+
				"/Resources << /Font << /F1 3 0 R >> >> /Contents %d 0 R >>",
			pdfPageWidth, pdfPageHeight, pageObjID(i)+1))
		writeObj(pageObjID(i)+1, fmt.Sprintf(
			"<< /Length %d >>\nstream\n%s\nendstream", len(content), content))
	}

	xrefOffset := buf.Len()
	total := 4 + len(pages)*2
	fmt.Fprintf(&buf, "xref\n0 %d\n0000000000 65535 f \n", total)
	for id := 1; id < total; id++ {
		fmt.Fprintf(&buf, "%010d 00000 n \n", offsets[id])
	}
	fmt.Fprintf(&buf, "trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n",
		total, xrefOffset)

	return buf.Bytes()
}

func paginate(lines []string) [][]string {
	if len(lines) == 0 {
		return [][]string{{}}
	}
	var pages [][]string
	for start := 0; start < len(lines); start += pdfPageLines {
		end := start + pdfPageLines
		if end > len(lines) {
			end = len(lines)
		}
		pages = append(pages, lines[start:end])
	}
	return pages
}

// escapePDFText escapes the delimiters of a PDF literal string and drops
// non-ASCII so the WinAnsi Helvetica base font renders it.
func escapePDFText(s string) string {
	var b strings.Builder
	for _, r := range s {
		switch {
		case r == '\\' || r == '(' || r == ')':
			b.WriteByte('\\')
			b.WriteRune(r)
		case r == '\t':
			b.WriteString("    ")
		case r >= 32 && r < 127:
			b.WriteRune(r)
		default:
			b.WriteByte('?')
		}
	}
	return b.String()
}
