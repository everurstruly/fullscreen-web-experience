/**
 * Chrome Extension Background Service Worker (Manifest V3)
 * Handles entry point triggers:
 * 1. Toolbar icon click (chrome.action.onClicked)
 * 2. Keyboard shortcut registration (chrome.commands.onCommand)
 * 3. Context Menu right click (chrome.contextMenus)
 */

// Establish Context Menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'loupe-open-context',
    title: 'Open in Loupe Viewer',
    contexts: ['image']
  });
});

// Context Menu selection handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'loupe-open-context' && tab && tab.id) {
    injectAndTrigger(tab.id, info.srcUrl);
  }
});

// Toolbar action icon click handler
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    injectAndTrigger(tab.id);
  }
});

// Hotkey command handler
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'trigger_loupe' && tab && tab.id) {
    injectAndTrigger(tab.id);
  }
});

/**
 * Script Injection Engine
 * Programmatically injects content.js script on demand (due to activeTab model)
 * then sends direct triggering message to the active tab DOM.
 */
function injectAndTrigger(tabId: number, startUrl?: string) {
  // Check if content script is already present inside active page
  chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
    // If runtime error occurs or ping fails, the script hasn't been injected yet
    if (chrome.runtime.lastError || !response || response.status !== 'pong') {
      // Inject content.js compiled bundle
      chrome.scripting.executeScript(
        {
          target: { tabId, allFrames: false },
          files: ['content.js']
        },
        () => {
          // Send direct initiate trigger signal to mounted listener
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: 'trigger_loupe', startUrl });
          }, 150);
        }
      );
    } else {
      // Script is already active - just send trigger message immediately
      chrome.tabs.sendMessage(tabId, { action: 'trigger_loupe', startUrl });
    }
  });
}
