import { t, getLocale, setLocale, LOCALES } from './i18n/index.js';
import { getTheme, toggleTheme } from './theme.js';
import { tools, getTool } from './tools/registry.js';
import { APP_VERSION } from './version.js';

let currentView = null;

const SUN_ICON = `
  <svg class="icon-theme" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
    <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="6.3" cy="6.3" r="1.5" fill="currentColor"/>
    <circle cx="17.7" cy="17.7" r="1.5" fill="currentColor"/>
    <circle cx="17.7" cy="6.3" r="1.5" fill="currentColor"/>
    <circle cx="6.3" cy="17.7" r="1.5" fill="currentColor"/>
  </svg>
`;

const MOON_ICON = `
  <svg class="icon-theme" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M14.5 3.5a7.5 7.5 0 1 0 7 12.2A6.5 6.5 0 1 1 14.5 3.5z" fill="currentColor"/>
  </svg>
`;

export function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="top-bar">
      <button type="button" id="nav-back" class="btn btn--ghost hidden">${t('app.back')}</button>
      <div class="settings-bar">
        <button type="button" id="theme-toggle" class="settings-chip settings-chip--icon" aria-label=""></button>
        <div class="lang-picker">
          <button type="button" id="lang-toggle" class="settings-chip settings-chip--lang" aria-haspopup="listbox" aria-expanded="false">
            <span id="lang-label"></span>
            <svg class="lang-picker__chevron" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
          <ul id="lang-menu" class="lang-picker__menu hidden" role="listbox"></ul>
        </div>
        <span class="settings-chip settings-chip--version">v${APP_VERSION}</span>
      </div>
    </header>
    <main id="view" class="view"></main>
  `;

  initLangPicker();
  initThemeToggle();

  app.querySelector('#nav-back').addEventListener('click', () => navigate(''));
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

function syncLangUi() {
  const label = document.getElementById('lang-label');
  if (label) label.textContent = LOCALES[getLocale()].label;
  document.querySelectorAll('.lang-picker__option').forEach(btn => {
    btn.classList.toggle('lang-picker__option--active', btn.dataset.lang === getLocale());
  });
}

function initLangPicker() {
  const toggle = document.getElementById('lang-toggle');
  const menu = document.getElementById('lang-menu');

  menu.innerHTML = Object.entries(LOCALES).map(([code, { label: name }]) => `
    <li>
      <button type="button" class="lang-picker__option${code === getLocale() ? ' lang-picker__option--active' : ''}" data-lang="${code}" role="option">
        ${name}
      </button>
    </li>
  `).join('');

  syncLangUi();

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!isHidden));
  });

  menu.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      setLocale(btn.dataset.lang);
      syncLangUi();
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      rerender();
    });
  });

  document.addEventListener('click', () => {
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  });
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  btn.addEventListener('click', () => {
    toggleTheme();
    updateThemeButton();
  });
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.querySelector('#theme-toggle');
  if (!btn) return;
  const isDark = getTheme() === 'dark';
  btn.innerHTML = isDark ? MOON_ICON : SUN_ICON;
  btn.setAttribute('aria-label', isDark ? t('nav.themeLight') : t('nav.themeDark'));
  btn.setAttribute('title', isDark ? t('nav.themeLight') : t('nav.themeDark'));
}

function navigate(toolId) {
  window.location.hash = toolId ? `#/${toolId}` : '#/';
}

function renderRoute() {
  const hash = window.location.hash.replace('#/', '') || '';
  const tool = hash ? getTool(hash) : null;
  const view = document.getElementById('view');
  const backBtn = document.getElementById('nav-back');

  if (currentView?.cleanup) currentView.cleanup();
  view.innerHTML = '';

  if (!tool) {
    backBtn.classList.add('hidden');
    view.appendChild(renderHome());
    document.title = t('app.title');
    return;
  }

  backBtn.classList.remove('hidden');
  const toolEl = tool.render();
  view.appendChild(toolEl);
  document.title = `${t(`tools.${tool.id}.title`)} — ${t('app.title')}`;
}

function renderHome() {
  const home = document.createElement('div');
  home.className = 'home';

  const available = tools.filter(tool => tool.available);
  const upcoming = tools.filter(tool => !tool.available);

  home.innerHTML = `
    <div class="home-hero">
      <img src="/assets/main-logo.png" alt="Stardew Valley" class="home-logo">
      <div class="home-sign">
        <h1 class="home-title">${t('home.welcome')}</h1>
        <p class="home-tagline">${t('home.subtitle')}</p>
      </div>
    </div>

    <div class="home-board">
      <div class="home-board__inner">
        <p class="home-board__greeting">${t('home.greeting')}</p>

        <div class="home-section">
          <h2 class="home-section__title">${t('home.available')}</h2>
          <ul class="tool-menu" id="tool-menu-available"></ul>
        </div>

        <div class="home-section home-section--soon">
          <h2 class="home-section__title">${t('home.comingSoon')}</h2>
          <ul class="tool-menu" id="tool-menu-soon"></ul>
        </div>
      </div>
    </div>
  `;

  const availableMenu = home.querySelector('#tool-menu-available');
  available.forEach(tool => availableMenu.appendChild(createToolMenuItem(tool, true)));

  const soonMenu = home.querySelector('#tool-menu-soon');
  upcoming.forEach(tool => soonMenu.appendChild(createToolMenuItem(tool, false)));

  return home;
}

function createToolIcon(tool) {
  const wrap = document.createElement('span');
  wrap.className = 'tool-menu__icon-wrap';

  const img = document.createElement('img');
  img.className = 'tool-menu__icon-img';
  img.src = `/assets/icons/${tool.id}.png`;
  img.alt = '';
  img.width = 36;
  img.height = 36;
  img.addEventListener('error', () => {
    wrap.innerHTML = `<span class="tool-menu__icon tool-menu__icon--${tool.icon}" aria-hidden="true"></span>`;
  });

  wrap.appendChild(img);
  return wrap;
}

function createToolMenuItem(tool, isAvailable) {
  const item = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `tool-menu__btn${isAvailable ? '' : ' tool-menu__btn--soon'}`;

  const icon = createToolIcon(tool);
  const text = document.createElement('span');
  text.className = 'tool-menu__text';
  text.innerHTML = `
    <span class="tool-menu__name">${t(`tools.${tool.id}.title`)}</span>
    <span class="tool-menu__desc">${t(`tools.${tool.id}.desc`)}</span>
  `;

  btn.appendChild(icon);
  btn.appendChild(text);

  if (isAvailable) {
    const arrow = document.createElement('span');
    arrow.className = 'tool-menu__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    btn.appendChild(arrow);
  } else {
    const lock = document.createElement('span');
    lock.className = 'tool-menu__lock';
    lock.textContent = t('home.comingSoon');
    btn.appendChild(lock);
  }

  btn.addEventListener('click', () => navigate(tool.id));
  item.appendChild(btn);
  return item;
}

function rerender() {
  updateThemeButton();
  syncLangUi();
  renderRoute();
}
