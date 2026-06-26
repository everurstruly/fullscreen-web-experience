/**
 * Feature 5: Magnifier Lens
 * Standard circular lens which clones the active image, fetching the
 * high-resolution source, and scales via pure CSS inverse translates.
 * Positioned with buttery-smooth damped frame easing.
 */

export class MagnifierController {
  private container: HTMLElement;
  private targetImage: HTMLImageElement;
  private lens: HTMLElement;
  private clone: HTMLImageElement;
  private isActive: boolean = false;
  private zoomFactor: number = 2.5;
  private isDisabled: boolean = false;

  public setDisabled(disabled: boolean) {
    this.isDisabled = disabled;
    if (disabled) {
      this.deactivate();
    }
  }

  // Damping properties
  private targetX: number = 0;
  private targetY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private animationId: number | null = null;

  constructor(
    container: HTMLElement,
    targetImage: HTMLImageElement,
    lens: HTMLElement,
    clone: HTMLImageElement
  ) {
    this.container = container;
    this.targetImage = targetImage;
    this.lens = lens;
    this.clone = clone;

    this.initEvents();
  }

  private initEvents() {
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('mouseleave', this.deactivate.bind(this));
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isDisabled) return;
    if (!this.isActive) return;

    const rect = this.targetImage.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    // Mouse position relative to the target image
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Boundary check: is cursor over the image?
    if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
      // Mouse position relative to the container for positioning the lens
      this.targetX = e.clientX - containerRect.left;
      this.targetY = e.clientY - containerRect.top;

      this.lens.style.display = 'block';

      if (!this.animationId) {
        this.tick();
      }
    } else {
      this.lens.style.display = 'none';
    }
  }

  private tick() {
    // Elegant damped motion/easing interpolation (0.15 coefficient)
    const easing = 0.15;
    const dx = this.targetX - this.currentX;
    const dy = this.targetY - this.currentY;

    this.currentX += dx * easing;
    this.currentY += dy * easing;

    this.lens.style.left = `${this.currentX - 120}px`; // center lens (120px radius)
    this.lens.style.top = `${this.currentY - 120}px`;

    // Calculate background offsets for the zoomed clone
    const rect = this.targetImage.getBoundingClientRect();
    const lensRect = this.lens.getBoundingClientRect();

    // Find mouse relative coordinate inside image frame
    const relX = (this.currentX - (rect.left - this.container.getBoundingClientRect().left)) / rect.width;
    const relY = (this.currentY - (rect.top - this.container.getBoundingClientRect().top)) / rect.height;

    // Set clone size
    const cloneWidth = rect.width * this.zoomFactor;
    const cloneHeight = rect.height * this.zoomFactor;
    this.clone.style.width = `${cloneWidth}px`;
    this.clone.style.height = `${cloneHeight}px`;

    // Inverse translates within the overflow mask
    const cloneX = -relX * cloneWidth + 120;
    const cloneY = -relY * cloneHeight + 120;
    this.clone.style.left = `${cloneX}px`;
    this.clone.style.top = `${cloneY}px`;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      this.animationId = requestAnimationFrame(this.tick.bind(this));
    } else {
      this.animationId = null;
    }
  }

  private rotation: number = 0;

  public setRotation(degrees: number) {
    this.rotation = degrees;
    this.clone.style.transform = `rotate(${this.rotation}deg)`;
  }

  public activate(highResSrc: string, zoomFactor: number = 2.5) {
    if (this.isDisabled) return;
    this.isActive = true;
    this.zoomFactor = zoomFactor;
    this.clone.src = highResSrc;
    this.clone.style.transform = `rotate(${this.rotation}deg)`;
    this.lens.style.display = 'block';
  }

  public deactivate() {
    this.isActive = false;
    this.lens.style.display = 'none';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public getIsActive(): boolean {
    return this.isActive;
  }
}
