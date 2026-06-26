/**
 * Design system tokens and styles for the Loupe shadow DOM.
 * Utilizes glassmorphism, modern spring-like animations, and minimalist typography.
 */
export const LOUPE_STYLES = `
:host {
  all: initial;
  --accent-color: #ff5f40; /* Radiant Coral */
  --bg-dark: rgba(10, 10, 12, 0.95);
  --bg-dark-glass: rgba(18, 18, 22, 0.7);
  --border-light: rgba(255, 255, 255, 0.1);
  --text-primary: #f5f5f7;
  --text-secondary: #8e8e93;
  --font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --spring-in: cubic-bezier(0.22, 0.61, 0.36, 1);
  --spring-out: cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.loupe-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483647;
  font-family: var(--font-stack);
  background: #000;
  color: var(--text-primary);
  overflow: hidden;
  user-select: none;
  opacity: 0;
  transition: opacity 0.3s var(--spring-in);
}

.loupe-wrapper.active {
  opacity: 1;
}

/* Base Canvas for image displaying */
.viewer-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: grab;
}

.viewer-canvas:active {
  cursor: grabbing;
}

/* Image wrapper and element */
.image-container {
  max-width: 90%;
  max-height: 90%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease-out;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 16px;
  transition: opacity 0.2s var(--spring-in);
  pointer-events: none;
}

/* Magnifier Lens */
.magnifier-lens {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 2px solid var(--accent-color);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255,255,255,0.1);
  pointer-events: none;
  overflow: hidden;
  display: none;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.magnifier-clone {
  position: absolute;
  pointer-events: none;
  transform-origin: 0 0;
  max-width: none !important;
  max-height: none !important;
}

/* UI Panels */
.glass-panel {
  background: var(--bg-dark-glass);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

/* Navigation Chevrons */
.nav-chevron {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s var(--spring-in);
  opacity: 0;
  z-index: 10;
  border-radius: 50%;
}

.viewer-canvas:hover .nav-chevron,
.loupe-wrapper.show-controls .nav-chevron {
  opacity: 0.6;
}

.nav-chevron:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-50%) scale(1.08);
}

.nav-chevron:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-left {
  left: 24px;
}

.nav-right {
  right: 24px;
}

/* Top bar control panel */
.top-bar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 20;
  transition: transform 0.3s var(--spring-in);
}

.loupe-wrapper.show-controls .top-bar {
  transform: translateX(-50%) translateY(0);
}

.top-bar-item {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.top-bar-item.index {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent-color);
}

.icon-btn:active {
  transform: scale(0.95);
}

.icon-btn.active {
  background: var(--accent-color);
  color: #fff;
}

/* Fading navigation indicator */
.nav-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 600;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 15;
}

.nav-indicator.visible {
  opacity: 1;
}

/* Context Sidebar */
.sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  transform: translateX(100%);
  transition: transform 0.3s var(--spring-in);
  z-index: 30;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  border-left: 1px solid var(--border-light);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  border-radius: 16px 0 0 16px;
}

.loupe-wrapper.sidebar-open .sidebar {
  transform: translateX(0);
}

.loupe-wrapper.sidebar-open .viewer-canvas {
  width: calc(100% - 360px);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: 700;
  letter-spacing: 0.05em;
}

.section-value {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

.section-value.dimensions {
  font-family: monospace;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

.action-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.action-btn.primary {
  background: var(--accent-color);
  border: none;
  color: #fff;
}

.action-btn.primary:hover {
  background: #ff775c;
  color: #fff;
}

/* Close button on top-right edge */
.close-corner-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 21;
}

/* Toast message inside shadow root */
.toast-msg {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: 10px 20px;
  font-size: 13px;
  border-radius: 20px;
  z-index: 100;
  transition: transform 0.3s var(--spring-in), opacity 0.3s;
  opacity: 0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
}

.toast-msg.visible {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* Bottom Progress Indicator */
.bottom-progress {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  display: flex;
  gap: 6px;
  z-index: 20;
  transition: transform 0.3s var(--spring-in);
  background: rgba(0,0,0,0.4);
  padding: 6px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.loupe-wrapper.show-controls .bottom-progress {
  transform: translateX(-50%) translateY(0);
}

.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.25s;
}

.progress-dot.active {
  background: var(--accent-color);
  transform: scale(1.4);
}

/* SVG Icon alignment */
svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Elegant Centered Loading Spinner */
.loading-spinner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: loupe-spin 0.8s linear infinite;
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.loading-spinner.visible {
  opacity: 1;
}

@keyframes loupe-spin {
  to { transform: rotate(360deg); }
}

/* Elegant Rotation Panel & Horizontal Measurement Dial */
.rotation-panel {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translate(-50%, 120px);
  width: 440px;
  max-width: 90%;
  padding: 14px 20px;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
  z-index: 1010;
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0;
  pointer-events: none;
  transition: transform 0.4s var(--spring-in), opacity 0.3s var(--spring-in);
}

.rotation-panel.active {
  transform: translate(-50%, 0);
  opacity: 1;
  pointer-events: auto;
}

.rotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.rotation-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-secondary);
  font-weight: 700;
}

.rotation-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-color);
  font-family: monospace;
  background: rgba(255, 95, 64, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 95, 64, 0.2);
}

.rotation-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.rotate-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.rotate-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.rotate-btn:active {
  transform: translateY(1px);
}

/* Horizontal Measurement Ruler Container */
.ruler-container {
  flex: 1;
  position: relative;
  height: 40px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #fff 20%, #fff 80%, transparent);
}

.ruler-track {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 1000px;
  pointer-events: none;
}

.ruler-tick {
  position: absolute;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  height: 8px;
}

.ruler-tick.medium {
  height: 12px;
  background: rgba(255, 255, 255, 0.4);
}

.ruler-tick.major {
  height: 18px;
  background: var(--text-primary);
  width: 1.5px;
}

.ruler-label {
  position: absolute;
  bottom: 20px;
  transform: translateX(-50%);
  font-size: 8px;
  color: var(--text-secondary);
  font-family: monospace;
  white-space: nowrap;
}

.ruler-center-line {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  background: var(--accent-color);
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 0 8px var(--accent-color);
}

/* Overlaid Invisible Range Input */
.rotation-slider {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: ew-resize;
  z-index: 5;
}

.rotate-reset-btn {
  align-self: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  padding: 4px 12px;
  transition: color 0.2s ease;
}

.rotate-reset-btn:hover {
  color: var(--accent-color);
}
`;
