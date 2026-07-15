let profileData = null;

// ─── LOAD PROFILE ─────────────────────────────────────
const loadProfile = async () => {
  profileData = await api.getProfile();

  // Update header
  document.getElementById('profileName').textContent = profileData.name;
  document.getElementById('profileEmail').textContent = profileData.email;
  document.getElementById('profileRole').textContent =
    profileData.role === 'admin' ? '⚙️ Admin' : '👤 Customer';

  // Update avatar
  const avatar = document.getElementById('profileAvatar');
  if (profileData.profile_picture) {
    const navAvatar = document.getElementById('navAvatar');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    if (navAvatar) navAvatar.innerHTML = `<img src="${profileData.profile_picture}" style="width:100%;height:100%;object-fit:cover;" />`;
    if (dropdownAvatar) dropdownAvatar.innerHTML = `<img src="${profileData.profile_picture}" style="width:100%;height:100%;object-fit:cover;" />`;
  }

  // Fill form fields
  document.getElementById('editName').value = profileData.name;
  document.getElementById('editPhone').value = profileData.phone || '';
  document.getElementById('editEmail').value = profileData.email;
  document.getElementById('editJoined').value =
    new Date(profileData.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
};

// ─── SAVE PROFILE ─────────────────────────────────────
const saveProfile = async () => {
  const name = document.getElementById('editName').value;
  const phone = document.getElementById('editPhone').value;

  const result = await api.updateProfile({ name, phone });
  showMsg('infoMessage', result.message);

  if (result.message.includes('✅')) {
    document.getElementById('profileName').textContent = name;
    // Update localStorage user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.name = name;
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// ─── PROFILE PICTURE ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('avatarInput')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const result = await api.updateProfilePicture(formData);

    if (result.image_url) {
      const avatar = document.getElementById('profileAvatar');
      avatar.innerHTML = `<img src="${result.image_url}"
        style="width:100%; height:100%; object-fit:cover; border-radius:50%;" />`;
    }
  });
});

// ─── TABS ─────────────────────────────────────────────
const switchTab = (tab, btn) => {
  document.querySelectorAll('.profile-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');

  // Load tab data
  if (tab === 'addresses') loadAddresses();
  if (tab === 'orders') loadProfileOrders();
};

// ─── ADDRESSES ────────────────────────────────────────
const toggleAddressForm = () => {
  const form = document.getElementById('addressForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

const loadAddresses = async () => {
  const addresses = await api.getAddresses();
  const container = document.getElementById('addressesList');

  if (!addresses.length) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-secondary);">
        <div style="font-size:40px; margin-bottom:12px;">📍</div>
        <p>No addresses yet — add one above!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = addresses.map(addr => `
    <div class="address-card ${addr.is_default ? 'default' : ''}">
      <div class="address-card-header">
        <div>
          <span class="address-name">${addr.full_name}</span>
          ${addr.is_default ? '<span class="default-badge">⭐ Default</span>' : ''}
        </div>
        <div style="display:flex; gap:8px;">
          ${!addr.is_default ? `
            <button class="addr-btn addr-btn-default" onclick="setDefault(${addr.id})">
              Set Default
            </button>
          ` : ''}
          <button class="addr-btn addr-btn-delete" onclick="removeAddress(${addr.id})">
            🗑 Delete
          </button>
        </div>
      </div>
      <div class="address-details">
        <p>📞 ${addr.phone}</p>
        <p>📍 ${addr.street}, ${addr.city}, ${addr.country}</p>
      </div>
    </div>
  `).join('');
};

const saveAddress = async () => {
  const data = {
    full_name: document.getElementById('addrName').value,
    phone: document.getElementById('addrPhone').value,
    street: document.getElementById('addrStreet').value,
    city: document.getElementById('addrCity').value,
    country: document.getElementById('addrCountry').value,
    is_default: document.getElementById('addrDefault').checked
  };

  const result = await api.addAddress(data);
  showMsg('addressMessage', result.message);

  if (result.message.includes('✅')) {
    // Clear form
    ['addrName', 'addrPhone', 'addrStreet', 'addrCity', 'addrCountry'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('addrDefault').checked = false;
    toggleAddressForm();
    loadAddresses();
  }
};

const removeAddress = async (id) => {
  if (!confirm('Delete this address?')) return;
  const result = await api.deleteAddress(id);
  if (result.message.includes('✅')) loadAddresses();
};

const setDefault = async (id) => {
  const result = await api.setDefaultAddress(id);
  if (result.message.includes('✅')) loadAddresses();
};

// ─── ORDERS ───────────────────────────────────────────
const loadProfileOrders = async () => {
  const orders = await api.getOrders();
  const container = document.getElementById('profileOrdersList');

  if (!orders.length) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-secondary);">
        <div style="font-size:40px; margin-bottom:12px;">📦</div>
        <p>No orders yet</p>
        <a href="index.html" style="color:var(--accent); font-weight:700;">Start Shopping →</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="orders-list">
      ${orders.map(order => `
        <div class="profile-order-card">
          <div class="profile-order-left">
            <span class="profile-order-id">#${order.id}</span>
            <span class="profile-order-date">
              ${new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </span>
          </div>
          <div class="profile-order-right">
            <span class="profile-order-total">$${order.total}</span>
            <span class="status ${order.status}">${order.status}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// ─── PASSWORD ─────────────────────────────────────────
const savePassword = async () => {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    showMsg('securityMessage', '❌ All fields are required', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showMsg('securityMessage', '❌ New passwords do not match', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showMsg('securityMessage', '❌ Password must be at least 6 characters', 'error');
    return;
  }

  const result = await api.changePassword(currentPassword, newPassword);
  showMsg('securityMessage', result.message);

  if (result.message.includes('✅')) {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }
};

// ─── LOGOUT ALL ───────────────────────────────────────
const logoutAll = () => {
  if (!confirm('Are you sure you want to logout?')) return;
  removeToken();
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};

// ─── HELPER: show message ─────────────────────────────
const showMsg = (elementId, message, type) => {
  const isSuccess = message.includes('✅');
  const msgType = type || (isSuccess ? 'success' : 'error');
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = `<div class="message ${msgType}" style="margin-bottom:16px;">${message}</div>`;
    setTimeout(() => el.innerHTML = '', 4000);
  }
};

// ─── INIT ─────────────────────────────────────────────
loadProfile();