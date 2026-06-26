# Loupe: Web Media Scanner & Inspector

Loupe is a browser extension designed to scan, filter, and inspect mixed-media assets—including high-resolution images, responsive picture elements, and HTML5 videos—directly within any web page. 

## Why It Exists

Modern websites often wrap media elements in complex hierarchies, shadow DOMs, background style definitions, or custom responsive configurations that prevent users from easily viewing, inspecting, or downloading the original high-resolution assets. 

Loupe solves this by scanning the document structure to extract direct media sources, resolving lazy-loaded URLs, and presenting them inside a unified inspection interface with visual inspection tools.

## Key Features

* **Dual Viewport Modes**: Choose between a minimal, distraction-free fullscreen viewer (Mode A) and a side-by-side rich layout analyzer with advanced image properties (Mode B).
* **Mixed-Media Scanning**: Seamlessly handles standard `<img>` tags, responsive `<picture>` layouts, lazy-loaded sources, CSS background images, and fully playable `<video>` sources.
* **On-Demand Inspection Tools**: Features a high-fidelity magnifier lens, custom rotation controls, full panning/zooming, and metadata extraction.
* **Smart Dimension Fallbacks**: Automatically queries poster attributes or temporary image structures to preserve context and dimensions for zero-sized or dynamic media targets.
* **Global Custom Hotkeys**: Toggle the inspector on any active tab using a configurable browser keyboard shortcut or the extension popup interface.

## Submitting Issues & Feature Suggestions

If you find a website layout where assets are missed, encounter a bug with video rendering, or want to suggest custom filter/scanning logic improvements:
1. Document the target website layout or provide a snippet of the HTML layout.
2. Open a ticket in the repository's issue tracker with steps to reproduce.
