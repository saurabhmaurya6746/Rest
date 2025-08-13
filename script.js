// ====== Demo data (GLB only) ======


const dishes = [
  {
    id: 'burger',
    emoji: '🍔',
    title: 'Classic Cheeseburger',
    price: 199,
    desc: 'Juicy beef patty, melted cheese, fresh lettuce & tomato on a toasted bun.',
    glb: 'assets/burger.glb'
  },
  {
    id: 'chowmein',
    emoji: '🍝',
    title: 'Veg Chowmein',
    price: 149,
    desc: 'Stir-fried noodles with fresh vegetables and special sauce.',
    glb: 'assest/pizza.glb'
  },
  {
    id: 'mc-double',
    emoji: '🍝',
    title: 'Creamy Pasta Delight',
    price: 229,
    desc: 'Rich and creamy pasta dish with a blend of herbs and spices.',
    glb: 'assest/pasta.glb'
  }
];

// ====== Render list ======
const listEl = document.getElementById('dishList');

function renderList() {
  listEl.innerHTML = '';
  dishes.forEach(d => {
    const row = document.createElement('div');
    row.className = 'list-row';

    row.innerHTML = `
      <div class="row-left">
        <div class="row-title">
          <span class="emoji">${d.emoji}</span>
          <span>${d.title}</span>
        </div>
        <div class="row-price">₹${d.price}</div>
        <div class="row-desc">${d.desc}</div>
      </div>
      <div class="preview-card">
        <model-viewer
          src="${d.glb}"
          alt="${d.title}"
          camera-controls
          auto-rotate
          disable-zoom
          environment-image="neutral"
          exposure="1"
          shadow-intensity="1"
        ></model-viewer>
      </div>
    `;

    row.addEventListener('click', () => openModal(d));
    listEl.appendChild(row);
  });
}

renderList();

// ====== Modal logic ======
const modal = document.getElementById('modal');
const mv = document.getElementById('mv');
const mTitle = document.getElementById('mTitle');
const mDesc = document.getElementById('mDesc');
const mPrice = document.getElementById('mPrice');
const closeBtn = document.getElementById('closeModal');
const rotateBtn = document.getElementById('rotateBtn');
const arBtn = document.getElementById('arBtn');
const addBtn = document.getElementById('addBtn');

let currentDish = null;
let rotating = true;

function openModal(dish) {
  currentDish = dish;
  mv.pause();
  mv.src = dish.glb;
  mTitle.textContent = dish.title;
  mDesc.textContent = dish.desc;
  mPrice.textContent = '₹' + dish.price;

  rotating = true;
  rotateBtn.textContent = 'Stop';
  mv.setAttribute('auto-rotate', '');

  modal.classList.remove('hidden');
  requestAnimationFrame(() => mv.play());
}

function closeModal() {
  modal.classList.add('hidden');
  mv.pause();
}

document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

rotateBtn.addEventListener('click', () => {
  rotating = !rotating;
  if (rotating) {
    mv.setAttribute('auto-rotate', '');
    rotateBtn.textContent = 'Stop';
  } else {
    mv.removeAttribute('auto-rotate');
    rotateBtn.textContent = 'Rotate';
  }
});

arBtn.addEventListener('click', async () => {
  try {
    await mv.enterAR();
  } catch {
    alert('AR not supported. Use Chrome on Android.');
  }
});

addBtn.addEventListener('click', () => {
  if (!currentDish) return;
  const cart = JSON.parse(localStorage.getItem('ar_menu_cart') || '[]');
  cart.push({ id: currentDish.id, title: currentDish.title, price: currentDish.price });
  localStorage.setItem('ar_menu_cart', JSON.stringify(cart));
  addBtn.textContent = 'Added!';
  setTimeout(() => addBtn.textContent = 'Add to cart', 1200);
});
