import { MarkdownRenderer } from "@/modules/markdown-renderer";
import { PanelResizer } from "@/modules/panel-resizer";
import { PanelPositionController } from "@/modules/panel-position-controller";

/**
 * Manage markdown preview panel using ShadowDOM
 */
export class MarkdownPreviewManager {
  private previewEnabled: boolean = true;
  private previewContainer: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private previewContent: HTMLElement | null = null;
  private markdownRenderer: MarkdownRenderer;
  private floatingButton: HTMLElement | null = null;
  private panelResizer: PanelResizer | null = null;
  private panelPositionController: PanelPositionController | null = null;
  constructor() {
    this.markdownRenderer = new MarkdownRenderer();
  }

  /**
   * Return if preview is enabled
   */
  public isPreviewEnabled(): boolean {
    return this.previewEnabled;
  }

  /**
   * Set preview enabled state
   * @param enabled enabled state
   */
  public setPreviewEnabled(enabled: boolean): void {
    this.previewEnabled = enabled;
    this.updatePreviewVisibility();
  }

  /**
   * Check if preview is visible
   */
  public isPreviewVisible(): boolean {
    return (
      !!this.previewContainer && this.previewContainer.style.display !== "none"
    );
  }

  /**
   * Initialize preview
   * @param textarea GitHub textarea element
   */
  public initializePreview(textarea: HTMLTextAreaElement): void {
    if (!this.previewContainer) {
      this.createPreviewContainer();
    }

    if (this.previewContainer && this.previewEnabled) {
      this.showPreview();
      this.updatePreview(textarea.value);
    }
  }

  /**
   * Create preview container using ShadowDOM
   */
  private createPreviewContainer(): void {
    this.previewContainer = document.createElement("div");
    this.previewContainer.id = "markdown-preview-container";
    this.previewContainer.style.position = "absolute";

    const width = Math.round(window.innerWidth * 0.38);
    const height = Math.round(window.innerHeight - 40);
    const left = Math.round((window.innerWidth - width) / 2);
    const top = Math.round((window.innerHeight - height) / 2);

    this.previewContainer.style.top = `${top}px`;
    this.previewContainer.style.left = `${left}px`;
    this.previewContainer.style.width = `${width}px`;
    this.previewContainer.style.height = `${height}px`;
    this.previewContainer.style.zIndex = "9999";
    document.body.appendChild(this.previewContainer);

    this.shadowRoot = this.previewContainer.attachShadow({ mode: "open" });

    this.initShadowDomContent();
    this.initPanelResizer();
    this.initPanelPositionController();
  }

  /**
   * Initialize ShadowDOM content
   */
  private initShadowDomContent(): void {
    if (!this.shadowRoot) return;

    // 1. styles
    const style = document.createElement("style");
    style.textContent = this.getPreviewStyles();

    // 2. container
    const container = document.createElement("div");
    container.className = "preview-panel";

    // 3. header
    const header = document.createElement("div");
    header.className = "preview-header";

    header.style.userSelect = "none";

    const title = document.createElement("h3");
    title.textContent = "Pull Request Previewer";

    const minimizeButton = document.createElement("button");
    minimizeButton.className = "minimize-button";
    minimizeButton.textContent = "_";
    minimizeButton.addEventListener("click", () => this.minimizePreview());

    header.appendChild(title);
    header.appendChild(minimizeButton);

    // 4. contents
    this.previewContent = document.createElement("div");
    this.previewContent.className = "preview-content markdown-body";

    // 5. combine elements
    container.appendChild(header);
    container.appendChild(this.previewContent);

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
  }

  /**
   * Initialize panel resizer
   */
  private initPanelResizer(): void {
    if (!this.previewContainer || !this.shadowRoot) return;

    const previewPanel = this.shadowRoot.querySelector(
      ".preview-panel",
    ) as HTMLElement;

    if (!previewPanel) return;

    this.panelResizer = new PanelResizer(previewPanel, this.previewContainer);
  }

  /**
   * Initialize panel dragger
   */
  private initPanelPositionController(): void {
    if (!this.previewContainer || !this.shadowRoot) return;

    const previewPanel = this.shadowRoot.querySelector(
      ".preview-panel",
    ) as HTMLElement;
    const headerElement = this.shadowRoot.querySelector(
      ".preview-header",
    ) as HTMLElement;

    if (previewPanel && headerElement && this.previewContainer) {
      this.panelPositionController = new PanelPositionController(
        previewPanel,
        headerElement,
        this.previewContainer,
      );
    }
  }

