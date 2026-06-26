import { scanImages } from './scanner';
import { LoupeViewer } from './viewer-host';

/**
 * Entry-point script for Chrome Extension Content Injection.
 * Listens for triggers from the background worker.
 */

// Simple active ping-pong to determine if we are already injected
chrome.runtime?.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ status: 'pong' });
    return true;
  }

  if (message.action === 'trigger_loupe') {
    triggerViewer(message.startUrl);
    sendResponse({ status: 'triggered' });
    return true;
  }
});

/**
 * Boots the Viewer shadow element and attaches it to the DOM.
 */
export function triggerViewer(startUrl?: string) {
  // If a viewer is already active, close it first
  const existing = document.querySelector('loupe-viewer') as LoupeViewer | null;
  if (existing) {
    if (existing && typeof (existing as any).closeViewer === 'function') {
      try {
        (existing as any).closeViewer();
      } catch (err) {
        console.warn('Loupe: failed to call closeViewer on existing element, removing directly:', err);
        existing.remove();
      }
    } else if (existing) {
      existing.remove();
    }
    return;
  }

  // Retrieve user filter configs if stored, default to minimum 40px bounding boxes
  const storage = window.chrome?.storage?.local || {
    get: (keys: string[], cb: any) => {
      cb({
        minWidth: localStorage.getItem('loupe_minWidth') || '40',
        minHeight: localStorage.getItem('loupe_minHeight') || '40',
        includeSmall: localStorage.getItem('loupe_includeSmall') === 'true'
      });
    }
  };

  storage.get(['minWidth', 'minHeight', 'includeSmall'], (settings: any) => {
    const minW = parseInt(settings.minWidth, 10) || 40;
    const minH = parseInt(settings.minHeight, 10) || 40;
    const inclS = settings.includeSmall === true || settings.includeSmall === 'true';

    // 1. Scan images
    const images = scanImages({ minWidth: minW, minHeight: minH, includeSmall: inclS });

    if (images.length === 0) {
      alert('Loupe: No images of qualifying size found on this page.');
      return;
    }

    // 2. Spawn <loupe-viewer> custom element
    let viewer: LoupeViewer;
    try {
      viewer = new LoupeViewer();
    } catch (err) {
      console.warn('Loupe: Failed to construct LoupeViewer directly, falling back to createElement:', err);
      viewer = document.createElement('loupe-viewer') as LoupeViewer;
    }
    document.body.appendChild(viewer);

    // 3. Initialize with scanned index
    if (typeof viewer.initializeViewer === 'function') {
      viewer.initializeViewer(images, startUrl || '');
    } else {
      console.warn('Loupe: LoupeViewer.initializeViewer is not a function. Waiting for custom elements upgrade...');
      // Wait for registry definition
      customElements.whenDefined('loupe-viewer').then(() => {
        const upgradedViewer = document.querySelector('loupe-viewer') as any;
        if (upgradedViewer && typeof upgradedViewer.initializeViewer === 'function') {
          upgradedViewer.initializeViewer(images, startUrl || '');
        }
      });
      // Immediate next-tick retry
      setTimeout(() => {
        if (typeof viewer.initializeViewer === 'function') {
          viewer.initializeViewer(images, startUrl || '');
        }
      }, 50);
    }
  });
}
