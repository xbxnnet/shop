// Knallmeisters Shop - Verbessert mit Admin-Produktverwaltung
class OnlineShop {
  constructor() {
    this.state = {
      isAdmin: false,
      adminPassword: '',
      showAdminLogin: false,
      customerCode: '',
      hasLocationAccess: localStorage.getItem('locationAccess') === 'true',
      showCustomerLogin: false,
      cart: JSON.parse(localStorage.getItem('shopCart') || '[]'),
      showCart: false,
      showCheckout: false,
      showProductDetail: null,
      showCouponManagement: false,
      showOrderTracking: false,
      showProductManagement: false,
      editingProduct: null,
      checkoutForm: {
        name: '',
        phone: '',
        contact: '', // WhatsApp, Telegram, TikTok username
        notes: ''
      },
      couponCode: '',
      appliedCoupon: null,
      orders: JSON.parse(localStorage.getItem('shopOrders') || '[]'),
      products: [
        {
          id: 1,
          name: 'DumBum 5g Packung',
          price: 25,
          image: 'https://tse3.mm.bing.net/th/id/OIP.0yTooMpP2krZ6-LR63zfdAHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
          description: '5g BKS Böller mit lautem Knall (F4)',
          weight: '100g',
          stock: 15
        },
        {
          id: 2,
          name: 'ZomBum 2g Packung',
          price: 10,
          image: 'https://www.ultrasfactory.net/wp-content/uploads/2024/02/Zom-Bum-ZB101-380x380.jpg',
          description: '2g BKS Böller mit Vorbrenner (F3)',
          weight: '2g pro Stück',
          stock: 1
        },
        {
          id: 3,
          name: 'Cobra 20 Ultimate Titanium Edition 200g',
          price: 15.99,
          image: 'https://pyrozeus.com/wp-content/uploads/2024/12/super-2-600x600.webp',
          description: '200g BKS Böller mit extra lautem Knall (F4)',
          weight: '200g pro Stück',
          stock: 2
        },
        {
          id: 4,
          name: 'Black Thunder 33g',
          price: 9.99,
          image: 'https://i.ytimg.com/vi/Fz07PzLYcec/hqdefault.jpg',
          description: '33g BKS Böller mit extra lautem Knall (F4)',
          weight: '33g pro Stück',
          stock: 20
        }
      ]
    };

    this.config = {
      ADMIN_PASSWORD: 'knallmeister2025pyro',
      VALID_CUSTOMER_CODES: ['STAMMKUNDE2024', 'KUNDE123', 'VIP2024'],
      COUPONS: JSON.parse(localStorage.getItem('shopCoupons') || JSON.stringify({
        'WELCOME10': { discount: 10, type: 'percent' },
        'SAVE5': { discount: 5, type: 'fixed' }
      })),
      PICKUP_LOCATION: {
        address: 'Hinter dem Fußballplatz der Südschule',
        coordinates: '50.791278,6.772333',
        hours: 'Dienstags: 15:00-18:00 Uhr'
      },
      SOCIALS: {
        telegram: 'https://t.me/knallmeisterx',
        tiktok: 'https://tiktok.com/@knallmeisterx'
      }
    };

    this.init();
  }

  init() {
    // Initialize localStorage with default products if not exists
    if (!localStorage.getItem('shopProducts')) {
      localStorage.setItem('shopProducts', JSON.stringify(this.state.products));
    } else {
      // Load products from localStorage but keep code defaults as backup
      this.state.products = JSON.parse(localStorage.getItem('shopProducts'));
    }
    this.attachEventListeners();
    this.render();
  }

  attachEventListeners() {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
    }

