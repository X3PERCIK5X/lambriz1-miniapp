const state = {
  config: {},
  categories: [],
  products: [],
  currentGroup: null,
  currentCategory: null,
  currentProduct: null,
  favorites: new Set(),
  cart: {},
  profile: {},
  orders: [],
};

const ui = {
  screens: document.querySelectorAll('.screen'),
  menuButton: document.getElementById('menuButton'),
  menuClose: document.getElementById('menuClose'),
  menuDrawer: document.getElementById('menuDrawer'),
  overlay: document.getElementById('drawerOverlay'),
  favoritesButton: document.getElementById('favoritesButton'),
  cartButton: document.getElementById('cartButton'),
  ordersButton: document.getElementById('ordersButton'),
  homeButton: document.getElementById('homeButton'),
  favoritesCount: document.getElementById('favoritesCount'),
  cartCount: document.getElementById('cartCount'),
  categoriesGrid: document.getElementById('categoriesGrid'),
  categoriesTitle: document.getElementById('categoriesTitle'),
  productsTitle: document.getElementById('productsTitle'),
  productsList: document.getElementById('productsList'),
  productView: document.getElementById('productView'),
  productTitle: document.getElementById('productTitle'),
  productFavoriteTop: document.getElementById('productFavoriteTop'),
  favoritesList: document.getElementById('favoritesList'),
  favoritesToCart: document.getElementById('favoritesToCart'),
  favoritesClear: document.getElementById('favoritesClear'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  cartItemsCount: document.getElementById('cartItemsCount'),
  checkoutTotal: document.getElementById('checkoutTotal'),
  checkoutButton: document.getElementById('checkoutButton'),
  orderForm: document.getElementById('orderForm'),
  inputName: document.getElementById('inputName'),
  inputPhone: document.getElementById('inputPhone'),
  inputEmail: document.getElementById('inputEmail'),
  inputComment: document.getElementById('inputComment'),
  policyCheck: document.getElementById('policyCheck'),
  policyLink: document.getElementById('policyLink'),
  orderStatus: document.getElementById('orderStatus'),
  ordersList: document.getElementById('ordersList'),
  aboutText: document.getElementById('aboutText'),
  paymentText: document.getElementById('paymentText'),
  contactsCard: document.getElementById('contactsCard'),
};

function setScreen(name) {
  if (state.currentScreen === name) return;
  state.currentScreen = name;
  if (state.screenStack[state.screenStack.length - 1] !== name) {
    state.screenStack.push(name);
  }
  ui.screens.forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
  updateBottomNav(name);
}

function goBack() {
  if (state.screenStack.length <= 1) return;
  const current = state.currentScreen;
  const currentEl = document.getElementById(`screen-${current}`);
  if (currentEl) {
    currentEl.classList.add('closing');
    setTimeout(() => currentEl.classList.remove('closing'), 220);
  }
  state.screenStack.pop();
  const prev = state.screenStack[state.screenStack.length - 1];
  state.currentScreen = prev;
  ui.screens.forEach((s) => s.classList.toggle('active', s.id === `screen-${prev}`));
  updateBottomNav(prev);
}

function openDrawer() {
  ui.menuDrawer.classList.remove('hidden');
  ui.menuDrawer.classList.add('drawer-open');
  ui.overlay.classList.remove('hidden');
  ui.overlay.classList.add('overlay-visible');
  document.body.classList.add('menu-open');
  if (ui.menuButton) ui.menuButton.classList.add('active');
}

function closeDrawer() {
  ui.menuDrawer.classList.remove('drawer-open');
  ui.overlay.classList.remove('overlay-visible');
  document.body.classList.remove('menu-open');
  if (ui.menuButton) ui.menuButton.classList.remove('active');
  setTimeout(() => {
    ui.menuDrawer.classList.add('hidden');
    ui.overlay.classList.add('hidden');
  }, 200);
}

function updateBottomNav(screen) {
  const map = {
    home: ui.homeButton,
    favorites: ui.favoritesButton,
    cart: ui.cartButton,
    orders: ui.ordersButton,
  };
  const defaultButton = ui.homeButton;
  const activeButton = map[screen] || defaultButton;
  [ui.homeButton, ui.favoritesButton, ui.cartButton, ui.ordersButton, ui.menuButton].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle('active', btn === activeButton);
  });
}

