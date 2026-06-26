import { ImageContext } from './registry';

/**
 * Adapter to parse structured articles, Open Graph metadata, and JSON-LD content.
 */
export const GenericArticleAdapter = {
  match(url: string): boolean {
    return true; // Catch-all fallback
  },

  extractContext(el: HTMLElement): ImageContext | null {
    const context: ImageContext = {};

    // 1. Resolve general web metadata as fallbacks
    // Page Open Graph metadata
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const ogSite = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');

    if (ogSite) context.siteName = ogSite;

    // 2. Resolve image details
    context.title = el.getAttribute('title') || el.getAttribute('alt') || ogTitle || document.title;
    context.altText = el.getAttribute('alt') || '';

    // Search nearest heading
    let ancestor: HTMLElement | null = el.parentElement;
    let headingText = '';
    while (ancestor && !headingText) {
      const heading = ancestor.querySelector('h1, h2, h3');
      if (heading && heading.textContent) {
        headingText = heading.textContent.trim();
      }
      ancestor = ancestor.parentElement;
    }
    if (headingText && headingText !== context.title) {
      context.description = `From section: "${headingText}"`;
    } else if (ogDesc) {
      context.description = ogDesc;
    }

    // Try finding JSON-LD details
    try {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        if (!script.textContent) continue;
        const data = JSON.parse(script.textContent);
        const searchLd = (obj: any): any => {
          if (!obj) return null;
          if (obj['@type'] === 'ImageObject' || obj['@type'] === 'NewsArticle' || obj['@type'] === 'Product') {
            return obj;
          }
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const res = searchLd(item);
              if (res) return res;
            }
          } else if (typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
              const res = searchLd(obj[key]);
              if (res) return res;
            }
          }
          return null;
        };

        const targetNode = searchLd(data);
        if (targetNode) {
          if (targetNode.name && !context.title) context.title = targetNode.name;
          if (targetNode.description && !context.description) context.description = targetNode.description;
          if (targetNode.creator && targetNode.creator.name) context.creator = targetNode.creator.name;
          break;
        }
      }
    } catch {
      // fail silently
    }

    return context;
  }
};