  /**
   * Return preview styles as CSS string
   */
  private getPreviewStyles(): string {
    return `
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #24292e;
      }
      
      .preview-panel {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        border-radius: 8px 0 0 8px;
        box-shadow: -5px 0 25px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        background-color: #f6f8fa;
        border-bottom: 1px solid #e1e4e8;
      }
      
      .preview-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #24292e;
      }
      
      .minimize-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #586069;
        padding: 0 6px;
      }
      
      .minimize-button:hover {
        color: #24292e;
      }
      
      .preview-content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        background-color: #ffffff;
      }
      
      /* GitHub 마크다운 스타일 */
      .markdown-body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        word-wrap: break-word;
        color: #24292e;
      }
      
      /* 헤딩 스타일 */
      .markdown-body h1 {
        font-size: 2em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      
      .markdown-body h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      
      .markdown-body h3 {
        font-size: 1.25em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      
      .markdown-body h4 {
        font-size: 1em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      
      .markdown-body h5 {
        font-size: 0.875em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      
      .markdown-body h6 {
        font-size: 0.85em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        color: #6a737d;
      }
      
      /* 단락 및 리스트 */
      .markdown-body p, 
      .markdown-body ul, 
      .markdown-body ol {
        margin-top: 0;
        margin-bottom: 16px;
      }
      
      .markdown-body ul, 
      .markdown-body ol {
        padding-left: 2em;
      }
      
      .markdown-body li {
        margin-top: 0.25em;
      }
      
      .markdown-body li + li {
        margin-top: 0.25em;
      }
      
      .markdown-body ul:has(input[type="checkbox"]) {
        list-style: none;
        padding-left: 0.75em;
      }
      
      /* 인용구 */
      .markdown-body blockquote {
        margin: 0;
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
      }
      
      /* 코드 */
      .markdown-body pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 6px;
        margin-top: 0;
        margin-bottom: 16px;
        word-wrap: normal;
      }
      
      .markdown-body code {
        font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
      }
      
      .markdown-body pre code {
        display: block;
        padding: 0;
        margin: 0;
        overflow: auto;
        line-height: inherit;
        word-wrap: normal;
        background-color: transparent;
        border: 0;
      }
      
      /* 테이블 */
      .markdown-table {
        display: block;
        width: 100%;
        overflow: auto;
        border-collapse: collapse;
        border-spacing: 0;
        margin-bottom: 16px;
      }
      
      .markdown-table th {
        font-weight: 600;
        background-color: #f6f8fa;
      }
      
      .markdown-table th, 
      .markdown-table td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }
      
      .markdown-table tr {
        background-color: #fff;
        border-top: 1px solid #c6cbd1;
      }
      
      .markdown-table tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
      
      /* 링크 */
      .markdown-body a {
        color: #0366d6;
        text-decoration: none;
      }
      
      .markdown-body a:hover {
        text-decoration: underline;
      }
      
      /* 이미지 */
      .markdown-image {
        max-width: 100%;
        box-sizing: border-box;
        background-color: #fff;
        border-style: none;
        border-radius: 6px;
      }
      
      .markdown-image-wrapper {
        margin: 16px 0;
        text-align: center;
      }
      
      .markdown-image-link {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        text-decoration: none;
      }
      
      .markdown-image-link:hover {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
      }
      
      .markdown-image-caption {
        margin-top: 8px;
        color: #586069;
        font-size: 14px;
        text-align: center;
      }
      
      /* 체크박스 */
      .markdown-body input[type="checkbox"] {
        margin-right: 0.5em;
        margin-top: 0;
        vertical-align: middle;
      }
      
      /* 수평선 */
      .markdown-body hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #e1e4e8;
        border: 0;
      }
      
      /* 코드 블럭 */
      .markdown-code {
        padding: 16px;
        background-color: #f6f8fa;
        border-radius: 6px;
        font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 85%;
        margin-bottom: 16px;
        overflow: auto;
      }
      
      /* 비디오 컨테이너 */
      .markdown-video-container {
        margin: 16px 0;
        text-align: center;
      }
      
      .markdown-video-wrapper {
        display: inline-block;
        max-width: 100%;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .markdown-video {
        max-width: 100%;
        border-radius: 6px;
        display: block;
      }
      
      .markdown-video-caption {
        margin-top: 8px;
        color: #586069;
        font-size: 14px;
        text-align: center;
      }
      
      /* 인라인 코드 */
      code {
        font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
        padding: 0.2em 0.4em;
        font-size: 85%;
      }
      
      /* 강조 표시 */
      .markdown-body strong {
        font-weight: 600;
      }
      
      .markdown-body em {
        font-style: italic;
      }
      
      /* 취소선 */
      .markdown-body del {
        text-decoration: line-through;
      }
      
      /* 다크 테마 지원 (GitHub의 다크 모드와 유사하게) */
      @media (prefers-color-scheme: dark) {
        .preview-panel {
          background-color: #0d1117;
        }
        
        .preview-header {
          background-color: #161b22;
          border-bottom: 1px solid #30363d;
        }
        
        .preview-header h3 {
          color: #c9d1d9;
        }
        
        .preview-content {
          background-color: #0d1117;
        }
        
        .markdown-body {
          color: #c9d1d9;
        }
        
        .markdown-body h1,
        .markdown-body h2 {
          border-bottom: 1px solid #21262d;
        }
        
        .markdown-body h6 {
          color: #8b949e;
        }
        
        .markdown-body blockquote {
          color: #8b949e;
          border-left: 0.25em solid #30363d;
        }
        
        .markdown-body pre {
          background-color: #161b22;
        }
        
        .markdown-body code {
          background-color: rgba(240, 246, 252, 0.15);
        }
        
        .markdown-table th {
          background-color: #161b22;
        }
        
        .markdown-table th, 
        .markdown-table td {
          border: 1px solid #30363d;
        }
        
        .markdown-table tr {
          background-color: #0d1117;
          border-top: 1px solid #30363d;
        }
        
        .markdown-table tr:nth-child(2n) {
          background-color: #161b22;
        }
        
        .markdown-body a {
          color: #58a6ff;
        }
        
        .markdown-body hr {
          background-color: #30363d;
        }
        
        .markdown-code {
          background-color: #161b22;
        }
        
        code {
          background-color: rgba(240, 246, 252, 0.15);
        }
        
        .minimize-button {
          color: #8b949e;
        }
        
        .minimize-button:hover {
          color: #c9d1d9;
        }
        
        .markdown-image {
          background-color: #0d1117;
          border: 1px solid #30363d;
        }
        
        .markdown-image-link {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        
        .markdown-image-link:hover {
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.6);
        }
        
        .markdown-image-caption,
        .markdown-video-caption {
          color: #8b949e;
        }
        
        .markdown-video-wrapper {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          border: 1px solid #30363d;
        }
      }
    `;
  }

