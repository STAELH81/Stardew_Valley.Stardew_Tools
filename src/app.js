import { t, getLocale, setLocale, LOCALES } from './i18n/index.js';
import { getTheme, toggleTheme } from './theme.js';
import { tools, getTool } from './tools/registry.js';

let currentView = null;

export function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="top-bar">
      <button type="button" id="nav-back" class="btn btn--ghost hidden">${t('app.back')}</button>
      <div class="top-bar__actions">
        <label class="sr-only" for="lang-select">${t('nav.language')}</label>
        <select id="lang-select" class="select"></select>
        <button type="button" id="theme-toggle" class="theme-toggle btn btn--ghost" aria-label="">
          <span class="theme-toggle__disc" aria-hidden="true"></span>
        </button>
      </div>
    </header>
    <main id="view" class="view"></main>
  `;

  const langSelect = app.querySelector('#lang-select');
  Object.entries(LOCALES).forEach(([code, { label }]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = label;
    langSelect.appendChild(option);
  });
  langSelect.value = getLocale();

  langSelect.addEventListener('change', () => {
    setLocale(langSelect.value);
    rerender();
  });

  app.querySelector('#theme-toggle').addEventListener('click', () => {
    toggleTheme();
    updateThemeButton();
  });

  app.querySelector('#nav-back').addEventListener('click', () => navigate(''));

  window.addEventListener('hashchange', renderRoute);
  updateThemeButton();
  renderRoute();
}

function updateThemeButton() {
  const btn = document.querySelector('#theme-toggle');
  if (!btn) return;
  const isDark = getTheme() === 'dark';
  btn.classList.toggle('theme-toggle--dark', isDark);
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

function createToolMenuItem(tool, isAvailable) {
  const item = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `tool-menu__btn${isAvailable ? '' : ' tool-menu__btn--soon'}`;
  btn.innerHTML = `
    <span class="tool-menu__icon tool-menu__icon--${tool.icon}" aria-hidden="true"></span>
    <span class="tool-menu__text">
      <span class="tool-menu__name">${t(`tools.${tool.id}.title`)}</span>
      <span class="tool-menu__desc">${t(`tools.${tool.id}.desc`)}</span>
    </span>
    ${isAvailable ? '<span class="tool-menu__arrow" aria-hidden="true"></span>' : `<span class="tool-menu__lock">${t('home.comingSoon')}</span>`}
  `;
  btn.addEventListener('click', () => navigate(tool.id));
  item.appendChild(btn);
  return item;
}

function rerender() {
  updateThemeButton();
  renderRoute();
}
