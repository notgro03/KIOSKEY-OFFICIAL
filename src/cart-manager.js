import { supabase } from './config/supabase.js';

class CartManager {
  constructor() {
    this.cart = [];
    this.listeners = [];
    this.init();
  }

  async init() {
    const session = this.getSession();

    if (session && session.user) {
      await this.loadCartFromDB();
    } else {
      this.loadCartFromLocal();
    }

    this.updateCartUI();
  }

  getSession() {
    const sessionData = localStorage.getItem('kioskeys_session');
    if (sessionData) {
      try {
        return JSON.parse(sessionData);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  loadCartFromLocal() {
    const localCart = localStorage.getItem('kioskeys_cart');
    if (localCart) {
      try {
        this.cart = JSON.parse(localCart);
      } catch (e) {
        this.cart = [];
      }
    }
  }

  async loadCartFromDB() {
    const session = this.getSession();
    if (!session || !session.user) return;

    try {
      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;

      this.cart = data || [];
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading cart from DB:', error);
      this.loadCartFromLocal();
    }
  }

  saveCartToLocal() {
    localStorage.setItem('kioskeys_cart', JSON.stringify(this.cart));
  }

  async saveCartToDB() {
    const session = this.getSession();
    if (!session || !session.user) {
      this.saveCartToLocal();
      return;
    }

    try {
      // Delete existing cart items
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', session.user.id);

      // Insert new cart items
      if (this.cart.length > 0) {
        const cartItems = this.cart.map(item => ({
          user_id: session.user.id,
          product_id: item.product_id,
          product_type: item.product_type,
          quantity: item.quantity,
          variant_data: item.variant_data || {},
          price_snapshot: item.price_snapshot,
        }));

        const { error } = await supabase
          .from('cart')
          .insert(cartItems);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving cart to DB:', error);
      this.saveCartToLocal();
    }
  }

  async addToCart(product) {
    const {
      product_id,
      product_type,
      name,
      price,
      quantity = 1,
      variant_data = {},
      image = null,
    } = product;

    // Check if item already exists in cart
    const existingIndex = this.cart.findIndex(
      item =>
        item.product_id === product_id &&
        item.product_type === product_type &&
        JSON.stringify(item.variant_data) === JSON.stringify(variant_data)
    );

    if (existingIndex !== -1) {
      // Update quantity
      this.cart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      this.cart.push({
        id: Date.now().toString(),
        product_id,
        product_type,
        name,
        price_snapshot: price,
        quantity,
        variant_data,
        image,
        created_at: new Date().toISOString(),
      });
    }

    await this.saveCartToDB();
    this.updateCartUI();
    this.notifyListeners();
    this.showCartNotification(name, quantity);

    return true;
  }

  async updateQuantity(itemId, quantity) {
    const item = this.cart.find(i => i.id === itemId || i.product_id === itemId);

    if (!item) return false;

    if (quantity <= 0) {
      return await this.removeFromCart(itemId);
    }

    item.quantity = quantity;
    await this.saveCartToDB();
    this.updateCartUI();
    this.notifyListeners();

    return true;
  }

  async removeFromCart(itemId) {
    this.cart = this.cart.filter(i => i.id !== itemId && i.product_id !== itemId);
    await this.saveCartToDB();
    this.updateCartUI();
    this.notifyListeners();

    return true;
  }

  async clearCart() {
    this.cart = [];
    await this.saveCartToDB();
    this.updateCartUI();
    this.notifyListeners();
  }

  getCart() {
    return this.cart;
  }

  getItemCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price_snapshot * item.quantity), 0);
  }

  calculateDiscount(userPlan = null) {
    // Apply discounts based on user plan
    const subtotal = this.getSubtotal();
    let discountPercentage = 0;

    if (userPlan) {
      // Example discount logic
      switch (userPlan.name) {
        case 'Plan Básico':
          discountPercentage = 0.20; // 20%
          break;
        case 'Plan Familiar':
          discountPercentage = 0.20; // 20%
          break;
        case 'Plan Flotas':
          discountPercentage = 0.30; // 30%
          break;
      }
    }

    return subtotal * discountPercentage;
  }

  getTotal(userPlan = null, shippingCost = 0) {
    const subtotal = this.getSubtotal();
    const discount = this.calculateDiscount(userPlan);
    return subtotal - discount + shippingCost;
  }

  updateCartUI() {
    const cartBadge = document.querySelector('.cart-badge');
    const cartCount = document.querySelector('.cart-count');

    const itemCount = this.getItemCount();

    if (cartBadge) {
      cartBadge.textContent = itemCount;
      cartBadge.style.display = itemCount > 0 ? 'flex' : 'none';
    }

    if (cartCount) {
      cartCount.textContent = itemCount;
    }
  }

  showCartNotification(productName, quantity) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="cart-notification-content">
        <i class="fas fa-check-circle"></i>
        <span>${quantity} x ${productName} agregado al carrito</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  unsubscribe(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.cart));
  }

  async migrateLocalCartToDB(userId) {
    const localCart = this.cart;

    if (localCart.length === 0) return;

    try {
      const cartItems = localCart.map(item => ({
        user_id: userId,
        product_id: item.product_id,
        product_type: item.product_type,
        quantity: item.quantity,
        variant_data: item.variant_data || {},
        price_snapshot: item.price_snapshot,
      }));

      const { error } = await supabase
        .from('cart')
        .insert(cartItems);

      if (error) throw error;

      localStorage.removeItem('kioskeys_cart');
      await this.loadCartFromDB();
    } catch (error) {
      console.error('Error migrating cart:', error);
    }
  }
}

export const cartManager = new CartManager();

// Add global cart notification styles
const style = document.createElement('style');
style.textContent = `
  .cart-notification {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: linear-gradient(135deg, rgba(0, 59, 142, 0.95), rgba(0, 114, 188, 0.95));
    color: white;
    padding: 16px 24px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 10000;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .cart-notification.show {
    transform: translateY(0);
    opacity: 1;
  }

  .cart-notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cart-notification-content i {
    font-size: 20px;
    color: rgba(134, 239, 172, 1);
  }

  @media (max-width: 768px) {
    .cart-notification {
      bottom: 16px;
      right: 16px;
      left: 16px;
      padding: 12px 16px;
    }
  }
`;
document.head.appendChild(style);
