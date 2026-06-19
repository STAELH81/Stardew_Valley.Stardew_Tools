import { t } from '../i18n/index.js';

const STORAGE_KEY = 'stardew-tools-quests';

function getQuests() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveQuests(quests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
}

function ensureQuestIds(quests) {
  let changed = false;
  quests.forEach(quest => {
    if (!quest.id) {
      quest.id = `${Date.now()}-${Math.random()}`;
      changed = true;
    }
  });
  if (changed) saveQuests(quests);
  return quests;
}

export function renderQuests() {
  const root = document.createElement('div');
  root.className = 'tool-view';
  root.innerHTML = `
    <div class="card">
      <h1>${t('tools.quests.title')}</h1>
      <section class="section">
        <h2>${t('quests.addTitle')}</h2>
        <label for="quest-name">${t('quests.name')}</label>
        <input type="text" id="quest-name">
        <label for="quest-description">${t('quests.description')}</label>
        <textarea id="quest-description" rows="3"></textarea>
        <label for="quest-reward">${t('quests.reward')}</label>
        <input type="text" id="quest-reward">
        <button type="button" id="add-quest" class="btn">${t('quests.add')}</button>
      </section>
      <section class="section">
        <h2>${t('quests.listTitle')}</h2>
        <input type="text" id="quest-search" placeholder="${t('quests.search')}">
        <ul id="quest-list" class="quest-list"></ul>
      </section>
    </div>
  `;

  const listEl = root.querySelector('#quest-list');

  function renderList() {
    listEl.innerHTML = '';
    const active = ensureQuestIds(getQuests()).filter(quest => !quest.completed);

    if (!active.length) {
      listEl.innerHTML = `<li class="quest-empty">${t('quests.empty')}</li>`;
      return;
    }

    active.forEach(quest => {
      const item = document.createElement('li');
      item.className = 'quest-item';
      item.dataset.id = quest.id;
      item.innerHTML = `
        <div class="quest-info">
          <strong>${escapeHtml(quest.name)}</strong>
          <p>${escapeHtml(quest.description)}</p>
          <span class="quest-reward">${t('quests.reward')}: ${escapeHtml(quest.reward)}</span>
        </div>
      `;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--small';
      btn.textContent = t('quests.complete');
      btn.addEventListener('click', () => {
        const quests = getQuests().map(q =>
          q.id === quest.id ? { ...q, completed: true } : q
        );
        saveQuests(quests);
        renderList();
      });

      item.appendChild(btn);
      listEl.appendChild(item);
    });
  }

  root.querySelector('#add-quest').addEventListener('click', () => {
    const name = root.querySelector('#quest-name').value.trim();
    const description = root.querySelector('#quest-description').value.trim();
    const reward = root.querySelector('#quest-reward').value.trim();

    if (!name || !description || !reward) {
      alert(t('quests.fillAll'));
      return;
    }

    const quests = getQuests();
    quests.push({ id: `${Date.now()}`, name, description, reward, completed: false });
    saveQuests(quests);

    root.querySelector('#quest-name').value = '';
    root.querySelector('#quest-description').value = '';
    root.querySelector('#quest-reward').value = '';
    renderList();
  });

  root.querySelector('#quest-search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    listEl.querySelectorAll('.quest-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
    });
  });

  renderList();
  return root;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
