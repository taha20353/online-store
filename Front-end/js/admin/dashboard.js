const loadStats = async () => {
  const stats = await api.getStats();

  document.getElementById('totalOrders').textContent = stats.totalOrders;
  document.getElementById('totalRevenue').textContent = `$${parseFloat(stats.totalRevenue).toFixed(2)}`;
  document.getElementById('totalCustomers').textContent = stats.totalCustomers;
  document.getElementById('totalProducts').textContent = stats.totalProducts;
};

const loadRecentOrders = async () => {
  const orders = await api.adminGetOrders();
  const container = document.getElementById('recentOrders');

  if (!orders.length) {
    container.innerHTML = '<p class="empty">No orders yet.</p>';
    return;
  }

  // Show only last 5 orders
  const recent = orders.slice(0, 5);

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${recent.map(order => `
          <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>$${order.total}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
              <a href="orders.html" class="admin-link">View All</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

loadStats();
loadRecentOrders();