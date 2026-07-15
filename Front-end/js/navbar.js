// ─── NEW: navbar avatar logic ───
const initNavbar = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return;

  // Hide login show avatar
  const loginLink = document.getElementById('loginLink');
  const avatarWrap = document.getElementById('avatarWrap');
  if (loginLink) loginLink.style.display = 'none';
  if (avatarWrap) avatarWrap.style.display = 'flex';

  // Set initials or profile picture
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
  const navAvatar = document.getElementById('navAvatar');
  const dropdownAvatar = document.getElementById('dropdownAvatar');

  // Check for profile picture
  const pic = user.profile_picture;
  if (pic) {
    if (navAvatar) navAvatar.innerHTML = `<img src="${pic}" />`;
    if (dropdownAvatar) dropdownAvatar.innerHTML = `<img src="${pic}" />`;
  } else {
    if (navAvatar) navAvatar.textContent = initial;
    if (dropdownAvatar) dropdownAvatar.textContent = initial;
  }

  // Set name and email
  const dropdownName = document.getElementById('dropdownName');
  const dropdownEmail = document.getElementById('dropdownEmail');
  if (dropdownName) dropdownName.textContent = user.name || 'User';
  if (dropdownEmail) dropdownEmail.textContent = user.email || '';

  // Show admin link if admin
  if (user.role === 'admin') {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) adminLink.style.display = 'flex';
  }

  // Mobile menu
  const mobileLogin = document.getElementById('mobileLoginLink');
  const mobileLogout = document.getElementById('mobileLogoutLink');
  const mobileName = document.getElementById('mobileUserName');
  if (mobileLogin) mobileLogin.style.display = 'none';
  if (mobileLogout) mobileLogout.style.display = 'block';
  if (mobileName) mobileName.textContent = user.name || 'User';
};

// ─── TOGGLE DROPDOWN ───
const toggleDropdown = () => {
  const dropdown = document.getElementById('navDropdown');
  dropdown?.classList.toggle('open');
};

// ─── CLOSE DROPDOWN WHEN CLICKING OUTSIDE ───
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('avatarWrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('navDropdown')?.classList.remove('open');
  }
});

// ─── LOGOUT ───
const handleLogout = () => {
  removeToken();
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};

// ─── INIT ───
document.addEventListener('DOMContentLoaded', initNavbar);