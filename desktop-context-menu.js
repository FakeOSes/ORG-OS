/* Windows-style desktop context menu and drag-to-select support for Indev.html.
   Load with: <script src="./desktop-context-menu.js" defer></script> */
(() => {
  'use strict';

  const desktop = document.getElementById('desktop');
  const iconLayer = document.getElementById('desktop-icons');
  const menu = document.getElementById('context-menu');
  if (!desktop || !iconLayer || !menu) return;

  const style = document.createElement('style');
  style.textContent = `
    #context-menu.desktop-context-menu { min-width: 230px; padding: 5px; background: rgba(248,249,252,.98); color: #20232a; border: 1px solid #d5d9e1; border-radius: 5px; box-shadow: 0 8px 26px #0004; font: 13px "Segoe UI",system-ui,sans-serif; }
    #context-menu.desktop-context-menu button { position:relative; padding: 8px 30px 8px 34px; border-radius: 3px; color: inherit; }
    #context-menu.desktop-context-menu button:hover, #context-menu.desktop-context-menu button:focus-visible { background:#e5efff; color:#111827; }
    #context-menu.desktop-context-menu .desktop-menu-icon { position:absolute; left:10px; width:17px; text-align:center; color:#526174; }
    #context-menu.desktop-context-menu .context-menu-separator { height:1px; margin:4px 5px; background:#dfe3e9; }
    #context-menu.desktop-context-menu .desktop-menu-arrow { position:absolute; right:10px; color:#697586; }
    #context-menu.desktop-context-menu .desktop-menu-sub { position:relative; }
    #context-menu.desktop-context-menu .desktop-menu-submenu { display:none; position:absolute; top:-5px; left:calc(100% - 3px); min-width:190px; padding:5px; background:#f8f9fc; border:1px solid #d5d9e1; border-radius:5px; box-shadow:0 8px 26px #0004; }
    #context-menu.desktop-context-menu .desktop-menu-sub:hover > .desktop-menu-submenu, #context-menu.desktop-context-menu .desktop-menu-sub:focus-within > .desktop-menu-submenu { display:block; }
    #context-menu.desktop-context-menu .desktop-menu-submenu button { width:100%; }
    #desktop .desktop-icon.desktop-selected { background:rgba(96,165,250,.34); border-color:#93c5fd; }
    #desktop .desktop-icon.desktop-icon-hidden { display:none !important; }
    #desktop .desktop-selection-box { position:absolute; z-index:20; display:none; pointer-events:none; border:1px solid #60a5fa; background:rgba(96,165,250,.19); }
    #desktop.desktop-icons-small .desktop-icon { width:68px; min-height:66px; font-size:11px; }
    #desktop.desktop-icons-small .desktop-icon .icon { font-size:22px; line-height:27px; }
    #desktop.desktop-icons-large .desktop-icon { width:96px; min-height:96px; font-size:13px; }
    #desktop.desktop-icons-large .desktop-icon .icon { font-size:38px; line-height:44px; }
    @media (max-width:600px) { #context-menu.desktop-context-menu .desktop-menu-submenu { left:auto; right:100%; } }
  `;
  document.head.appendChild(style);

  const selectionBox = document.createElement('div');
  selectionBox.className = 'desktop-selection-box';
  selectionBox.setAttribute('aria-hidden', 'true');
  desktop.appendChild(selectionBox);

  let drag = null;
  let menuTarget = null;
  let iconsVisible = true;

  function toast(message) {
    if (typeof window.showToast === 'function') window.showToast(message);
    else {
      const toastEl = document.getElementById('toast');
      if (toastEl) {
        toastEl.textContent = message;
        toastEl.classList.add('show');
        window.setTimeout(() => toastEl.classList.remove('show'), 2200);
      }
    }
  }

  function iconButtons() {
    return Array.from(iconLayer.querySelectorAll('.desktop-icon'));
  }

  function closeMenu() {
    menu.style.display = 'none';
    menu.classList.remove('open', 'desktop-context-menu');
    menu.replaceChildren();
  }

  function addItem(label, icon, action, options = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitem');
    button.innerHTML = `<span class="desktop-menu-icon" aria-hidden="true">${icon}</span><span></span>`;
    button.querySelector('span:last-child').textContent = label;
    if (options.checked) button.insertAdjacentText('beforeend', '  ✓');
    if (options.submenu) {
      button.className = 'desktop-menu-sub';
      const arrow = document.createElement('span');
      arrow.className = 'desktop-menu-arrow';
      arrow.textContent = '›';
      button.appendChild(arrow);
      const sub = document.createElement('div');
      sub.className = 'desktop-menu-submenu';
      sub.setAttribute('role', 'menu');
      options.submenu.forEach(item => {
        const child = document.createElement('button');
        child.type = 'button';
        child.setAttribute('role', 'menuitem');
        child.textContent = item.label;
        child.addEventListener('click', event => {
          event.stopPropagation();
          closeMenu();
          item.action();
        });
        sub.appendChild(child);
      });
      button.appendChild(sub);
    } else {
      button.addEventListener('click', () => {
        closeMenu();
        action();
      });
    }
    menu.appendChild(button);
    return button;
  }

  function separator() {
    const line = document.createElement('div');
    line.className = 'context-menu-separator';
    line.setAttribute('role', 'separator');
    menu.appendChild(line);
  }

  function arrangeIcons(sortBy) {
    const icons = iconButtons().filter(icon => !icon.classList.contains('desktop-icon-hidden'));
    if (sortBy) {
      icons.sort((a, b) => {
        const aName = (a.dataset.label || a.textContent).trim().toLowerCase();
        const bName = (b.dataset.label || b.textContent).trim().toLowerCase();
        if (sortBy === 'type') return (a.dataset.open || '').localeCompare(b.dataset.open || '') || aName.localeCompare(bName);
        if (sortBy === 'date') return (b.dataset.created || '').localeCompare(a.dataset.created || '') || aName.localeCompare(bName);
        return aName.localeCompare(bName);
      });
      icons.forEach(icon => iconLayer.appendChild(icon));
    }
    const cellW = desktop.classList.contains('desktop-icons-large') ? 104 : desktop.classList.contains('desktop-icons-small') ? 74 : 88;
    const cellH = desktop.classList.contains('desktop-icons-large') ? 104 : desktop.classList.contains('desktop-icons-small') ? 72 : 88;
    const cols = Math.max(1, Math.floor((desktop.clientWidth - 20) / cellW));
    icons.forEach((icon, index) => {
      icon.style.left = `${12 + (Math.floor(index / Math.max(1, Math.ceil(desktop.clientHeight / cellH))) * cellW)}px`;
      icon.style.top = `${12 + (index % Math.max(1, Math.ceil(desktop.clientHeight / cellH))) * cellH}px`;
    });
    toast(sortBy ? `Icons sorted by ${sortBy === 'date' ? 'date modified' : sortBy}.` : 'Icons arranged.');
  }

  function openSettings() {
    if (typeof window.openApp === 'function') window.openApp('settings');
    if (typeof window.selectSettingsTab === 'function') window.selectSettingsTab('personalize');
  }

  function openDesktopMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    menuTarget = { x: event.clientX, y: event.clientY };
    menu.replaceChildren();
    menu.classList.add('desktop-context-menu', 'open');
    menu.setAttribute('role', 'menu');
    addItem('View', '▤', () => {}, { submenu: [
      { label: 'Large icons', action: () => { desktop.classList.add('desktop-icons-large'); desktop.classList.remove('desktop-icons-small'); } },
      { label: 'Medium icons', action: () => { desktop.classList.remove('desktop-icons-large', 'desktop-icons-small'); } },
      { label: 'Small icons', action: () => { desktop.classList.add('desktop-icons-small'); desktop.classList.remove('desktop-icons-large'); } },
      { label: 'Show desktop icons', action: () => { iconsVisible = !iconsVisible; iconButtons().forEach(icon => icon.classList.toggle('desktop-icon-hidden', !iconsVisible)); } }
    ] });
    addItem('Sort by', '↕', () => {}, { submenu: [
      { label: 'Name', action: () => arrangeIcons('name') },
      { label: 'Item type', action: () => arrangeIcons('type') },
      { label: 'Date modified', action: () => arrangeIcons('date') }
    ] });
    addItem('Refresh', '⟳', () => { arrangeIcons(); toast('Desktop refreshed.'); });
    separator();
    addItem('New', '+', () => {}, { submenu: [
      { label: 'Folder', action: () => { if (typeof window.openApp === 'function') window.openApp('files'); toast('Create a folder in Files.'); } },
      { label: 'Text document', action: () => { if (typeof window.openApp === 'function') window.openApp('files'); toast('Create a text document in Files.'); } },
      { label: 'Shortcut', action: () => toast('Shortcuts can be added from the Apps catalog.') }
    ] });
    separator();
    addItem('Display settings', '▣', openSettings);
    addItem('Personalize', '🎨', openSettings);
    menu.style.display = 'block';
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(4, Math.min(event.clientX, window.innerWidth - rect.width - 4))}px`;
    menu.style.top = `${Math.max(4, Math.min(event.clientY, window.innerHeight - rect.height - 4))}px`;
  }

  desktop.addEventListener('contextmenu', event => {
    if (event.target.closest('.desktop-icon, .desktop-widget, .window, #taskbar')) return;
    openDesktopMenu(event);
  }, true);

  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target) && !event.target.closest('.desktop-icon')) closeMenu();
    if (event.button !== 0 || !desktop.contains(event.target)) return;
    if (event.target.closest('.desktop-icon, .desktop-widget, .window, button, input, textarea, select')) return;
    const bounds = desktop.getBoundingClientRect();
    drag = { pointerId: event.pointerId, x: event.clientX - bounds.left, y: event.clientY - bounds.top, additive: event.ctrlKey || event.metaKey, moved: false };
    if (!drag.additive && !event.shiftKey) iconButtons().forEach(icon => icon.classList.remove('desktop-selected'));
    selectionBox.style.display = 'block';
    selectionBox.style.left = `${drag.x}px`;
    selectionBox.style.top = `${drag.y}px`;
    selectionBox.style.width = '0';
    selectionBox.style.height = '0';
    event.preventDefault();
  }, true);

  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const bounds = desktop.getBoundingClientRect();
    const x = Math.max(0, Math.min(desktop.clientWidth, event.clientX - bounds.left));
    const y = Math.max(0, Math.min(desktop.clientHeight, event.clientY - bounds.top));
    const left = Math.min(drag.x, x), top = Math.min(drag.y, y);
    const width = Math.abs(x - drag.x), height = Math.abs(y - drag.y);
    if (width + height > 4) drag.moved = true;
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    if (!drag.moved) return;
    const box = selectionBox.getBoundingClientRect();
    iconButtons().forEach(icon => {
      const r = icon.getBoundingClientRect();
      const intersects = r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top;
      icon.classList.toggle('desktop-selected', intersects || (drag.additive && icon.classList.contains('desktop-selected')));
    });
  });

  function finishSelection(event) {
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    if (!drag.moved && event && !drag.additive && !event.shiftKey) iconButtons().forEach(icon => icon.classList.remove('desktop-selected'));
    drag = null;
    selectionBox.style.display = 'none';
  }
  document.addEventListener('pointerup', finishSelection);
  document.addEventListener('pointercancel', finishSelection);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); finishSelection(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && !event.target.closest('input,textarea,select,[contenteditable="true"]')) {
      iconButtons().filter(icon => !icon.classList.contains('desktop-icon-hidden')).forEach(icon => icon.classList.add('desktop-selected'));
    }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', closeMenu);
})();