    this.clickHandler = (e) => {
      const button = e.target.closest('button, [role="button"]') || e.target;
      const id = button.id;
      
      // Close cart by clicking on overlay
      if (e.target.classList.contains('cart-overlay') && e.target.id === 'modalOverlay') {
        this.setState({ showCart: false });
        this.renderCart();
        return;
      }
      
      // Close modals by clicking outside (on overlay) - aber NICHT auf cart
      if (e.target.id === 'modalOverlay' && !e.target.classList.contains('cart-overlay')) {
        this.setState({ 
          showProductDetail: null,
          showCouponManagement: false,
          showOrderTracking: false,
          showProductManagement: false,
          editingProduct: null
        });
        this.renderModals();
        return;
      }

      // Product Detail (clicking product card)
      const productCard = e.target.closest('.product-card');
      if (productCard && !this.state.isAdmin) {
        const productId = parseInt(productCard.dataset.productId);
        const product = this.state.products.find(p => p.id === productId);
        if (product) {
          this.setState({ showProductDetail: product });
          this.renderModals();
          return;
        }
      }

      // Admin Login
      if (id === 'adminLoginBtn') {
        this.setState({ showAdminLogin: true });
        this.renderModals();
        return;
      }
      if (id === 'adminLoginSubmit') {
        this.handleAdminLogin();
        return;
      }
      if (id === 'adminLoginCancel') {
        this.setState({ showAdminLogin: false, adminPassword: '' });
        this.renderModals();
        return;
      }
      
      // Warenkorb schließen durch Klick auf overlay
      if (e.target.classList.contains('cart-overlay') && e.target === e.currentTarget) {
        this.setState({ showCart: false });
        this.renderCart();
        return;
      }

      // Product Management (Admin)
      if (id === 'manageProductsBtn') {
        this.setState({ showProductManagement: true });
        this.renderModals();
        return;
      }
      if (id === 'closeProductManagement') {
        this.setState({ showProductManagement: false, editingProduct: null });
        this.renderModals();
        return;
      }
      if (id && id.startsWith('editProduct-btn-')) {
        const productId = parseInt(id.split('-')[2]);
        const product = this.state.products.find(p => p.id === productId);
        this.setState({ editingProduct: { ...product } });
        this.renderModals();
        return;
      }
      if (id === 'saveProductBtn') {
        this.saveProduct();
        return;
      }
      if (id === 'cancelEditProductBtn') {
        this.setState({ editingProduct: null });
        this.renderModals();
        return;
      }
      if (id && id.startsWith('deleteProduct-btn-')) {
        const productId = parseInt(id.split('-')[2]);
        if (confirm('Produkt wirklich löschen?')) {
          this.deleteProduct(productId);
        }
        return;
      }
      if (id === 'addProductBtn') {
        const newId = Math.max(...this.state.products.map(p => p.id), 0) + 1;
        this.setState({ 
          editingProduct: {
            id: newId,
            name: '',
            price: 0,
            image: '',
            description: '',
            weight: '',
            stock: 0
          }
        });
        this.renderModals();
        return;
      }

      // Gutschein-Verwaltung
      if (id === 'manageCouponsBtn') {
        this.setState({ showCouponManagement: true });
        this.renderModals();
        return;
      }
      if (id === 'closeCouponManagement') {
        this.setState({ showCouponManagement: false });
        this.renderModals();
        return;
      }
      if (id && id.startsWith('deleteCoupon-')) {
        const code = id.split('-')[1];
        delete this.config.COUPONS[code];
        localStorage.setItem('shopCoupons', JSON.stringify(this.config.COUPONS));
        this.renderModals();
        return;
      }
      if (id === 'addCouponBtn') {
        const code = document.getElementById('newCouponCode')?.value.toUpperCase();
        const discount = parseInt(document.getElementById('newCouponDiscount')?.value);
        const type = document.getElementById('newCouponType')?.value;
        
        if (code && discount > 0 && type) {
          this.config.COUPONS[code] = { discount, type };
          localStorage.setItem('shopCoupons', JSON.stringify(this.config.COUPONS));
          this.renderModals();
        } else {
          alert('✗ Bitte füllen Sie alle Felder aus');
        }
        return;
      }

      // Bestellverfolgung
      if (id === 'manageOrdersBtn') {
        this.setState({ showOrderTracking: true });
        this.renderModals();
        return;
      }
      if (id === 'closeOrderTracking') {
        this.setState({ showOrderTracking: false });
        this.renderModals();
        return;
      }
      if (id && id.startsWith('approveOrder-')) {
        const orderId = id.replace('approveOrder-', '');
        this.approveOrder(orderId);
        return;
      }
      if (id && id.startsWith('rejectOrder-')) {
        const orderId = id.replace('rejectOrder-', '');
        this.rejectOrder(orderId);
        return;
      }

      // Kundencode
      if (id === 'customerCodeBtn') {
        this.setState({ showCustomerLogin: true });
        this.renderModals();
        return;
      }
      if (id === 'customerCodeSubmit') {
        this.handleCustomerCodeSubmit();
        return;
      }
      if (id === 'customerCodeCancel') {
        this.setState({ showCustomerLogin: false, customerCode: '' });
        this.renderModals();
        return;
      }

      // Warenkorb
      if (id === 'cartBtn') {
        this.setState({ showCart: !this.state.showCart });
        this.renderCart();
        return;
      }

      // Warenkorb schließen
      if (id === 'closeCartBtn') {
        this.setState({ showCart: false });
        this.renderCart();
        return;
      }

      // Produktdetail Modal
      if (id === 'closeProductDetail') {
        this.setState({ showProductDetail: null });
        this.renderModals();
        return;
      }
      if (id === 'addToCartBtn' && this.state.showProductDetail) {
        this.addToCart(this.state.showProductDetail);
        this.setState({ showProductDetail: null });
        this.renderModals();
        alert('✓ Produkt zum Warenkorb hinzugefügt!');
        return;
      }

      // Warenkorb-Aktionen
      if (id && id.startsWith('qty-minus-')) {
        const cartId = parseInt(id.split('-')[2]);
        this.updateQuantity(cartId, -1);
        return;
      }
      if (id && id.startsWith('qty-plus-')) {
        const cartId = parseInt(id.split('-')[2]);
        this.updateQuantity(cartId, 1);
        return;
      }
      if (id && id.startsWith('remove-')) {
        const cartId = parseInt(id.split('-')[1]);
        this.removeFromCart(cartId);
        return;
      }

      // Gutschein
      if (id === 'applyCouponBtn') {
        this.applyCoupon();
        return;
      }

      // Checkout
      if (id === 'checkoutBtn') {
        this.setState({ showCart: false, showCheckout: true });
        this.renderCart();
        this.renderModals();
        return;
      }
      if (id === 'checkoutSubmit') {
        this.handleCheckout();
        return;
      }
      if (id === 'checkoutCancel') {
        this.setState({ showCheckout: false });
        this.renderModals();
        return;
      }
    };

