let modalInstance = null;

function createModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = '<img class="modal-content" alt="Vista ampliada del producto" />';
  document.body.appendChild(modal);
  return modal;
}

function bindCloseHandler(modal) {
  if (modal.dataset.bound === 'true') {
    return;
  }

  modal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.dataset.bound = 'true';
}

export function ensureMediaModal() {
  if (modalInstance && document.body.contains(modalInstance)) {
    bindCloseHandler(modalInstance);
    return modalInstance;
  }

  const existing = document.querySelector('.modal');
  modalInstance = existing ? existing : createModal();
  bindCloseHandler(modalInstance);
  return modalInstance;
}

export function bindZoomableMedia(root, selector) {
  if (!root) return;

  const modal = ensureMediaModal();
  const modalImage = modal.querySelector('.modal-content');

  if (!modalImage) return;

  root.querySelectorAll(selector).forEach(element => {
    if (element.dataset.zoomBound === 'true') {
      return;
    }

    element.dataset.zoomBound = 'true';
    element.style.cursor = 'zoom-in';

    element.addEventListener('click', () => {
      const imageSrc = element.dataset.image || element.getAttribute('src');
      if (!imageSrc) return;
      modalImage.src = imageSrc;
      modal.classList.add('active');
    });
  });
}
