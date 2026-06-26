/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Settings, 
  Download, 
  Terminal, 
  FileCode, 
  ChevronRight, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Compass, 
  Play, 
  Menu,
  X,
  Copy,
  FolderOpen,
  Keyboard
} from 'lucide-react';
import Simulators from './components/Simulators';
import { triggerViewer } from './content/index';

function matchesShortcut(e: KeyboardEvent, shortcutStr: string): boolean {
  const parts = shortcutStr.split('+');
  const mainKey = parts[parts.length - 1].toUpperCase();
  
  const hasCtrl = parts.includes('Ctrl');
  const hasShift = parts.includes('Shift');
  const hasAlt = parts.includes('Alt');
  const hasMeta = parts.includes('Meta') || parts.includes('Cmd') || parts.includes('Command');

  // Check modifier keys
  if (hasCtrl !== e.ctrlKey) return false;
  if (hasShift !== e.shiftKey) return false;
  if (hasAlt !== e.altKey) return false;
  if (hasMeta !== e.metaKey) return false;

  // Check main key
  let eventKey = e.key.toUpperCase();
  if (eventKey === ' ') eventKey = 'SPACE';
  
  return eventKey === mainKey;
}

// Sample preloaded images and videos for infinite scroll appending
const MOCK_INFINITE_PRESETS = [
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
  'https://www.w3schools.com/html/mov_bbb.mp4'
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'article' | 'store' | 'carousel' | 'portfolio' | 'infinite'>('article');
  
  // Storage states synced with simulated localStorage
  const [settings, setSettings] = useState(() => {
    return {
      mode: localStorage.getItem('loupe_mode') || 'overlay',
      magnifierZoom: parseFloat(localStorage.getItem('loupe_magnifierZoom') || '2.5') || 2.5,
      minWidth: parseInt(localStorage.getItem('loupe_minWidth') || '40', 10) || 40,
      minHeight: parseInt(localStorage.getItem('loupe_minHeight') || '40', 10) || 40,
      includeSmall: localStorage.getItem('loupe_includeSmall') === 'true',
      shortcut: localStorage.getItem('loupe_shortcut') || 'Ctrl+Shift+F'
    };
  });

  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false);

  const [infiniteImages, setInfiniteImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80'
  ]);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    imageUrl: ''
  });

  const [showCodeExplorer, setShowCodeExplorer] = useState(false);
  const [activeCodeFile, setActiveCodeFile] = useState<string>('manifest.json');
  const [isCopied, setIsCopied] = useState(false);

  // Sync settings to simulated chrome.storage on changes
  useEffect(() => {
    Object.entries(settings).forEach(([key, val]) => {
      localStorage.setItem(`loupe_${key}`, String(val));
    });
  }, [settings]);

  // Bind simulation action event and hotkey listener
  useEffect(() => {
    const handleSimulatedTrigger = () => {
      triggerViewer();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is active in an editable field or recording a shortcut
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      if (matchesShortcut(e, settings.shortcut)) {
        e.preventDefault();
        e.stopPropagation();
        triggerViewer();
      }
    };

    window.addEventListener('simulate-trigger', handleSimulatedTrigger);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('simulate-trigger', handleSimulatedTrigger);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [settings.shortcut]);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleShortcutRecording = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const keys: string[] = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');
    if (e.metaKey) keys.push('Meta');

    const key = e.key;
    const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(key);

    if (!isModifier) {
      let finalKey = key.toUpperCase();
      if (finalKey === ' ') finalKey = 'Space';

      if (!keys.includes('Ctrl') && e.ctrlKey) keys.push('Ctrl');
      keys.push(finalKey);

      const newShortcut = keys.join('+');
      handleSettingChange('shortcut', newShortcut);
      setIsRecordingShortcut(false);
    }
  };

  const handleOpenContextMenu = (e: React.MouseEvent, imgUrl: string) => {
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      imageUrl: imgUrl
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

  const handleTriggerContextMenu = () => {
    closeContextMenu();
    triggerViewer(contextMenu.imageUrl);
  };

  const appendInfiniteImage = () => {
    const nextSrc = MOCK_INFINITE_PRESETS[infiniteImages.length % MOCK_INFINITE_PRESETS.length];
    setInfiniteImages(prev => [...prev, nextSrc]);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    });
  };

  // Get current path url for our browser mock
  const getSimulatedUrl = () => {
    switch (activeTab) {
      case 'article': return 'https://thejournal.org/features/analog-renaissance';
      case 'store': return 'https://apxsport.com/products/scarlet-carbon-trainer';
      case 'carousel': return 'https://mediastream.com/galleries/mixed-media-carousel';
      case 'portfolio': return 'https://unsplash.com/vistas-photography-portfolio';
      case 'infinite': return 'https://graphstream.app/feed/live-photos';
    }
  };

  // Static Chrome Extension files dictionary for the inspector
  const extensionFiles: Record<string, { path: string, content: string }> = {
    'manifest.json': {
      path: '/manifest.json',
      content: `{
  "manifest_version": 3,
  "name": "Loupe — Universal Fullscreen Image Viewer",
  "version": "1.0.0",
  "description": "Open any image on any website in a glassmorphic fullscreen viewer. Support Zoom/Pan, high-res Magnifier and Sidebar image metadata extractors.",
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "contextMenus"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "commands": {
    "trigger_loupe": {
      "suggested_key": {
        "default": "${settings.shortcut}",
        "mac": "${settings.shortcut.replace('Ctrl', 'Command')}"
      },
      "description": "Open Loupe on the current tab"
    }
  }
}`
    },
    'service-worker.ts': {
      path: '/src/background/service-worker.ts',
      content: `chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "loupe-open-context",
    title: "Open in Loupe Viewer",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "loupe-open-context" && tab?.id) {
    injectAndTrigger(tab.id, info.srcUrl);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) injectAndTrigger(tab.id);
});

function injectAndTrigger(tabId: number, startUrl?: string) {
  chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      }, () => {
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { action: "trigger_loupe", startUrl });
        }, 150);
      });
    } else {
      chrome.tabs.sendMessage(tabId, { action: "trigger_loupe", startUrl });
    }
  });
}`
    },
    'scanner.ts': {
      path: '/src/content/scanner.ts',
      content: `export interface MediaItem {
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

function resolveUrl(url: string): string {
  if (!url) return '';
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

function parseSrcset(srcset: string): string {
  if (!srcset) return '';
  const candidates = srcset.split(',').map(item => {
    const parts = item.trim().split(/\\s+/);
    const url = parts[0];
    const descriptor = parts[1] || '';
    let size = 0;
    if (descriptor.endsWith('w')) {
      size = parseInt(descriptor.slice(0, -1), 10) || 0;
    } else if (descriptor.endsWith('x')) {
      size = parseFloat(descriptor.slice(0, -1)) * 300 || 0;
    }
    return { url, size };
  });

  if (candidates.length === 0) return '';
  candidates.sort((a, b) => b.size - a.size);
  return resolveUrl(candidates[0].url);
}

export function findHighResSource(el: HTMLElement): string {
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

  if (el instanceof HTMLImageElement && el.srcset) {
    const highRes = parseSrcset(el.srcset);
    if (highRes) return highRes;
  }

  const highResAttrs = [
    'data-zoom-src',
    'data-original',
    'data-full-src',
    'data-full',
    'data-large',
    'data-high-res',
    'data-src'
  ];

  for (const attr of highResAttrs) {
    const val = el.getAttribute(attr);
    if (val && val.trim()) {
      return resolveUrl(val.trim());
    }
  }

  if (el instanceof HTMLImageElement) {
    return resolveUrl(el.currentSrc || el.src);
  }
  return '';
}

export function scanImages(options: ScanOptions = { minWidth: 40, minHeight: 40, includeSmall: false }): MediaItem[] {
  const mediaMap = new Map<string, MediaItem>();

  const collectFromNode = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
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

      let pUrl = el.getAttribute('poster') || el.poster || '';
      if (pUrl) posterUrl = resolveUrl(pUrl);
    }

    if (foundSrc) {
      const absoluteSrc = resolveUrl(foundSrc);
      if (absoluteSrc && !absoluteSrc.startsWith('data:image/svg')) {
        const rect = el.getBoundingClientRect();
        let width = rect.width || el.offsetWidth || (el as any).videoWidth || 0;
        let height = rect.height || el.offsetHeight || (el as any).videoHeight || 0;

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
        if (sizeMatches && !mediaMap.has(absoluteSrc)) {
          mediaMap.set(absoluteSrc, {
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
            poster: posterUrl || undefined
          });
        }
      }
    }

    if (el.shadowRoot) {
      Array.from(el.shadowRoot.children).forEach(collectFromNode);
    }
    el.children && Array.from(el.children).forEach(collectFromNode);
  };

  collectFromNode(document.body);
  return Array.from(mediaMap.values());
}`
    },
    'viewer-host.ts': {
      path: '/src/content/viewer-host.ts',
      content: `import { ZoomPanController } from './zoom-pan';
import { MagnifierController } from './magnifier';

export class LoupeViewer extends HTMLElement {
  private shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadow.innerHTML = \`
      <style>\${LOUPE_STYLES}</style>
      <div id="loupe-wrapper" class="loupe-wrapper">
        <div id="viewer-canvas" class="viewer-canvas">
          <div id="image-container" class="image-container">
            <img id="viewer-image" class="viewer-image" />
          </div>
          <div id="magnifier-lens" class="magnifier-lens">
            <img id="magnifier-clone" class="magnifier-clone" />
          </div>
        </div>
      </div>
    \`;
  }
}`
    },
    'zoom-pan.ts': {
      path: '/src/content/zoom-pan.ts',
      content: `export class ZoomPanController {
  private scale = 1;
  private posX = 0;
  private posY = 0;
  constructor(private container: HTMLElement, private image: HTMLImageElement) {
    this.initEvents();
  }

  private initEvents() {
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const intensity = 0.1;
      this.scale = e.deltaY < 0 ? this.scale + intensity : this.scale - intensity;
      this.scale = Math.max(1, Math.min(this.scale, 8));
      this.apply();
    });
  }

  private apply() {
    this.image.style.transform = \`translate3d(\${this.posX}px, \${this.posY}px, 0) scale(\${this.scale})\`;
  }
}`
    },
    'magnifier.ts': {
      path: '/src/content/magnifier.ts',
      content: `export class MagnifierController {
  constructor(
    private container: HTMLElement,
    private targetImage: HTMLImageElement,
    private lens: HTMLElement,
    private clone: HTMLImageElement
  ) {
    this.initEvents();
  }

  private initEvents() {
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.targetImage.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
        this.lens.style.display = 'block';
        this.lens.style.left = \`\${e.clientX - 60}px\`;
        this.lens.style.top = \`\${e.clientY - 60}px\`;
        
        // Inverse translate
        const zoom = 2.5;
        this.clone.style.width = \`\${rect.width * zoom}px\`;
        this.clone.style.left = \`\${-mouseX * zoom + 60}px\`;
      }
    });
  }
}`
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col antialiased selection:bg-[#ff5f40] selection:text-white font-sans">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none z-0"></div>

      {/* Main header block */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 py-3.5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-[#ff5f40] to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/10">
            <span className="text-white font-black text-lg tracking-tighter">L</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Loupe Universal Image Viewer
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium px-1.5 py-0.2 rounded">MV3 Packaged</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Universal chrome extension overlay simulation & testing workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowCodeExplorer(!showCodeExplorer)}
            className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition flex items-center gap-1.5 ${
              showCodeExplorer 
                ? 'bg-[#ff5f40] border-[#ff5f40] text-white hover:bg-orange-600' 
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
            }`}
          >
            <FileCode size={14} />
            {showCodeExplorer ? 'Hide Extension Source' : 'View Extension Source'}
          </button>
        </div>
      </header>

      {/* Primary bento dashboard layout */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 p-6 z-10 max-w-7xl mx-auto w-full">
        {/* Left column settings widget */}
        <section className="xl:col-span-1 flex flex-col gap-5">
          {/* Section: Simulated Extension state storage */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Settings size={13} className="text-[#ff5f40]" />
              Chrome Storage (Settings)
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">Default Launch Mode</label>
              <select 
                value={settings.mode}
                onChange={(e) => handleSettingChange('mode', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-zinc-100 outline-none focus:border-[#ff5f40] transition"
              >
                <option value="overlay">Rich Overlay (Mode B)</option>
                <option value="fullscreen">Browser Fullscreen (Mode A)</option>
              </select>
              <span className="text-[10px] text-zinc-500">Mode A triggers Fullscreen API. Mode B renders sidebar/magnifier overlays.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="text-zinc-400 font-medium">Magnifier Scale Factor</label>
                <span className="text-[#ff5f40] font-mono font-bold">{settings.magnifierZoom}x</span>
              </div>
              <input 
                type="range" 
                min="1.5" 
                max="5.0" 
                step="0.5"
                value={settings.magnifierZoom}
                onChange={(e) => handleSettingChange('magnifierZoom', parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#ff5f40]"
              />
              <span className="text-[10px] text-zinc-500">Scale factor of cloned canvas under floating circular lens.</span>
            </div>

            <div className="border-t border-zinc-800/60 my-1"></div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] text-zinc-400 font-medium">Size Exclusions (px)</label>
                <div className="flex items-center gap-1">
                  <input 
                    type="number"
                    value={settings.minWidth}
                    onChange={(e) => handleSettingChange('minWidth', parseInt(e.target.value) || 0)}
                    className="w-12 bg-zinc-950 border border-zinc-800 rounded text-center text-[10px] py-1 text-zinc-200 outline-none focus:border-[#ff5f40]"
                  />
                  <span className="text-zinc-500 text-[9px]">x</span>
                  <input 
                    type="number"
                    value={settings.minHeight}
                    onChange={(e) => handleSettingChange('minHeight', parseInt(e.target.value) || 0)}
                    className="w-12 bg-zinc-950 border border-zinc-800 rounded text-center text-[10px] py-1 text-zinc-200 outline-none focus:border-[#ff5f40]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-zinc-400 font-medium">Include Small Icons</label>
                <input 
                  type="checkbox"
                  checked={settings.includeSmall}
                  onChange={(e) => handleSettingChange('includeSmall', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#ff5f40] cursor-pointer"
                />
              </div>
              <span className="text-[10px] text-zinc-500">Ignores layout sprites, bullets, and avatars below size threshold.</span>
            </div>
          </div>

          {/* Section: Keyboard Shortcuts Settings */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Keyboard size={13} className="text-[#ff5f40]" />
              Keyboard Shortcuts
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-zinc-400 font-medium">Activation Trigger</label>
              
              <div className="flex items-center gap-2">
                <div 
                  tabIndex={0}
                  onKeyDown={handleShortcutRecording}
                  className={`flex-1 border text-center rounded-lg py-2 text-xs font-mono font-bold cursor-pointer transition select-none outline-none ${
                    isRecordingShortcut 
                      ? 'bg-orange-500/10 border-[#ff5f40] text-[#ff5f40] animate-pulse' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-zinc-700 focus:border-[#ff5f40]'
                  }`}
                  onClick={() => setIsRecordingShortcut(true)}
                  onBlur={() => setIsRecordingShortcut(false)}
                  title="Click here, then press your new keyboard combination to rebind"
                >
                  {isRecordingShortcut ? 'Press keys...' : settings.shortcut}
                </div>
                
                {!isRecordingShortcut && (
                  <button
                    onClick={() => {
                      handleSettingChange('shortcut', 'Ctrl+Shift+F');
                    }}
                    className="text-[10px] text-zinc-500 hover:text-[#ff5f40] px-2 py-1.5 rounded border border-zinc-800 bg-zinc-950 font-bold transition"
                    title="Reset to default (Ctrl+Shift+F)"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              <span className="text-[10px] text-zinc-500 leading-normal">
                Click the box above and press your desired modifier sequence (e.g., <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">Ctrl+Shift+L</kbd>). You can immediately test the new hotkey on this page!
              </span>
            </div>
          </div>

          {/* Setup & Extension Installation instructions */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Download size={13} className="text-[#ff5f40]" />
              Chrome Deployment Guide
            </h2>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Vite automatically packages your exact visual extension assets into standard Manifest V3 bundles.
            </p>

            <ol className="text-[11px] text-zinc-400 space-y-2.5 list-decimal pl-4">
              <li>Open top-right <strong>AI Studio Workspace</strong> settings panel.</li>
              <li>Click <strong>Download ZIP</strong> (saves source codebase locally).</li>
              <li>Unzip folder on your computer.</li>
              <li>In Google Chrome, navigate to <code className="text-[#ff5f40] bg-orange-500/10 px-1 rounded font-mono font-medium">chrome://extensions</code></li>
              <li>Toggle <strong>Developer mode</strong> ON (top right corner toggle).</li>
              <li>Click <strong>Load unpacked</strong> and choose the <code className="text-[#ff5f40] bg-orange-500/10 px-1 rounded font-mono font-medium">dist-extension</code> directory.</li>
            </ol>
          </div>
        </section>

        {/* Central columns simulated browser page frame */}
        <section className={`${showCodeExplorer ? 'xl:col-span-1.5' : 'xl:col-span-3'} flex flex-col gap-4`}>
          {/* Simulated browser header bar */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-zinc-950/90 px-4 py-2.5 border-b border-zinc-800/80 flex items-center justify-between gap-4">
              {/* Window dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/40"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/40"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/40"></span>
              </div>

              {/* URL input field with floating Extension action button */}
              <div className="flex-1 max-w-xl mx-auto bg-zinc-900/80 border border-zinc-800 rounded-lg py-1 px-3 text-xs text-zinc-400 flex items-center justify-between relative">
                <span className="font-mono text-[11px] tracking-wide select-all text-zinc-300">
                  {getSimulatedUrl()}
                </span>
                
                {/* Simulated Chrome Extension toolbar button */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-zinc-800 text-zinc-500 rounded px-1 text-[9px] font-mono">https</span>
                  <button 
                    onClick={() => triggerViewer()}
                    className="w-5 h-5 bg-[#ff5f40] hover:bg-orange-600 rounded-full flex items-center justify-center text-white cursor-pointer transition shadow shadow-orange-500/40"
                    title="Click Extension Icon (Trigger Loupe)"
                  >
                    <span className="font-black text-[9px]">L</span>
                  </button>
                </div>
              </div>

              {/* Right tabs triggers */}
              <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/60">
                <button 
                  onClick={() => setActiveTab('article')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${activeTab === 'article' ? 'bg-[#ff5f40] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  News Article
                </button>
                <button 
                  onClick={() => setActiveTab('store')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${activeTab === 'store' ? 'bg-[#ff5f40] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Product Detail
                </button>
                <button 
                  onClick={() => setActiveTab('carousel')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${activeTab === 'carousel' ? 'bg-[#ff5f40] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Mixed Carousel
                </button>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${activeTab === 'portfolio' ? 'bg-[#ff5f40] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Unsplash Grid
                </button>
                <button 
                  onClick={() => setActiveTab('infinite')}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${activeTab === 'infinite' ? 'bg-[#ff5f40] text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  SPA Feed
                </button>
              </div>
            </div>

            {/* Simulated browser active tab display */}
            <div className="bg-zinc-950 p-6 min-h-[460px] relative">
              <Simulators 
                currentTab={activeTab} 
                onOpenContextMenu={handleOpenContextMenu}
                includeSmall={settings.includeSmall}
                onLoadMore={appendInfiniteImage}
                infiniteImages={infiniteImages}
              />

              {/* Simulated browser prompt/help overlay */}
              <div className="absolute bottom-4 left-4 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-zinc-400 max-w-sm flex flex-col gap-1 backdrop-blur shadow-lg">
                <span className="font-semibold text-zinc-200 flex items-center gap-1">
                  <Play size={10} className="text-[#ff5f40]" />
                  How to test:
                </span>
                <span>1. Click the circular coral <strong>L icon</strong> in URL bar to activate.</span>
                <span>2. Or <strong>right-click</strong> (press & hold or dual tap on trackpads) any image or video inside the page!</span>
              </div>
            </div>
          </div>
        </section>

        {/* Source Code Inspector Column (Visible when toggled) */}
        {showCodeExplorer && (
          <section className="xl:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-[#ff5f40]" />
                <h3 className="text-sm font-bold text-white tracking-tight">Source Inspector</h3>
              </div>
              <button 
                onClick={() => setShowCodeExplorer(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Explorer sidebar layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              {/* File list */}
              <div className="md:col-span-1 flex flex-col gap-1 font-mono text-xs text-zinc-400 border-r border-zinc-800/50 pr-2">
                {Object.keys(extensionFiles).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => {
                      setActiveCodeFile(filename);
                      setIsCopied(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded transition ${
                      activeCodeFile === filename 
                        ? 'bg-zinc-800 text-[#ff5f40] font-semibold border-l-2 border-[#ff5f40]' 
                        : 'hover:bg-zinc-950 hover:text-zinc-100'
                    }`}
                  >
                    {filename}
                  </button>
                ))}
              </div>

              {/* File contents rendering */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{extensionFiles[activeCodeFile].path}</span>
                  <button 
                    onClick={() => handleCopyCode(extensionFiles[activeCodeFile].content)}
                    className="flex items-center gap-1 text-[#ff5f40] hover:text-orange-400 font-sans font-semibold cursor-pointer"
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="flex-1 bg-zinc-950 border border-zinc-800/60 p-4 rounded-xl font-mono text-[11px] text-zinc-300 leading-relaxed overflow-auto max-h-[380px] select-text">
                  <code>{extensionFiles[activeCodeFile].content}</code>
                </pre>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* High-fidelity Custom right-click Context Menu Simulation */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl py-1.5 z-[2147483646] w-56 backdrop-blur-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] text-zinc-500 px-3 py-1 font-mono uppercase tracking-wider select-none">
            Simulated Context Menu
          </div>
          <button 
            onClick={handleTriggerContextMenu}
            className="w-full text-left px-3 py-2 text-xs text-zinc-100 hover:bg-[#ff5f40] hover:text-white font-semibold transition flex items-center gap-2"
          >
            <Sparkles size={13} />
            Open in Loupe Viewer
          </button>
          <div className="border-t border-zinc-800 my-1"></div>
          <button className="w-full text-left px-3 py-2 text-xs text-zinc-400 cursor-not-allowed select-none">
            Copy image address
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-zinc-400 cursor-not-allowed select-none">
            Search image with Google
          </button>
        </div>
      )}
    </div>
  );
}
