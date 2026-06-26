import { CandidateImage, scanImages } from './scanner';
import { LOUPE_STYLES } from './styles/tokens';
import { ZoomPanController } from './zoom-pan';
import { MagnifierController } from './magnifier';
import { extractImageContext, createSidebarDOM } from './sidebar';

export class LoupeViewer extends HTMLElement {
  private shadow: ShadowRoot;
  private images: CandidateImage[] = [];
  private currentIndex: number = 0;
  private mode: 'fullscreen' | 'overlay' = 'overlay';
  private sidebarOpen: boolean = false;
  private magnifierZoom: number = 2.5;
  private includeSmall: boolean = false;

  // DOM Elements inside Shadow
  private wrapper!: HTMLElement;
  private canvas!: HTMLElement;
  private imageContainer!: HTMLElement;
  private viewerImage!: HTMLImageElement;
  private lens!: HTMLElement;
  private lensClone!: HTMLImageElement;
  private topBar!: HTMLElement;
  private sidebar!: HTMLElement;
  private bottomProgress!: HTMLElement;
  private navIndicator!: HTMLElement;
  private leftChevron!: HTMLElement;
  private rightChevron!: HTMLElement;
  private toast!: HTMLElement;
  private loader!: HTMLElement;
  private activeHighResLoader: HTMLImageElement | null = null;

  // Controllers
  private zoomPan!: ZoomPanController;
  private magnifier!: MagnifierController;
  private observer: MutationObserver | null = null;

