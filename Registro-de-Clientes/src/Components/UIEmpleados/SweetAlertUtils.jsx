import Swal from 'sweetalert2';

export const showSuccessAlert = (onConfirm) => {
  Swal.fire({
    title: 'Cliente agregado con éxito!',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div id="lottie-success" style="width: 150px; height: 150px; margin: 20px 0;"></div>
        <p style="margin: 10px 0; font-size: 16px; color: #4a5568;">Cliente agregado correctamente</p>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Continuar',
    confirmButtonColor: '#5D9646',
    allowOutsideClick: false,
    customClass: {
      popup: 'animated bounceIn'
    },
    didOpen: () => {
      // Cargar tu animación Lottie
      import('lottie-web').then((lottie) => {
        lottie.default.loadAnimation({
          container: document.getElementById('lottie-success'),
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: '/success tick.json' // Tu archivo exacto
        });
      }).catch(() => {
        // Si falla, mostrar emoji de respaldo
        document.getElementById('lottie-success').innerHTML = '✅';
        document.getElementById('lottie-success').style.fontSize = '60px';
        document.getElementById('lottie-success').style.display = 'flex';
        document.getElementById('lottie-success').style.alignItems = 'center';
        document.getElementById('lottie-success').style.justifyContent = 'center';
      });
    }
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

export const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error al agregar cliente',
    text: message || 'Hubo un error al procesar la solicitud',
    icon: 'error',
    confirmButtonText: 'Intentar de nuevo',
    confirmButtonColor: '#ef4444',
    allowOutsideClick: false,
    customClass: {
      popup: 'animated shakeX'
    }
  });
};

export const showLoadingAlert = () => {
  Swal.fire({
    title: 'Agregando cliente...',
    text: 'Por favor espera mientras procesamos la información',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const showValidationAlert = (camposFaltantes) => {
  Swal.fire({
    title: '⚠️ Formulario incompleto',
    html: `
      <p style="margin-bottom: 15px;">Los siguientes campos son obligatorios:</p>
      <ul style="text-align: left; color: #dc2626; font-weight: 500;">
        ${camposFaltantes.map(campo => `<li>• ${campo}</li>`).join('')}
      </ul>
    `,
    icon: 'warning',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#f59e0b',
    allowOutsideClick: false,
    customClass: {
      popup: 'animated pulse'
    }
  });
};