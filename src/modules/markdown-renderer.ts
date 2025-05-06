import { marked } from "marked";
import { MediaHandler } from "@/modules/media-handler";

/**
 * Convert markdown to html
 */
export class MarkdownRenderer {
  private mediaHandler: MediaHandler;

  constructor() {
    this.mediaHandler = new MediaHandler();
    this.configureMarked();
  }

  /**
   * Configure marked library
   */
  private configureMarked(): void {
    marked.setOptions({
      gfm: true, // Enable GitHub Flavored Markdown
      breaks: true, // Convert line breaks to <br>
    });

    const renderer = new marked.Renderer();
    marked.use({ renderer });
  }

  /**
   * Convert markdown text to html
   * @param text markdown text
   * @returns rendered html
   */
  public async render(text: string): Promise<string> {
    try {
      // 1. Preprocess github videos
      const preprocessed = this.mediaHandler.handleVideos(text);

      // 2. Convert markdown to html
      const html = await marked.parse(preprocessed);

      // 3. Process video links
      let processedHtml = this.mediaHandler.handleVideoLinks(html);

      // 4. Enhance image styles
      processedHtml = this.mediaHandler.improveImageStyles(processedHtml);

      // 5. Add github style classes
      processedHtml = this.addClasses(processedHtml);

      return processedHtml;
    } catch (error) {
      console.error("[Error] Failed to render markdown:", error);
      return `<div class="error">Failed to render markdown: ${error}</div>`;
    }
  }

  /**
   * Add github style classes
   * @param html base html
   * @returns html with github style classes
   */
  private addClasses(html: string): string {
    // Add basic github style classes
    return (
      html
        // Table
        .replace(/<table>/g, '<table class="markdown-table">')
        .replace(/<thead>/g, '<thead class="markdown-thead">')
        .replace(/<tbody>/g, '<tbody class="markdown-tbody">')

        // Block elements
        .replace(/<blockquote>/g, '<blockquote class="markdown-blockquote">')
        .replace(/<pre><code>/g, '<pre class="markdown-code"><code>')
        .replace(/<p>/g, '<p class="markdown-paragraph">')
        .replace(/<hr>/g, '<hr class="markdown-hr">')

        // Heading
        .replace(/<h([1-6])>/g, '<h$1 class="markdown-h$1">')

        // List
        .replace(/<ul>/g, '<ul class="markdown-list markdown-ul">')
        .replace(/<ol>/g, '<ol class="markdown-list markdown-ol">')
        .replace(/<li>/g, '<li class="markdown-list-item">')

        // Checkbox
        .replace(
          /<input type="checkbox"(.*?)>/g,
          '<input type="checkbox" class="markdown-checkbox"$1>',
        )

        // Link and image
        .replace(/<a href/g, '<a class="markdown-link" href')

        // GitHub Flavored Markdown elements
        .replace(/<span class="pl-.*?>/g, '<span class="markdown-code-span">')
    );
  }
}
