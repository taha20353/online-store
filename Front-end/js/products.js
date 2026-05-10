const grid = document.getElementById('productsGrid');

const loadProducts = async () => {
  const products = await api.getProducts();

  if (!products.length) {
    grid.innerHTML = '<p class="empty">No products found.</p>';
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit;">
        ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" class="product-card-img" />` : '<div class="product-card-no-img">No Image</div>'}
        <h3>${p.name}</h3>
        <p class="category">📦 ${p.category}</p>
        <p class="price">$${p.price}</p>
        <p class="stock">✅ ${p.stock > 0 ? p.stock + ' in stock' : '❌ Out of stock'}</p>
      </a>
      <button class="btn btn-primary"
        onclick="addToCart(${p.id})"
        ${p.stock === 0 ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>
        ${p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  `).join('');
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
    window.location.href = 'login.html';
    return;
  }

  if (isLoggedIn()){
    const result = await api.addToCart(productId, 1);
    if (result.message) {
      // ✅ open panel instead of alert
    }
  }
};

loadProducts();