function formatPrice(v) { return Number(v || 0).toLocaleString('ru-RU'); }
function formatMultiline(text) {
  return String(text || '').replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
}

function loadStorage() {
  state.favorites = new Set(JSON.parse(localStorage.getItem('lambriz_favorites') || '[]'));
  state.cart = JSON.parse(localStorage.getItem('lambriz_cart') || '{}');
  state.profile = JSON.parse(localStorage.getItem('lambriz_profile') || '{}');
  state.orders = JSON.parse(localStorage.getItem('lambriz_orders') || '[]');
}

function saveStorage() {
  localStorage.setItem('lambriz_favorites', JSON.stringify(Array.from(state.favorites)));
  localStorage.setItem('lambriz_cart', JSON.stringify(state.cart));
  localStorage.setItem('lambriz_profile', JSON.stringify(state.profile));
  localStorage.setItem('lambriz_orders', JSON.stringify(state.orders));
}

function getProduct(id) { return state.products.find((p) => p.id === id); }

function cartItems() {
  return Object.entries(state.cart)
    .map(([id, qty]) => ({ ...getProduct(id), qty }))
    .filter((p) => p.id);
}

function cartTotal() {
  return cartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateBadges() {
  const cartCount = Object.values(state.cart).reduce((s, q) => s + q, 0);
  ui.cartCount.textContent = cartCount;
  ui.favoritesCount.textContent = state.favorites.size;
}

function renderCategories() {
  const list = state.categories.filter((c) => c.groupId === state.currentGroup);
  ui.categoriesGrid.innerHTML = list.map((c) => `
    <button class="category-card" data-category="${c.id}">
      <img src="${c.image}" alt="${c.title}" />
      <span>${c.title}</span>
    </button>
  `).join('');
}

function renderProducts() {
  const list = state.products.filter((p) => p.categoryId === state.currentCategory);
  ui.productsList.innerHTML = list.map((p) => `
    <article class="product-card" data-open="${p.id}">
      <button class="card-icon favorite ${state.favorites.has(p.id) ? 'active' : ''}" data-favorite="${p.id}" aria-label="В избранное">
        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
        </svg>
      </button>
      <img src="${p.images[0]}" alt="${p.title}" />
      <div>
        <div class="product-title">${p.title}</div>
        <div class="product-meta">${p.shortDescription}</div>
        <div class="product-meta">Артикул: ${p.sku}</div>
        <div class="product-price">${formatPrice(p.price)} ₽</div>
        ${state.cart[p.id]
          ? `
            <div class="card-qty" data-qty="${p.id}">
              <button class="qty-btn" data-qty-dec="${p.id}" type="button">−</button>
              <span class="qty-count">${state.cart[p.id]}</span>
              <button class="qty-btn" data-qty-inc="${p.id}" type="button">+</button>
            </div>
          `
          : `
            <button class="card-icon cart" data-cart="${p.id}" aria-label="В корзину">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 11-1 9" />
                <path d="m19 11-4-7" />
                <path d="M2 11h20" />
                <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
              </svg>
            </button>
          `}
      </div>
    </article>
  `).join('');
}

function renderProductView() {
  const p = getProduct(state.currentProduct);
  if (!p) return;
  if (ui.productTitle) ui.productTitle.textContent = p.title || '';
  if (ui.productFavoriteTop) {
    ui.productFavoriteTop.dataset.favorite = p.id;
    ui.productFavoriteTop.classList.toggle('active', state.favorites.has(p.id));
  }
  const specs = (p.specs || []).map((s) => {
    if (typeof s === 'string') return `<div>${s}</div>`;
    return `<div><span>${s.label}</span><span>${s.value}</span></div>`;
  }).join('');
  ui.productView.innerHTML = `
    <div class="product-hero">
      <div class="product-gallery">${p.images.map((src) => `<img src="${src}" alt="${p.title}" />`).join('')}</div>
    </div>
    <div class="product-title">${p.title}</div>
    <div class="product-meta">Артикул: ${p.sku}</div>
    <div class="product-price-row">
      <div class="product-price">${formatPrice(p.price)} ₽</div>
      ${state.cart[p.id]
        ? `
          <div class="product-qty" data-qty="${p.id}">
            <button class="qty-btn" data-qty-dec="${p.id}" type="button">−</button>
            <span class="qty-count">${state.cart[p.id]}</span>
            <button class="qty-btn" data-qty-inc="${p.id}" type="button">+</button>
          </div>
        `
        : `<button class="primary-button" data-cart="${p.id}">В корзину</button>`}
    </div>
    <div class="detail-section">
      <div class="section-title">Описание</div>
      <div class="section-body">${p.description}</div>
    </div>
    <div class="detail-section">
      <div class="section-title">Характеристики</div>
      <div class="product-specs">${specs}</div>
    </div>
  `;
}

function renderFavorites() {
  const list = state.products.filter((p) => state.favorites.has(p.id));
  ui.favoritesList.innerHTML = list.map((p) => `
    <article class="product-card">
      <img src="${p.images[0]}" alt="${p.title}" />
      <div>
        <div class="product-title">${p.title}</div>
        <div class="product-meta">${p.shortDescription}</div>
        <div class="product-price">${formatPrice(p.price)} ₽</div>
        <div class="product-actions">
          <button class="ghost-button" data-favorite="${p.id}">Удалить</button>
          <button class="primary-button" data-cart="${p.id}">В корзину</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const items = cartItems();
  ui.cartList.innerHTML = items.map((p) => `
    <div class="cart-item">
      <div><strong>${p.title}</strong></div>
      <div>Артикул: ${p.sku}</div>
      <div>${formatPrice(p.price)} ₽</div>
      <div class="cart-controls">
        <button data-qty="${p.id}" data-action="dec">−</button>
        <span>${p.qty}</span>
        <button data-qty="${p.id}" data-action="inc">+</button>
        <button class="ghost-button" data-remove="${p.id}">Удалить</button>
      </div>
    </div>
  `).join('');
  ui.cartTotal.textContent = formatPrice(cartTotal());
  if (ui.cartItemsCount) {
    ui.cartItemsCount.textContent = items.reduce((s, i) => s + i.qty, 0);
  }
  if (ui.checkoutTotal) {
    ui.checkoutTotal.textContent = `${formatPrice(cartTotal())} ₽`;
  }
}

function renderOrders() {
  if (!state.orders.length) {
    ui.ordersList.innerHTML = '<div class="text-card">История заказов пуста.</div>';
    return;
  }
  ui.ordersList.innerHTML = state.orders.slice().reverse().map((o) => `
    <div class="cart-item">
      <div><strong>Заявка №${o.id}</strong></div>
      <div>${new Date(o.createdAt).toLocaleString('ru-RU')}</div>
      <div>${o.items.map((i) => `${i.title} × ${i.qty}`).join('<br/>')}</div>
      <div><strong>Итого: ${formatPrice(o.total)} ₽</strong></div>
    </div>
  `).join('');
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
  saveStorage();
  updateBadges();
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveStorage();
  updateBadges();
}

function bindEvents() {
  ui.menuButton.addEventListener('click', openDrawer);
  if (ui.menuClose) ui.menuClose.addEventListener('click', closeDrawer);
  ui.overlay.addEventListener('click', closeDrawer);


  document.querySelectorAll('[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      if (target) setScreen(target);
    });
  });
  document.querySelectorAll('.drawer-menu button').forEach((btn) => {
    btn.addEventListener('click', () => {
      setScreen(btn.dataset.screen);
      if (btn.dataset.screen === 'orders') renderOrders();
      closeDrawer();
    });
  });

  document.querySelectorAll('.hero-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      state.currentGroup = tile.dataset.group;
      ui.categoriesTitle.textContent = tile.dataset.group === 'equipment' ? 'Каталог оборудования' : 'Изделия из нержавейки';
      renderCategories();
      setScreen('categories');
    });
  });

  ui.categoriesGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    state.currentCategory = btn.dataset.category;
    const cat = state.categories.find((c) => c.id === state.currentCategory);
    ui.productsTitle.textContent = cat ? cat.title : 'Категория';
    renderProducts();
    setScreen('products');
  });

  ui.productsList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.dataset.favorite) {
      toggleFavorite(btn.dataset.favorite);
      renderProducts();
      renderFavorites();
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.cart) {
      addToCart(btn.dataset.cart);
      renderProducts();
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.qtyInc) {
      addToCart(btn.dataset.qtyInc);
      renderProducts();
      e.stopPropagation();
      return;
    }
    if (btn && btn.dataset.qtyDec) {
      const id = btn.dataset.qtyDec;
      state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
      if (!state.cart[id]) delete state.cart[id];
      saveStorage();
      updateBadges();
      renderProducts();
      e.stopPropagation();
      return;
    }
    const card = e.target.closest('[data-open]');
    if (!card) return;
    state.currentProduct = card.dataset.open;
    renderProductView();
    setScreen('product');
  });

  ui.productView.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); renderProductView(); }
    if (btn.dataset.cart) { addToCart(btn.dataset.cart); renderProductView(); }
    if (btn.dataset.qtyInc) { addToCart(btn.dataset.qtyInc); renderProductView(); }
    if (btn.dataset.qtyDec) {
      const id = btn.dataset.qtyDec;
      state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
      if (!state.cart[id]) delete state.cart[id];
      saveStorage();
      updateBadges();
      renderProductView();
    }
  });

  if (ui.productFavoriteTop && !ui.productFavoriteTop.dataset.bound) {
    ui.productFavoriteTop.dataset.bound = '1';
    ui.productFavoriteTop.addEventListener('click', (e) => {
      const id = ui.productFavoriteTop.dataset.favorite;
      if (!id) return;
      toggleFavorite(id);
      renderProductView();
      e.stopPropagation();
    });
  }


  ui.favoritesList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); renderFavorites(); }
    if (btn.dataset.cart) { addToCart(btn.dataset.cart); }
  });

  ui.favoritesButton.addEventListener('click', () => { renderFavorites(); setScreen('favorites'); closeDrawer(); });
  ui.cartButton.addEventListener('click', () => { renderCart(); setScreen('cart'); closeDrawer(); });
  ui.ordersButton.addEventListener('click', () => { renderOrders(); setScreen('orders'); closeDrawer(); });
  ui.homeButton.addEventListener('click', () => { setScreen('home'); closeDrawer(); });
  ui.checkoutButton.addEventListener('click', () => { renderCart(); setScreen('checkout'); });

  document.querySelectorAll('.back-button').forEach((btn) => {
    btn.addEventListener('click', () => goBack());
  });

  ui.favoritesToCart.addEventListener('click', () => {
    state.favorites.forEach((id) => addToCart(id));
    renderFavorites();
  });
  ui.favoritesClear.addEventListener('click', () => { state.favorites.clear(); saveStorage(); renderFavorites(); updateBadges(); });

  ui.cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.qty || btn.dataset.remove;
    if (!id) return;
    if (btn.dataset.action === 'inc') { addToCart(id); }
    else if (btn.dataset.action === 'dec') { state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1); if (!state.cart[id]) delete state.cart[id]; saveStorage(); updateBadges(); }
    else if (btn.dataset.remove) { delete state.cart[id]; saveStorage(); updateBadges(); }
    renderCart();
  });

  ui.orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!ui.policyCheck.checked) { ui.orderStatus.textContent = 'Подтвердите согласие с политикой.'; return; }
    const items = cartItems();
    if (!items.length) { ui.orderStatus.textContent = 'Корзина пуста.'; return; }
    const profile = { name: ui.inputName.value.trim(), phone: ui.inputPhone.value.trim(), email: ui.inputEmail.value.trim() };
    if (!profile.name || !profile.phone || !profile.email) { ui.orderStatus.textContent = 'Заполните поля.'; return; }

    const order = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      customer: { ...profile, comment: ui.inputComment ? ui.inputComment.value.trim() : '' },
      items: items.map((i) => ({ id: i.id, title: i.title, sku: i.sku, price: i.price, qty: i.qty })),
      total: cartTotal(),
      telegramUserId: null,
    };

    ui.orderStatus.textContent = 'Отправка...';
    if (!state.config.orderEndpoint) {
      ui.orderStatus.textContent = 'Не задан адрес отправки (orderEndpoint в config.json).';
      return;
    }

    try {
      const res = await fetch(state.config.orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      state.orders.push(order);
      state.profile = profile;
      state.cart = {};
      saveStorage();
      updateBadges();
      renderCart();
      ui.orderStatus.textContent = 'Заявка отправлена.';
      setScreen('confirmation');
    } catch (err) {
      ui.orderStatus.textContent = 'Ошибка отправки. Проверьте настройки.';
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  ui.menuDrawer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  ui.menuDrawer.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dx > 40 && dy < 30) closeDrawer();
  });
  ui.overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  ui.overlay.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dx > 40 && dy < 30) closeDrawer();
  });

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dx > 40 && dy < 30) {
      if (ui.menuDrawer.classList.contains('drawer-open')) {
        closeDrawer();
      } else {
        goBack();
      }
    }
  });
}

async function loadConfig() {
  const res = await fetch('config.json', { cache: 'no-store' });
  state.config = await res.json();
  ui.policyLink.href = state.config.privacyPolicyUrl || '#';
  ui.aboutText.innerHTML = formatMultiline(state.config.aboutText || 'Текст будет добавлен позже.');
  ui.paymentText.innerHTML = formatMultiline(state.config.paymentText || 'Информация будет добавлена позже.');
  if (state.config.contactsText) {
    ui.contactsCard.innerHTML = formatMultiline(state.config.contactsText);
  } else {
    ui.contactsCard.innerHTML = `
      <strong>${state.config.companyName || 'Ламбриз'}</strong><br/>
      Телефон: ${state.config.companyPhone || '-'}<br/>
      Email: ${state.config.companyEmail || '-'}<br/>
      Адрес: ${state.config.companyAddress || '-'}
    `;
  }
  const phoneText = state.config.companyPhone || '+7 (916) 616-37-77';
  const phoneDigits = phoneText.replace(/\D/g, '');
  const menuPhone = document.getElementById('menuPhone');
  const menuCallButton = document.getElementById('menuCallButton');
  if (menuPhone) menuPhone.textContent = phoneText;
  if (menuCallButton && phoneDigits) menuCallButton.href = `tel:+${phoneDigits}`;

  ui.inputName.value = state.profile.name || '';
  ui.inputPhone.value = state.profile.phone || '';
  ui.inputEmail.value = state.profile.email || '';
}

async function loadData() {
  const [catRes, prodRes] = await Promise.all([
    fetch('data/categories.json'),
    fetch('data/products.json'),
  ]);
  state.categories = await catRes.json();
  state.products = await prodRes.json();
}

async function init() {
  loadStorage();
  state.screenStack = ['home'];
  state.currentScreen = 'home';
  bindEvents();
  updateBottomNav('home');
  updateBadges();
  renderFavorites();
  renderCart();
  closeDrawer();

  try {
    await loadConfig();
  } catch (err) {
    console.error('loadConfig failed', err);
  }

  try {
    await loadData();
  } catch (err) {
    console.error('loadData failed', err);
  }
}

init();
