// Show a message on the page
const showMessage = (text, type) => {
  const msg = document.getElementById('message');
  msg.innerHTML = `<div class="message ${type}">${text}</div>`;
};

// Handle Login
const handleLogin = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Please fill in all fields', 'error');
    return;
  }

  const result = await api.login(email, password);

  if (result.token) {
    saveToken(result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    showMessage('✅ Login successful! Redirecting...', 'success');
    setTimeout(() => window.location.href = 'index.html', 1500);
  } else {
    showMessage(result.message || 'Login failed', 'error');
  }
};

// Handle Register
const handleRegister = async () => {
  const name = document.getElementById('name')?.value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Please fill in all fields', 'error');
    return;
  }

  const result = await api.register(name, email, password);

  if (result.message === '✅ User registered successfully!') {
    showMessage('✅ Registered! Redirecting to login...', 'success');
    setTimeout(() => window.location.href = 'login.html', 1500);
  } else {
    showMessage(result.message || 'Registration failed', 'error');
  }
};