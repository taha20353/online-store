let allProducts = [];
let activeCategory = 'all';

const grid = document.getElementById('productsGrid');

const loadProducts = async () => {
  const products = await api.getProducts();
  allProducts = products;

  // Update hero stats
  const heroCount = document.getElementById('heroProductCount');
  if (heroCount) heroCount.textContent = products.length + '+';

  // Load categories
  loadCategories(products);

  // Render all products
  renderProducts(products);
};

const loadCategories = (products) => {
  const bar = document.getElementById('categoriesBar');
  if (!bar) return;

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Update hero category count
  const heroCatCount = document.getElementById('heroCategoryCount');
  if (heroCatCount) heroCatCount.textContent = categories.length + '+';

  // Add category buttons
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.textContent = cat;
    btn.onclick = () => filterByCategory(cat, btn);
    bar.appendChild(btn);
  });
};

const filterByCategory = (category, btn) => {
  activeCategory = category;

  // Update active button
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  filterProducts();
};

const filterProducts = () => {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const sort = document.getElementById('sortSelect')?.value || 'default';

  let filtered = [...allProducts];

  // Filter by category
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  // Filter by search
  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      (p.description && p.description.toLowerCase().includes(search))
    );
  }

  // Sort
  switch (sort) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name-az':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-za':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  renderProducts(filtered);
};

const renderProducts = (products) => {
  const count = document.getElementById('productsCount');
  if (count) count.textContent = `${products.length} product${products.length !== 1 ? 's' : ''} found`;

  if (!products.length) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filter</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <a href="product.html?id=${p.id}" style="text-decoration:none; color:inherit;">
        ${p.image_url
          ? `<img src="${p.image_url}" alt="${p.name}" class="product-card-img" />`
          : '<div class="product-card-no-img">No Image</div>'
        }
        <h3>${p.name}</h3>
        <p class="category">📦 ${p.category}</p>
        <p class="price">$${p.price}</p>
        <p class="stock">${p.stock > 0 ? `✅ ${p.stock} in stock` : '❌ Out of stock'}</p>
      </a>
      <button class="btn btn-primary"
        onclick="event.preventDefault(); addToCart(${p.id})"
        ${p.stock === 0 ? 'disabled' : ''}>
        ${p.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
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

  panelItems.innerHTML = '<p style="color:var(--text-secondary);">Loading...</p>';
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
          <span style="font-weight:700; font-family:'DM Mono',monospace;">$${parseFloat(item.subtotal).toFixed(2)}</span>
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

  const token = localStorage.getItem('token');
  if (!token || token.trim() === '') {
    window.location.href = 'login.html';
    return;
  }

  const result = await api.addToCart(productId, 1);

  if (result.message === 'No token provided' || result.message === 'Invalid or expired token') {
    window.location.href = 'login.html';
    return;
  }

  if (result.message) openCart();
};

loadProducts();