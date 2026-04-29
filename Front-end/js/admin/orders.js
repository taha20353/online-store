const loadOrders = async () => {
  const orders = await api.adminGetOrders();
  const container = document.getElementById('ordersTable');

  if (!orders.length) {
    container.innerHTML = '<p class="empty">No orders found.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Email</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.email}</td>
            <td>$${order.total}</td>
            <td>
              <select class="status-select" onchange="updateStatus(${order.id}, this.value)">
                <option value="pending"   ${order.status === 'pending'   ? 'selected' : ''}>Pending</option>
                <option value="paid"      ${order.status === 'paid'      ? 'selected' : ''}>Paid</option>
                <option value="shipped"   ${order.status === 'shipped'   ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
              <button class="admin-btn admin-btn-edit" onclick="viewOrder(${order.id})">
                👁 Details
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

// Update order status
const updateStatus = async (id, status) => {
  const result = await api.adminUpdateOrderStatus(id, status);
  alert(result.message);
};

// View order details in modal
const viewOrder = async (id) => {
  const items = await api.adminGetOrder(id);
  const modal = document.getElementById('orderModal');
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  document.getElementById('modalTitle').textContent = `Order #${id} Details`;

  content.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.product}</td>
            <td>${item.quantity}</td>
            <td>$${item.price}</td>
            <td>$${(item.quantity * item.price).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top:20px;">
      <p><strong>Customer:</strong> ${items[0].customer}</p>
      <p><strong>Email:</strong> ${items[0].email}</p>
      <p><strong>Status:</strong> <span class="status ${items[0].status}">${items[0].status}</span></p>
      <p><strong>Total:</strong> $${items[0].total}</p>
    </div>
  `;

  modal.classList.add('open');
  overlay.classList.add('open');
};

const closeModal = () => {
  document.getElementById('orderModal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
};

loadOrders();