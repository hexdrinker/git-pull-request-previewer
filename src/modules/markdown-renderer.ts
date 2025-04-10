import { marked } from 'marked'
import {
  preprocessGithubVideos,
  processVideoLinks,
  enhanceImageStyles,
} from './media-handler'

export class MarkdownRenderer {
  public async render(text: string): Promise<string> {
    try {
      // 1. github video URL processing
      const preprocessed = preprocessGithubVideos(text)

      // 2. markdown to html
      const html = await marked.parse(preprocessed)

      // 3. video link processing based on extension
      let processedHtml = processVideoLinks(html)

      // 4. image style improvement
      processedHtml = enhanceImageStyles(processedHtml)

      return processedHtml
    } catch (error) {
      console.error('[Error] markdown rendering failed:', error)
      return `<div class="error">markdown rendering failed: ${error}</div>`
    }
  }

  public async renderToElement(
    text: string,
    element: HTMLElement
  ): Promise<void> {
    if (!element) {
      console.error('[Error] rendering target element is not found.')
      return
    }

    const html = await this.render(text)
    element.innerHTML = html
  }
}
