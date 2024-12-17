import { api } from './api';
import { showSuccess, showError, showLoading, hideLoading } from './ui';

class ContentManager {
  constructor() {
    this.editors = new Map();
    this.initializeEditors();
  }

  initializeEditors() {
    document.querySelectorAll('[data-content-editor]').forEach(element => {
      const pageId = element.dataset.contentEditor;
      // Initialize rich text editor
      const editor = new RichTextEditor(element, {
        onChange: () => this.autosave(pageId)
      });
      this.editors.set(pageId, editor);
    });
  }

  async autosave(pageId) {
    try {
      const editor = this.editors.get(pageId);
      if (!editor) return;

      const content = editor.getContent();
      await api.updateContent(pageId, { content });
      showSuccess('Contenido guardado');
    } catch (error) {
      showError('Error al guardar el contenido');
      console.error('Error saving content:', error);
    }
  }
}

export const contentManager = new ContentManager();