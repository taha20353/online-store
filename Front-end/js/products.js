const grid = document.getElementById('productsGrid');

const loadProduct = async () => {
  const id = getIdFromURL();

  if (!id) {
    productDetails.innerHTML = '<p class="empty">Product not found.</p>';
    return;
  }

  const product = await api.getProduct(id);

  if (product.error) {
    productDetails.innerHTML = '<p class="empty">Product not found.</p>';
    return;
  }

  // Build images array
  const images = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [{ image_url: product.image_url }]
      : [];

  productDetails.innerHTML = `
    <div class="product-details-card">

      <!-- IMAGE GALLERY -->
      ${images.length > 0 ? `
        <div class="product-gallery">
          <div class="main-image-container">
            <img id="mainImage" src="${images[0].image_url}" 
                 alt="${product.name}" class="main-image" />
          </div>
          ${images.length > 1 ? `
            <div class="thumbnail-container">
              ${images.map((img, index) => `
                <img src="${img.image_url}" 
                     class="thumbnail ${index === 0 ? 'active' : ''}"
                     onclick="changeImage('${img.image_url}', this)" />
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : '<div class="product-card-no-img">No Image</div>'}

      <!-- PRODUCT INFO -->
      <div class="product-details-info">
        <span class="category-badge">📦 ${product.category}</span>
        <h1>${product.name}</h1>
        <p class="product-description">${product.description || 'No description available.'}</p>
        <p class="product-price">$${product.price}</p>
        <p class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}">
          ${product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
        </p>

        <div class="quantity-selector">
          <label>Quantity:</label>
          <div class="quantity-controls">
            <button onclick="changeQty(-1)">−</button>
            <span id="qty">1</span>
            <button onclick="changeQty(1)">+</button>
          </div>
        </div>

        <button class="btn btn-primary" style="width:200px;"
          onclick="addToCart(${product.id})"
          ${product.stock === 0 ? 'disabled' : ''}>
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `;
};

// Change main image when thumbnail clicked
const changeImage = (url, el) => {
  document.getElementById('mainImage').src = url;
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
};

// ─── CART PANEL ───────────────────────────────────────

const openCart = () => {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  loadPanelCart();
};

const closeCart = () => {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
};

const loadPanelCart = async () => {
  const panelItems = document.getElementById('panelCartItems');
  const panelFooter = document.getElementById('panelCartFooter');

  if (!isLoggedIn()) {
    panelItems.innerHTML = `
      <div class="panel-empty">
        <p>Please login to view your cart</p>
        <a href="login.html" class="btn btn-primary" 
           style="display:inline-block; margin-top:15px; width:auto; padding:10px 20px;">
          Login
        </a>
      </div>`;
    panelFooter.innerHTML = '';
    return;
  }

  panelItems.innerHTML = '<p style="color:#aaa;">Loading...</p>';
  const items = await api.getCart();

  if (!items.length) {
    panelItems.innerHTML = '<p class="panel-empty">Your cart is empty 🛒</p>';
    panelFooter.innerHTML = '';
    return;
  }

  let total = 0;

  panelItems.innerHTML = items.map(item => {
    total += parseFloat(item.subtotal);
    return `
      <div class="panel-cart-item" id="panel-item-${item.id}">
        <h4>${item.name}</h4>
        <p class="item-price">$${item.price} each</p>
        <div class="panel-item-controls">
          <div class="panel-qty-controls">
            <button onclick="updateQty(${item.id}, ${item.quantity - 1}, ${item.product_id})">−</button>
            <span id="qty-${item.id}">${item.quantity}</span>
            <button onclick="updateQty(${item.id}, ${item.quantity + 1}, ${item.product_id})">+</button>
          </div>
          <span style="font-weight:bold;">$${parseFloat(item.subtotal).toFixed(2)}</span>
          <button class="panel-remove-btn" onclick="removeFromPanel(${item.id})">🗑 Remove</button>
        </div>
      </div>
    `;
  }).join('');

  panelFooter.innerHTML = `
    <div class="panel-total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <button class="btn btn-success" onclick="checkout()">
      Place Order ✅
    </button>
  `;
};

const updateQty = async (itemId, newQty) => {
  if (newQty < 1) {
    removeFromPanel(itemId);
    return;
  }

  await api.updateCartItem(itemId, newQty);
  loadPanelCart();
};

const removeFromPanel = async (itemId) => {
  await api.removeFromCart(itemId);
  loadPanelCart();
};

const checkout = async () => {
  const result = await api.placeOrder();
  alert(result.message);
  if (result.order_id) {
    closeCart();
    window.location.href = 'orders.html';
  }
};

// ─── ADD TO CART ──────────────────────────────────────

const addToCart = async (productId) => {
  if (!isLoggedIn()) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }

  const result = await api.addToCart(productId, 1);
  if (result.message) {
    openCart(); // ✅ open panel instead of alert
  }
};

loadProducts();