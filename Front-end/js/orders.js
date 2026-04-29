const ordersList = document.getElementById('ordersList');

const loadOrders = async () => {
  const orders = await api.getOrders();

  if (!orders.length) {
    ordersList.innerHTML = '<p class="empty">No orders yet 📦</p>';
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <h3>Order #${order.id}</h3>
      <p>📅 ${new Date(order.created_at).toLocaleDateString()}</p>
      <p>💰 Total: <strong>$${order.total}</strong></p>
      <span class="status">${order.status}</span>
    </div>
  `).join('');
};

loadOrders();