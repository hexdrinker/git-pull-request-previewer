export class PanelSizeController {
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

    const deltaX = mouseEvent.clientX - this.startX;
    const deltaY = mouseEvent.clientY - this.startY;

    let calculatedMaxWidth: number;
    if (this.currentResizeEdge.includes("left")) {
      // When dragging the left edge: The panel's right edge is fixed, and the left edge must be >= 20px.
      // Max width = (initial right edge position) - 20px
      calculatedMaxWidth = this.startLeft + this.startWidth - 20;
    } else {
      // When dragging the right edge: The panel's left edge is fixed, and the right edge must be <= (window width - 20px).
      // Max width = (window width - 20px) - (initial left edge position)
      calculatedMaxWidth = window.innerWidth - this.startLeft - 20;
    }
    calculatedMaxWidth = Math.max(calculatedMaxWidth, this.minWidth);

    let calculatedMaxHeight: number;
    if (this.currentResizeEdge.includes("top")) {
      // When dragging the top edge: The panel's bottom edge is fixed, and the top edge must be >= 20px.
      // Max height = (initial bottom edge position) - 20px
      calculatedMaxHeight = this.startTop + this.startHeight - 20;
    } else {
      // When dragging the bottom edge: The panel's top edge is fixed, and the bottom edge must be <= (window height - 20px).
      // Max height = (window height - 20px) - (initial top edge position)
      calculatedMaxHeight = window.innerHeight - this.startTop - 20;
    }
    calculatedMaxHeight = Math.max(calculatedMaxHeight, this.minHeight);

    this.resizePanel(deltaX, deltaY, calculatedMaxWidth, calculatedMaxHeight);
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

    const PADDING = 20;

    const fixedRightEdge = this.startLeft + this.startWidth;
    const fixedBottomEdge = this.startTop + this.startHeight;

    // process differently according to the currently selected edge
    switch (this.currentResizeEdge) {
      case "right":
        // Left edge is fixed (newLeft = this.startLeft)
        // Top edge is fixed (newTop = this.startTop)
        newWidth = this.startWidth + deltaX;
        newWidth = Math.max(this.minWidth, newWidth);
        newWidth = Math.min(newWidth, maxWidth); // maxWidth is the maximum width when expanding to the right
        // newLeft, newTop remain startLeft, startTop
        break;

      case "bottom":
        // Top edge is fixed (newTop = this.startTop)
        // Left edge is fixed (newLeft = this.startLeft)
        newHeight = this.startHeight + deltaY;
        newHeight = Math.max(this.minHeight, newHeight);
        newHeight = Math.min(newHeight, maxHeight); // maxHeight is the maximum height when expanding downwards
        // newLeft, newTop remain startLeft, startTop
        break;

      case "left":
        // Right edge is fixed (fixedRightEdge)
        // Top edge is fixed (newTop = this.startTop)
        let idealLeft = this.startLeft + deltaX;
        idealLeft = Math.max(idealLeft, PADDING); // Left PADDING constraint

        newWidth = fixedRightEdge - idealLeft;
        newWidth = Math.max(this.minWidth, newWidth);
        newWidth = Math.min(newWidth, maxWidth); // maxWidth is the maximum width when shrinking/expanding to the left

        newLeft = fixedRightEdge - newWidth; // Recalculate newLeft based on the final width
        // newTop remains startTop
        break;

      case "top":
        // Bottom edge is fixed (fixedBottomEdge)
        // Left edge is fixed (newLeft = this.startLeft)
        let idealTop = this.startTop + deltaY;
        idealTop = Math.max(idealTop, PADDING); // Top PADDING constraint

        newHeight = fixedBottomEdge - idealTop;
        newHeight = Math.max(this.minHeight, newHeight);
        newHeight = Math.min(newHeight, maxHeight); // maxHeight is the maximum height when shrinking/expanding upwards

        newTop = fixedBottomEdge - newHeight; // Recalculate newTop based on the final height
        // newLeft remains startLeft
        break;

      case "top-left":
        // Bottom-right corner is fixed (fixedRightEdge, fixedBottomEdge)
        let tl_idealLeft = this.startLeft + deltaX;
        tl_idealLeft = Math.max(tl_idealLeft, PADDING);
        let tl_idealTop = this.startTop + deltaY;
        tl_idealTop = Math.max(tl_idealTop, PADDING);

        newWidth = fixedRightEdge - tl_idealLeft;
        newWidth = Math.max(this.minWidth, newWidth);
        newWidth = Math.min(newWidth, maxWidth);

        newHeight = fixedBottomEdge - tl_idealTop;
        newHeight = Math.max(this.minHeight, newHeight);
        newHeight = Math.min(newHeight, maxHeight);

        newLeft = fixedRightEdge - newWidth;
        newTop = fixedBottomEdge - newHeight;
        break;

      case "top-right":
        // Bottom-left corner is fixed (this.startLeft, fixedBottomEdge)
        newWidth = this.startWidth + deltaX; // Left (this.startLeft) is fixed
        newWidth = Math.max(this.minWidth, newWidth);
        newWidth = Math.min(newWidth, maxWidth);
        // newLeft = this.startLeft; // Remains the same

        let tr_idealTop = this.startTop + deltaY; // Bottom (fixedBottomEdge) is fixed reference
        tr_idealTop = Math.max(tr_idealTop, PADDING);

        newHeight = fixedBottomEdge - tr_idealTop;
        newHeight = Math.max(this.minHeight, newHeight);
        newHeight = Math.min(newHeight, maxHeight);

        newTop = fixedBottomEdge - newHeight;
        break;

      case "bottom-left":
        // Top-right corner is fixed (fixedRightEdge, this.startTop)
        let bl_idealLeft = this.startLeft + deltaX; // Right (fixedRightEdge) is fixed reference
        bl_idealLeft = Math.max(bl_idealLeft, PADDING);

        newWidth = fixedRightEdge - bl_idealLeft;
        newWidth = Math.max(this.minWidth, newWidth);
        newWidth = Math.min(newWidth, maxWidth);

        newLeft = fixedRightEdge - newWidth;

        newHeight = this.startHeight + deltaY; // Top (this.startTop) is fixed
        newHeight = Math.max(this.minHeight, newHeight);
        newHeight = Math.min(newHeight, maxHeight);
        // newTop = this.startTop; // Remains the same
        break;

      case "bottom-right":
        // Top-left corner is fixed (this.startLeft, this.startTop)
        newWidth = this.startWidth + deltaX; // Left (this.startLeft) is fixed
        newWidth = Math.max(this.minWidth, newWidth);
        newWidth = Math.min(newWidth, maxWidth);
        // newLeft = this.startLeft; // Remains the same

        newHeight = this.startHeight + deltaY; // Top (this.startTop) is fixed
        newHeight = Math.max(this.minHeight, newHeight);
        newHeight = Math.min(newHeight, maxHeight);
        // newTop = this.startTop; // Remains the same
        break;
        // Width (logic from case "right")
        newWidth = this.startWidth + deltaX;
        newWidth = Math.max(newWidth, this.minWidth);
        newWidth = Math.min(newWidth, maxWidth); // maxWidth for right-edge

        // Height (logic from case "bottom")
        newHeight = this.startHeight + deltaY;
        newHeight = Math.max(newHeight, this.minHeight);
        newHeight = Math.min(newHeight, maxHeight); // maxHeight for bottom-edge
        break;
    }

    // Update panel and container styles
    this.panel.style.width = `${newWidth}px`;
    this.panel.style.height = `${newHeight}px`;
    this.panel.style.top = `${newTop}px`;
    this.panel.style.left = `${newLeft}px`;

    this.container.style.width = `${newWidth}px`;
    this.container.style.height = `${newHeight}px`;
    this.container.style.top = `${newTop}px`;
    this.container.style.left = `${newLeft}px`;
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
