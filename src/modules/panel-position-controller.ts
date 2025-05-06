export class PanelPositionController {
  private panel: HTMLElement;
  private dragHandle: HTMLElement;
  private container: HTMLElement;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragStartTop: number = 0;
  private dragStartLeft: number = 0;

  private boundMouseMove: (e: Event) => void;
  private boundMouseUp: (e: Event) => void;

  /**
   * @param panel the panel element to be dragged (inside Shadow DOM)
   * @param dragHandle the drag handle element (usually the header)
   * @param container the container element that will actually move
   */
  constructor(
    panel: HTMLElement,
    dragHandle: HTMLElement,
    container: HTMLElement,
  ) {
    this.panel = panel;
    this.dragHandle = dragHandle;
    this.container = container;

    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    this.initialize();
  }

  private initialize(): void {
    this.dragHandle.style.cursor = "grab";
    this.dragHandle.style.userSelect = "none";

    this.dragHandle.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
    );
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);
  }

  private handleMouseDown(e: MouseEvent): void {
    if (
      (e.target as HTMLElement).tagName === "BUTTON" ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }

    e.preventDefault();

    this.isDragging = true;
    this.dragHandle.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;

    this.dragStartTop = parseInt(this.container.style.top, 10) || 0;
    this.dragStartLeft = parseInt(this.container.style.left, 10) || 0;
  }

  private handleMouseMove(e: Event): void {
    if (!this.isDragging) return;

    const mouseEvent = e as MouseEvent;
    mouseEvent.preventDefault();

    const deltaX = mouseEvent.clientX - this.dragStartX;
    const deltaY = mouseEvent.clientY - this.dragStartY;

    const newTop = this.dragStartTop + deltaY;
    const newLeft = this.dragStartLeft + deltaX;

    // check if the panel is in the screen boundary
    const rect = this.container.getBoundingClientRect();
    const maxTop = window.innerHeight - rect.height - 20;
    const maxLeft = window.innerWidth - rect.width - 20;

    // restrict the panel to the screen boundary
    this.container.style.top = `${Math.max(20, Math.min(newTop, maxTop))}px`;
    this.container.style.left = `${Math.max(20, Math.min(newLeft, maxLeft))}px`;
  }

  private handleMouseUp(e: Event): void {
    if (!this.isDragging) return;

    e.preventDefault();
    this.isDragging = false;

    this.dragHandle.style.cursor = "grab";
    document.body.style.userSelect = "";
  }

  public cleanup(): void {
    this.dragHandle.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
  }
}