    document.addEventListener('click', this.clickHandler);

    // Input Events
    if (this.inputHandler) {
      document.removeEventListener('input', this.inputHandler);
    }
    
    this.inputHandler = (e) => {
      if (e.target.id === 'adminPassword') {
        this.setState({ adminPassword: e.target.value });
      }
      if (e.target.id === 'customerCode') {
        this.setState({ customerCode: e.target.value.toUpperCase() });
      }
      if (e.target.id === 'couponCode') {
        this.setState({ couponCode: e.target.value });
      }
      if (e.target.id === 'checkoutName') {
        this.state.checkoutForm.name = e.target.value;
      }
      if (e.target.id === 'checkoutPhone') {
        this.state.checkoutForm.phone = e.target.value;
      }
      if (e.target.id === 'checkoutContact') {
        this.state.checkoutForm.contact = e.target.value;
      }
      if (e.target.id === 'checkoutNotes') {
        this.state.checkoutForm.notes = e.target.value;
      }

      // Product editing
      if (e.target.dataset.editField && this.state.editingProduct) {
        const field = e.target.dataset.editField;
        const value = field === 'price' || field === 'stock' ? parseFloat(e.target.value) : e.target.value;
        this.state.editingProduct[field] = value;
      }
    };
    
    document.addEventListener('input', this.inputHandler);

    // Keypress Events
    if (this.keypressHandler) {
      document.removeEventListener('keypress', this.keypressHandler);
    }
    
    this.keypressHandler = (e) => {
      if (e.key === 'Enter') {
        if (e.target.id === 'adminPassword') this.handleAdminLogin();
        if (e.target.id === 'customerCode') this.handleCustomerCodeSubmit();
        if (e.target.id === 'couponCode') this.applyCoupon();
      }
    };
    
