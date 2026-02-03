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
  favoritesCount: document.getElementById('favoritesCount'),
  cartCount: document.getElementById('cartCount'),
  categoriesGrid: document.getElementById('categoriesGrid'),
  categoriesTitle: document.getElementById('categoriesTitle'),
  productsTitle: document.getElementById('productsTitle'),
  productsList: document.getElementById('productsList'),
  productView: document.getElementById('productView'),
  favoritesList: document.getElementById('favoritesList'),
  favoritesToCart: document.getElementById('favoritesToCart'),
  favoritesClear: document.getElementById('favoritesClear'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  cartBar: document.getElementById('cartBar'),
  cartBarTotal: document.getElementById('cartBarTotal'),
  orderForm: document.getElementById('orderForm'),
  inputName: document.getElementById('inputName'),
  inputPhone: document.getElementById('inputPhone'),
  inputEmail: document.getElementById('inputEmail'),
  policyCheck: document.getElementById('policyCheck'),
  policyLink: document.getElementById('policyLink'),
  orderStatus: document.getElementById('orderStatus'),
  ordersList: document.getElementById('ordersList'),
  aboutText: document.getElementById('aboutText'),
  paymentText: document.getElementById('paymentText'),
  contactsCard: document.getElementById('contactsCard'),
};

function setScreen(name) {
  ui.screens.forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
}

function openDrawer() {
  ui.menuDrawer.classList.remove('hidden');
  ui.menuDrawer.classList.add('drawer-open');
  ui.overlay.classList.remove('hidden');
  ui.overlay.classList.add('overlay-visible');
}

function closeDrawer() {
  ui.menuDrawer.classList.remove('drawer-open');
  ui.overlay.classList.remove('overlay-visible');
  setTimeout(() => {
    ui.menuDrawer.classList.add('hidden');
    ui.overlay.classList.add('hidden');
  }, 200);
}

function formatPrice(v) { return Number(v || 0).toLocaleString('ru-RU'); }

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
  if (cartCount > 0) {
    ui.cartBar.classList.remove('hidden');
    ui.cartBarTotal.textContent = `${formatPrice(cartTotal())} ₽`;
  } else {
    ui.cartBar.classList.add('hidden');
  }
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
    <article class="product-card">
      <img src="${p.images[0]}" alt="${p.title}" />
      <div>
        <div class="product-title">${p.title}</div>
        <div class="product-meta">${p.shortDescription}</div>
        <div class="product-meta">Артикул: ${p.sku}</div>
        <div class="product-price">${formatPrice(p.price)} ₽</div>
        <div class="product-actions">
          <button class="ghost-button" data-favorite="${p.id}">${state.favorites.has(p.id) ? 'Удалить' : 'В избранное'}</button>
          <button class="primary-button" data-cart="${p.id}">В корзину</button>
          <button class="secondary-button" data-open="${p.id}">Подробнее</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderProductView() {
  const p = getProduct(state.currentProduct);
  if (!p) return;
  const specs = (p.specs || []).map((s) => {
    if (typeof s === 'string') return `<div>${s}</div>`;
    return `<div><span>${s.label}</span><span>${s.value}</span></div>`;
  }).join('');
  ui.productView.innerHTML = `
    <div class="product-gallery">${p.images.map((src) => `<img src="${src}" alt="${p.title}" />`).join('')}</div>
    <div class="product-title">${p.title}</div>
    <div class="product-meta">Артикул: ${p.sku}</div>
    <div class="product-price">${formatPrice(p.price)} ₽</div>
    <div class="product-actions">
      <button class="ghost-button" data-favorite="${p.id}">${state.favorites.has(p.id) ? 'Удалить' : 'В избранное'}</button>
      <button class="primary-button" data-cart="${p.id}">В корзину</button>
    </div>
    <div class="text-card"><strong>Описание</strong><p>${p.description}</p></div>
    <div class="product-specs"><strong>Характеристики</strong>${specs}</div>
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
  ui.menuClose.addEventListener('click', closeDrawer);
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
    if (!btn) return;
    if (btn.dataset.open) {
      state.currentProduct = btn.dataset.open;
      renderProductView();
      setScreen('product');
      return;
    }
    if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); renderProducts(); renderFavorites(); }
    if (btn.dataset.cart) { addToCart(btn.dataset.cart); }
  });

  ui.productView.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); renderProductView(); }
    if (btn.dataset.cart) { addToCart(btn.dataset.cart); }
  });

  ui.favoritesList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); renderFavorites(); }
    if (btn.dataset.cart) { addToCart(btn.dataset.cart); }
  });

  ui.favoritesButton.addEventListener('click', () => { renderFavorites(); setScreen('favorites'); });
  ui.cartButton.addEventListener('click', () => { renderCart(); setScreen('cart'); });
  ui.cartBar.addEventListener('click', () => { renderCart(); setScreen('cart'); });

  document.querySelectorAll('.back-button').forEach((btn) => {
    btn.addEventListener('click', () => setScreen(btn.dataset.back));
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
      customer: profile,
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
}

async function loadConfig() {
  const res = await fetch('config.json', { cache: 'no-store' });
  state.config = await res.json();
  ui.policyLink.href = state.config.privacyPolicyUrl || '#';
  ui.aboutText.textContent = state.config.aboutText || 'Текст будет добавлен позже.';
  ui.paymentText.textContent = state.config.paymentText || 'Информация будет добавлена позже.';
  ui.contactsCard.innerHTML = `
    <strong>${state.config.companyName || 'Ламбриз'}</strong><br/>
    Телефон: ${state.config.companyPhone || '-'}<br/>
    Email: ${state.config.companyEmail || '-'}<br/>
    Адрес: ${state.config.companyAddress || '-'}
  `;

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
  await loadConfig();
  await loadData();
  bindEvents();
  updateBadges();
  renderFavorites();
  renderCart();
  closeDrawer();
}

init();
