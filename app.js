const state = {
  config: {},
  categories: [],
  products: [],
  currentGroup: null,
  currentCategory: null,
  currentProduct: null,
  favorites: new Set(),
  selectedFavorites: new Set(),
  cart: {},
  selectedCart: new Set(),
  cartSelectionTouched: false,
  favoritesSelectionTouched: false,
  productionSlide: 0,
  profile: {},
  orders: [],
};

const menuCatalogTree = [
  { title: 'Автохимия' },
  { title: 'Аксессуары для АВД', children: ['Пистолеты и копья', 'Шланги высокого давления', 'Насадки и форсунки'] },
  { title: 'Аксессуары для автомоек', children: ['Щётки и держатели', 'Пистолеты пены', 'Крепёж и соединители'] },
  { title: 'Аппараты высокого давления', children: ['Бензиновые АВД', 'Электрические АВД', 'Профессиональные АВД'] },
  { title: 'Насосы ВД и двигатели', children: ['Насосы высокого давления', 'Электродвигатели', 'Комплекты'] },
  { title: 'Пеногенераторы' },
  { title: 'Поломоечные и подметальные машины', children: ['Поломоечные машины', 'Подметальные машины', 'Комбинированные'] },
  { title: 'Пылесосы и Химчистка', children: ['Моющие пылесосы', 'Пылесосы сухой уборки', 'Химчистка салона'] },
];