    document.addEventListener('keypress', this.keypressHandler);
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.saveProducts();
  }

  saveProducts() {
    localStorage.setItem('shopCart', JSON.stringify(this.state.cart));
    localStorage.setItem('shopOrders', JSON.stringify(this.state.orders));
    localStorage.setItem('shopProducts', JSON.stringify(this.state.products));
  }

  saveProduct() {
    if (!this.state.editingProduct.name || this.state.editingProduct.price <= 0) {
      alert('✗ Name und Preis sind erforderlich');
      return;
    }

    const index = this.state.products.findIndex(p => p.id === this.state.editingProduct.id);
    if (index >= 0) {
      this.state.products[index] = this.state.editingProduct;
    } else {
      this.state.products.push(this.state.editingProduct);
    }

    this.setState({ 
      editingProduct: null, 
      showProductManagement: false,
      products: this.state.products 
    });
    this.render();
    alert('✓ Produkt gespeichert!');
  }

  deleteProduct(productId) {
    this.state.products = this.state.products.filter(p => p.id !== productId);
    this.setState({ products: this.state.products });
    this.render();
    alert('✓ Produkt gelöscht!');
  }

  handleAdminLogin() {
    if (this.state.adminPassword === this.config.ADMIN_PASSWORD) {
      this.setState({ 
        isAdmin: true, 
        showAdminLogin: false, 
        adminPassword: '' 
      });
      this.renderModals();
      this.render();
    } else {
      alert('✗ Falsches Passwort');
    }
  }

  handleCustomerCodeSubmit() {
    if (this.config.VALID_CUSTOMER_CODES.includes(this.state.customerCode.toUpperCase())) {
      this.setState({ 
        hasLocationAccess: true, 
        showCustomerLogin: false, 
        customerCode: '' 
      });
      localStorage.setItem('locationAccess', 'true');
      this.renderModals();
      this.render();
      alert('✓ Standort freigeschaltet!');
    } else {
      alert('✗ Ungültiger Kundencode');
    }
  }

  addToCart(product) {
    const existing = this.state.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.state.cart.push({ ...product, quantity: 1 });
    }
    this.setState({ cart: this.state.cart });
    this.renderCart();
  }

  updateQuantity(id, change) {
    const item = this.state.cart.find(item => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        this.removeFromCart(id);
        return;
      }
      this.setState({ cart: this.state.cart });
      this.renderCart();
    }
  }

  removeFromCart(id) {
    this.state.cart = this.state.cart.filter(item => item.id !== id);
    this.setState({ cart: this.state.cart });
    this.renderCart();
  }

  applyCoupon() {
    const coupon = this.config.COUPONS[this.state.couponCode.toUpperCase()];
    if (coupon) {
      this.setState({ 
        appliedCoupon: { code: this.state.couponCode.toUpperCase(), ...coupon },
        couponCode: ''
      });
      this.renderCart();
      alert('✓ Gutschein angewendet!');
    } else {
      alert('✗ Ungültiger Gutscheincode');
    }
  }

  calculateTotals() {
    const subtotal = this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;
    if (this.state.appliedCoupon) {
      discount = this.state.appliedCoupon.type === 'percent'
        ? subtotal * (this.state.appliedCoupon.discount / 100)
        : this.state.appliedCoupon.discount;
    }
    return { subtotal, discount, total: subtotal - discount };
  }

  approveOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'approved';
      order.approvedAt = new Date().toLocaleString('de-DE');
      this.setState({ orders: this.state.orders });
      this.renderModals();
      alert('✓ Bestellung angenommen!');
    }
  }

  rejectOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      const reason = prompt('Grund für Ablehnung:');
      if (reason) {
        order.status = 'rejected';
        order.rejectionReason = reason;
        this.setState({ orders: this.state.orders });
        this.renderModals();
        alert('✗ Bestellung abgelehnt');
      }
    }
  }

  async handleCheckout() {
    const { name, notes } = this.state.checkoutForm;
    if (!name) {
      alert('⚠️ Bitte geben Sie Ihren Namen ein.');
      return;
    }

    const { total, subtotal, discount } = this.calculateTotals();
    const orderId = 'ORD-' + Date.now();
    
    const order = {
      id: orderId,
      name,
      contact: this.state.checkoutForm.contact,
      notes,
      products: this.state.cart,
      subtotal,
      discount,
      total,
      status: 'pending',
      createdAt: new Date().toLocaleString('de-DE'),
      approvedAt: null,
      rejectionReason: null
    };

    this.state.orders.push(order);

    try {
      const response = await fetch('https://formspree.io/f/maqwvbbj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          order: `Bestellung #${orderId}\n\n${this.state.cart.map(i => `${i.name} x${i.quantity}`).join('\n')}\n\nGesamtbetrag: ${total.toFixed(2)}€`,
          total: total.toFixed(2)
        })
      });

      if (response.ok) {
        alert('✓ Bestellung erfolgreich!');
        this.setState({
          cart: [],
          checkoutForm: { name: '', notes: '' },
          appliedCoupon: null,
          showCheckout: false
        });
        this.renderModals();
        this.render();
      } else {
        alert('✗ Fehler beim Senden');
      }
    } catch (error) {
      alert('✗ Netzwerkfehler');
    }
  }

  getCartBadge() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  renderHeader() {
    const html = `
      <header class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex justify-between items-center flex-wrap gap-4 mb-4">
            <div class="flex items-center space-x-3">
              <div class="text-3xl"><i class="fas fa-fire" style="color: #ff6b35;"></i></div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Knallmeisters Shop
              </h1>
            </div>
            
            <div class="flex items-center space-x-2 flex-wrap">
              ${!this.state.hasLocationAccess ? `
                <button id="customerCodeBtn" class="flex items-center space-x-2 px-3 py-2 bg-emerald-900 text-emerald-100 rounded-lg hover:bg-emerald-800 transition-colors text-sm font-medium">
                  <span><i class="fas fa-map-marker-alt"></i></span>
                  <span class="hidden sm:inline">Standort</span>
                </button>
              ` : `
                <span class="flex items-center space-x-2 px-3 py-2 bg-emerald-900 text-emerald-100 rounded-lg text-sm font-medium">
                  <span><i class="fas fa-check"></i></span>
                </span>
              `}
              
              ${this.state.isAdmin ? `
                <button id="manageProductsBtn" class="flex items-center space-x-2 px-3 py-2 bg-purple-900 text-purple-100 rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium">
                  <i class="fas fa-cog"></i>
                  <span class="hidden sm:inline">Produkte</span>
                </button>
                <button id="manageCouponsBtn" class="flex items-center space-x-2 px-3 py-2 bg-amber-900 text-amber-100 rounded-lg hover:bg-amber-800 transition-colors text-sm font-medium">
                  <i class="fas fa-ticket-alt"></i>
                  <span class="hidden sm:inline">Gutscheine</span>
                </button>
                <button id="manageOrdersBtn" class="flex items-center space-x-2 px-3 py-2 bg-blue-900 text-blue-100 rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium">
                  <i class="fas fa-chart-bar"></i>
                  <span class="hidden sm:inline">Bestellungen</span>
                </button>
              ` : ''}
              
              <button id="adminLoginBtn" class="flex items-center space-x-2 px-3 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                <span><i class="fas fa-user"></i></span>
                <span class="hidden sm:inline">${this.state.isAdmin ? 'Abmelden' : 'Admin'}</span>
              </button>
              
              <button id="cartBtn" class="relative flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                <span><i class="fas fa-shopping-cart"></i></span>
                ${this.getCartBadge() > 0 ? `<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">${this.getCartBadge()}</span>` : ''}
              </button>
            </div>
          </div>

          <!-- Social Media Links -->
          <div class="flex items-center space-x-3 pt-4 border-t border-slate-700">
            <span class="text-xs text-slate-400">Folge uns:</span>
            <a href="${this.config.SOCIALS.telegram}" target="_blank" class="text-slate-400 hover:text-blue-400 transition-colors">
              <span class="text-lg"><i class="fab fa-telegram"></i></span>
            </a>
            <a href="${this.config.SOCIALS.tiktok}" target="_blank" class="text-slate-400 hover:text-white transition-colors">
              <span class="text-lg"><i class="fab fa-tiktok"></i></span>
            </a>
          </div>
        </div>
      </header>
    `;
    document.querySelector('header') && document.querySelector('header').remove();
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  renderProducts() {
    const container = document.querySelector('.products-grid') || document.createElement('div');
    container.className = 'products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    
    container.innerHTML = this.state.products.map(product => `
      <div class="product-card bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 relative border border-slate-700 hover:border-orange-500" data-product-id="${product.id}" style="${!this.state.isAdmin ? 'cursor: pointer;' : ''}">
        ${this.state.isAdmin ? `
          <div class="absolute top-2 right-2 flex space-x-2 z-10">
            <button id="editProduct-btn-${product.id}" class="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">✏</button>
            <button id="deleteProduct-btn-${product.id}" class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">🗑</button>
          </div>
        ` : ''}
        
        <div class="relative overflow-hidden h-64 bg-slate-900">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
        </div>
        
        <div class="p-6">
          <h3 class="font-bold text-lg mb-2 text-white">${product.name}</h3>
          <p class="text-sm text-slate-400 mb-1">⚖ ${product.weight}</p>
          <p class="text-sm text-slate-400 mb-3">${product.description}</p>
          <p class="text-2xl font-bold text-orange-500 mb-4">${product.price.toFixed(2)} €</p>
          <p class="text-xs text-slate-500">👆 Klicke für Details</p>
        </div>
      </div>
    `).join('');

    const main = document.querySelector('main');
    main.querySelector('.products-grid') && main.querySelector('.products-grid').remove();
    main.appendChild(container);
  }

  renderLocationInfo() {
    const main = document.querySelector('main');
    const existing = main.querySelector('.location-info');
    
    if (this.state.hasLocationAccess) {
      const html = `
        <div class="location-info bg-gradient-to-r from-orange-900 to-amber-900 border-2 border-orange-500 rounded-2xl p-6 mb-8 shadow-lg">
          <div class="flex items-start space-x-4">
            <div class="bg-orange-800 p-3 rounded-full text-2xl"><i class="fas fa-map-marker-alt"></i></div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-orange-100 mb-2">Abholort</h3>
              <p class="text-orange-50 mb-1">${this.config.PICKUP_LOCATION.address}</p>
              <p class="text-orange-200 text-sm mb-2">Koordinaten: ${this.config.PICKUP_LOCATION.coordinates}</p>
              <p class="text-orange-200 text-sm">${this.config.PICKUP_LOCATION.hours}</p>
            </div>
          </div>
        </div>
      `;
      if (existing) existing.remove();
      document.querySelector('main').insertAdjacentHTML('afterbegin', html);
    } else if (existing) {
      existing.remove();
    }
  }

  renderCart() {
    if (!this.state.showCart) {
      const cartSidebar = document.querySelector('.cart-sidebar');
      if (cartSidebar) cartSidebar.remove();
      return;
    }

    const { total, subtotal, discount } = this.calculateTotals();
    const html = `
      <div id="modalOverlay" class="cart-sidebar fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end cart-overlay">
        <div class="bg-slate-800 w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
          <div class="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white"><i class="fas fa-shopping-cart"></i> Warenkorb</h2>
            <button id="closeCartBtn" class="text-slate-400 hover:text-slate-300 text-2xl"><i class="fas fa-times"></i></button>
          </div>

          ${this.state.cart.length === 0 ? `
            <div class="p-6 text-center text-slate-400 flex-1">
              <div class="text-5xl mb-4"><i class="fas fa-shopping-cart"></i></div>
              <p>Leer</p>
            </div>
          ` : `
            <div class="p-6 space-y-4 flex-1">
              ${this.state.cart.map(item => `
                <div class="flex items-start space-x-4 bg-slate-700 p-4 rounded-xl">
                  <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg" />
                  <div class="flex-1">
                    <h3 class="font-semibold text-white text-sm">${item.name}</h3>
                    <p class="text-orange-500 font-bold">${item.price.toFixed(2)} €</p>
                    <div class="flex items-center space-x-2 mt-2">
                      <button id="qty-minus-${item.id}" class="bg-slate-600 p-1 rounded hover:bg-slate-500 text-sm"><i class="fas fa-minus"></i></button>
                      <span class="font-semibold">${item.quantity}</span>
                      <button id="qty-plus-${item.id}" class="bg-slate-600 p-1 rounded hover:bg-slate-500 text-sm"><i class="fas fa-plus"></i></button>
                      <button id="remove-${item.id}" class="ml-auto text-red-500 hover:text-red-700 text-sm"><i class="fas fa-times-circle"></i></button>
                    </div>
                  </div>
                </div>
              `).join('')}

              <div class="border-t pt-4">
                <div class="flex space-x-2">
                  <input id="couponCode" type="text" value="${this.state.couponCode}" placeholder="Gutschein" class="flex-1 px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                  <button id="applyCouponBtn" class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium text-sm"><i class="fas fa-check"></i></button>
                </div>
              </div>

              <div class="border-t pt-4 space-y-2">
                <div class="flex justify-between text-slate-300 text-sm">
                  <span>Summe:</span>
                  <span class="font-semibold">${subtotal.toFixed(2)} €</span>
                </div>
                ${this.state.appliedCoupon ? `
                  <div class="flex justify-between text-green-600 text-sm">
                    <span>Rabatt:</span>
                    <span class="font-semibold">-${discount.toFixed(2)} €</span>
                  </div>
                ` : ''}
                <div class="flex justify-between text-lg font-bold text-white pt-2 border-t">
                  <span>Gesamt:</span>
                  <span class="text-orange-500">${total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
              <button id="checkoutBtn" class="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-xl hover:from-orange-700 hover:to-amber-700 font-bold shadow-lg">
                <i class="fas fa-credit-card"></i> Zur Kasse
              </button>
            </div>
          `}
        </div>
      </div>
    `;

    const existing = document.querySelector('.cart-sidebar');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', html);
  }

  renderModals() {
    let modalsHTML = '';

    // Admin Login
    if (this.state.showAdminLogin && !this.state.isAdmin) {
      modalsHTML += `
        <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 class="text-2xl font-bold mb-6 text-white"><i class="fas fa-lock"></i> Admin Login</h2>
            <input id="adminPassword" type="password" value="${this.state.adminPassword}" placeholder="Passwort" class="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 outline-none" />
            <div class="flex space-x-3">
              <button id="adminLoginSubmit" class="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-medium">Anmelden</button>
              <button id="adminLoginCancel" class="flex-1 bg-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-500 font-medium">Abbrechen</button>
            </div>
          </div>
        </div>
      `;
    }

    // Produkt Detail
    if (this.state.showProductDetail) {
      const p = this.state.showProductDetail;
      modalsHTML += `
        <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl">
            <div class="flex justify-between items-start mb-6">
              <h2 class="text-3xl font-bold text-white">${p.name}</h2>
              <button id="closeProductDetail" class="text-slate-400 hover:text-slate-300 text-2xl"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <img src="${p.image}" alt="${p.name}" class="rounded-lg w-full h-80 object-cover" />
              <div>
                <p class="text-2xl font-bold text-orange-500 mb-4">${p.price.toFixed(2)} €</p>
                <div class="space-y-3 mb-6">
                  <p class="text-slate-300"><strong>Beschreibung:</strong> ${p.description}</p>
                  <p class="text-slate-300"><strong>Gewicht:</strong> ${p.weight}</p>
                  <p class="text-slate-300"><strong>Lagerbestand:</strong> ${p.stock}</p>
                </div>
                <button id="addToCartBtn" class="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-xl hover:from-orange-700 hover:to-amber-700 font-bold text-lg shadow-lg">
                  <i class="fas fa-shopping-cart"></i> In den Warenkorb
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Kundencode
    if (this.state.showCustomerLogin) {
      modalsHTML += `
        <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 class="text-2xl font-bold text-white mb-6"><i class="fas fa-lock-alt"></i> Standort freischalten</h2>
            <input id="customerCode" type="text" value="${this.state.customerCode}" placeholder="Kundencode" class="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 outline-none uppercase" />
            <div class="flex space-x-3">
              <button id="customerCodeSubmit" class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium">Freischalten</button>
              <button id="customerCodeCancel" class="flex-1 bg-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-500 font-medium">Abbrechen</button>
            </div>
          </div>
        </div>
      `;
    }

    // Product Management (Admin)
    if (this.state.showProductManagement && this.state.isAdmin) {
      if (this.state.editingProduct) {
        modalsHTML += `
          <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div class="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl">
              <h2 class="text-3xl font-bold mb-6 text-white"><i class="fas fa-edit"></i> Produkt bearbeiten</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold mb-2 text-slate-200">Name</label>
                  <input type="text" data-edit-field="name" value="${this.state.editingProduct.name}" class="w-full px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2 text-slate-200">Preis (€)</label>
                    <input type="number" step="0.01" data-edit-field="price" value="${this.state.editingProduct.price}" class="w-full px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2 text-slate-200">Gewicht</label>
                    <input type="text" data-edit-field="weight" value="${this.state.editingProduct.weight}" class="w-full px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2 text-slate-200">Lagerbestand</label>
                    <input type="number" data-edit-field="stock" value="${this.state.editingProduct.stock}" class="w-full px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2 text-slate-200">Beschreibung</label>
                  <textarea data-edit-field="description" class="w-full px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white">${this.state.editingProduct.description}</textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2 text-slate-200">Bild-URL</label>
                  <input type="text" data-edit-field="image" value="${this.state.editingProduct.image}" class="w-full px-4 py-2 border border-slate-600 rounded-lg outline-none text-sm" />
                </div>
                <div class="flex space-x-4">
                  <button id="saveProductBtn" class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"><i class="fas fa-save"></i> Speichern</button>
                  <button id="cancelEditProductBtn" class="flex-1 bg-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-500 font-medium">Abbrechen</button>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        modalsHTML += `
          <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div class="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold text-white">📝 Produkte verwalten</h2>
                <button id="closeProductManagement" class="text-slate-400 hover:text-slate-300 text-2xl"><i class="fas fa-times"></i></button>
              </div>
              
              <button id="addProductBtn" class="mb-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
                <i class="fas fa-plus"></i> Neues Produkt
              </button>

              <div class="space-y-3">
                ${this.state.products.map(product => `
                  <div class="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
                    <div class="flex-1">
                      <p class="font-bold">${product.name}</p>
                      <p class="text-sm text-slate-400">${product.price.toFixed(2)}€ | Lager: ${product.stock}</p>
                    </div>
                    <div class="flex space-x-2">
                      <button id="editProduct-btn-${product.id}" class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"><i class="fas fa-edit"></i></button>
                      <button id="deleteProduct-btn-${product.id}" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }
    }

    // Gutscheine
    if (this.state.showCouponManagement && this.state.isAdmin) {
      modalsHTML += `
        <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-3xl font-bold text-white"><i class="fas fa-ticket-alt"></i> Gutscheine</h2>
              <button id="closeCouponManagement" class="text-slate-400 hover:text-slate-300 text-2xl"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="space-y-6">
              <div class="bg-slate-700 p-6 rounded-xl">
                <h3 class="font-bold text-lg mb-4 text-white">Neuer Gutschein</h3>
                <div class="grid grid-cols-3 gap-3 mb-3">
                  <input id="newCouponCode" type="text" placeholder="Code" class="px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white" />
                  <input id="newCouponDiscount" type="number" placeholder="Rabatt" class="px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white" />
                  <select id="newCouponType" class="px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white">
                    <option value="percent">%</option>
                    <option value="fixed">€</option>
                  </select>
                </div>
                <button id="addCouponBtn" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"><i class="fas fa-plus"></i> Hinzufügen</button>
              </div>

              <div>
                <h3 class="font-bold text-lg mb-3 text-white">Bestehende</h3>
                <div class="space-y-2">
                  ${Object.entries(this.config.COUPONS).map(([code, coupon]) => `
                    <div class="flex justify-between items-center bg-slate-700 p-4 rounded-lg">
                      <div>
                        <p class="font-semibold">${code}</p>
                        <p class="text-sm text-slate-400">${coupon.discount}${coupon.type === 'percent' ? '%' : '€'}</p>
                      </div>
                      <button id="deleteCoupon-${code}" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">Löschen</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Bestellungen
    if (this.state.showOrderTracking && this.state.isAdmin) {
      modalsHTML += `
        <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-3xl font-bold text-white"><i class="fas fa-list"></i> Bestellungen</h2>
              <button id="closeOrderTracking" class="text-slate-400 hover:text-slate-300 text-2xl"><i class="fas fa-times"></i></button>
            </div>
            
            ${this.state.orders.length === 0 ? `<p class="text-slate-400">Keine Bestellungen</p>` : `
              <div class="space-y-3">
                ${this.state.orders.map(order => `
                  <div class="border border-slate-700 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <p class="font-bold">#${order.id}</p>
                        <p class="text-sm text-slate-400">${order.name} | ${order.createdAt}</p>
                        <p class="text-sm text-slate-300"><strong>Kontakt:</strong> ${order.contact || 'N/A'}</p>
                        <p class="text-sm font-semibold text-orange-500">${order.total.toFixed(2)}€</p>
                      </div>
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }">
                        ${order.status === 'pending' ? '<i class="fas fa-hourglass"></i> Ausstehend' : order.status === 'approved' ? '<i class="fas fa-check-circle"></i> Angenommen' : '<i class="fas fa-times-circle"></i> Abgelehnt'}
                      </span>
                    </div>
                    <div class="mb-3 bg-slate-700 p-3 rounded">
                      <p class="text-sm font-semibold text-slate-200 mb-2"><i class="fas fa-shopping-cart"></i> Produkte:</p>
                      ${order.products.map(item => `
                        <p class="text-sm text-slate-300">• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€</p>
                      `).join('')}
                    </div>
                    ${order.notes ? `
                      <div class="mb-3 bg-slate-700 p-3 rounded">
                        <p class="text-sm font-semibold text-slate-200 mb-2"><i class="fas fa-sticky-note"></i> Anmerkungen:</p>
                        <p class="text-sm text-slate-300">${order.notes}</p>
                      </div>
                    ` : ''}
                    ${order.status === 'pending' ? `
                      <div class="flex space-x-2">
                        <button id="approveOrder-${order.id}" class="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-medium text-sm"><i class="fas fa-check-circle"></i></button>
                        <button id="rejectOrder-${order.id}" class="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 font-medium text-sm"><i class="fas fa-times-circle"></i></button>
                      </div>
                    ` : order.status === 'approved' ? `
                      <p class="text-sm text-green-700"><i class="fas fa-check-circle"></i> ${order.approvedAt}</p>
                    ` : `
                      <p class="text-sm text-red-700"><i class="fas fa-times-circle"></i> ${order.rejectionReason}</p>
                    `}
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }

    // Checkout
    if (this.state.showCheckout) {
      const { total, subtotal, discount } = this.calculateTotals();
      modalsHTML += `
        <div id="modalOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl">
            <h2 class="text-3xl font-bold mb-6 text-white"><i class="fas fa-credit-card"></i> Bestellung abschließen</h2>
            
            <form class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-slate-300 mb-2">Name *</label>
                <input id="checkoutName" type="text" value="${this.state.checkoutForm.name}" class="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-300 mb-2">WhatsApp Nummer oder Social Username *</label>
                <input id="checkoutContact" type="text" value="${this.state.checkoutForm.contact}" placeholder="z.B. +49123456789 oder @username" class="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-300 mb-2">Zahlungsart</label>
                <div class="bg-slate-700 p-4 rounded-lg border-2 border-indigo-200">
                  <p class="font-semibold text-white"><i class="fas fa-money-bill"></i> Bar bei Abholung</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-300 mb-2">Anmerkungen</label>
                <textarea id="checkoutNotes" class="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-slate-700 text-white" rows="3" class="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">${this.state.checkoutForm.notes}</textarea>
              </div>

              <div class="bg-slate-700 p-6 rounded-xl">
                <h3 class="font-bold text-lg mb-4 text-white">Bestellübersicht</h3>
                ${this.state.cart.map(item => `
                  <div class="flex justify-between py-2 text-slate-300">
                    <span>${item.name} x${item.quantity}</span>
                    <span class="font-semibold">${(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                `).join('')}
                <div class="border-t border-slate-700 mt-4 pt-4">
                  <div class="flex justify-between text-slate-300 mb-2">
                    <span>Zwischensumme:</span>
                    <span class="font-semibold">${subtotal.toFixed(2)} €</span>
                  </div>
                  ${this.state.appliedCoupon ? `
                    <div class="flex justify-between text-green-600 mb-2">
                      <span>Rabatt:</span>
                      <span class="font-semibold">-${discount.toFixed(2)} €</span>
                    </div>
                  ` : ''}
                  <div class="flex justify-between text-xl font-bold text-white pt-2 border-t">
                    <span>Gesamtsumme:</span>
                    <span class="text-orange-500">${total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div class="flex space-x-4">
                <button type="button" id="checkoutSubmit" class="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-xl hover:from-orange-700 hover:to-amber-700 font-bold text-lg shadow-lg">
                  <i class="fas fa-check-circle"></i> Absenden
                </button>
                <button type="button" id="checkoutCancel" class="px-8 bg-slate-600 text-slate-300 py-4 rounded-xl hover:bg-slate-500 font-medium">
                  Zurück
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    const modalsContainer = document.querySelector('#modals') || document.createElement('div');
    modalsContainer.id = 'modals';
    modalsContainer.innerHTML = modalsHTML;
    
    if (!document.querySelector('#modals')) {
      document.body.appendChild(modalsContainer);
    }
  }

  render() {
    this.renderHeader();
    this.renderLocationInfo();
    this.renderProducts();
    this.renderCart();
    this.renderModals();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OnlineShop();
});
