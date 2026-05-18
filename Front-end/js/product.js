const productDetails = document.getElementById('productDetails');
let currentProductId = null;

const getIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

// ─── LOAD PRODUCT ─────────────────────────────────────
const loadProduct = async () => {
  const id = getIdFromURL();
  if (!id) {
    productDetails.innerHTML = '<p class="empty">Product not found.</p>';
    return;
  }

  currentProductId = id;
  const product = await api.getProduct(id);

  if (product.error) {
    productDetails.innerHTML = '<p class="empty">Product not found.</p>';
    return;
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [{ image_url: product.image_url }]
      : [];

  productDetails.innerHTML = `
    <div class="product-layout">

      <!-- LEFT: IMAGE GALLERY -->
      <div class="product-gallery-col">
        <div class="main-image-container" onclick="openZoom('${images[0]?.image_url || ''}')">
          <img id="mainImage"
               src="${images[0]?.image_url || ''}"
               alt="${product.name}"
               class="main-image" />
          <div class="zoom-hint">🔍 Click to zoom</div>
        </div>
        ${images.length > 1 ? `
          <div class="thumbnail-container">
            ${images.map((img, i) => `
              <img src="${img.image_url}"
                   class="thumbnail ${i === 0 ? 'active' : ''}"
                   onclick="changeImage('${img.image_url}', this)" />
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- RIGHT: PRODUCT INFO -->
      <div class="product-info-col">
        <span class="category-badge">📦 ${product.category}</span>
        <h1 class="product-title">${product.name}</h1>

        <!-- RATING SUMMARY -->
        <div class="rating-summary" id="ratingSummary">
          <div class="stars-display" id="starsDisplay">★★★★★</div>
          <span class="rating-avg" id="ratingAvg">0.0</span>
          <span class="rating-count" id="ratingCount">(0 reviews)</span>
        </div>

        <div class="product-price">$${product.price}</div>

        <p class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}">
          ${product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
        </p>

        <!-- DIVIDER -->
        <div class="product-divider"></div>

        <!-- DESCRIPTION -->
        <div class="product-section">
          <h4 class="product-section-title">Description</h4>
          <p class="product-description">${product.description || 'No description available.'}</p>
        </div>

        <div class="product-divider"></div>

        <!-- QUANTITY + ADD TO CART -->
        <div class="product-actions">
          <div class="quantity-selector">
            <label>Qty</label>
            <div class="quantity-controls">
              <button onclick="changeQty(-1)">−</button>
              <span id="qty">1</span>
              <button onclick="changeQty(1)">+</button>
            </div>
          </div>
          <button class="btn btn-primary add-cart-btn"
            onclick="addToCart(${product.id})"
            ${product.stock === 0 ? 'disabled' : ''}>
            ${product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
          </button>
        </div>

        <!-- PRODUCT META -->
        <div class="product-meta">
          <div class="meta-item">
            <span class="meta-label">Category</span>
            <span class="meta-value">${product.category}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Availability</span>
            <span class="meta-value ${product.stock > 0 ? 'in-stock' : 'out-stock'}">
              ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Product ID</span>
            <span class="meta-value">#${product.id}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- TABS SECTION -->
    <div class="product-tabs">
      <div class="tabs-header">
        <button class="tab-btn active" onclick="switchTab('reviews', this)">
          ⭐ Reviews <span id="reviewTabCount">(0)</span>
        </button>
        <button class="tab-btn" onclick="switchTab('details', this)">
          📋 Details
        </button>
        <button class="tab-btn" onclick="switchTab('shipping', this)">
          🚚 Shipping
        </button>
      </div>

      <!-- REVIEWS TAB -->
      <div class="tab-content active" id="tab-reviews">
        <!-- ADD REVIEW -->
        ${isLoggedIn() ? `
          <div class="add-review-form">
            <h4>Write a Review</h4>
            <div class="star-picker" id="starPicker">
              <span onclick="setRating(1)" class="star-pick">★</span>
              <span onclick="setRating(2)" class="star-pick">★</span>
              <span onclick="setRating(3)" class="star-pick">★</span>
              <span onclick="setRating(4)" class="star-pick">★</span>
              <span onclick="setRating(5)" class="star-pick">★</span>
            </div>
            <textarea id="reviewComment" placeholder="Share your experience with this product..." class="review-textarea"></textarea>
            <button class="btn btn-primary" style="width:auto; padding:10px 24px;" onclick="submitReview()">
              Submit Review
            </button>
            <div id="reviewMessage"></div>
          </div>
        ` : `
          <div class="login-to-review">
            <p>Please <a href="login.html">login</a> to write a review</p>
          </div>
        `}

        <!-- REVIEWS LIST -->
        <div id="reviewsList">Loading reviews...</div>
      </div>

      <!-- DETAILS TAB -->
      <div class="tab-content" id="tab-details">
        <div class="details-grid">
          <div class="detail-row">
            <span class="detail-label">Product Name</span>
            <span class="detail-value">${product.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Category</span>
            <span class="detail-value">${product.category}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Price</span>
            <span class="detail-value">$${product.price}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Stock</span>
            <span class="detail-value">${product.stock} units</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Product ID</span>
            <span class="detail-value">#${product.id}</span>
          </div>
        </div>
      </div>

      <!-- SHIPPING TAB -->
      <div class="tab-content" id="tab-shipping">
        <div class="shipping-info">
          <div class="shipping-item">
            <span class="shipping-icon">🚚</span>
            <div>
              <h4>Standard Delivery</h4>
              <p>3-5 business days</p>
            </div>
          </div>
          <div class="shipping-item">
            <span class="shipping-icon">⚡</span>
            <div>
              <h4>Express Delivery</h4>
              <p>1-2 business days</p>
            </div>
          </div>
          <div class="shipping-item">
            <span class="shipping-icon">🔄</span>
            <div>
              <h4>Free Returns</h4>
              <p>30-day return policy</p>
            </div>
          </div>
          <div class="shipping-item">
            <span class="shipping-icon">🔒</span>
            <div>
              <h4>Secure Payment</h4>
              <p>100% secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load reviews
  loadReviews();
};

// ─── IMAGE FUNCTIONS ──────────────────────────────────
const changeImage = (url, el) => {
  document.getElementById('mainImage').src = url;
  document.getElementById('mainImage').parentElement.onclick = () => openZoom(url);
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
};

// ─── ZOOM ─────────────────────────────────────────────
const openZoom = (url) => {
  if (!url) return;
  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  overlay.innerHTML = `
    <div class="zoom-container">
      <button class="zoom-close" onclick="closeZoom()">✕</button>
      <img src="${url}" class="zoom-image" />
    </div>
  `;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeZoom();
  };
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  setTimeout(() => overlay.classList.add('open'), 10);
};

const closeZoom = () => {
  const overlay = document.querySelector('.zoom-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 300);
  }
};

// ─── QUANTITY ─────────────────────────────────────────
let quantity = 1;

const changeQty = (change) => {
  quantity = Math.max(1, quantity + change);
  document.getElementById('qty').textContent = quantity;
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
  const result = await api.addToCart(productId, quantity);
  if (result.message === 'No token provided' || result.message === 'Invalid or expired token') {
    window.location.href = 'login.html';
    return;
  }
  if (result.message) openCart();
};

// ─── TABS ─────────────────────────────────────────────
const switchTab = (tab, btn) => {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');
};

// ─── REVIEWS ──────────────────────────────────────────
let selectedRating = 0;

const setRating = (rating) => {
  selectedRating = rating;
  document.querySelectorAll('.star-pick').forEach((star, i) => {
    star.classList.toggle('selected', i < rating);
  });
};

const loadReviews = async () => {
  const data = await api.getReviews(currentProductId);
  const { reviews, average, total } = data;

  // Update rating summary
  document.getElementById('ratingAvg').textContent = average;
  document.getElementById('ratingCount').textContent = `(${total} review${total !== 1 ? 's' : ''})`;
  document.getElementById('reviewTabCount').textContent = `(${total})`;

  // Update stars display
  const starsEl = document.getElementById('starsDisplay');
  if (starsEl) {
    const fullStars = Math.round(average);
    starsEl.innerHTML = Array(5).fill(0).map((_, i) =>
      `<span style="color:${i < fullStars ? '#ffd700' : 'var(--text-muted)'}">★</span>`
    ).join('');
  }

  const list = document.getElementById('reviewsList');

  if (!reviews.length) {
    list.innerHTML = `
      <div class="no-reviews">
        <p>No reviews yet — be the first to review!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${r.user_name.charAt(0).toUpperCase()}</div>
        <div class="review-meta">
          <span class="review-name">${r.user_name}</span>
          <span class="review-date">${new Date(r.created_at).toLocaleDateString()}</span>
        </div>
        <div class="review-stars">
          ${Array(5).fill(0).map((_, i) =>
            `<span style="color:${i < r.rating ? '#ffd700' : 'var(--text-muted)'}">★</span>`
          ).join('')}
        </div>
      </div>
      ${r.comment ? `<p class="review-comment">${r.comment}</p>` : ''}
    </div>
  `).join('');
};

const submitReview = async () => {
  if (!selectedRating) {
    document.getElementById('reviewMessage').innerHTML =
      '<div class="message error">Please select a rating!</div>';
    return;
  }

  const comment = document.getElementById('reviewComment').value;
  const result = await api.addReview(currentProductId, selectedRating, comment);

  document.getElementById('reviewMessage').innerHTML =
    `<div class="message ${result.message.includes('✅') ? 'success' : 'error'}">${result.message}</div>`;

  if (result.message.includes('✅')) {
    document.getElementById('reviewComment').value = '';
    selectedRating = 0;
    document.querySelectorAll('.star-pick').forEach(s => s.classList.remove('selected'));
    loadReviews();
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
    panelItems.innerHTML = `<div class="panel-empty"><p>Please login to view your cart</p></div>`;
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
      <div class="panel-cart-item">
        <h4>${item.name}</h4>
        <p class="item-price">$${item.price} each</p>
        <div class="panel-item-controls">
          <div class="panel-qty-controls">
            <button onclick="updateQty(${item.id}, ${item.quantity - 1})">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          <span style="font-weight:700;">$${parseFloat(item.subtotal).toFixed(2)}</span>
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
    <button class="btn btn-success" onclick="checkout()">Place Order ✅</button>
  `;
};

const updateQty = async (itemId, newQty) => {
  if (newQty < 1) { removeFromPanel(itemId); return; }
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