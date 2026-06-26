/**
 * Feature 1: Image Discovery & Indexing
 * Scans the DOM, crawls open shadow roots, resolves high-res source URLs,
 * filters icons/trackers, and sorts candidates by visual reading position.
 */

export interface MediaItem {
  element: HTMLElement;
  src: string;
  highResSrc: string;
  alt: string;
  title: string;
  rect: DOMRect;
  width: number;
  height: number;
  type: 'img' | 'picture' | 'input' | 'bg' | 'video';
  mediaType: 'image' | 'video';
  caption?: string;
  poster?: string;
}

export type CandidateImage = MediaItem;

export interface ScanOptions {
  minWidth: number;
  minHeight: number;
  includeSmall: boolean;
}

/**
 * Normalizes and extracts absolute URLs.
 */
function resolveUrl(url: string): string {
  if (!url) return '';
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

/**
 * Finds the largest image source from a srcset string.
 */
function parseSrcset(srcset: string): string {
  if (!srcset) return '';
  const candidates = srcset.split(',').map(item => {
    const parts = item.trim().split(/\s+/);
    const url = parts[0];
    const descriptor = parts[1] || '';
    let size = 0;
    if (descriptor.endsWith('w')) {
      size = parseInt(descriptor.slice(0, -1), 10) || 0;
    } else if (descriptor.endsWith('x')) {
      size = parseFloat(descriptor.slice(0, -1)) * 300 || 0; // rough w equivalence
    }
    return { url, size };
  });

  if (candidates.length === 0) return '';
  candidates.sort((a, b) => b.size - a.size);
  return resolveUrl(candidates[0].url);
}

/**
 * Inspects common data attributes to find a potential high-res version of the image.
 */
export function findHighResSource(el: HTMLElement): string {
  // 1. If it's a picture element, find the active or largest source
  if (el.tagName.toLowerCase() === 'picture' || el.parentElement?.tagName.toLowerCase() === 'picture') {
    const picture = el.tagName.toLowerCase() === 'picture' ? el : el.parentElement!;
    const sources = picture.querySelectorAll('source');
    for (const source of sources) {
      const srcset = source.getAttribute('srcset');
      if (srcset) {
        const highRes = parseSrcset(srcset);
        if (highRes) return highRes;
      }
    }
  }

  // 2. Check standard srcset on <img> elements
  if (el instanceof HTMLImageElement && el.srcset) {
    const highRes = parseSrcset(el.srcset);
    if (highRes) return highRes;
  }

  // 3. Check data attributes for high-res sources (common in lazy-loaders)
  const highResAttrs = [
    'data-zoom-src',
    'data-original',
    'data-full-src',
    'data-full',
    'data-large',
    'data-high-res',
    'data-src-high-res',
    'data-src',
    'data-lazy-src',
    'data-actual-src'
  ];

  for (const attr of highResAttrs) {
    const val = el.getAttribute(attr);
    if (val && val.trim()) {
      return resolveUrl(val.trim());
    }
  }

  // 4. Fallback to standard sources
  if (el instanceof HTMLImageElement) {
    return resolveUrl(el.currentSrc || el.src);
  } else if (el instanceof HTMLInputElement && el.type === 'image') {
    return resolveUrl(el.src);
  }

  // 5. Check CSS background image
  const bgImg = window.getComputedStyle(el).backgroundImage;
  if (bgImg && bgImg !== 'none') {
    const match = bgImg.match(/url\s*\(\s*['"]?([^'"]+)['"]?\s*\)/);
    if (match && match[1]) {
      return resolveUrl(match[1]);
    }
  }

  return '';
}

/**
 * Extract nearest text captions from surrounding ancestors or sibling tags.
 */
export function findCaption(el: HTMLElement): string {
  // Check figcaption
  const figure = el.closest('figure');
  if (figure) {
    const figcaption = figure.querySelector('figcaption');
    if (figcaption && figcaption.textContent) {
      return figcaption.textContent.trim();
    }
  }

  // Check closest sibling or sibling container containing words like "caption", "desc"
  let sibling = el.nextElementSibling;
  while (sibling) {
    if (sibling.classList.value.match(/(caption|desc|text|legend|title)/i)) {
      if (sibling.textContent) return sibling.textContent.trim();
    }
    sibling = sibling.nextElementSibling;
  }

  // Look for sibling aria-describedby or alt texts
  const alt = el.getAttribute('alt') || el.getAttribute('title');
  if (alt) return alt;

  return '';
}

/**
 * Scans a single DOM node (and recurses into children / open shadow roots).
 */
function collectFromNode(
  node: Node,
  mediaItems: Map<string, MediaItem>,
  options: ScanOptions
) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as HTMLElement;

  // Silently skip our own custom shadow elements
  if (el.tagName.toLowerCase() === 'loupe-viewer') return;

  const tagName = el.tagName.toLowerCase();
  let foundSrc = '';
  let type: MediaItem['type'] = 'img';
  let mediaType: MediaItem['mediaType'] = 'image';
  let posterUrl = '';

  if (tagName === 'img' && el instanceof HTMLImageElement) {
    foundSrc = el.currentSrc || el.src;
    type = 'img';
    mediaType = 'image';
  } else if (tagName === 'input' && el instanceof HTMLInputElement && el.type === 'image') {
    foundSrc = el.src;
    type = 'input';
    mediaType = 'image';
  } else if (tagName === 'picture') {
    const imgChild = el.querySelector('img');
    foundSrc = imgChild ? (imgChild.currentSrc || imgChild.src) : '';
    type = 'picture';
    mediaType = 'image';
  } else if (tagName === 'video' && el instanceof HTMLVideoElement) {
    type = 'video';
    mediaType = 'video';

    // For video elements:
    // - Retrieve the best available source URL by trying, in order: video.currentSrc (if non‑empty), video.src, or the src of the first <source> child element. Store this as the video’s canonical URL for matching and sidebar display.
    let foundVideoSrc = '';
    if (el.currentSrc && el.currentSrc.trim() !== '') {
      foundVideoSrc = el.currentSrc;
    } else if (el.src && el.src.trim() !== '') {
      foundVideoSrc = el.src;
    } else {
      const firstSource = el.querySelector('source');
      if (firstSource) {
        foundVideoSrc = firstSource.getAttribute('src') || (firstSource as HTMLSourceElement).src || '';
      }
    }

    // Secondary fallback for lazy-loaded attributes if the canonical sources are not found/set yet
    if (!foundVideoSrc || !foundVideoSrc.trim()) {
      const lazyVideoAttrs = ['data-src', 'data-video-src', 'data-original'];
      for (const attr of lazyVideoAttrs) {
        const val = el.getAttribute(attr);
        if (val && val.trim()) {
          foundVideoSrc = val.trim();
          break;
        }
      }
    }

    foundSrc = foundVideoSrc;

    // Resolve poster URL
    let pUrl = el.getAttribute('poster') || el.poster || '';
    const lazyPosterAttrs = ['data-poster', 'data-thumb', 'data-thumbnail'];
    for (const attr of lazyPosterAttrs) {
      if (!pUrl) {
        const val = el.getAttribute(attr);
        if (val) pUrl = val;
      }
    }
    if (pUrl) {
      posterUrl = resolveUrl(pUrl);
    }
  } else {
    // Check if background image exists
    const bgImg = window.getComputedStyle(el).backgroundImage;
    if (bgImg && bgImg !== 'none') {
      const match = bgImg.match(/url\s*\(\s*['"]?([^'"]+)['"]?\s*\)/);
      if (match && match[1]) {
        foundSrc = match[1];
        type = 'bg';
        mediaType = 'image';
      }
    }
  }

  if (foundSrc) {
    const absoluteSrc = resolveUrl(foundSrc);
    if (absoluteSrc && !absoluteSrc.startsWith('data:image/svg')) { // skip basic inline UI SVGs
      const rect = el.getBoundingClientRect();
      let width = rect.width || el.offsetWidth || (el as any).naturalWidth || (el as any).videoWidth || 0;
      let height = rect.height || el.offsetHeight || (el as any).naturalHeight || (el as any).videoHeight || 0;

      // Use the poster image as a fallback for minimum‑size filtering: if the <video> element itself has a zero or near‑zero rendered size, attempt to load the poster (via a temporary Image object) to obtain dimensions; if the poster has dimensions ≥ the minimum threshold, include the video. If no poster or can’t load it, fall back to a reasonable default dimension (e.g., 300×200) to avoid excluding videos that haven’t rendered yet, or skip the video if you prefer a conservative approach.
      if (mediaType === 'video' && (width <= 10 || height <= 10)) {
        let posterWidth = 0;
        let posterHeight = 0;
        if (posterUrl) {
          const tempImg = new Image();
          tempImg.src = posterUrl;
          if (tempImg.naturalWidth > 0 && tempImg.naturalHeight > 0) {
            posterWidth = tempImg.naturalWidth;
            posterHeight = tempImg.naturalHeight;
          }
        }

        if (posterWidth > 0 && posterHeight > 0) {
          width = posterWidth;
          height = posterHeight;
        } else {
          width = 300;
          height = 200;
        }
      }

      const sizeMatches = options.includeSmall || (width >= options.minWidth && height >= options.minHeight);

      if (sizeMatches && !mediaItems.has(absoluteSrc)) {
        mediaItems.set(absoluteSrc, {
          element: el,
          src: absoluteSrc,
          highResSrc: mediaType === 'video' ? absoluteSrc : (findHighResSource(el) || absoluteSrc),
          alt: el.getAttribute('alt') || '',
          title: el.getAttribute('title') || '',
          rect,
          width,
          height,
          type,
          mediaType,
          caption: findCaption(el),
          poster: posterUrl || undefined
        });
      }
    }
  }

  // Recurse into standard shadow roots
  if (el.shadowRoot) {
    collectFromNode(el.shadowRoot, mediaItems, options);
  }

  // Recurse into children
  const children = el.children;
  for (let i = 0; i < children.length; i++) {
    collectFromNode(children[i], mediaItems, options);
  }
}

/**
 * Collects, filters, and sorts all qualifyable images and videos on the page.
 */
export function scanMedia(options: ScanOptions = { minWidth: 40, minHeight: 40, includeSmall: false }): MediaItem[] {
  const mediaMap = new Map<string, MediaItem>();

  // 1. Scan from the document body
  collectFromNode(document.body, mediaMap, options);

  // 2. Convert to array
  const list = Array.from(mediaMap.values());

  // 3. Sort by visual reading order (top-to-bottom, then left-to-right)
  list.sort((a, b) => {
    // Get viewport absolute positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const topA = a.rect.top + scrollY;
    const topB = b.rect.top + scrollY;
    const leftA = a.rect.left + scrollX;
    const leftB = b.rect.left + scrollX;

    // Grid row sorting tolerance of 15px to keep items in rows together
    if (Math.abs(topA - topB) > 15) {
      return topA - topB;
    }
    return leftA - leftB;
  });

  return list;
}

/**
 * Collects, filters, and sorts all qualifyable media on the page.
 */
export function scanImages(options: ScanOptions = { minWidth: 40, minHeight: 40, includeSmall: false }): MediaItem[] {
  return scanMedia(options);
}
