export class PanelResizer {
  private panel: HTMLElement;
  private container: HTMLElement;
  private minWidth: number = 300;
  private minHeight: number = 200;
  private isResizing: boolean = false;
  private currentResizeEdge: string | null = null;
  private startX: number = 0;
  private startY: number = 0;
  private startWidth: number = 0;
  private startHeight: number = 0;
  private startTop: number = 0;
  private startLeft: number = 0;

  private boundMouseMove: (e: Event) => void;
  private boundMouseUp: (e: Event) => void;

  private readonly handleSize: number = 6;

  constructor(panel: HTMLElement, container: HTMLElement) {
    this.panel = panel;
    this.container = container;

    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    this.initialize();
  }

  private initialize(): void {
    this.createResizeHandles();
    this.addEventListeners();
  }

  private createResizeHandles(): void {
    const edges = [
      "top",
      "right",
      "bottom",
      "left",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ];

    edges.forEach((edge) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle resize-handle-${edge}`;
      handle.dataset.edge = edge;

      this.applyHandleStyles(handle, edge);

      this.panel.appendChild(handle);
    });
  }

  private applyHandleStyles(handle: HTMLElement, edge: string): void {
    handle.style.position = "absolute";
    handle.style.zIndex = "10000";

    switch (edge) {
      case "top":
        handle.style.top = "0";
        handle.style.left = this.handleSize + "px";
        handle.style.right = this.handleSize + "px";
        handle.style.height = this.handleSize + "px";
        handle.style.cursor = "ns-resize";
        break;
      case "right":
        handle.style.top = this.handleSize + "px";
        handle.style.right = "0";
        handle.style.bottom = this.handleSize + "px";
        handle.style.width = this.handleSize + "px";
        handle.style.cursor = "ew-resize";
        break;
      case "bottom":
        handle.style.bottom = "0";
        handle.style.left = this.handleSize + "px";
        handle.style.right = this.handleSize + "px";
        handle.style.height = this.handleSize + "px";
        handle.style.cursor = "ns-resize";
        break;
      case "left":
        handle.style.top = this.handleSize + "px";
        handle.style.left = "0";
        handle.style.bottom = this.handleSize + "px";
        handle.style.width = this.handleSize + "px";
        handle.style.cursor = "ew-resize";
        break;
      case "top-left":
        handle.style.top = "0";
        handle.style.left = "0";
        handle.style.width = this.handleSize + "px";
        handle.style.height = this.handleSize + "px";
        handle.style.cursor = "nwse-resize";
        break;
      case "top-right":
        handle.style.top = "0";
        handle.style.right = "0";
        handle.style.width = this.handleSize + "px";
        handle.style.height = this.handleSize + "px";
        handle.style.cursor = "nesw-resize";
        break;
      case "bottom-left":
        handle.style.bottom = "0";
        handle.style.left = "0";
        handle.style.width = this.handleSize + "px";
        handle.style.height = this.handleSize + "px";
        handle.style.cursor = "nesw-resize";
        break;
      case "bottom-right":
        handle.style.bottom = "0";
        handle.style.right = "0";
        handle.style.width = this.handleSize + "px";
        handle.style.height = this.handleSize + "px";
        handle.style.cursor = "nwse-resize";
        break;
    }

    handle.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    handle.style.border = "1px solid rgba(0, 0, 0, 0.2)";
  }

  private addEventListeners(): void {
    const handles = this.panel.querySelectorAll(".resize-handle");
    handles.forEach((handle) => {
      handle.addEventListener("mousedown", (e: Event) => {
        this.handleMouseDown(e as MouseEvent);
      });
    });

    // mousemove and mouseup event is registered on document (because the drag can go out of the panel)
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);
  }

  /**
   * Mouse down event handler
   */
  private handleMouseDown(e: MouseEvent): void {
    // prevent default event
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;

    // set resizing start state
    this.isResizing = true;
    this.currentResizeEdge = target.dataset.edge || null;

    // record start position
    this.startX = e.clientX;
    this.startY = e.clientY;

    // record current size and position of the panel
    const rect = this.panel.getBoundingClientRect();
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.startTop = parseInt(this.panel.style.top, 10) || 0;
    this.startLeft = parseInt(this.panel.style.left, 10) || 0;

    // add visual feedback when resizing starts
    document.body.style.cursor = target.style.cursor;
    document.body.style.userSelect = "none"; // prevent text selection
  }

  /**
   * Mouse move event handler
   */
  private handleMouseMove(e: Event): void {
    if (!this.isResizing || !this.currentResizeEdge) return;

    const mouseEvent = e as MouseEvent;
    mouseEvent.preventDefault();

    // calculate mouse move distance
    const deltaX = mouseEvent.clientX - this.startX;
    const deltaY = mouseEvent.clientY - this.startY;

    // limit maximum size to current panel size
    const maxWidth =
      window.innerWidth - parseInt(this.panel.style.right, 10) - 20;
    const maxHeight = window.innerHeight - 40; // 20px 위, 20px 아래 여백 고려

    // resize panel according to the resizing edge
    this.resizePanel(deltaX, deltaY, maxWidth, maxHeight);
  }

  /**
   * Resize panel processing
   */
  private resizePanel(
    deltaX: number,
    deltaY: number,
    maxWidth: number,
    maxHeight: number,
  ): void {
    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newTop = this.startTop;
    let newLeft = this.startLeft;

    // process differently according to the currently selected edge
    switch (this.currentResizeEdge) {
      case "right":
        newWidth = Math.min(
          Math.max(this.startWidth + deltaX, this.minWidth),
          maxWidth,
        );
        this.panel.style.width = `${newWidth}px`;
        this.container.style.width = `${newWidth}px`;
        break;

      case "bottom":
        newHeight = Math.min(
          Math.max(this.startHeight + deltaY, this.minHeight),
          maxHeight,
        );
        this.panel.style.height = `${newHeight}px`;
        this.container.style.height = `${newHeight}px`;
        break;

      case "left":
        const widthChange = Math.min(this.startWidth - this.minWidth, deltaX);
        newWidth = Math.min(
          Math.max(this.startWidth - deltaX, this.minWidth),
          maxWidth,
        );
        newLeft = this.startLeft + (this.startWidth - newWidth);

        this.panel.style.width = `${newWidth}px`;
        this.panel.style.left = `${newLeft}px`;
        this.container.style.width = `${newWidth}px`;
        this.container.style.left = `${newLeft}px`;
        break;

      case "top":
        const heightChange = Math.min(
          this.startHeight - this.minHeight,
          deltaY,
        );
        newHeight = Math.min(
          Math.max(this.startHeight - deltaY, this.minHeight),
          maxHeight,
        );
        newTop = this.startTop + (this.startHeight - newHeight);

        this.panel.style.height = `${newHeight}px`;
        this.panel.style.top = `${newTop}px`;
        this.container.style.height = `${newHeight}px`;
        this.container.style.top = `${newTop}px`;
        break;

      case "top-left":
        // adjust width
        newWidth = Math.min(
          Math.max(this.startWidth - deltaX, this.minWidth),
          maxWidth,
        );
        newLeft = this.startLeft + (this.startWidth - newWidth);

        // adjust height
        newHeight = Math.min(
          Math.max(this.startHeight - deltaY, this.minHeight),
          maxHeight,
        );
        newTop = this.startTop + (this.startHeight - newHeight);

        this.panel.style.width = `${newWidth}px`;
        this.panel.style.height = `${newHeight}px`;
        this.panel.style.top = `${newTop}px`;
        this.panel.style.left = `${newLeft}px`;
        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;
        this.container.style.top = `${newTop}px`;
        this.container.style.left = `${newLeft}px`;
        break;

      case "top-right":
        // adjust width
        newWidth = Math.min(
          Math.max(this.startWidth + deltaX, this.minWidth),
          maxWidth,
        );

        // adjust height
        newHeight = Math.min(
          Math.max(this.startHeight - deltaY, this.minHeight),
          maxHeight,
        );
        newTop = this.startTop + (this.startHeight - newHeight);

        this.panel.style.width = `${newWidth}px`;
        this.panel.style.height = `${newHeight}px`;
        this.panel.style.top = `${newTop}px`;
        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;
        this.container.style.top = `${newTop}px`;
        break;

      case "bottom-left":
        // adjust width
        newWidth = Math.min(
          Math.max(this.startWidth - deltaX, this.minWidth),
          maxWidth,
        );
        newLeft = this.startLeft + (this.startWidth - newWidth);

        // adjust height
        newHeight = Math.min(
          Math.max(this.startHeight + deltaY, this.minHeight),
          maxHeight,
        );

        this.panel.style.width = `${newWidth}px`;
        this.panel.style.height = `${newHeight}px`;
        this.panel.style.left = `${newLeft}px`;
        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;
        this.container.style.left = `${newLeft}px`;
        break;

      case "bottom-right":
        // adjust width
        newWidth = Math.min(
          Math.max(this.startWidth + deltaX, this.minWidth),
          maxWidth,
        );

        // adjust height
        newHeight = Math.min(
          Math.max(this.startHeight + deltaY, this.minHeight),
          maxHeight,
        );

        this.panel.style.width = `${newWidth}px`;
        this.panel.style.height = `${newHeight}px`;
        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;
        break;
    }
  }

  /**
   * Mouse up event handler
   */
  private handleMouseUp(e: Event): void {
    if (!this.isResizing) return;

    // reset resizing state
    this.isResizing = false;
    this.currentResizeEdge = null;

    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  /**
   * Remove resizer event (cleanup)
   */
  public cleanup(): void {
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);

    const handles = this.panel.querySelectorAll(".resize-handle");
    handles.forEach((handle) => {
      if (handle.parentNode === this.panel) {
        this.panel.removeChild(handle);
      }
    });
  }
}
