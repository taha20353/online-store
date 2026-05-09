let editingId = null;

const showMessage = (text, type) => {
  document.getElementById('productMessage').innerHTML =
    `<div class="message ${type}" style="margin-top:15px;">${text}</div>`;
  setTimeout(() => document.getElementById('productMessage').innerHTML = '', 3000);
};

// Load categories into dropdown
const loadCategories = async () => {
  const categories = await api.adminGetCategories();
  const select = document.getElementById('productCategory');
  select.innerHTML = categories.map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');
};

// Load products table
const loadProducts = async () => {
  const products = await api.adminGetProducts();
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
          <th>ID</th>
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
            <td>#${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>$${p.price}</td>
            <td>${p.stock}</td>
            <td style="display:flex; gap:8px;">
              <button class="admin-btn admin-btn-edit" onclick="editProduct(${p.id})">
                ✏️ Edit
              </button>
              <button class="admin-btn admin-btn-delete" onclick="deleteProduct(${p.id})">
                🗑 Delete
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
};

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

  // Save product first
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

  if (!result.message.includes('✅')) {
    showMessage(result.message, 'error');
    return;
  }

  // Upload images if any selected
  const imageFiles = document.getElementById('productImages').files;
  if (imageFiles.length > 0) {
    const productId = editingId || result.id;
    const formData = new FormData();
    Array.from(imageFiles).forEach(file => formData.append('images', file));
    formData.append('is_primary', 'true');
    await api.adminUploadImages(productId, formData);
  }

  showMessage('✅ Product saved successfully!', 'success');
  cancelEdit();
  loadProducts();
};

// Fill form with product data for editing
const editProduct = async (id) => {
  const products = await api.adminGetProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  editingId = id;
  document.getElementById('editProductId').value = id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productImage').value = product.image_url || '';
  document.getElementById('productCategory').value = product.category_id;
  document.getElementById('formTitle').textContent = '✏️ Edit Product';
  document.getElementById('cancelEdit').style.display = 'inline-block';

  loadExistingImages(id);

  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancel edit mode
const cancelEdit = () => {
  editingId = null;
  document.getElementById('productName').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productImages').value = '';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('existingImages').innerHTML = '';
  document.getElementById('formTitle').textContent = '➕ Add New Product';
  document.getElementById('cancelEdit').style.display = 'none';
};
// Delete product
const deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  const result = await api.adminDeleteProduct(id);
  showMessage(result.message, 'success');
  loadProducts();
};

// Preview images before upload
document.getElementById('productImages')?.addEventListener('change', (e) => {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  Array.from(e.target.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML += `
        <img src="${e.target.result}" 
             style="width:80px; height:80px; object-fit:cover; border-radius:6px;" />
      `;
    };
    reader.readAsDataURL(file);
  });
});

// Load existing images when editing
const loadExistingImages = async (productId) => {
  const images = await api.adminGetProductImages(productId);
  const container = document.getElementById('existingImages');

  if (!images.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <p style="font-size:13px; color:#888; margin-bottom:8px;">Existing images:</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      ${images.map(img => `
        <div style="position:relative;">
          <img src="${img.image_url}" 
               style="width:80px; height:80px; object-fit:cover; border-radius:6px;" />
          <button onclick="deleteImage(${img.id})"
            style="position:absolute; top:-8px; right:-8px; background:#e74c3c; 
                   color:white; border:none; border-radius:50%; width:20px; 
                   height:20px; cursor:pointer; font-size:12px;">✕</button>
        </div>
      `).join('')}
    </div>
  `;
};

const deleteImage = async (imageId) => {
  if (!confirm('Delete this image?')) return;
  await api.adminDeleteImage(imageId);
  loadExistingImages(editingId);
};

loadCategories();
loadProducts();