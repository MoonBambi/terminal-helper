import { defineStore } from 'pinia';

function makeId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function normalizeStopAction(value, fallbackShell = 'cmd') {
  const action = value && typeof value === 'object' ? value : {};
  const command = typeof action.command === 'string' ? action.command : '';
  const shell = action.shell === 'ps' || action.shell === 'bash' || action.shell === 'cmd' ? action.shell : fallbackShell;
  return {
    name: typeof action.name === 'string' && action.name.trim() ? action.name.trim() : '停止',
    command,
    shell,
    useDedicatedTerminal: action.useDedicatedTerminal !== false
  };
}

function normalizeCollection(collection) {
  const fallbackShell = collection?.stopAction?.shell || 'cmd';
  return {
    ...collection,
    cardIds: Array.isArray(collection?.cardIds) ? collection.cardIds : [],
    stopAction: normalizeStopAction(collection?.stopAction, fallbackShell)
  };
}
export const useDataStore = defineStore('data', {
  state: () => ({
    cards: [],
    collections: [],
    runLogs: [],
    pendingLogs: {},
    settings: {
      shellPaths: {
        cmd: 'cmd.exe',
        ps: 'powershell.exe',
        bash: 'bash'
      }
    },
    selectedCollectionId: null,
    searchQuery: '',
    activeRunId: null
  }),
  getters: {
    selectedCollection(state) {
      return state.collections.find((c) => c.id === state.selectedCollectionId) || null;
    },
    filteredCards(state) {
      let cards = state.cards;
      const collection = state.collections.find((c) => c.id === state.selectedCollectionId);
      if (collection) {
        const map = new Map(state.cards.map((card) => [card.id, card]));
        cards = collection.cardIds.map((id) => map.get(id)).filter(Boolean);
      }
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.trim().toLowerCase();
        cards = cards.filter((card) => {
          return (
            card.name.toLowerCase().includes(q) ||
            card.description.toLowerCase().includes(q) ||
            card.command.toLowerCase().includes(q)
          );
        });
      }
      return cards;
    }
  },
  actions: {
    async load() {
      const data = await window.terminalHelper.getData();
      this.cards = Array.isArray(data.cards) ? data.cards : [];
      this.settings = data.settings || this.settings;
      this.cards.forEach((card) => {
        if (!card.shell) {
          const tags = Array.isArray(card.tags) ? card.tags.map((t) => t.toLowerCase()) : [];
          if (tags.includes('ps')) {
            card.shell = 'ps';
          } else if (tags.includes('bash')) {
            card.shell = 'bash';
          } else {
            card.shell = 'cmd';
          }
        }
        delete card.tags;
      });
      this.collections = Array.isArray(data.collections) ? data.collections.map((collection) => normalizeCollection(collection)) : [];
      this.runLogs = Array.isArray(data.runLogs) ? data.runLogs : [];
    },
    async persist() {
      const payload = JSON.parse(
        JSON.stringify({
          cards: this.cards,
          collections: this.collections,
          runLogs: this.runLogs,
          settings: this.settings
        })
      );
      await window.terminalHelper.saveData(payload);
    },
    addCard(payload) {
      const now = new Date().toISOString();
      const card = {
        id: makeId('card'),
        name: payload.name,
        command: payload.command,
        description: payload.description || '',
        shell: payload.shell || 'cmd',
        createdAt: now,
        updatedAt: now
      };
      this.cards.unshift(card);
      this.persist();
      return card.id;
    },
    updateCard(id, payload) {
      const card = this.cards.find((c) => c.id === id);
      if (!card) return;
      card.name = payload.name;
      card.command = payload.command;
      card.description = payload.description || '';
      card.shell = payload.shell || 'cmd';
      card.updatedAt = new Date().toISOString();
      this.persist();
    },
    duplicateCard(card) {
      const now = new Date().toISOString();
      const next = {
        ...card,
        id: makeId('card'),
        name: `${card.name} Copy`,
        createdAt: now,
        updatedAt: now
      };
      this.cards.unshift(next);
      this.persist();
      return next.id;
    },
    deleteCard(id) {
      this.cards = this.cards.filter((c) => c.id !== id);
      this.collections = this.collections.map((collection) => ({
        ...collection,
        cardIds: collection.cardIds.filter((cardId) => cardId !== id)
      }));
      this.persist();
    },
    addCollection(payload) {
      const now = new Date().toISOString();
      this.collections.unshift({
        id: makeId('collection'),
        name: payload.name,
        cardIds: payload.cardIds || [],
        stopAction: normalizeStopAction(payload.stopAction),
        createdAt: now,
        updatedAt: now
      });
      this.persist();
    },
    addCardsToCollection(collectionId, cardIds) {
      const collection = this.collections.find((c) => c.id === collectionId);
      if (!collection) return;
      const nextIds = Array.isArray(cardIds) ? cardIds : [];
      const exists = new Set(collection.cardIds);
      nextIds.forEach((id) => {
        if (!exists.has(id)) {
          collection.cardIds.push(id);
        }
      });
      collection.updatedAt = new Date().toISOString();
      this.persist();
    },
    updateCollection(id, payload) {
      const collection = this.collections.find((c) => c.id === id);
      if (!collection) return;
      collection.name = payload.name;
      collection.cardIds = payload.cardIds || [];
      collection.stopAction = normalizeStopAction(payload.stopAction, collection.stopAction?.shell || 'cmd');
      collection.updatedAt = new Date().toISOString();
      this.persist();
    },
    duplicateCollection(collection) {
      const now = new Date().toISOString();
      this.collections.unshift({
        ...collection,
        id: makeId('collection'),
        name: `${collection.name} Copy`,
        cardIds: [...collection.cardIds],
        stopAction: normalizeStopAction(collection.stopAction, collection.stopAction?.shell || 'cmd'),
        createdAt: now,
        updatedAt: now
      });
      this.persist();
    },
    deleteCollection(id) {
      this.collections = this.collections.filter((c) => c.id !== id);
      if (this.selectedCollectionId === id) {
        this.selectedCollectionId = null;
      }
      this.persist();
    },
    insertCardIntoCollection(collectionId, cardId, index) {
      const collection = this.collections.find((c) => c.id === collectionId);
      if (!collection) return;
      const nextIndex = Number.isInteger(index) ? index : collection.cardIds.length;
      const boundedIndex = Math.max(0, Math.min(nextIndex, collection.cardIds.length));
      collection.cardIds.splice(boundedIndex, 0, cardId);
      collection.updatedAt = new Date().toISOString();
      this.persist();
    },
    removeCardFromCollection(collectionId, cardId) {
      const collection = this.collections.find((c) => c.id === collectionId);
      if (!collection) return;
      const index = collection.cardIds.indexOf(cardId);
      if (index === -1) return;
      collection.cardIds.splice(index, 1);
      collection.updatedAt = new Date().toISOString();
      this.persist();
    },
    removeCardFromCollectionAt(collectionId, index) {
      const collection = this.collections.find((c) => c.id === collectionId);
      if (!collection) return;
      if (index < 0 || index >= collection.cardIds.length) return;
      collection.cardIds.splice(index, 1);
      collection.updatedAt = new Date().toISOString();
      this.persist();
    },
    reorderCollectionCardAt(collectionId, index, newIndex) {
      const collection = this.collections.find((c) => c.id === collectionId);
      if (!collection) return;
      if (index < 0 || index >= collection.cardIds.length) return;
      const boundedIndex = Math.max(0, Math.min(newIndex, collection.cardIds.length - 1));
      if (index === boundedIndex) return;
      const [cardId] = collection.cardIds.splice(index, 1);
      collection.cardIds.splice(boundedIndex, 0, cardId);
      collection.updatedAt = new Date().toISOString();
      this.persist();
    },
    reorderCollectionCard(collectionId, cardId, newIndex) {
      const collection = this.collections.find((c) => c.id === collectionId);
      if (!collection) return;
      const currentIndex = collection.cardIds.indexOf(cardId);
      if (currentIndex === -1) return;
      const boundedIndex = Math.max(0, Math.min(newIndex, collection.cardIds.length - 1));
      if (currentIndex === boundedIndex) return;
      collection.cardIds.splice(currentIndex, 1);
      collection.cardIds.splice(boundedIndex, 0, cardId);
      collection.updatedAt = new Date().toISOString();
      this.persist();
    },
    addRunLog(run) {
      this.runLogs.unshift(run);
      this.activeRunId = run.id;
      this.persist();
    },
    updateRun(runId, update) {
      const run = this.runLogs.find((r) => r.id === runId);
      if (!run) return;
      Object.assign(run, update);
      this.persist();
    },
    addRunStep(runId, step) {
      const run = this.runLogs.find((r) => r.id === runId);
      if (!run) return;
      run.steps.push(step);
      const key = `${runId}:${step.id}`;
      const pending = this.pendingLogs[key];
      if (pending) {
        if (pending.stdout) step.stdout += pending.stdout;
        if (pending.stderr) step.stderr += pending.stderr;
        delete this.pendingLogs[key];
      }
      this.persist();
    },
    updateRunStep(runId, stepId, update) {
      const run = this.runLogs.find((r) => r.id === runId);
      if (!run) return;
      const step = run.steps.find((s) => s.id === stepId);
      if (!step) return;
      Object.assign(step, update);
      this.persist();
    },
    appendRunOutput(runId, stepId, stream, chunk) {
      const run = this.runLogs.find((r) => r.id === runId);
      if (!run) return;
      const step = run.steps.find((s) => s.id === stepId);
      if (!step) {
        const key = `${runId}:${stepId}`;
        if (!this.pendingLogs[key]) {
          this.pendingLogs[key] = { stdout: '', stderr: '' };
        }
        if (stream === 'stdout') {
          this.pendingLogs[key].stdout += chunk;
        } else {
          this.pendingLogs[key].stderr += chunk;
        }
        return;
      }
      if (stream === 'stdout') {
        step.stdout += chunk;
      } else {
        step.stderr += chunk;
      }
      this.persist();
    }
  }
});

