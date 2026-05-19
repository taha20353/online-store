let allProducts = [];
let editingId = null;

// ─── MESSAGES ────────────────────────────────────────
const showMessage = (text, type) => {
  document.getElementById('productMessage').innerHTML =
    `<div class="message ${type}" style="margin-top:15px;">${text}</div>`;
  setTimeout(() => document.getElementById('productMessage').innerHTML = '', 3000);
};

// ─── LOAD CATEGORIES ─────────────────────────────────
const loadCategories = async () => {
  const categories = await api.adminGetCategories();
  const select = document.getElementById('productCategory');
  select.innerHTML = categories.map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');
};

// ─── LOAD PRODUCTS ───────────────────────────────────
const loadProducts = async () => {
  allProducts = await api.adminGetProducts();
  renderProducts(allProducts);
};

const renderProducts = (products) => {
  const container = document.getElementById('productsTable');

  if (!products.length) {
    container.innerHTML = '<p class="empty">No products found.</p>';
    return;
  }

  container.innerHTML = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td>
                ${p.image_url
                  ? `<img src="${p.image_url}" style="width:48px; height:48px; object-fit:cover; border-radius:8px; border:1px solid var(--border);" />`
                  : `<div style="width:48px; height:48px; background:var(--bg-hover); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">📦</div>`
                }
              </td>
              <td style="font-weight:600;">${p.name}</td>
              <td>${p.category}</td>
              <td style="font-family:'DM Mono',monospace; color:var(--accent);">$${p.price}</td>
              <td>
                <span style="color:${p.stock > 0 ? 'var(--success)' : 'var(--danger)'}; font-family:'DM Mono',monospace;">
                  ${p.stock}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:8px;">
                  <button class="admin-btn admin-btn-edit" onclick="editProduct(${p.id})">
                    ✏️ Edit
                  </button>
                  <button class="admin-btn admin-btn-delete" onclick="deleteProduct(${p.id})">
                    🗑 Delete
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};

// ─── SEARCH ──────────────────────────────────────────
const searchProducts = () => {
  const query = document.getElementById('productSearch').value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  renderProducts(filtered);
};

// ─── OPEN ADD MODAL ───────────────────────────────────
const openAddModal = () => {
  editingId = null;
  document.getElementById('modalTitle').textContent = '➕ Add New Product';
  document.getElementById('productName').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productImages').value = '';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('existingImagesSection').style.display = 'none';
  document.getElementById('existingImages').innerHTML = '';
  document.getElementById('productMessage').innerHTML = '';
  openModal();
};

// ─── EDIT PRODUCT ─────────────────────────────────────
const editProduct = async (id) => {
  editingId = id;
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  document.getElementById('modalTitle').textContent = '✏️ Edit Product';
  document.getElementById('productName').value = product.name;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productCategory').value = product.category_id;
  document.getElementById('productImages').value = '';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('productMessage').innerHTML = '';

  openModal();

  // Load existing images
  await loadExistingImages(id);
};

