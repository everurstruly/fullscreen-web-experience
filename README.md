# Loupe - Media Scanner & Inspector Extension Prototype

This repository contains the source code and development workspace for Loupe, a Google Chrome extension designed to scan, filter, and inspect mixed-media assets (high-resolution images, responsive pictures, and HTML5 videos) directly on any web page.

## Why this Repository Exists

This repository is provided as a complete, sandboxed simulation workspace. It allows developers to:
1. **Develop and Test Core Algorithms**: Iterate on media discovery, viewport coordinate tracking, and lazy-loading detection logic (located in `src/content/scanner.ts`) without needing to rebuild or reload an unpacked extension continuously.
2. **Preview Responsive Media Handling**: Test how the scanner detects canonical video sources (by evaluating `currentSrc`, `src`, or child source elements) and how it handles zero-sized elements through poster image measurements or dimension fallbacks.
3. **Simulate Diverse Web Layouts**: Provide a playground (via the integrated React simulator tabs like `Article`, `Product Detail`, `Mixed Carousel`, and `Infinite Feed`) to verify how the inspector handles edge cases, dynamic content injection, and standard HTML5 media layouts.

## Repository Structure

* **`/src/content/`**: Core scripts injected into the webpage:
  * `scanner.ts`: Scans the DOM tree, analyzes element dimensions, retrieves high-resolution variants or poster placeholders, and filters media.
  * `viewer-host.ts`: Manages the main overlay viewer, high-resolution rendering, playback controls, and magnifier/zoom UI.
* **`/src/background/`**: Contains the browser service worker managing background events and extension triggers.
* **`/src/popup/`**: The Chrome action popup interface for quick interactions.
* **`/src/components/`**: Interactive simulators (including `Simulators.tsx`) providing test modes like mixed carousels, stores, and infinite scroll layouts.
* **`/build-extension.js`**: Build script compiling the TS/JS codebase into a browser-ready extension directory.

## Submitting Issues & Feature Suggestions

If you encounter bugs, discover media filtering edge cases where videos or images are missed, or have suggestions for scanning logic enhancements:
1. Clearly describe the page structure or layout pattern causing the issue.
2. Provide a mock HTML structure illustrating how the `<img>` or `<video>` element is rendered.
3. Submit your report or feature recommendation through the repository's issue tracker.
