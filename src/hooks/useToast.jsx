import { createRoot } from 'react-dom/client';
import Toast from '../components/Toast';

const toastQueue = [];
let toastContainer = null;

function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '0';
    toastContainer.style.right = '0';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.padding = '1rem';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '0.5rem';
    toastContainer.style.pointerEvents = 'none';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(options) {
  const container = createToastContainer();
  
  const toastWrapper = document.createElement('div');
  toastWrapper.style.pointerEvents = 'auto';
  container.appendChild(toastWrapper);

  const root = createRoot(toastWrapper);
  
  const handleClose = () => {
    root.unmount();
    if (container.contains(toastWrapper)) {
      container.removeChild(toastWrapper);
    }
    const index = toastQueue.findIndex(item => item.root === root);
    if (index > -1) {
      toastQueue.splice(index, 1);
    }
  };

  root.render(<Toast {...options} onClose={handleClose} />);
  
  toastQueue.push({ root, wrapper: toastWrapper });

  return {
    close: handleClose
  };
}

export function useToast() {
  return {
    success: (title, message = '', duration = 3000) => {
      return showToast({ type: 'success', title, message, duration });
    },
    error: (title, message = '', duration = 4000) => {
      return showToast({ type: 'error', title, message, duration });
    },
    warning: (title, message = '', duration = 3500) => {
      return showToast({ type: 'warning', title, message, duration });
    },
    info: (title, message = '', duration = 3000) => {
      return showToast({ type: 'info', title, message, duration });
    },
    custom: (options) => {
      return showToast(options);
    }
  };
}
