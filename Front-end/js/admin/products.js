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
  `;
};

// Save product (add or update)
const saveProduct = async () => {
  const data = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    price: document.getElementById('productPrice').value,
    stock: document.getElementById('productStock').value,
    image_url: document.getElementById('productImage').value,
    category_id: document.getElementById('productCategory').value
  };

  if (!data.name || !data.price || !data.category_id) {
    showMessage('❌ Name, price and category are required', 'error');
    return;
  }

  let result;
  if (editingId) {
    result = await api.adminUpdateProduct(editingId, data);
  } else {
    result = await api.adminAddProduct(data);
  }

  showMessage(result.message, 'success');
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
  document.getElementById('productImage').value = '';
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

loadCategories();
loadProducts();