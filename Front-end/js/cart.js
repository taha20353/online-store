const cartItems = document.getElementById('cartItems');
const cartSummary = document.getElementById('cartSummary');
const cartTotal = document.getElementById('cartTotal');

// Load cart
const loadCart = async () => {
  if (!isLoggedIn()) {
    cartItems.innerHTML = '<p class="empty">Please <a href="login.html">login</a> to view your cart.</p>';
    return;
  }

  const items = await api.getCart();

  if (!items.length) {
    cartItems.innerHTML = '<p class="empty">Your cart is empty 🛒</p>';
    cartSummary.style.display = 'none';
    return;
  }

  // Calculate total
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  cartTotal.textContent = total.toFixed(2);
  cartSummary.style.display = 'block';

  cartItems.innerHTML = items.map(item => `
    <div class="cart-item">
      <div>
        <h3>${item.name}</h3>
        <p>Quantity: ${item.quantity} × $${item.price}</p>
        <p>Subtotal: $${parseFloat(item.subtotal).toFixed(2)}</p>
      </div>
      <button class="btn btn-danger" style="width:auto;"
        onclick="handleRemove(${item.id})">
        Remove
      </button>
    </div>
  `).join('');
};

// Remove item
const handleRemove = async (id) => {
  const result = await api.removeFromCart(id);
  alert(result.message);
  loadCart();
};

// Place order
const handlePlaceOrder = async () => {
  const confirmed = confirm('Are you sure you want to place this order?');
  if (!confirmed) return;

  const result = await api.placeOrder();

  if (result.order_id) {
    alert(`✅ Order placed! Order ID: ${result.order_id} | Total: $${result.total}`);
    window.location.href = 'orders.html';
  } else {
    alert(result.message || 'Something went wrong');
  }
};

loadCart();