  /**
   * Update preview
   * @param markdown markdown text
   */
  public updatePreview(markdown: string): void {
    if (!this.previewContent || !this.isPreviewVisible()) return;

    this.markdownRenderer
      .render(markdown)
      .then((html) => {
        if (this.previewContent) {
          this.previewContent.innerHTML = html;
        }
      })
      .catch((error) => {
        console.error("[Error] Failed to update preview:", error);
      });
  }

  /**
   * Minimize preview
   */
  private minimizePreview(): void {
    if (!this.previewContainer) return;

    this.previewContainer.style.display = "none";
    this.createFloatingButton();
  }

  /**
   * Show preview
   */
  private showPreview(): void {
    if (!this.previewContainer) return;

    this.previewContainer.style.display = "block";

    if (this.floatingButton) {
      this.floatingButton.style.display = "none";
    }
  }

  /**
   * Update preview visibility
   */
  private updatePreviewVisibility(): void {
    if (!this.previewContainer) return;

    if (this.previewEnabled) {
      this.previewContainer.style.display = "block";
      if (this.floatingButton) {
        this.floatingButton.style.display = "none";
      }
    } else {
      this.previewContainer.style.display = "none";
      if (this.floatingButton) {
        this.floatingButton.style.display = "none";
      }
    }
  }

  /**
   * Create floating button (displayed when preview is minimized)
   */
  private createFloatingButton(): void {
    if (this.floatingButton) {
      this.floatingButton.style.display = "block";
      return;
    }

    this.floatingButton = document.createElement("button");
    this.floatingButton.textContent = "📝";
    this.floatingButton.style.position = "fixed";
    this.floatingButton.style.bottom = "20px";
    this.floatingButton.style.right = "20px";
    this.floatingButton.style.width = "50px";
    this.floatingButton.style.height = "50px";
    this.floatingButton.style.borderRadius = "50%";
    this.floatingButton.style.backgroundColor = "#238636";
    this.floatingButton.style.color = "white";
    this.floatingButton.style.border = "none";
    this.floatingButton.style.fontSize = "20px";
    this.floatingButton.style.cursor = "pointer";
    this.floatingButton.style.zIndex = "9999";
    this.floatingButton.style.boxShadow = "0 3px 12px rgba(0, 0, 0, 0.25)";

    this.floatingButton.addEventListener("mouseenter", () => {
      if (this.floatingButton) {
        this.floatingButton.style.transform = "scale(1.05)";
        this.floatingButton.style.backgroundColor = "#2ea043";
      }
    });

    this.floatingButton.addEventListener("mouseleave", () => {
      if (this.floatingButton) {
        this.floatingButton.style.transform = "scale(1)";
        this.floatingButton.style.backgroundColor = "#238636";
      }
    });

    this.floatingButton.addEventListener("click", () => {
      this.showPreview();
    });

    document.body.appendChild(this.floatingButton);
  }

  /**
   * Clean up
   */
  public cleanup(): void {
    if (this.panelResizer) {
      this.panelResizer.cleanup();
      this.panelResizer = null;
    }

    if (this.panelPositionController) {
      this.panelPositionController.cleanup();
      this.panelPositionController = null;
    }

    if (this.previewContainer) {
      document.body.removeChild(this.previewContainer);
      this.previewContainer = null;
      this.shadowRoot = null;
      this.previewContent = null;
    }

    if (this.floatingButton) {
      document.body.removeChild(this.floatingButton);
      this.floatingButton = null;
    }
  }
}
