/**
 * Chrome Extension Settings Popup Controller
 * Manages user preferences and lets them trigger Loupe immediately
 */

document.addEventListener('DOMContentLoaded', () => {
  // Map interactive inputs
  const modeSelect = document.getElementById('default-mode') as HTMLSelectElement;
  const zoomSlider = document.getElementById('magnifier-zoom') as HTMLInputElement;
  const zoomVal = document.getElementById('zoom-val') as HTMLElement;
  const minWidthInput = document.getElementById('min-width') as HTMLInputElement;
  const minHeightInput = document.getElementById('min-height') as HTMLInputElement;
  const includeSmallCheck = document.getElementById('include-small') as HTMLInputElement;
  const triggerBtn = document.getElementById('trigger-btn') as HTMLButtonElement;
  const saveStatus = document.getElementById('save-status') as HTMLElement;
  const shortcutBox = document.getElementById('shortcut-box') as HTMLElement;
  const resetShortcutBtn = document.getElementById('reset-shortcut-btn') as HTMLButtonElement;
  const hotkeyDisplay = document.getElementById('hotkey-display') as HTMLElement;

  const storage = window.chrome?.storage?.local || {
    get: (keys: string[], cb: any) => {
      const data: any = {};
      keys.forEach(k => {
        data[k] = localStorage.getItem(`loupe_${k}`);
      });
      cb(data);
    },
    set: (data: any, cb?: any) => {
      Object.entries(data).forEach(([k, v]) => {
        localStorage.setItem(`loupe_${k}`, String(v));
      });
      if (cb) cb();
    }
  };

  // Load preferences
  storage.get(['mode', 'magnifierZoom', 'minWidth', 'minHeight', 'includeSmall', 'shortcut'], (res) => {
    if (res.mode) modeSelect.value = res.mode;
    if (res.magnifierZoom) {
      zoomSlider.value = res.magnifierZoom;
      zoomVal.textContent = `${res.magnifierZoom}x`;
    }
    if (res.minWidth) minWidthInput.value = res.minWidth;
    if (res.minHeight) minHeightInput.value = res.minHeight;
    if (res.includeSmall === 'true' || res.includeSmall === true) {
      includeSmallCheck.checked = true;
    }
    const currentShortcut = res.shortcut || 'Ctrl+Shift+F';
    if (shortcutBox) shortcutBox.textContent = currentShortcut;
    if (hotkeyDisplay) hotkeyDisplay.textContent = `Hotkey: ${currentShortcut}`;
  });

  // Watch slider tweaks
  zoomSlider.addEventListener('input', () => {
    zoomVal.textContent = `${zoomSlider.value}x`;
  });

  // Save on any changes
  const saveAll = () => {
    const data = {
      mode: modeSelect.value,
      magnifierZoom: parseFloat(zoomSlider.value),
      minWidth: parseInt(minWidthInput.value, 10) || 40,
      minHeight: parseInt(minHeightInput.value, 10) || 40,
      includeSmall: includeSmallCheck.checked,
      shortcut: shortcutBox?.textContent || 'Ctrl+Shift+F'
    };

    storage.set(data, () => {
      saveStatus.textContent = 'Settings saved';
      saveStatus.style.opacity = '1';
      if (hotkeyDisplay) {
        hotkeyDisplay.textContent = `Hotkey: ${data.shortcut}`;
      }
      setTimeout(() => {
        saveStatus.style.opacity = '0';
      }, 1000);
    });
  };

  [modeSelect, zoomSlider, minWidthInput, minHeightInput, includeSmallCheck].forEach(el => {
    el.addEventListener('change', saveAll);
  });

  // Shortcut Recording Logic
  let isRecording = false;

  if (shortcutBox) {
    shortcutBox.addEventListener('click', () => {
      isRecording = true;
      shortcutBox.textContent = 'Press keys...';
      shortcutBox.style.borderColor = 'var(--accent)';
    });

    shortcutBox.addEventListener('blur', () => {
      isRecording = false;
      storage.get(['shortcut'], (res) => {
        shortcutBox.textContent = res.shortcut || 'Ctrl+Shift+F';
        shortcutBox.style.borderColor = 'var(--border)';
      });
    });

    shortcutBox.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!isRecording) return;
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
        shortcutBox.textContent = newShortcut;
        shortcutBox.style.borderColor = 'var(--border)';
        shortcutBox.blur();
        isRecording = false;
        saveAll();
      }
    });
  }

  if (resetShortcutBtn) {
    resetShortcutBtn.addEventListener('click', () => {
      if (shortcutBox) {
        shortcutBox.textContent = 'Ctrl+Shift+F';
      }
      saveAll();
    });
  }

  // Action: Launch Loupe on active page
  triggerBtn.addEventListener('click', () => {
    if (window.chrome?.tabs) {
      window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && tab.id) {
          // Send background injection message
          window.chrome.runtime.sendMessage({ action: 'trigger_loupe_tab', tabId: tab.id });
          window.close(); // Close popup
        }
      });
    } else {
      // Direct simulation trigger inside our playground
      window.dispatchEvent(new CustomEvent('simulate-trigger'));
    }
  });
});
