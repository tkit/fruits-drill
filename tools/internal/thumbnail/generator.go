package thumbnail

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

type Generator struct {
	// CommandName is "magick" (Windows) or "convert" (Others)
	CommandName string
}

func NewGenerator() *Generator {
	cmd := "convert"
	// IMv7 prefers "magick"
	if _, err := exec.LookPath("magick"); err == nil {
		cmd = "magick"
	}
	return &Generator{CommandName: cmd}
}

// GenerateFromPDF creates a thumbnail from the first page of the PDF.
// Returns the path to the generated image file.
func (g *Generator) GenerateFromPDF(pdfPath string) (string, error) {
	// Output filename: original.pdf -> original.jpg
	ext := filepath.Ext(pdfPath)
	base := strings.TrimSuffix(pdfPath, ext)
	outputPath := base + ".jpg"

	// ImageMagick command: convert -density 150 input.pdf[0] -quality 90 output.jpg
	// [0] selects the first page.
	args := []string{
		"-density", "150",
		fmt.Sprintf("%s[0]", pdfPath),
		"-quality", "90",
		"-colorspace", "RGB", // Ensure consistent colors
		"-background", "white", // Flatten transparency
		"-alpha", "remove",
		"-resize", "800x", // Reasonable web size
		outputPath,
	}

	cmd := exec.Command(g.CommandName, args...)
	if output, err := cmd.CombinedOutput(); err != nil {
		return "", fmt.Errorf("failed to generate thumbnail: %w (output: %s)", err, output)
	}

	return outputPath, nil
}
