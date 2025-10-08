import { supabase } from './config/supabase.js';

// Resolve env for edge functions base URL and anon key
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const browserEnv = (typeof window !== 'undefined' && window.__ENV__) ? window.__ENV__ : {};
const SUPABASE_URL = viteEnv.VITE_SUPABASE_URL || browserEnv.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = viteEnv.VITE_SUPABASE_ANON_KEY || browserEnv.SUPABASE_ANON_KEY || '';

let currentPhone = '';
let timerInterval = null;
let canResend = false;

// Elements
const phoneStep = document.getElementById('phoneStep');
const otpStep = document.getElementById('otpStep');
const phoneForm = document.getElementById('phoneForm');
const otpForm = document.getElementById('otpForm');
const phoneInput = document.getElementById('phone');
const countryCode = document.getElementById('countryCode');
const otpInputs = document.querySelectorAll('.otp-input');
const sendCodeBtn = document.getElementById('sendCodeBtn');
const verifyBtn = document.getElementById('verifyBtn');
const changePhoneBtn = document.getElementById('changePhoneBtn');
const resendLink = document.getElementById('resendLink');
const alertContainer = document.getElementById('alertContainer');
const timeLeftSpan = document.getElementById('timeLeft');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const facebookLoginBtn = document.getElementById('facebookLoginBtn');

// Check if already logged in
checkExistingSession();

// Social login handlers
googleLoginBtn?.addEventListener('click', async () => {
  try {
    googleLoginBtn.disabled = true;
    googleLoginBtn.innerHTML = '<div class="loading-spinner"></div><span>Conectando...</span>';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/pages/mi-cuenta.html`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;

  } catch (error) {
    console.error('Google login error:', error);
    showAlert('error', 'Error al conectar con Google. Intenta nuevamente.');
    googleLoginBtn.disabled = false;
    googleLoginBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg><span>Continuar con Google</span>';
  }
});

facebookLoginBtn?.addEventListener('click', async () => {
  try {
    facebookLoginBtn.disabled = true;
    facebookLoginBtn.innerHTML = '<div class="loading-spinner"></div><span>Conectando...</span>';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/pages/mi-cuenta.html`,
      }
    });

    if (error) throw error;

  } catch (error) {
    console.error('Facebook login error:', error);
    showAlert('error', 'Error al conectar con Facebook. Intenta nuevamente.');
    facebookLoginBtn.disabled = false;
    facebookLoginBtn.innerHTML = '<i class="fab fa-facebook-f"></i><span>Continuar con Facebook</span>';
  }
});

// Handle OAuth callback
window.addEventListener('load', async () => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');

  if (accessToken) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        localStorage.setItem('kioskeys_session', JSON.stringify({
          access_token: accessToken,
          user: user,
        }));

        showAlert('success', '¡Inicio de sesión exitoso! Redirigiendo...');

        setTimeout(() => {
          window.location.href = '/pages/mi-cuenta.html';
        }, 1000);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      showAlert('error', 'Error al completar el inicio de sesión.');
    }
  }
});

async function checkExistingSession() {
  const session = localStorage.getItem('kioskeys_session');
  if (session) {
    try {
      const sessionData = JSON.parse(session);
      const user = sessionData.user;

      // Verificar si la sesión sigue siendo válida
      if (user && user.id) {
        // Redirigir a mi cuenta
        window.location.href = '/pages/mi-cuenta.html';
        return;
      }
    } catch (e) {
      localStorage.removeItem('kioskeys_session');
    }
  }
}

