const API_URL = 'https://online-store-rq6j.onrender.com';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Save token to localStorage
const saveToken = (token) => localStorage.setItem('token', token);

// Remove token (logout)
const removeToken = () => localStorage.removeItem('token');

// Check if user is logged in
const isLoggedIn = () => !!getToken();

// Standard headers for protected routes
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ─── AUTH ───────────────────────────────────────────
const api = {
  // Register
  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  // Login
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // ─── PRODUCTS ───────────────────────────────────────
  // Get all products
  getProducts: async () => {
    const res = await fetch(`${API_URL}/products`);
    return res.json();
  },

  // Get single product
  getProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`);
    return res.json();
  },

  // ─── CART ───────────────────────────────────────────
  // Get cart
  getCart: async () => {
    const res = await fetch(`${API_URL}/cart`, {
      headers: authHeaders()
    });
    return res.json();
  },

  // Add to cart
  addToCart: async (product_id, quantity) => {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ product_id, quantity })
    });
    return res.json();
  },

  // Remove from cart
  removeFromCart: async (id) => {
    const res = await fetch(`${API_URL}/cart/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return res.json();
  },

  // Update cart item quantity
updateCartItem: async (id, quantity) => {
  const res = await fetch(`${API_URL}/cart/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ quantity })
  });
  return res.json();
},

  // ─── ORDERS ─────────────────────────────────────────
  // Place order
  placeOrder: async () => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: authHeaders()
    });
    return res.json();
  },

  // Get all orders
  getOrders: async () => {
    const res = await fetch(`${API_URL}/orders`, {
      headers: authHeaders()
    });
    return res.json();
  },

  // Get single order
  getOrder: async (id) => {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      headers: authHeaders()
    });
    return res.json();
  },

  // ─── ADMIN ──────────────────────────────────────────
  // Stats
  getStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: authHeaders()
    });
    return res.json();
  },

  // Admin Orders
  adminGetOrders: async () => {
    const res = await fetch(`${API_URL}/admin/orders`, {
      headers: authHeaders()
    });
    return res.json();
  },

  adminGetOrder: async (id) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      headers: authHeaders()
    });
    return res.json();
  },

  adminUpdateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Admin Products
  adminGetProducts: async () => {
    const res = await fetch(`${API_URL}/admin/products`, {
      headers: authHeaders()
    });
    return res.json();
  },

  adminAddProduct: async (data) => {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  adminUpdateProduct: async (id, data) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  adminDeleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return res.json();
  },

  adminGetCategories: async () => {
    const res = await fetch(`${API_URL}/admin/categories`, {
      headers: authHeaders()
    });
    return res.json();
  }

};

