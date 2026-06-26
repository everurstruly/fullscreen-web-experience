/**
 * Feature 4: Zoom & Pan Mechanics
 * Manages trackpad/pinch zooming, click-and-drag panning,
 * and double-click snapping. Mutually exclusive with Feature 5 (Magnifier).
 */

export class ZoomPanController {
  private container: HTMLElement;
  private image: HTMLImageElement;
  private scale: number = 1;
  private posX: number = 0;
  private posY: number = 0;
  private isPanning: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private onStateChange: (isZoomed: boolean) => void;

  constructor(
    container: HTMLElement,
    image: HTMLImageElement,
    onStateChange: (isZoomed: boolean) => void
  ) {
    this.container = container;
    this.image = image;
    this.onStateChange = onStateChange;

    this.initEvents();
  }

  private initEvents() {
    // 1. Mouse Wheel Zoom (Pinch zoom on Trackpads triggers Ctrl + Wheel)
    this.container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // 2. Click and Drag to Pan
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 3. Double click to toggle Fit <-> 100%
    this.container.addEventListener('dblclick', this.handleDoubleClick.bind(this));

    // 4. Touch support (Pinch/Pan)
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomIntensity = 0.12;

    const mouseX = e.clientX - this.container.getBoundingClientRect().left;
    const mouseY = e.clientY - this.container.getBoundingClientRect().top;

    const previousScale = this.scale;
    
    if (e.deltaY < 0) {
      this.scale = Math.min(this.scale + zoomIntensity * this.scale, 8);
    } else {
      this.scale = Math.max(this.scale - zoomIntensity * this.scale, 0.5);
    }

    // Adjust positions so we zoom into the mouse position
    const ratio = this.scale / previousScale;
    this.posX = mouseX - (mouseX - this.posX) * ratio;
    this.posY = mouseY - (mouseY - this.posY) * ratio;

    this.applyTransform();
  }

  private handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return; // Only left click
    if (this.scale <= 1.05) return; // No panning if fit-to-screen
    this.isPanning = true;
    this.startX = e.clientX - this.posX;
    this.startY = e.clientY - this.posY;
    e.preventDefault();
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isPanning) return;
    this.posX = e.clientX - this.startX;
    this.posY = e.clientY - this.startY;
    this.applyTransform();
  }

  private handleMouseUp() {
    this.isPanning = false;
  }

  private handleDoubleClick(e: MouseEvent) {
    e.preventDefault();
    if (this.scale > 1.05) {
      this.reset();
    } else {
      // Zoom to 100% natural dimensions centered on mouse
      const rect = this.image.getBoundingClientRect();
      const naturalWidth = this.image.naturalWidth || rect.width * 2;
      const renderWidth = rect.width || 1;
      this.scale = naturalWidth / renderWidth;
      if (this.scale < 1.5) this.scale = 2; // enforce noticeable zoom
      if (this.scale > 6) this.scale = 4;

      const mouseX = e.clientX - this.container.getBoundingClientRect().left;
      const mouseY = e.clientY - this.container.getBoundingClientRect().top;
      this.posX = mouseX - (mouseX - 0) * this.scale;
      this.posY = mouseY - (mouseY - 0) * this.scale;

      this.applyTransform();
    }
  }

  // Touch handlers
  private lastTouchDistance: number = 0;
  private isTouching: boolean = false;

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.isTouching = true;
      this.lastTouchDistance = this.getTouchDistance(e);
    } else if (e.touches.length === 1 && this.scale > 1.05) {
      this.isPanning = true;
      this.startX = e.touches[0].clientX - this.posX;
      this.startY = e.touches[0].clientY - this.posY;
    }
  }

  private handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && this.isTouching) {
      e.preventDefault();
      const currentDist = this.getTouchDistance(e);
      const ratio = currentDist / (this.lastTouchDistance || 1);
      this.lastTouchDistance = currentDist;

      const touchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - this.container.getBoundingClientRect().left;
      const touchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - this.container.getBoundingClientRect().top;

      const previousScale = this.scale;
      this.scale = Math.max(0.5, Math.min(this.scale * ratio, 8));

      const scaleRatio = this.scale / previousScale;
      this.posX = touchCenterX - (touchCenterX - this.posX) * scaleRatio;
      this.posY = touchCenterY - (touchCenterY - this.posY) * scaleRatio;

      this.applyTransform();
    } else if (e.touches.length === 1 && this.isPanning) {
      e.preventDefault();
      this.posX = e.touches[0].clientX - this.startX;
      this.posY = e.touches[0].clientY - this.startY;
      this.applyTransform();
    }
  }

  private handleTouchEnd() {
    this.isTouching = false;
    this.isPanning = false;
  }

  private getTouchDistance(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private rotation: number = 0;

  public setRotation(degrees: number) {
    this.rotation = degrees;
    this.applyTransform();
  }

  public getRotation(): number {
    return this.rotation;
  }

  public reset() {
    this.scale = 1;
    this.posX = 0;
    this.posY = 0;
    this.rotation = 0;
    this.applyTransform();
  }

  private applyTransform() {
    // Restrict panning boundaries so image doesn't fly off screen completely
    if (this.scale <= 1) {
      this.posX = 0;
      this.posY = 0;
    }

    this.image.style.transform = `translate3d(${this.posX}px, ${this.posY}px, 0) scale(${this.scale}) rotate(${this.rotation}deg)`;
    this.onStateChange(this.scale > 1.05);
  }

  public getIsZoomed(): boolean {
    return this.scale > 1.05;
  }
}