// ─── LOAD EXISTING IMAGES ─────────────────────────────
const loadExistingImages = async (productId) => {
  const images = await api.adminGetProductImages(productId);
  const section = document.getElementById('existingImagesSection');
  const container = document.getElementById('existingImages');

  if (!images.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  container.innerHTML = images.map(img => `
    <div class="existing-image-item" id="existing-${img.id}">
      <img src="${img.image_url}" />
      ${img.is_primary ? '<div class="primary-badge">Primary</div>' : ''}
      <button class="image-delete-btn" onclick="deleteExistingImage(${img.id})">✕</button>
    </div>
  `).join('');
};

// ─── DELETE EXISTING IMAGE ────────────────────────────
const deleteExistingImage = async (imageId) => {
  if (!confirm('Delete this image?')) return;
  const result = await api.adminDeleteImage(imageId);
  if (result.message.includes('✅')) {
    document.getElementById(`existing-${imageId}`)?.remove();
    // Hide section if no images left
    const remaining = document.querySelectorAll('.existing-image-item');
    if (!remaining.length) {
      document.getElementById('existingImagesSection').style.display = 'none';
    }
  }
};

// ─── IMAGE PREVIEW ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('productImages')?.addEventListener('change', (e) => {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML += `
          <div class="preview-image-item">
            <img src="${e.target.result}" />
            <div class="preview-badge">New</div>
          </div>
        `;
      };
      reader.readAsDataURL(file);
    });
  });
});

// ─── SAVE PRODUCT ─────────────────────────────────────
const saveProduct = async () => {
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const stock = document.getElementById('productStock').value;
  const category_id = document.getElementById('productCategory').value;

  if (!name || !price || !category_id) {
    showMessage('❌ Name, price and category are required', 'error');
    return;
  }

  let result;
  if (editingId) {
    result = await api.adminUpdateProduct(editingId, {
      name, description, price, stock, category_id, image_url: ''
    });
  } else {
    result = await api.adminAddProduct({
      name, description, price, stock, category_id, image_url: ''
    });
  }

  if (!result.message?.includes('✅')) {
    showMessage(result.message || '❌ Something went wrong', 'error');
    return;
  }

  // Upload images if selected
  const imageFiles = document.getElementById('productImages').files;
  if (imageFiles.length > 0) {
    const productId = editingId || result.id;
    const formData = new FormData();
    Array.from(imageFiles).forEach(file => formData.append('images', file));
    formData.append('is_primary', 'true');
    await api.adminUploadImages(productId, formData);
  }

  showMessage('✅ Product saved!', 'success');
  setTimeout(() => {
    closeModal();
    loadProducts();
  }, 1000);
};

// ─── DELETE PRODUCT ───────────────────────────────────
const deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  const result = await api.adminDeleteProduct(id);
  if (result.message?.includes('✅')) loadProducts();
  else alert(result.message);
};

// ─── MODAL CONTROLS ───────────────────────────────────
const openModal = () => {
  document.getElementById('productModal').classList.add('open');
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  document.getElementById('productModal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
};

// ─── NEW: load and render categories ───
const loadCategoriesSection = async () => {
  const categories = await api.adminGetCategories();
  const container = document.getElementById('categoriesList');

  if (!categories.length) {
    container.innerHTML = '<p style="color:var(--text-secondary); font-size:13px;">No categories yet.</p>';
    return;
  }

  container.innerHTML = categories.map(c => `
    <div class="category-tag">
      <span>${c.name}</span>
      <button onclick="deleteCategory(${c.id}, '${c.name}')" class="cat-delete-btn">✕</button>
    </div>
  `).join('');
};

// ─── NEW: add category ───
const addCategory = async () => {
  const name = document.getElementById('newCategoryName').value.trim();
  if (!name) return;

  const result = await api.adminAddCategory(name);
  const msg = document.getElementById('categoryMessage');
  msg.innerHTML = `<div class="message ${result.message.includes('✅') ? 'success' : 'error'}" 
                       style="margin-top:10px;">${result.message}</div>`;

  if (result.message.includes('✅')) {
    document.getElementById('newCategoryName').value = '';
    loadCategoriesSection();
    loadCategories(); // ─── NEW: refresh dropdown in product form ───
    setTimeout(() => msg.innerHTML = '', 3000);
  }
};

// ─── NEW: delete category ───
const deleteCategory = async (id, name) => {
  if (!confirm(`Delete category "${name}"?`)) return;

  const result = await api.adminDeleteCategory(id);
  const msg = document.getElementById('categoryMessage');
  msg.innerHTML = `<div class="message ${result.message.includes('✅') ? 'success' : 'error'}"
                       style="margin-top:10px;">${result.message}</div>`;

  if (result.message.includes('✅')) {
    loadCategoriesSection();
    loadCategories(); // ─── NEW: refresh dropdown ───
    setTimeout(() => msg.innerHTML = '', 3000);
  }
};

loadCategories();
loadProducts();
loadCategoriesSection();