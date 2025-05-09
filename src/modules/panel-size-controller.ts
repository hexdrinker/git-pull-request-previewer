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
  private boundWindowResize: () => void;

  private readonly handleSize: number = 6;

  constructor(panel: HTMLElement, container: HTMLElement) {
    this.panel = panel;
    this.container = container;

    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundWindowResize = this.handleWindowResize.bind(this);

    this.initialize();
  }

  private initialize(): void {
    this.createResizeHandles();
    this.addEventListeners();
    window.addEventListener("resize", this.boundWindowResize);

    requestAnimationFrame(() => this.handleWindowResize());
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
        handle.style.left = `${this.handleSize}px`;
        handle.style.right = `${this.handleSize}px`;
        handle.style.height = `${this.handleSize}px`;
        handle.style.cursor = "ns-resize";
        break;
      case "right":
        handle.style.top = `${this.handleSize}px`;
        handle.style.right = "0";
        handle.style.bottom = `${this.handleSize}px`;
        handle.style.width = `${this.handleSize}px`;
        handle.style.cursor = "ew-resize";
        break;
      case "bottom":
        handle.style.bottom = "0";
        handle.style.left = `${this.handleSize}px`;
        handle.style.right = `${this.handleSize}px`;
        handle.style.height = `${this.handleSize}px`;
        handle.style.cursor = "ns-resize";
        break;
      case "left":
        handle.style.top = `${this.handleSize}px`;
        handle.style.left = "0";
        handle.style.bottom = `${this.handleSize}px`;
        handle.style.width = `${this.handleSize}px`;
        handle.style.cursor = "ew-resize";
        break;
      case "top-left":
        handle.style.top = "0";
        handle.style.left = "0";
        handle.style.width = `${this.handleSize}px`;
        handle.style.height = `${this.handleSize}px`;
        handle.style.cursor = "nwse-resize";
        break;
      case "top-right":
        handle.style.top = "0";
        handle.style.right = "0";
        handle.style.width = `${this.handleSize}px`;
        handle.style.height = `${this.handleSize}px`;
        handle.style.cursor = "nesw-resize";
        break;
      case "bottom-left":
        handle.style.bottom = "0";
        handle.style.left = "0";
        handle.style.width = `${this.handleSize}px`;
        handle.style.height = `${this.handleSize}px`;
        handle.style.cursor = "nesw-resize";
        break;
      case "bottom-right":
        handle.style.bottom = "0";
        handle.style.right = "0";
        handle.style.width = `${this.handleSize}px`;
        handle.style.height = `${this.handleSize}px`;
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

  private handleWindowResize(): void {
    // 사용자가 패널을 드래그하여 리사이징 중(this.isResizing)일 때는
    // 이 자동 조정을 잠시 멈추거나, 드래그 로직과 통합하여 충돌을 방지할 수 있습니다.
    // 여기서는 설명을 위해 드래그 중 여부와 관계없이 항상 제약을 적용하는 것으로 가정합니다.

    const PADDING = 20; // 패널과 뷰포트 가장자리 사이의 최소 간격
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 1. 현재 패널의 크기와 위치를 가져옵니다.
    // panel.style에서 직접 값을 읽어오고, 없다면 0으로 간주합니다.
    // 이는 handleMouseDown에서 this.startTop/Left를 초기화하는 방식과 일관성을 유지합니다.
    const currentPanelRect = this.panel.getBoundingClientRect(); // 실제 렌더링된 크기
    let currentWidth = currentPanelRect.width;
    let currentHeight = currentPanelRect.height;
    let currentTop = parseInt(this.panel.style.top, 10) || 0;
    let currentLeft = parseInt(this.panel.style.left, 10) || 0;

    // 2. 목표 패널 크기를 계산합니다.
    // 뷰포트 내 가용 공간을 초과하지 않도록 하며, 최소 크기를 보장합니다.
    let targetWidth = currentWidth;
    const maxAllowedWidth = viewportWidth - PADDING * 2;
    if (targetWidth > maxAllowedWidth) {
      targetWidth = maxAllowedWidth;
    }
    targetWidth = Math.max(this.minWidth, targetWidth); // 최소 너비 적용

    let targetHeight = currentHeight;
    const maxAllowedHeight = viewportHeight - PADDING * 2;
    if (targetHeight > maxAllowedHeight) {
      targetHeight = maxAllowedHeight;
    }
    targetHeight = Math.max(this.minHeight, targetHeight); // 최소 높이 적용

    // 3. 목표 패널 위치를 계산합니다.
    // 현재 위치를 기준으로, 패딩을 고려하여 뷰포트 경계 안에 있도록 조정합니다.
    let targetTop = currentTop;
    let targetLeft = currentLeft;

    // 위쪽 경계 조정
    if (targetTop < PADDING) {
      targetTop = PADDING;
    }
    // 아래쪽 경계 조정 (패널의 아래쪽 끝 기준)
    if (targetTop + targetHeight > viewportHeight - PADDING) {
      targetTop = viewportHeight - PADDING - targetHeight;
      // 만약 패널이 너무 커서 위로 올렸을 때 상단 패딩을 침범하면, 상단 패딩에 맞춤
      if (targetTop < PADDING) {
        targetTop = PADDING;
      }
    }

    // 왼쪽 경계 조정
    if (targetLeft < PADDING) {
      targetLeft = PADDING;
    }
    // 오른쪽 경계 조정 (패널의 오른쪽 끝 기준)
    if (targetLeft + targetWidth > viewportWidth - PADDING) {
      targetLeft = viewportWidth - PADDING - targetWidth;
      // 만약 패널이 너무 커서 왼쪽으로 밀었을 때 좌측 패딩을 침범하면, 좌측 패딩에 맞춤
      if (targetLeft < PADDING) {
        targetLeft = PADDING;
      }
    }

    // 4. 계산된 크기 및 위치로 패널 스타일을 업데이트합니다. (실제 변경이 있을 경우에만)
    //    부동소수점 비교로 인한 문제를 피하기 위해 Math.round를 사용하거나 작은 오차(epsilon)를 고려할 수 있습니다.
    const needsUpdate =
      Math.round(currentWidth) !== Math.round(targetWidth) ||
      Math.round(currentHeight) !== Math.round(targetHeight) ||
      Math.round(currentTop) !== Math.round(targetTop) ||
      Math.round(currentLeft) !== Math.round(targetLeft);

    if (needsUpdate) {
      this.panel.style.width = `${targetWidth}px`;
      this.panel.style.height = `${targetHeight}px`;
      this.panel.style.top = `${targetTop}px`;
      this.panel.style.left = `${targetLeft}px`;

      // 컨테이너의 크기와 위치도 패널과 동일하게 업데이트합니다.
      this.container.style.width = `${targetWidth}px`;
      this.container.style.height = `${targetHeight}px`;
      this.container.style.top = `${targetTop}px`;
      this.container.style.left = `${targetLeft}px`;
    }
  }

  /**
   * Remove resizer event (cleanup)
   */
  public cleanup(): void {
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
    window.removeEventListener("resize", this.boundWindowResize);

    const handles = this.panel.querySelectorAll(".resize-handle");
    handles.forEach((handle) => {
      if (handle.parentNode === this.panel) {
        this.panel.removeChild(handle);
      }
    });
  }
}