// Phone form submission
phoneForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const phone = phoneInput.value.trim();
  const code = countryCode.value;

  if (!phone || phone.length < 8) {
    showAlert('error', 'Por favor ingresa un número de teléfono válido');
    return;
  }

  currentPhone = code + phone;

  // Show loading
  sendCodeBtn.disabled = true;
  sendCodeBtn.innerHTML = '<div class="loading-spinner"></div><span>Enviando...</span>';

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phone: currentPhone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al enviar código');
    }

    // Show dev code in development
    if (data.dev_code) {
      showAlert('info', `Código de desarrollo: ${data.dev_code}`);
    } else {
      showAlert('success', '¡Código enviado! Revisa tu WhatsApp');
    }

    // Switch to OTP step
    phoneStep.classList.remove('active');
    otpStep.classList.add('active');

    // Focus first OTP input
    otpInputs[0].focus();

    // Start timer
    startTimer(300); // 5 minutes

  } catch (error) {
    console.error('Error sending OTP:', error);
    showAlert('error', error.message || 'Error al enviar el código. Intenta nuevamente.');
  } finally {
    sendCodeBtn.disabled = false;
    sendCodeBtn.innerHTML = '<i class="fab fa-whatsapp"></i><span>Enviar Código</span>';
  }
});

// OTP form submission
otpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const code = Array.from(otpInputs).map(input => input.value).join('');

  if (code.length !== 6) {
    showAlert('error', 'Por favor ingresa el código completo');
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.innerHTML = '<div class="loading-spinner"></div><span>Verificando...</span>';

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-whatsapp-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        phone: currentPhone,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Código inválido');
    }

    // Save session
    localStorage.setItem('kioskeys_session', JSON.stringify({
      access_token: data.session.access_token,
      user: data.user,
    }));

    showAlert('success', '¡Verificación exitosa! Redirigiendo...');

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Redirect to account page or home
    setTimeout(() => {
      if (data.is_new_user) {
        window.location.href = '/pages/mi-cuenta.html?welcome=true';
      } else {
        window.location.href = '/pages/mi-cuenta.html';
      }
    }, 1000);

  } catch (error) {
    console.error('Error verifying OTP:', error);
    showAlert('error', error.message || 'Código incorrecto. Intenta nuevamente.');

    // Clear OTP inputs
    otpInputs.forEach(input => input.value = '');
    otpInputs[0].focus();

  } finally {
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Verificar Código</span>';
  }
});

// Change phone button
changePhoneBtn.addEventListener('click', () => {
  otpStep.classList.remove('active');
  phoneStep.classList.add('active');

  // Clear OTP inputs
  otpInputs.forEach(input => input.value = '');

  // Stop timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  alertContainer.innerHTML = '';
});

// Resend code
resendLink.addEventListener('click', async () => {
  if (!canResend) return;

  canResend = false;
  resendLink.classList.add('disabled');

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phone: currentPhone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al reenviar código');
    }

    showAlert('success', '¡Código reenviado!');

    // Restart timer
    startTimer(300);

    // Clear OTP inputs
    otpInputs.forEach(input => input.value = '');
    otpInputs[0].focus();

  } catch (error) {
    console.error('Error resending OTP:', error);
    showAlert('error', error.message || 'Error al reenviar el código');
    canResend = true;
    resendLink.classList.remove('disabled');
  }
});

// OTP input handling
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const value = e.target.value;

    if (value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });

  // Only allow numbers
  input.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  });

  // Paste handling
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      pastedData.split('').forEach((char, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = char;
        }
      });
      otpInputs[5].focus();
    }
  });
});

// Timer function
function startTimer(seconds) {
  let timeLeft = seconds;
  canResend = false;
  resendLink.classList.add('disabled');

  const timer = document.getElementById('timer');
  timer.classList.remove('expired');

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    timeLeft--;

    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timeLeftSpan.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timer.classList.add('expired');
      timeLeftSpan.textContent = 'Expirado';
      canResend = true;
      resendLink.classList.remove('disabled');
    }
  }, 1000);
}

// Alert function
function showAlert(type, message) {
  const icons = {
    error: 'fa-exclamation-circle',
    success: 'fa-check-circle',
    info: 'fa-info-circle',
  };

  alertContainer.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas ${icons[type]}"></i>
      <span>${message}</span>
    </div>
  `;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 5000);
}
