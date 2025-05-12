/**
 * Handle media (images, videos, etc.) in markdown
 */
export class MediaHandler {
  /**
   * Preprocess github videos
   * @param text markdown text
   * @returns preprocessed text
   */
  public handleVideos(text: string): string {
    // GitHub video url pattern (example: ![video](https://user-images.githubusercontent.com/...))
    // This pattern must be processed specially before markdown rendering
    const videoPattern =
      /!\[(.*?)\]\((https:\/\/user-images\.githubusercontent\.com\/.*?\.(?:mp4|mov|webm).*?)\)/g;

    // Convert video url to special marker so it is not processed by markdown parser
    return text.replace(videoPattern, (_match, alt, url) => {
      // Remove query parameters from url and encode it
      const cleanUrl = url.split("?")[0];
      // Replace with special marker (will be converted back after markdown parsing)
      return `<!-- VIDEO_PLACEHOLDER:${alt}:${cleanUrl} -->`;
    });
  }

  /**
   * Convert video link to html video element
   * @param html markdown converted html
   * @returns html with video element
   */
  public handleVideoLinks(html: string): string {
    // Convert video placeholder to actual video tag
    const videoPlaceholderPattern = /<!-- VIDEO_PLACEHOLDER:(.*?):(.*?) -->/g;

    return html.replace(videoPlaceholderPattern, (_match, alt, url) => {
      const videoExtension = this.getFileExtension(url);

      // Create github style video tag
      return `
        <div class="markdown-video-container">
          <div class="markdown-video-wrapper">
            <video 
              controls 
              alt="${alt}" 
              class="markdown-video"
              preload="metadata"
            >
              <source src="${url}" type="video/${videoExtension}">
              Your browser does not support the video tag.
            </video>
            ${alt ? `<p class="markdown-video-caption">${alt}</p>` : ""}
          </div>
        </div>
      `;
    });
  }

  /**
   * Improve image styles
   * @param html HTML string
   * @returns HTML with improved image styles
   */
  public improveImageStyles(html: string): string {
    // Add styles and classes to image tags
    const imgPattern = /<img(.*?)src="(.*?)"(.*?)>/g;

    return html.replace(imgPattern, (_match, prefix, src, suffix) => {
      // Extract alt attribute
      const altMatch = (prefix + suffix).match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : "";

      // Check if style attribute exists
      const hasStyle = prefix.includes('style="') || suffix.includes('style="');

      // Check if class attribute exists
      const hasClass = prefix.includes('class="') || suffix.includes('class="');

      // Create github style image wrapper
      return `<div class="markdown-image-wrapper">
        <a href="${src}" target="_blank" rel="noopener noreferrer" class="markdown-image-link">
          <img${prefix}src="${src}"${suffix}${
            !hasClass ? ' class="markdown-image"' : ""
          }${!hasStyle ? ' style="max-width: 100%; border-radius: 6px;"' : ""}>
        </a>
        ${alt ? `<p class="markdown-image-caption">${alt}</p>` : ""}
      </div>`;
    });
  }

  /**
   * Extract file extension from url
   * @param url file url
   * @returns extension
   */
  private getFileExtension(url: string): string {
    const match = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
    return match ? match[1].toLowerCase() : "";
  }
}
