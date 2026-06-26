import { ImageContext, getMatchingAdapter } from './adapters/registry';
import { GenericArticleAdapter } from './adapters/generic-article';

/**
 * Executes the entire metadata extraction pipeline for a given candidate image.
 */
export async function extractImageContext(el: HTMLElement, url: string): Promise<ImageContext> {
  const hostname = window.location.hostname;
  const adapter = getMatchingAdapter(hostname);
  
  let context: ImageContext = {};

  if (adapter) {
    context = adapter.extractContext(el) || {};
  } else {
    context = GenericArticleAdapter.extractContext(el) || {};
  }

  // Inject standard technical metrics
  context.sourceUrl = url;

  if (el instanceof HTMLImageElement) {
    context.dimensions = `${el.naturalWidth || 'unknown'} × ${el.naturalHeight || 'unknown'} px`;
  } else {
    // Attempt to probe image natural size if loaded
    const tempImg = new Image();
    tempImg.src = url;
    await new Promise<void>((resolve) => {
      tempImg.onload = () => {
        context.dimensions = `${tempImg.naturalWidth} × ${tempImg.naturalHeight} px`;
        resolve();
      };
      tempImg.onerror = () => {
        context.dimensions = 'unknown dimensions';
        resolve();
      };
    });
  }

  // Gather file size asynchronously via HEAD request
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'cors' });
    const sizeBytes = res.headers.get('content-length');
    if (sizeBytes) {
      const kb = parseInt(sizeBytes, 10) / 1024;
      if (kb > 1024) {
        context.fileSize = `${(kb / 1024).toFixed(1)} MB`;
      } else {
        context.fileSize = `${kb.toFixed(0)} KB`;
      }
    } else {
      context.fileSize = 'unknown size';
    }
  } catch {
    context.fileSize = 'unknown size';
  }

  return context;
}

/**
 * Helper to dynamically construct and populate the sidebar panel inner DOM.
 */
export function createSidebarDOM(context: ImageContext, onClose: () => void): string {
  const customItems = Object.entries(context.customDetails || {})
    .map(([key, val]) => `
      <div class="sidebar-section">
        <span class="section-label">${key}</span>
        <span class="section-value">${val}</span>
      </div>
    `).join('');

  return `
    <div class="sidebar-header">
      <span class="sidebar-title">Image Inspector</span>
      <button id="sidebar-close-btn" class="icon-btn" title="Close inspector">
        <svg width="20" height="20" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="sidebar-content">
      ${context.title ? `
        <div class="sidebar-section">
          <span class="section-label">Title / Caption</span>
          <span class="sidebar-image-title section-value" style="font-weight: 600;">${context.title}</span>
        </div>
      ` : ''}

      ${context.creator ? `
        <div class="sidebar-section">
          <span class="section-label">Creator</span>
          <span class="section-value">${context.creator}</span>
        </div>
      ` : ''}

      ${context.description ? `
        <div class="sidebar-section">
          <span class="section-label">Contextual Info</span>
          <span class="section-value">${context.description}</span>
        </div>
      ` : ''}

      ${context.siteName ? `
        <div class="sidebar-section">
          <span class="section-label">Host Site</span>
          <span class="section-value">${context.siteName}</span>
        </div>
      ` : ''}

      ${context.price ? `
        <div class="sidebar-section">
          <span class="section-label">Price Accent</span>
          <span class="section-value" style="color: var(--accent-color); font-weight: bold; font-size: 16px;">${context.price}</span>
        </div>
      ` : ''}

      <div class="sidebar-section">
        <span class="section-label">Dimensions</span>
        <span class="section-value dimensions">${context.dimensions || 'unknown'}</span>
      </div>

      <div class="sidebar-section">
        <span class="section-label">File Size</span>
        <span class="section-value">${context.fileSize || 'unknown'}</span>
      </div>

      ${customItems}

      <div class="sidebar-actions">
        <button id="sidebar-btn-copy" class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy Image URL
        </button>
        <button id="sidebar-btn-tab" class="action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Open in New Tab
        </button>
        <a id="sidebar-btn-dl" class="action-btn primary" href="${context.sourceUrl}" download="loupe-image.jpg">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Original
        </a>
      </div>
    </div>
  `;
}
