import { t } from '../i18n/index.js';

const STORAGE_KEY = 'stardew-tools-quests';

const CATEGORIES = ['general', 'farming', 'fishing', 'mining', 'combat', 'social'];

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

function categoryLabel(category) {
  const key = `quests.category${category.charAt(0).toUpperCase()}${category.slice(1)}`;
  return t(key);
}

function formatDeadline(deadline) {
  if (!deadline) return '';
  try {
    return new Date(deadline + 'T12:00:00').toLocaleDateString();
  } catch {
    return deadline;
  }
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
        <label for="quest-category">${t('quests.category')}</label>
        <select id="quest-category">
          ${CATEGORIES.map(cat => `<option value="${cat}">${categoryLabel(cat)}</option>`).join('')}
        </select>
        <label for="quest-deadline">${t('quests.deadline')}</label>
        <input type="date" id="quest-deadline">
        <label for="quest-reward">${t('quests.reward')}</label>
        <input type="text" id="quest-reward">
        <button type="button" id="add-quest" class="btn">${t('quests.add')}</button>
      </section>
      <section class="section">
        <h2>${t('quests.listTitle')}</h2>
        <div class="quest-filters">
          <input type="text" id="quest-search" placeholder="${t('quests.search')}">
          <select id="quest-filter-category">
            <option value="">${t('quests.allCategories')}</option>
            ${CATEGORIES.map(cat => `<option value="${cat}">${categoryLabel(cat)}</option>`).join('')}
          </select>
        </div>
        <ul id="quest-list" class="quest-list"></ul>
      </section>
      <section class="section">
        <button type="button" id="toggle-completed" class="btn btn--ghost btn--small">${t('quests.showCompleted')}</button>
        <ul id="quest-completed-list" class="quest-list hidden"></ul>
      </section>
      <div class="button-row">
        <button type="button" id="quest-export" class="btn btn--ghost">${t('quests.export')}</button>
        <button type="button" id="quest-import" class="btn btn--ghost">${t('quests.import')}</button>
        <input type="file" id="quest-import-file" accept="application/json,.json" hidden>
      </div>
    </div>
  `;

  const listEl = root.querySelector('#quest-list');
  const completedListEl = root.querySelector('#quest-completed-list');
  let showCompleted = false;

  function matchesFilters(quest) {
    const query = root.querySelector('#quest-search').value.toLowerCase();
    const category = root.querySelector('#quest-filter-category').value;
    const text = `${quest.name} ${quest.description} ${quest.reward}`.toLowerCase();
    if (category && quest.category !== category) return false;
    if (query && !text.includes(query)) return false;
    return true;
  }

  function renderQuestItem(quest, isCompleted) {
    const item = document.createElement('li');
    item.className = `quest-item${isCompleted ? ' quest-item--completed' : ''}`;
    item.dataset.id = quest.id;

    const meta = [];
    if (quest.category) meta.push(categoryLabel(quest.category));
    if (quest.deadline) meta.push(`${t('quests.deadlineLabel')}: ${formatDeadline(quest.deadline)}`);

    item.innerHTML = `
      <div class="quest-info">
        <strong>${escapeHtml(quest.name)}</strong>
        ${meta.length ? `<span class="quest-meta">${escapeHtml(meta.join(' · '))}</span>` : ''}
        <p>${escapeHtml(quest.description)}</p>
        <span class="quest-reward">${t('quests.reward')}: ${escapeHtml(quest.reward)}</span>
      </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'quest-actions';

    if (isCompleted) {
      const restoreBtn = document.createElement('button');
      restoreBtn.type = 'button';
      restoreBtn.className = 'btn btn--small';
      restoreBtn.textContent = t('quests.restore');
      restoreBtn.addEventListener('click', () => {
        const quests = getQuests().map(q =>
          q.id === quest.id ? { ...q, completed: false } : q
        );
        saveQuests(quests);
        renderLists();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn--small btn--danger';
      deleteBtn.textContent = t('quests.delete');
      deleteBtn.addEventListener('click', () => {
        if (!confirm(t('quests.deleteConfirm'))) return;
        saveQuests(getQuests().filter(q => q.id !== quest.id));
        renderLists();
      });

      actions.append(restoreBtn, deleteBtn);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--small';
      btn.textContent = t('quests.complete');
      btn.addEventListener('click', () => {
        const quests = getQuests().map(q =>
          q.id === quest.id ? { ...q, completed: true } : q
        );
        saveQuests(quests);
        renderLists();
      });
      actions.appendChild(btn);
    }

    item.appendChild(actions);
    return item;
  }

  function renderLists() {
    listEl.innerHTML = '';
    completedListEl.innerHTML = '';

    const all = ensureQuestIds(getQuests());
    const active = all.filter(quest => !quest.completed && matchesFilters(quest));
    const completed = all.filter(quest => quest.completed);

    if (!active.length) {
      listEl.innerHTML = `<li class="quest-empty">${t('quests.empty')}</li>`;
    } else {
      active.forEach(quest => listEl.appendChild(renderQuestItem(quest, false)));
    }

    if (completed.length) {
      completed.forEach(quest => completedListEl.appendChild(renderQuestItem(quest, true)));
    } else if (showCompleted) {
      completedListEl.innerHTML = `<li class="quest-empty">${t('quests.noCompleted')}</li>`;
    }

    const toggleBtn = root.querySelector('#toggle-completed');
    toggleBtn.textContent = showCompleted
      ? t('quests.hideCompleted', { count: completed.length })
      : t('quests.showCompleted', { count: completed.length });
  }

  root.querySelector('#add-quest').addEventListener('click', () => {
    const name = root.querySelector('#quest-name').value.trim();
    const description = root.querySelector('#quest-description').value.trim();
    const reward = root.querySelector('#quest-reward').value.trim();
    const category = root.querySelector('#quest-category').value;
    const deadline = root.querySelector('#quest-deadline').value;

    if (!name || !description || !reward) {
      alert(t('quests.fillAll'));
      return;
    }

    const quests = getQuests();
    quests.push({
      id: `${Date.now()}`,
      name,
      description,
      reward,
      category,
      deadline: deadline || null,
      completed: false,
    });
    saveQuests(quests);

    root.querySelector('#quest-name').value = '';
    root.querySelector('#quest-description').value = '';
    root.querySelector('#quest-reward').value = '';
    root.querySelector('#quest-deadline').value = '';
    renderLists();
  });

  root.querySelector('#quest-search').addEventListener('input', renderLists);
  root.querySelector('#quest-filter-category').addEventListener('change', renderLists);

  root.querySelector('#toggle-completed').addEventListener('click', () => {
    showCompleted = !showCompleted;
    completedListEl.classList.toggle('hidden', !showCompleted);
    renderLists();
  });

  root.querySelector('#quest-export').addEventListener('click', async () => {
    const json = JSON.stringify(getQuests(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      alert(t('quests.exported'));
    } catch {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stardew-quests.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  const importFile = root.querySelector('#quest-import-file');
  root.querySelector('#quest-import').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error('invalid');
        saveQuests(imported);
        renderLists();
        alert(t('quests.importSuccess'));
      } catch {
        alert(t('quests.importError'));
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  renderLists();
  return root;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
