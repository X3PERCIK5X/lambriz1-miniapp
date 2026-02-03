const screens = document.querySelectorAll('.screen');

function setScreen(name) {
  screens.forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
}

const menuButton = document.getElementById('menuButton');
const menuDrawer = document.getElementById('menuDrawer');
const menuClose = document.getElementById('menuClose');
const overlay = document.getElementById('drawerOverlay');
const favoritesButton = document.getElementById('favoritesButton');
const cartButton = document.getElementById('cartButton');

const openDrawer = () => {
  menuDrawer.classList.remove('hidden');
  menuDrawer.classList.add('drawer-open');
  overlay.classList.remove('hidden');
  overlay.classList.add('overlay-visible');
};

const closeDrawer = () => {
  menuDrawer.classList.remove('drawer-open');
  overlay.classList.remove('overlay-visible');
  setTimeout(() => {
    menuDrawer.classList.add('hidden');
    overlay.classList.add('hidden');
  }, 200);
};

menuButton.addEventListener('click', openDrawer);
menuClose.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

favoritesButton.addEventListener('click', () => setScreen('favorites'));
cartButton.addEventListener('click', () => setScreen('cart'));

menuDrawer.querySelectorAll('button[data-screen]').forEach((btn) => {
  btn.addEventListener('click', () => {
    setScreen(btn.dataset.screen);
    closeDrawer();
  });
});

setScreen('home');