const ui = {
  screens: document.querySelectorAll('.screen'),
  menuButton: document.getElementById('menuButton'),
  menuCatalogToggle: document.getElementById('menuCatalogToggle'),
  menuCatalogList: document.getElementById('menuCatalogList'),
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
  favoritesSelectAll: document.getElementById('favoritesSelectAll'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  cartItemsCount: document.getElementById('cartItemsCount'),
  checkoutTotal: document.getElementById('checkoutTotal'),
  checkoutButton: document.getElementById('checkoutButton'),
  cartSelectAll: document.getElementById('cartSelectAll'),
  cartRemoveSelected: document.getElementById('cartRemoveSelected'),
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
  productionText: document.getElementById('productionText'),
  productionServices: document.getElementById('productionServices'),
  productionTrack: document.getElementById('productionTrack'),
};

function openCategoryById(categoryId) {
  if (!categoryId) return;
  state.currentCategory = categoryId;
  const cat = state.categories.find((c) => c.id === categoryId);
  ui.productsTitle.textContent = cat ? cat.title : 'Категория';
  renderProducts();
  setScreen('products');
}

function buildMenuCatalog() {
  if (!ui.menuCatalogList) return;
  const titleToId = new Map(state.categories.map((c) => [c.title, c.id]));
  const card = document.createElement('div');
  card.className = 'menu-catalog-card';
  menuCatalogTree.forEach((item, idx) => {
    const id = titleToId.get(item.title) || '';
    const hasChildren = Array.isArray(item.children) && item.children.length;
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `menu-catalog-item${hasChildren ? ' has-children' : ''}`;
    row.dataset.menuIndex = String(idx);
    row.dataset.category = id;
    row.dataset.hasChildren = hasChildren ? '1' : '0';
    row.innerHTML = `<span>${item.title}</span>${hasChildren ? '<span class="menu-caret">▾</span>' : ''}`;
    card.appendChild(row);

    if (hasChildren) {
      const sub = document.createElement('div');
      sub.className = 'menu-catalog-children hidden';
      sub.dataset.menuChildren = String(idx);
      sub.innerHTML = item.children.map((child) => {
        const childId = titleToId.get(child) || id;
        return `<button type="button" class="menu-subitem" data-menu-subitem="1" data-category="${childId || ''}">${child}</button>`;
      }).join('');
      card.appendChild(sub);
    }
  });
  ui.menuCatalogList.innerHTML = '';
  ui.menuCatalogList.appendChild(card);
}

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

function openMenu() {
  setScreen('menu');
}

function updateBottomNav(screen) {
  const map = {
    home: ui.homeButton,
    favorites: ui.favoritesButton,
    cart: ui.cartButton,
    orders: ui.ordersButton,
    menu: ui.menuButton,
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
  const raw = String(text || '').trim();
  if (!raw) return '';
  const parts = raw.split(/\n{2,}/g);
  return parts
    .map((part) => `<p>${part.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function loadStorage() {
  state.favorites = new Set(JSON.parse(localStorage.getItem('lambriz_favorites') || '[]'));
  state.cart = JSON.parse(localStorage.getItem('lambriz_cart') || '{}');
  state.selectedCart = new Set(JSON.parse(localStorage.getItem('lambriz_cart_selected') || '[]'));
  state.selectedFavorites = new Set(JSON.parse(localStorage.getItem('lambriz_fav_selected') || '[]'));
  state.profile = JSON.parse(localStorage.getItem('lambriz_profile') || '{}');
  state.orders = JSON.parse(localStorage.getItem('lambriz_orders') || '[]');
}

function saveStorage() {
  localStorage.setItem('lambriz_favorites', JSON.stringify(Array.from(state.favorites)));
  localStorage.setItem('lambriz_cart', JSON.stringify(state.cart));
  localStorage.setItem('lambriz_cart_selected', JSON.stringify(Array.from(state.selectedCart)));
  localStorage.setItem('lambriz_fav_selected', JSON.stringify(Array.from(state.selectedFavorites)));
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
  if (!state.selectedCart.size) return 0;
  const selected = cartItems().filter((i) => state.selectedCart.has(i.id));
  return selected.reduce((sum, item) => sum + item.price * item.qty, 0);
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
  if (!state.selectedFavorites.size && list.length && !state.favoritesSelectionTouched) {
    state.selectedFavorites = new Set(list.map((p) => p.id));
    saveStorage();
  }
  if (ui.favoritesSelectAll) {
    ui.favoritesSelectAll.checked = list.length && list.every((p) => state.selectedFavorites.has(p.id));
  }
  ui.favoritesList.innerHTML = list.map((p) => `
    <article class="product-card">
      <label class="select-dot">
        <input type="checkbox" data-fav-select="${p.id}" ${state.selectedFavorites.has(p.id) ? 'checked' : ''} />
        <span></span>
      </label>
      <img src="${p.images[0]}" alt="${p.title}" />
      <div>
        <div class="product-title">${p.title}</div>
        <div class="product-meta">${p.shortDescription}</div>
        <div class="product-price">${formatPrice(p.price)} ₽</div>
        <div class="product-actions icon-actions">
          <button class="icon-btn" data-favorite="${p.id}" aria-label="Удалить из избранного">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M6 6l1 14h10l1-14" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
          ${state.cart[p.id]
            ? `
              <div class="product-qty" data-qty="${p.id}">
                <button class="qty-btn" data-qty-dec="${p.id}" type="button">−</button>
                <span class="qty-count">${state.cart[p.id]}</span>
                <button class="qty-btn" data-qty-inc="${p.id}" type="button">+</button>
              </div>
            `
            : `
              <button class="icon-btn" data-cart="${p.id}" aria-label="В корзину">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m15 11-1 9" />
                  <path d="m19 11-4-7" />
                  <path d="M2 11h20" />
                  <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
                </svg>
              </button>
            `}
        </div>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const items = cartItems();
  if (!state.selectedCart.size && items.length && !state.cartSelectionTouched) {
    state.selectedCart = new Set(items.map((i) => i.id));
    saveStorage();
  }
  ui.cartList.innerHTML = items.map((p) => `
    <div class="cart-item">
      <label class="select-dot">
        <input type="checkbox" data-cart-select="${p.id}" ${state.selectedCart.has(p.id) ? 'checked' : ''} />
        <span></span>
      </label>
      <img class="cart-image" src="${p.images[0]}" alt="${p.title}" />
      <div class="cart-info">
        <button class="cart-title-link" data-open="${p.id}">${p.title}</button>
        <div class="cart-sku">Артикул: ${p.sku}</div>
        <div class="cart-price">${formatPrice(p.price)} ₽</div>
      </div>
      <div class="cart-controls">
        <button class="qty-btn" data-qty="${p.id}" data-action="dec">−</button>
        <span class="qty-count">${p.qty}</span>
        <button class="qty-btn" data-qty="${p.id}" data-action="inc">+</button>
        <button class="icon-btn ${state.favorites.has(p.id) ? 'active' : ''}" data-favorite="${p.id}" aria-label="В избранное">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        </button>
        <button class="icon-btn" data-remove="${p.id}" aria-label="Удалить">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 14h10l1-14" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
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
  if (ui.cartSelectAll) {
    ui.cartSelectAll.checked = items.length && items.every((i) => state.selectedCart.has(i.id));
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
  refreshFavoriteViews();
}

function refreshFavoriteViews() {
  if (state.currentScreen === 'products' || state.currentScreen === 'categories' || state.currentScreen === 'home') {
    renderProducts();
  }
  if (state.currentScreen === 'favorites') {
    renderFavorites();
  } else {
    renderFavorites();
  }
  if (state.currentScreen === 'product') {
    renderProductView();
  }
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveStorage();
  updateBadges();
}

function bindEvents() {
  ui.menuButton.addEventListener('click', openMenu);


  document.querySelectorAll('[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      if (target) setScreen(target);
    });
  });
  document.querySelectorAll('.menu-item[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setScreen(btn.dataset.screen);
      if (btn.dataset.screen === 'orders') renderOrders();
    });
  });

  if (ui.menuCatalogToggle) {
    ui.menuCatalogToggle.addEventListener('click', () => {
      ui.menuCatalogList.classList.toggle('hidden');
    });
  }

  document.querySelectorAll('.hero-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      state.currentGroup = tile.dataset.group;
      ui.categoriesTitle.textContent = tile.dataset.group === 'equipment' ? 'Каталог оборудования' : 'Изделия из нержавейки';
      renderCategories();
      setScreen('categories');
    });
  });
  // Ensure categories grid has data on load
  if (!state.currentGroup) {
    state.currentGroup = 'equipment';
    ui.categoriesTitle.textContent = 'Каталог оборудования';
    renderCategories();
  }

  if (ui.menuCatalogList) {
    ui.menuCatalogList.addEventListener('click', (e) => {
      const subItem = e.target.closest('[data-menu-subitem]');
      if (subItem) {
        const id = subItem.dataset.category;
        openCategoryById(id);
        return;
      }
      const row = e.target.closest('[data-menu-index]');
      if (!row) return;
      const hasChildren = row.dataset.hasChildren === '1';
      if (hasChildren) {
        const idx = row.dataset.menuIndex;
        const block = ui.menuCatalogList.querySelector(`[data-menu-children="${idx}"]`);
        if (block) {
          block.classList.toggle('hidden');
          row.classList.toggle('open');
        }
        return;
      }
      openCategoryById(row.dataset.category);
    });
  }

  document.querySelectorAll('[data-prod-dot]').forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.prodDot || 0);
      setProductionSlide(index);
    });
  });

  const productionSlider = document.querySelector('.production-slider');
  if (productionSlider) {
    let prodStartX = 0;
    productionSlider.addEventListener('touchstart', (e) => {
      prodStartX = e.touches[0].clientX;
    }, { passive: true });
    productionSlider.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - prodStartX;
      if (Math.abs(dx) < 40) return;
      const totalSlides = document.querySelectorAll('.production-track img').length || 1;
      const dir = dx < 0 ? 1 : -1;
      const next = Math.max(0, Math.min(totalSlides - 1, state.productionSlide + dir));
      if (next !== state.productionSlide) setProductionSlide(next);
    });
  }

  ui.categoriesGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    openCategoryById(btn.dataset.category);
  });

  ui.productsList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.dataset.favorite) {
      toggleFavorite(btn.dataset.favorite);
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
    if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); }
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
      e.stopPropagation();
    });
  }


  ui.favoritesList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) {
      if (btn.dataset.favorite) { toggleFavorite(btn.dataset.favorite); }
      if (btn.dataset.cart) { addToCart(btn.dataset.cart); renderFavorites(); }
      if (btn.dataset.qtyInc) { addToCart(btn.dataset.qtyInc); renderFavorites(); }
      if (btn.dataset.qtyDec) {
        const id = btn.dataset.qtyDec;
        state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1);
        if (!state.cart[id]) delete state.cart[id];
        saveStorage();
        updateBadges();
        renderFavorites();
      }
      return;
    }
  });

  ui.favoritesList.addEventListener('change', (e) => {
    const select = e.target.closest('input[data-fav-select]');
    if (!select) return;
    state.favoritesSelectionTouched = true;
    const id = select.dataset.favSelect;
    if (select.checked) state.selectedFavorites.add(id); else state.selectedFavorites.delete(id);
    saveStorage();
    renderFavorites();
  });

  ui.favoritesButton.addEventListener('click', () => { renderFavorites(); setScreen('favorites'); });
  ui.cartButton.addEventListener('click', () => { renderCart(); setScreen('cart'); });
  ui.ordersButton.addEventListener('click', () => { renderOrders(); setScreen('orders'); });
  ui.homeButton.addEventListener('click', () => { setScreen('home'); });
  ui.checkoutButton.addEventListener('click', () => { renderCart(); setScreen('checkout'); });

  document.querySelectorAll('.back-button').forEach((btn) => {
    btn.addEventListener('click', () => goBack());
  });

  ui.favoritesToCart.addEventListener('click', () => {
    const ids = state.selectedFavorites.size ? Array.from(state.selectedFavorites) : Array.from(state.favorites);
    ids.forEach((id) => addToCart(id));
    renderFavorites();
  });
  ui.favoritesClear.addEventListener('click', () => {
    const ids = state.selectedFavorites.size ? Array.from(state.selectedFavorites) : Array.from(state.favorites);
    ids.forEach((id) => state.favorites.delete(id));
    state.selectedFavorites.clear();
    saveStorage();
    renderFavorites();
    updateBadges();
  });

  ui.cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.open) {
      state.currentProduct = btn.dataset.open;
      renderProductView();
      setScreen('product');
      return;
    }
    const id = btn.dataset.qty || btn.dataset.remove;
    if (!id && btn.dataset.favorite) {
      toggleFavorite(btn.dataset.favorite);
      renderCart();
      return;
    }
    if (!id) return;
    if (btn.dataset.action === 'inc') { addToCart(id); }
    else if (btn.dataset.action === 'dec') { state.cart[id] = Math.max(0, (state.cart[id] || 0) - 1); if (!state.cart[id]) delete state.cart[id]; saveStorage(); updateBadges(); }
    else if (btn.dataset.remove) { delete state.cart[id]; saveStorage(); updateBadges(); }
    renderCart();
  });

  ui.cartList.addEventListener('change', (e) => {
    const select = e.target.closest('input[data-cart-select]');
    if (!select) return;
    state.cartSelectionTouched = true;
    const id = select.dataset.cartSelect;
    if (select.checked) state.selectedCart.add(id); else state.selectedCart.delete(id);
    saveStorage();
    renderCart();
  });

  if (ui.favoritesSelectAll) ui.favoritesSelectAll.addEventListener('change', () => {
    state.favoritesSelectionTouched = true;
    const list = state.products.filter((p) => state.favorites.has(p.id));
    state.selectedFavorites = new Set(ui.favoritesSelectAll.checked ? list.map((p) => p.id) : []);
    saveStorage();
    renderFavorites();
  });

  if (ui.cartSelectAll) ui.cartSelectAll.addEventListener('change', () => {
    state.cartSelectionTouched = true;
    const items = cartItems();
    state.selectedCart = new Set(ui.cartSelectAll.checked ? items.map((i) => i.id) : []);
    saveStorage();
    renderCart();
  });

  if (ui.cartRemoveSelected) ui.cartRemoveSelected.addEventListener('click', () => {
    state.selectedCart.forEach((id) => delete state.cart[id]);
    state.selectedCart.clear();
    saveStorage();
    updateBadges();
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

function setProductionSlide(index) {
  if (!ui.productionTrack) return;
  ui.productionTrack.style.transform = `translateX(-${index * 100}%)`;
  state.productionSlide = index;
  document.querySelectorAll('[data-prod-dot]').forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.prodDot) === index);
  });
}

async function loadConfig() {
  const res = await fetch('config.json', { cache: 'no-store' });
  state.config = await res.json();
  ui.policyLink.href = state.config.privacyPolicyUrl || '#';
  if (ui.aboutText) {
    const aboutRaw = state.config.aboutText || 'Текст будет добавлен позже.';
    if (String(aboutRaw).includes('<')) {
      ui.aboutText.innerHTML = aboutRaw;
    } else {
      ui.aboutText.innerHTML = formatMultiline(aboutRaw);
    }
  }
  ui.paymentText.innerHTML = formatMultiline(state.config.paymentText || 'Информация будет добавлена позже.');
  if (ui.productionText) {
    const prodRaw = state.config.productionText || 'Информация будет добавлена позже.';
    const prodLines = String(prodRaw).split('\n');
    const prodTitle = prodLines.shift()?.trim();
    const prodBody = prodLines.join('\n').trim();
    if (prodTitle && prodBody) {
      ui.productionText.innerHTML = `<div class="section-title">${prodTitle}</div>` + formatMultiline(prodBody);
    } else {
      ui.productionText.innerHTML = formatMultiline(prodRaw);
    }
  }
  if (ui.productionServices) {
    const list = state.config.productionServices || [];
    ui.productionServices.innerHTML = list.map((item) => `<li>${item}</li>`).join('');
  }
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
  buildMenuCatalog();
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