  // Active state
  private isControlsVisible: boolean = true;
  private controlsTimeoutId: number | null = null;
  private isMagnifierActiveState: boolean = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.renderBaseStructure();
    this.loadPersistedSettings();
    this.initMutationObserver();
    this.initGlobalListeners();
    this.showControlsTemporarily();
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.removeGlobalListeners();
  }

  /**
   * Bootstrap base HTML shell & css styles within Shadow DOM.
   */
  private renderBaseStructure() {
    this.shadow.innerHTML = `
      <style>${LOUPE_STYLES}</style>
      <div id="loupe-wrapper" class="loupe-wrapper">
        <!-- Main Interactive Canvas -->
        <div id="viewer-canvas" class="viewer-canvas">
          <!-- Image frame -->
          <div id="image-container" class="image-container">
            <div id="loupe-loader" class="loading-spinner"></div>
            <img id="viewer-image" class="viewer-image" alt="Visualizing..." />
          </div>

          <!-- Magnifier Lens -->
          <div id="magnifier-lens" class="magnifier-lens">
            <img id="magnifier-clone" class="magnifier-clone" alt="Lens details" />
          </div>

          <!-- Navigation Chevrons -->
          <div id="nav-left" class="nav-chevron glass-panel nav-left" title="Previous Image (Left Arrow)">
            <svg width="24" height="24" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </div>
          <div id="nav-right" class="nav-chevron glass-panel nav-right" title="Next Image (Right Arrow)">
            <svg width="24" height="24" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <!-- Top Bar Panel -->
        <div id="top-bar" class="top-bar glass-panel">
          <span id="top-bar-index" class="top-bar-item index">0/0</span>
          
          <button id="toggle-mode-btn" class="icon-btn" title="Toggle Fullscreen (Mode A) / Overlay (Mode B)">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          </button>

          <button id="toggle-magnify-btn" class="icon-btn" title="Toggle Magnifier Lens (M)">
            <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>

          <button id="toggle-sidebar-btn" class="icon-btn" title="Toggle Sidebar Inspector (I)">
            <svg width="18" height="18" viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          </button>
        </div>

        <!-- Floating corner close button -->
        <button id="close-corner-btn" class="icon-btn close-corner-btn glass-panel" title="Exit Loupe (Esc)" style="width: 44px; height: 44px; border-radius: 50%;">
          <svg width="22" height="22" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Dynamic Context Sidebar (Mode B) -->
        <div id="sidebar" class="sidebar glass-panel"></div>

        <!-- Navigation Index Toast (Mode A) -->
        <div id="nav-indicator" class="nav-indicator">3/12</div>

        <!-- Bottom Dot Progress Indicators -->
        <div id="bottom-progress" class="bottom-progress"></div>

        <!-- Mini Toast Alert -->
        <div id="toast-msg" class="toast-msg glass-panel">Linked!</div>
      </div>
    `;

    // Map DOM elements
    this.wrapper = this.shadow.getElementById('loupe-wrapper')!;
    this.canvas = this.shadow.getElementById('viewer-canvas')!;
    this.imageContainer = this.shadow.getElementById('image-container')!;
    this.viewerImage = this.shadow.getElementById('viewer-image')! as HTMLImageElement;
    this.lens = this.shadow.getElementById('magnifier-lens')!;
    this.lensClone = this.shadow.getElementById('magnifier-clone')! as HTMLImageElement;
    this.topBar = this.shadow.getElementById('top-bar')!;
    this.sidebar = this.shadow.getElementById('sidebar')!;
    this.bottomProgress = this.shadow.getElementById('bottom-progress')!;
    this.navIndicator = this.shadow.getElementById('nav-indicator')!;
    this.leftChevron = this.shadow.getElementById('nav-left')!;
    this.rightChevron = this.shadow.getElementById('nav-right')!;
    this.toast = this.shadow.getElementById('toast-msg')!;
    this.loader = this.shadow.getElementById('loupe-loader')!;

    // Instanciate internal controllers
    this.zoomPan = new ZoomPanController(
      this.canvas,
      this.viewerImage,
      (isZoomed) => {
        if (isZoomed && this.isMagnifierActiveState) {
          this.magnifier.deactivate();
        } else if (!isZoomed && this.isMagnifierActiveState) {
          const currentImg = this.images[this.currentIndex];
          this.magnifier.activate(currentImg ? currentImg.highResSrc : this.viewerImage.src, this.magnifierZoom);
        }
      }
    );

    this.magnifier = new MagnifierController(
      this.canvas,
      this.viewerImage,
      this.lens,
      this.lensClone
    );

    // Fade-in animation triggers after render
    setTimeout(() => {
      this.wrapper.classList.add('active');
    }, 50);

    this.initUIInteractions();
  }

  /**
   * Populates list and initializes selected index.
   */
  public initializeViewer(list: CandidateImage[], startUrl: string) {
    this.images = list;
    
    // Attempt matching starting image index
    let startIndex = 0;
    if (startUrl) {
      const matchIdx = list.findIndex(img => img.src === startUrl || img.highResSrc === startUrl);
      if (matchIdx !== -1) {
        startIndex = matchIdx;
      }
    }

    this.currentIndex = startIndex;
    this.renderCurrentImage();
    this.renderProgressDots();
  }

  /**
   * Render the currently indexed image with high-res details, updating preloading queues.
   */
  private async renderCurrentImage() {
    if (this.images.length === 0) {
      this.viewerImage.style.display = 'none';
      this.showToast('No images found on page.');
      return;
    }

    // Cancel any active high-resolution loader from a previous slide.
    // This stops outstanding network requests, preventing connection pool choking.
    if (this.activeHighResLoader) {
      this.activeHighResLoader.onload = null;
      this.activeHighResLoader.onerror = null;
      this.activeHighResLoader.src = '';
      this.activeHighResLoader = null;
    }

    const img = this.images[this.currentIndex];
    this.viewerImage.style.display = 'block';
    
    // Set preview source for an instant visual response at full opacity
    this.viewerImage.src = img.src;
    this.viewerImage.style.opacity = '1';

    // Show loading spinner if higher resolution source is not loaded/matched
    const needsLoader = img.src !== img.highResSrc;
    if (needsLoader) {
      this.loader.classList.add('visible');
    } else {
      this.loader.classList.remove('visible');
    }

    // Load actual high-resolution source asynchronously
    const highRes = new Image();
    this.activeHighResLoader = highRes;
    highRes.src = img.highResSrc;

    highRes.onload = () => {
      // Ensure we only update if this loaded image still matches the current active index/loader
      if (this.activeHighResLoader === highRes) {
        this.viewerImage.src = img.highResSrc;
        this.loader.classList.remove('visible');
        this.activeHighResLoader = null;

        // Re-align magnifier lens if currently active
        if (this.isMagnifierActiveState && !this.zoomPan.getIsZoomed()) {
          this.magnifier.activate(img.highResSrc, this.magnifierZoom);
        }
      }
    };

    highRes.onerror = () => {
      if (this.activeHighResLoader === highRes) {
        this.loader.classList.remove('visible');
        this.activeHighResLoader = null;
      }
    };

    // Update UI counters
    const indexPill = this.shadow.getElementById('top-bar-index')!;
    if (indexPill) {
      indexPill.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }

    // Update Mode A temporary screen pill
    if (this.navIndicator) {
      this.navIndicator.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
      if (this.mode === 'fullscreen') {
        this.navIndicator.classList.add('visible');
        setTimeout(() => this.navIndicator.classList.remove('visible'), 800);
      }
    }

    // Reset layout transformations from previous images
    this.zoomPan.reset();

    // Trigger asynchronous metadata extraction for the context sidebar
    const context = await extractImageContext(img.element, img.highResSrc);
    this.sidebar.innerHTML = createSidebarDOM(context, () => this.toggleSidebar(false));
    this.bindSidebarActions(context);

    // Update visual dot active classes
    const dots = this.bottomProgress.querySelectorAll('.progress-dot');
    dots.forEach((dot, idx) => {
      if (idx === this.currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Smart background preloading of adjacent images
    this.preloadAdjacent();
  }

  /**
   * Preload adjacent images in the pipeline.
   */
  private preloadAdjacent() {
    if (this.images.length <= 1) return;

    const nextIdx = (this.currentIndex + 1) % this.images.length;
    const prevIdx = (this.currentIndex - 1 + this.images.length) % this.images.length;

    const nextImg = new Image();
    nextImg.src = this.images[nextIdx].highResSrc;

    const prevImg = new Image();
    prevImg.src = this.images[prevIdx].highResSrc;
  }

  /**
   * Setup interactive click handlers.
   */
  private initUIInteractions() {
    // Left/Right Nav
    this.leftChevron.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigate(-1);
    });
    this.rightChevron.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigate(1);
    });

    // Close button
    this.shadow.getElementById('close-corner-btn')?.addEventListener('click', () => {
      this.closeViewer();
    });

    // Canvas click to hide controls/sidebar
    this.canvas.addEventListener('click', (e) => {
      if (e.target === this.canvas || e.target === this.imageContainer) {
        this.toggleSidebar(false);
      }
    });

    // Controls activity tracking
    this.canvas.addEventListener('mousemove', () => this.showControlsTemporarily());

    // Toggle Sidebar Action
    this.shadow.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Toggle Mode Action
    this.shadow.getElementById('toggle-mode-btn')?.addEventListener('click', () => {
      this.toggleMode();
    });

    // Toggle Magnifier Action
    this.shadow.getElementById('toggle-magnify-btn')?.addEventListener('click', () => {
      this.toggleMagnifier();
    });

    // Swipe gestures
    let touchStartX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diffX) > 60) {
        if (diffX > 0) this.navigate(-1);
        else this.navigate(1);
      }
    }, { passive: true });
  }

  /**
   * Sidebar controls copy & download binding.
   */
  private bindSidebarActions(context: any) {
    this.shadow.getElementById('sidebar-close-btn')?.addEventListener('click', () => {
      this.toggleSidebar(false);
    });

    this.shadow.getElementById('sidebar-btn-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(context.sourceUrl || '').then(() => {
        this.showToast('Copied URL to Clipboard!');
      });
    });

    this.shadow.getElementById('sidebar-btn-tab')?.addEventListener('click', () => {
      window.open(context.sourceUrl, '_blank');
    });
  }

  /**
   * Navigate index.
   */
  private navigate(direction: number) {
    if (this.images.length <= 1) return;
    this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length;
    this.renderCurrentImage();
  }

  /**
   * Toggle inspector sidebar.
   */
  private toggleSidebar(forceState?: boolean) {
    this.sidebarOpen = forceState !== undefined ? forceState : !this.sidebarOpen;
    const btn = this.shadow.getElementById('toggle-sidebar-btn')!;

    if (this.sidebarOpen) {
      this.wrapper.classList.add('sidebar-open');
      btn.classList.add('active');
    } else {
      this.wrapper.classList.remove('sidebar-open');
      btn.classList.remove('active');
    }
    
    // Update local storage
    this.saveSettings();
  }

  /**
   * Toggle between Mode A (Browser Fullscreen) and Mode B (Overlay)
   */
  private toggleMode() {
    const btn = this.shadow.getElementById('toggle-mode-btn')!;
    if (this.mode === 'overlay') {
      this.mode = 'fullscreen';
      btn.classList.add('active');
      this.enterBrowserFullscreen();
    } else {
      this.mode = 'overlay';
      btn.classList.remove('active');
      this.exitBrowserFullscreen();
    }
    this.saveSettings();
  }

  private enterBrowserFullscreen() {
    this.wrapper.classList.remove('show-controls');
    this.toggleSidebar(false);
    
    // Request fullscreen on this Custom Element host container once
    if (this.requestFullscreen) {
      this.requestFullscreen().catch(() => {
        // Fallback overlay mode
        this.showToast('Fullscreen blocked by host settings.');
        this.mode = 'overlay';
        this.shadow.getElementById('toggle-mode-btn')?.classList.remove('active');
      });
    }
  }

  private exitBrowserFullscreen() {
    if (document.fullscreenElement === this) {
      document.exitFullscreen();
    }
    this.showControlsTemporarily();
  }

  /**
   * Toggle floating magnifier state.
   */
  private toggleMagnifier() {
    this.isMagnifierActiveState = !this.isMagnifierActiveState;
    const btn = this.shadow.getElementById('toggle-magnify-btn')!;

    if (this.isMagnifierActiveState) {
      btn.classList.add('active');
      if (!this.zoomPan.getIsZoomed()) {
        const currentImg = this.images[this.currentIndex];
        this.magnifier.activate(currentImg ? currentImg.highResSrc : this.viewerImage.src, this.magnifierZoom);
        this.showToast('Magnifier Lens ON (Move cursor over image)');
      }
    } else {
      btn.classList.remove('active');
      this.magnifier.deactivate();
    }
  }

  /**
   * Temporary top-bar controls toggler.
   */
  private showControlsTemporarily() {
    if (this.mode === 'fullscreen') return; // hide controls in Fullscreen Mode A
    
    this.wrapper.classList.add('show-controls');
    this.isControlsVisible = true;

    if (this.controlsTimeoutId) {
      clearTimeout(this.controlsTimeoutId);
    }

    this.controlsTimeoutId = window.setTimeout(() => {
      if (!this.sidebarOpen && !this.isMagnifierActiveState) {
        this.wrapper.classList.remove('show-controls');
        this.isControlsVisible = false;
      }
    }, 2500);
  }

  /**
   * Render indicator circles.
   */
  private renderProgressDots() {
    this.bottomProgress.innerHTML = '';
    // If hundreds of images, virtualize to 10 dots max to prevent layout cluttering
    const maxDots = Math.min(this.images.length, 12);
    for (let i = 0; i < maxDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      if (i === this.currentIndex) dot.classList.add('active');
      this.bottomProgress.appendChild(dot);
    }
  }

  /**
   * Register global escape, navigation, and magnifier keyboard hooks.
   */
  private globalKeyHandler = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.closeViewer();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.navigate(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.navigate(1);
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        this.toggleMagnifier();
        break;
      case 'i':
      case 'I':
        e.preventDefault();
        this.toggleSidebar();
        break;
    }
  };

  private initGlobalListeners() {
    window.addEventListener('keydown', this.globalKeyHandler);
    
    // Monitor native browser fullscreen exits gracefully
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement !== this && this.mode === 'fullscreen') {
        this.mode = 'overlay';
        this.shadow.getElementById('toggle-mode-btn')?.classList.remove('active');
        this.showControlsTemporarily();
      }
    });
  }

  private removeGlobalListeners() {
    window.removeEventListener('keydown', this.globalKeyHandler);
  }

  /**
   * Detect newly appended infinite scroll SPA image content.
   */
  private initMutationObserver() {
    this.observer = new MutationObserver(() => {
      // Re-scan silently
      const newList = scanImages({ minWidth: 40, minHeight: 40, includeSmall: this.includeSmall });
      if (newList.length > this.images.length) {
        this.images = newList;
        this.renderProgressDots();
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Persistent storage managers.
   */
  private loadPersistedSettings() {
    const storage = window.chrome?.storage?.local || {
      get: (keys: string[], cb: any) => {
        const val: any = {};
        keys.forEach(k => {
          val[k] = localStorage.getItem(`loupe_${k}`);
        });
        cb(val);
      }
    };

    storage.get(['mode', 'sidebarOpen', 'magnifierZoom', 'includeSmall'], (res: any) => {
      if (res.mode === 'fullscreen') {
        this.mode = 'fullscreen';
        this.shadow.getElementById('toggle-mode-btn')?.classList.add('active');
        this.enterBrowserFullscreen();
      }
      if (res.sidebarOpen === 'true' || res.sidebarOpen === true) {
        this.toggleSidebar(true);
      }
      if (res.magnifierZoom) {
        this.magnifierZoom = parseFloat(res.magnifierZoom) || 2.5;
      }
      if (res.includeSmall === 'true' || res.includeSmall === true) {
        this.includeSmall = true;
      }
    });
  }

  private saveSettings() {
    const data = {
      mode: this.mode,
      sidebarOpen: this.sidebarOpen,
      magnifierZoom: this.magnifierZoom,
      includeSmall: this.includeSmall
    };

    if (window.chrome?.storage?.local) {
      window.chrome.storage.local.set(data);
    } else {
      Object.entries(data).forEach(([key, val]) => {
        localStorage.setItem(`loupe_${key}`, String(val));
      });
    }
  }

  /**
   * Display visual overlay alerts.
   */
  public showToast(msg: string) {
    this.toast.textContent = msg;
    this.toast.classList.add('visible');
    setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 2000);
  }

  /**
   * Tear down the entire viewer completely.
   */
  public closeViewer() {
    if (this.wrapper) {
      this.wrapper.classList.remove('active');
    }
    if (this.magnifier) {
      try {
        this.magnifier.deactivate();
      } catch (err) {
        console.warn('Loupe: magnifier deactivation failed during teardown:', err);
      }
    }
    if (this.zoomPan) {
      try {
        this.zoomPan.reset();
      } catch (err) {
        console.warn('Loupe: zoomPan reset failed during teardown:', err);
      }
    }

    // Fade and delete
    setTimeout(() => {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
      
      // Dispatch close event for hosts/extension handlers
      this.dispatchEvent(new CustomEvent('loupe-closed'));
    }, 300);
  }
}

// Define the custom element
if (!customElements.get('loupe-viewer')) {
  customElements.define('loupe-viewer', LoupeViewer);
}
