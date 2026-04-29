const productDetails = document.getElementById('productDetails');

// Get product ID from URL
const getIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

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

    productDetails.innerHTML = `
    <div class="product-details-card">
      ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" class="product-details-img" />` : ''}
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

// ─── QUANTITY SELECTOR ────────────────────────────────
let quantity = 1;

const changeQty = (change) => {
  quantity = Math.max(1, quantity + change);
  document.getElementById('qty').textContent = quantity;
};

// ─── ADD TO CART ──────────────────────────────────────
const addToCart = async (productId) => {
  if (!isLoggedIn()) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }

  const result = await api.addToCart(productId, quantity);
  if (result.message) {
    openCart(); // ✅ opens the side panel
  }
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
            <button onclick="updateQty(${item.id}, ${item.quantity - 1})">−</button>
            <span id="qty-${item.id}">${item.quantity}</span>
            <button onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
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

loadProduct();