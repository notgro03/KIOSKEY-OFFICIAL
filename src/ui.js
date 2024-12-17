import Swal from 'sweetalert2';

export function showSuccess(message) {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    timer: 2000,
    showConfirmButton: false,
    position: 'top-end',
    toast: true
  });
}

export function showError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    position: 'top-end',
    toast: true,
    timer: 3000,
    showConfirmButton: false
  });
}

export function showLoading() {
  Swal.showLoading();
}

export function hideLoading() {
  Swal.close();
}