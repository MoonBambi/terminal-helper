import { defineStore } from 'pinia';

function makeId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
      this.collections = Array.isArray(data.collections) ? data.collections : [];
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
      this.cards.unshift({
        ...card,
        id: makeId('card'),
        name: `${card.name} Copy`,
        createdAt: now,
        updatedAt: now
      });
      this.persist();
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
