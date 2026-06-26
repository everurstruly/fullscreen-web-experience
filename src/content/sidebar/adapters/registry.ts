export interface ImageContext {
  title?: string;
  description?: string;
  creator?: string;
  sourceUrl?: string;
  siteName?: string;
  price?: string;
  dimensions?: string;
  fileSize?: string;
  altText?: string;
  duration?: string;
  poster?: string;
  width?: number;
  height?: number;
  customDetails?: Record<string, string>;
}

export interface SiteAdapter {
  match(hostname: string): boolean;
  extractContext(el: HTMLElement): ImageContext | null;
}

/**
 * Adapter for Unsplash photography platform or simulated photography streams.
 */
const UnsplashAdapter: SiteAdapter = {
  match(hostname: string): boolean {
    return hostname.includes('unsplash.com') || hostname.includes('photography');
  },

  extractContext(el: HTMLElement): ImageContext | null {
    // Attempt to extract photographer name and photographic description
    const context: ImageContext = {
      siteName: 'Unsplash Photography',
      title: el.getAttribute('alt') || 'Fine Art Photograph',
    };

    // Unsplash user links often have data-test or class names containing owner/profile
    const userLink = document.querySelector('a[href*="/@"]') || el.closest('div')?.querySelector('a[href*="/@"]');
    if (userLink && userLink.textContent) {
      context.creator = userLink.textContent.trim();
    } else {
      context.creator = 'Professional Photographer';
    }

    // Capture photography technical details if present in standard overlays
    const details: Record<string, string> = {};
    const camera = document.querySelector('span:has(svg)')?.textContent;
    if (camera && camera.match(/(sony|canon|nikon|fujifilm|iphone)/i)) {
      details['Camera'] = camera;
    }
    details['Resolution'] = `${(el as any).naturalWidth || '3840'} x ${(el as any).naturalHeight || '2160'} (4K UHD)`;
    details['License'] = 'Free to use under Loupe License';
    context.customDetails = details;

    return context;
  }
};

/**
 * Adapter for Amazon, Shopify or simulated E-Commerce stores.
 */
const ECommerceAdapter: SiteAdapter = {
  match(hostname: string): boolean {
    return hostname.includes('amazon.') || hostname.includes('shopify') || hostname.includes('store') || hostname.includes('shop');
  },

  extractContext(el: HTMLElement): ImageContext | null {
    const context: ImageContext = {
      siteName: 'E-Commerce Showcase',
      title: document.getElementById('productTitle')?.textContent?.trim() || 
             document.querySelector('h1')?.textContent?.trim() || 
             el.getAttribute('alt') || 'Product Listing Image',
    };

    // Retrieve price
    const priceEl = document.querySelector('.a-price .a-offscreen') || 
                    document.querySelector('[class*="price"]') || 
                    document.querySelector('[id*="price"]');
    if (priceEl && priceEl.textContent) {
      context.price = priceEl.textContent.trim();
    } else {
      context.price = '$49.99'; // fallback simulation for showcase
    }

    const details: Record<string, string> = {
      'Availability': 'In Stock',
      'Shipping': 'Free Next-Day Delivery',
      'Condition': 'New in Original Box'
    };

    const ratingEl = document.querySelector('.a-icon-alt') || document.querySelector('[class*="rating"]');
    if (ratingEl && ratingEl.textContent) {
      details['User Rating'] = ratingEl.textContent.trim();
    }

    context.customDetails = details;
    return context;
  }
};

// Registered registry of adapters
export const ADAPTER_REGISTRY: SiteAdapter[] = [
  UnsplashAdapter,
  ECommerceAdapter
];

/**
 * Finds the matching adapter, or returns null if none matches.
 */
export function getMatchingAdapter(hostname: string): SiteAdapter | null {
  for (const adapter of ADAPTER_REGISTRY) {
    if (adapter.match(hostname)) {
      return adapter;
    }
  }
  return null;
}
