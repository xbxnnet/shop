// Knallmeisters Shop - Vanilla JavaScript
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
      checkoutForm: {
        name: '',
        email: '',
        phone: '',
        notes: ''
      },
      couponCode: '',
      appliedCoupon: null,
      products: [
        {
          id: 1,
          name: 'Premium Handseife Lavendel',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1600857062241-98e5dba60f2f?w=500&h=500&fit=crop',
          description: 'Natürliche Seife mit ätherischem Lavendelöl',
          stock: 15
        },
        {
          id: 2,
          name: 'Bio Honig 500g',
          price: 12.50,
          image: 'https://images.unsplash.com/photo-1587049352846-4a222e784210?w=500&h=500&fit=crop',
          description: 'Regionaler Bio-Honig aus eigener Imkerei',
          stock: 8
        },
        {
          id: 3,
          name: 'Handgefertigte Kerze',
          price: 15.99,
          image: 'https://images.unsplash.com/photo-1602874801006-94c8e7fb6677?w=500&h=500&fit=crop',
          description: 'Soja-Wachs Kerze mit natürlichen Duftstoffen',
          stock: 12
        },
        {
          id: 4,
          name: 'Kräutertee Set',
          price: 9.99,
          image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&h=500&fit=crop',
          description: '5 verschiedene Bio-Kräutertees',
          stock: 20
        }
      ]
    };

    this.config = {
      ADMIN_PASSWORD: 'admin2024',
      VALID_CUSTOMER_CODES: ['STAMMKUNDE2024', 'KUNDE123', 'VIP2024'],
      COUPONS: {
        'WELCOME10': { discount: 10, type: 'percent' },
        'SAVE5': { discount: 5, type: 'fixed' }
      },
      PICKUP_LOCATION: {
        address: 'Musterstraße 123, 12345 Musterstadt',
        coordinates: '50.7753, 6.0839',
        hours: 'Mo-Fr: 14:00-18:00 Uhr'
      }
    };

    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'adminLoginBtn') {
        this.setState({ showAdminLogin: true });
        this.renderModals();
      }
      if (e.target.id === 'adminLoginSubmit') {
        this.handleAdminLogin();
      }
      if (e.target.id === 'adminLoginCancel') {
        this.setState({ showAdminLogin: false, adminPassword: '' });
        this.renderModals();
      }

      if (e.target.id === 'customerCodeBtn') {
        this.setState({ showCustomerLogin: true });
        this.renderModals();
      }
      if (e.target.id === 'customerCodeSubmit') {
        this.handleCustomerCodeSubmit();
      }
      if (e.target.id === 'customerCodeCancel') {
        this.setState({ showCustomerLogin: false, customerCode: '' });
        this.renderModals();
      }

      if (e.target.id === 'cartBtn') {
        this.setState({ showCart: !this.state.showCart });
        this.renderCart();
      }
      if (e.target.id === 'cartOverlay') {
        this.setState({ showCart: false });
        this.renderCart();
      }

      if (e.target.dataset.productId) {
        const product = this.state.products.find(p => p.id === parseInt(e.target.dataset.productId));
        if (product) this.addToCart(product);
      }

      if (e.target.id && e.target.id.startsWith('qty-minus-')) {
        const id = parseInt(e.target.id.split('-')[2]);
        this.updateQuantity(id, -1);
      }
      if (e.target.id && e.target.id.startsWith('qty-plus-')) {
        const id = parseInt(e.target.id.split('-')[2]);
        this.updateQuantity(id, 1);
      }
      if (e.target.id && e.target.id.startsWith('remove-')) {
        const id = parseInt(e.target.id.split('-')[1]);
        this.removeFromCart(id);
      }

      if (e.target.id === 'applyCouponBtn') {
        this.applyCoupon();
      }

      if (e.target.id === 'checkoutBtn') {
        this.setState({ showCart: false, showCheckout: true });
        this.renderModals();
      }
      if (e.target.id === 'checkoutSubmit') {
        this.handleCheckout();
      }
      if (e.target.id === 'checkoutCancel') {
        this.setState({ showCheckout: false });
        this.renderModals();
      }
    });

    document.addEventListener('input', (e) => {
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
      if (e.target.id === 'checkoutEmail') {
        this.state.checkoutForm.email = e.target.value;
      }
      if (e.target.id === 'checkoutPhone') {
        this.state.checkoutForm.phone = e.target.value;
      }
      if (e.target.id === 'checkoutNotes') {
        this.state.checkoutForm.notes = e.target.value;
      }

      if (e.target.dataset.editField) {
        const id = parseInt(e.target.dataset.productId);
        const field = e.target.dataset.editField;
        const value = field === 'price' ? parseFloat(e.target.value) : e.target.value;
        this.editProduct(id, field, value);
      }
    });

    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (e.target.id === 'adminPassword') this.handleAdminLogin();
        if (e.target.id === 'customerCode') this.handleCustomerCodeSubmit();
        if (e.target.id === 'couponCode') this.applyCoupon();
      }
    });
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem('shopCart', JSON.stringify(this.state.cart));
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
      alert('❌ Falsches Passwort');
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
      alert('✅ Standort freigeschaltet! Sie können nun die Abholadresse sehen.');
    } else {
      alert('❌ Ungültiger Kundencode');
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
      alert('✅ Gutschein erfolgreich angewendet!');
    } else {
      alert('❌ Ungültiger Gutscheincode');
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

  editProduct(id, field, value) {
    const product = this.state.products.find(p => p.id === id);
    if (product) {
      product[field] = value;
      this.render();
    }
  }

  async handleCheckout() {
    const { name, email, phone, notes } = this.state.checkoutForm;
    if (!name || !email) {
      alert('⚠️ Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    const { total, subtotal, discount } = this.calculateTotals();
    const orderDetails = `
Neue Bestellung:

Kunde: ${name}
Email: ${email}
Telefon: ${phone || '—'}

Produkte:
${this.state.cart.map(item => `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

Zwischensumme: ${subtotal.toFixed(2)}€
${this.state.appliedCoupon ? `Rabatt (${this.state.appliedCoupon.code}): -${discount.toFixed(2)}€\n` : ''}
Gesamtsumme: ${total.toFixed(2)}€

Zahlungsart: Bar bei Abholung

${notes ? `Notizen: ${notes}` : ''}
    `.trim();

    try {
      const formspreeUrl = 'https://formspree.io/f/maqwvbbj';
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          notes,
          order: orderDetails,
          total: total.toFixed(2)
        })
      });

      if (response.ok) {
        alert('✅ Bestellung erfolgreich! Wir melden uns bei Ihnen.');
        this.setState({
          cart: [],
          checkoutForm: { name: '', email: '', phone: '', notes: '' },
          appliedCoupon: null,
          showCheckout: false
        });
        this.renderModals();
        this.render();
      } else {
        alert('❌ Fehler beim Senden der Bestellung. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      alert('❌ Netzwerkfehler. Bitte versuchen Sie es erneut.');
      console.error(error);
    }
  }

  getCartBadge() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  renderHeader() {
    const html = `
      <header class="bg-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">📦</div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Knallmeisters Shop
            </h1>
          </div>
          
          <div class="flex items-center space-x-3 flex-wrap">
            ${!this.state.hasLocationAccess ? `
              <button id="customerCodeBtn" class="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                <span>📍</span>
                <span class="hidden sm:inline">Standort freischalten</span>
              </button>
            ` : `
              <span class="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <span>✅</span>
                <span class="hidden sm:inline">Standort freigeschaltet</span>
              </span>
            `}
            
            <button id="adminLoginBtn" class="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              <span>👤</span>
              <span class="hidden sm:inline">Admin</span>
            </button>
            
            <button id="cartBtn" class="relative flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              <span>🛒</span>
              ${this.getCartBadge() > 0 ? `<span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">${this.getCartBadge()}</span>` : ''}
              <span class="hidden sm:inline">Warenkorb</span>
            </button>
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
      <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div class="relative overflow-hidden h-64 bg-gray-200">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
          ${this.state.isAdmin ? `<div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">ADMIN</div>` : ''}
        </div>
        
        <div class="p-6">
          ${this.state.isAdmin ? `
            <input type="text" data-product-id="${product.id}" data-edit-field="name" value="${product.name}" class="w-full font-bold text-lg mb-2 border-b border-gray-300 focus:border-indigo-500 outline-none" />
            <textarea data-product-id="${product.id}" data-edit-field="description" class="w-full text-sm text-gray-600 mb-3 border-b border-gray-300 focus:border-indigo-500 outline-none">${product.description}</textarea>
            <input type="number" step="0.01" data-product-id="${product.id}" data-edit-field="price" value="${product.price}" class="w-full text-2xl font-bold text-indigo-600 mb-2 border-b border-gray-300 focus:border-indigo-500 outline-none" />
          ` : `
            <h3 class="font-bold text-lg mb-2 text-gray-800">${product.name}</h3>
            <p class="text-sm text-gray-600 mb-3 min-h-[40px]">${product.description}</p>
            <p class="text-2xl font-bold text-indigo-600 mb-4">${product.price.toFixed(2)} €</p>
          `}
          
          <button data-product-id="${product.id}" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg">
            🛒 In den Warenkorb
          </button>
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
        <div class="location-info bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div class="flex items-start space-x-4">
            <div class="bg-green-100 p-3 rounded-full text-2xl">📍</div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-800 mb-2">Abholort</h3>
              <p class="text-gray-700 mb-1">${this.config.PICKUP_LOCATION.address}</p>
              <p class="text-gray-600 text-sm mb-2">Koordinaten: ${this.config.PICKUP_LOCATION.coordinates}</p>
              <p class="text-gray-600 text-sm">${this.config.PICKUP_LOCATION.hours}</p>
            </div>
            <div class="text-2xl">✅</div>
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
      <div id="cartOverlay" class="cart-sidebar fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
        <div class="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">
          <div class="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <h2 class="text-2xl font-bold text-gray-800">🛒 Warenkorb</h2>
          </div>

          ${this.state.cart.length === 0 ? `
            <div class="p-6 text-center text-gray-500 flex-1">
              <div class="text-5xl mb-4">🛒</div>
              <p>Ihr Warenkorb ist leer</p>
            </div>
          ` : `
            <div class="p-6 space-y-4 flex-1">
              ${this.state.cart.map(item => `
                <div class="flex items-start space-x-4 bg-gray-50 p-4 rounded-xl">
                  <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg" />
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">${item.name}</h3>
                    <p class="text-indigo-600 font-bold">${item.price.toFixed(2)} €</p>
                    <div class="flex items-center space-x-2 mt-2">
                      <button id="qty-minus-${item.id}" class="bg-gray-200 p-1 rounded hover:bg-gray-300">➖</button>
                      <span class="font-semibold px-3">${item.quantity}</span>
                      <button id="qty-plus-${item.id}" class="bg-gray-200 p-1 rounded hover:bg-gray-300">➕</button>
                      <button id="remove-${item.id}" class="ml-auto text-red-500 hover:text-red-700 font-bold">❌</button>
                    </div>
                  </div>
                </div>
              `).join('')}

              <div class="border-t pt-4">
                <div class="flex space-x-2">
                  <input id="couponCode" type="text" value="${this.state.couponCode}" placeholder="Gutscheincode" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <button id="applyCouponBtn" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">✓</button>
                </div>
                ${this.state.appliedCoupon ? `
                  <div class="mt-2 text-green-600 text-sm font-medium">
                    ✓ Gutschein "${this.state.appliedCoupon.code}" angewendet
                  </div>
                ` : ''}
              </div>

              <div class="border-t pt-4 space-y-2">
                <div class="flex justify-between text-gray-700">
                  <span>Zwischensumme:</span>
                  <span class="font-semibold">${subtotal.toFixed(2)} €</span>
                </div>
                ${this.state.appliedCoupon ? `
                  <div class="flex justify-between text-green-600">
                    <span>Rabatt:</span>
                    <span class="font-semibold">-${discount.toFixed(2)} €</span>
                  </div>
                ` : ''}
                <div class="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                  <span>Gesamt:</span>
                  <span class="text-indigo-600">${total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button id="checkoutBtn" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg">
                💳 Zur Kasse
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

    if (this.state.showAdminLogin && !this.state.isAdmin) {
      modalsHTML += `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">🔐 Admin Login</h2>
            <input id="adminPassword" type="password" value="${this.state.adminPassword}" placeholder="Passwort eingeben" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
            <div class="flex space-x-3">
              <button id="adminLoginSubmit" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">Anmelden</button>
              <button id="adminLoginCancel" class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium">Abbrechen</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.state.showCustomerLogin) {
      modalsHTML += `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div class="flex items-center space-x-3 mb-6">
              <span class="text-2xl">🔒</span>
              <h2 class="text-2xl font-bold text-gray-800">Standort freischalten</h2>
            </div>
            <p class="text-gray-600 mb-6">
              Geben Sie Ihren Kundencode ein, um die Abholadresse zu sehen.
            </p>
            <input id="customerCode" type="text" value="${this.state.customerCode}" placeholder="Kundencode eingeben" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none uppercase" />
            <div class="flex space-x-3">
              <button id="customerCodeSubmit" class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">Freischalten</button>
              <button id="customerCodeCancel" class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium">Abbrechen</button>
            </div>
          </div>
        </div>
      `;
    }

    if (this.state.showCheckout) {
      const { total, subtotal, discount } = this.calculateTotals();
      modalsHTML += `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl">
            <h2 class="text-3xl font-bold mb-6 text-gray-800">💳 Bestellung abschließen</h2>
            
            <form class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input id="checkoutName" type="text" value="${this.state.checkoutForm.name}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">E-Mail *</label>
                <input id="checkoutEmail" type="email" value="${this.state.checkoutForm.email}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                <input id="checkoutPhone" type="tel" value="${this.state.checkoutForm.phone}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Zahlungsart</label>
                <div class="bg-gray-50 p-4 rounded-lg border-2 border-indigo-200">
                  <p class="font-semibold text-gray-800">💵 Bar bei Abholung</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Anmerkungen</label>
                <textarea id="checkoutNotes" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">${this.state.checkoutForm.notes}</textarea>
              </div>

              <div class="bg-gray-50 p-6 rounded-xl">
                <h3 class="font-bold text-lg mb-4 text-gray-800">Bestellübersicht</h3>
                ${this.state.cart.map(item => `
                  <div class="flex justify-between py-2 text-gray-700">
                    <span>${item.name} x${item.quantity}</span>
                    <span class="font-semibold">${(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                `).join('')}
                <div class="border-t mt-4 pt-4">
                  <div class="flex justify-between text-gray-700 mb-2">
                    <span>Zwischensumme:</span>
                    <span class="font-semibold">${subtotal.toFixed(2)} €</span>
                  </div>
                  ${this.state.appliedCoupon ? `
                    <div class="flex justify-between text-green-600 mb-2">
                      <span>Rabatt:</span>
                      <span class="font-semibold">-${discount.toFixed(2)} €</span>
                    </div>
                  ` : ''}
                  <div class="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                    <span>Gesamtsumme:</span>
                    <span class="text-indigo-600">${total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <div class="flex space-x-4">
                <button type="button" id="checkoutSubmit" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg">
                  ✅ Bestellung absenden
                </button>
                <button type="button" id="checkoutCancel" class="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors font-medium">
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
