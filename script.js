const modelContainer = document.querySelector('#burger-container');
let currentYRotation = 180;
let previousX = 0;
let isDragging = false;
let isTouching = false;

const dishes = [
  {
    name: 'Classic Burger',
    src: '#model1',
    scale: '20 20 20',
    title: '🍔 Classic Burger',
    price: '₹199',
    desc: 'Juicy beef patty, melted cheese, fresh lettuce & tomato served on a toasted bun.',
    lights: { ambient: 1.5, directionalTop: 4, point: 3, directionalBottom: 5 }
  },
  // {
  //   name: 'Big Mac',
  //   src: '#model2',
  //   scale: '30 30 30',
  //   title: '🍔 Big Mac',
  //   price: '₹249',
  //   desc: 'Double beef patties with special sauce and cheese between triple buns.',
  //   lights: { ambient: 1, directionalTop: 0.6, point: 0, directionalBottom: 0.6 }
  // },
  // {
  //   name: 'Mc Double Burger',
  //   src: '#model3',
  //   scale: '10 10 10',
  //   title: '🍔 Mc Double Burger',
  //   price: '₹229',
  //   desc: 'Two beef patties with pickles, onions, ketchup, and mustard on a sesame bun.',
  //   lights: { ambient: 1.2, directionalTop: 3.5, point: 3.2, directionalBottom: 4.2 }
  // },
  {
    name: 'Cheesy Pizza',
    src: '#model4',
    scale: '8 1 8',
    rotation: '-25 0 0',
    title: '🍕 Cheesy Pizza',
    price: '₹299',
    desc: 'Thin crust pizza with melted mozzarella, tangy tomato sauce, and herbs.',
    lights: { ambient: 1, directionalTop: 0.6, point: 0, directionalBottom: 0.6 }
  }
];

let currentIndex = 0;
let modelEntity = null;

function updateLights(config) {
  document.querySelector('#ambientLight').setAttribute('light', `type: ambient; intensity: ${config.ambient}`);
  document.querySelector('#topLight').setAttribute('light', `type: directional; intensity: ${config.directionalTop}; color: #ffffff`);
  document.querySelector('#pointLight').setAttribute('light', `type: point; intensity: ${config.point}; color: #ffffff`);
  document.querySelector('#bottomLight').setAttribute('light', `type: directional; intensity: ${config.directionalBottom}; color: #ffffff`);
}

function updateUI(dish) {
  document.querySelector('.info-box h1').innerText = dish.title;
  document.querySelector('.price').innerText = dish.price;
  document.querySelector('.desc').innerText = dish.desc;
}

function updateRotation() {
  modelContainer.setAttribute('rotation', `0 ${currentYRotation} 0`);
}

function initModel() {
  const dish = dishes[currentIndex];
  modelEntity = document.createElement('a-gltf-model');
  modelEntity.setAttribute('id', 'burgerModelEntity');
  modelEntity.setAttribute('src', dish.src);
  modelEntity.setAttribute('scale', dish.scale);
  modelEntity.setAttribute('rotation', dish.rotation || '0 0 0');
  modelEntity.setAttribute('material', 'side: front');

  modelContainer.appendChild(modelEntity);

  updateUI(dish);
  updateRotation();
  updateLights(dish.lights);
}

function updateModel() {
  if (modelEntity && modelEntity.parentNode) {
    modelEntity.parentNode.removeChild(modelEntity);
  }

  currentYRotation = 180; // Reset horizontal rotation
  const dish = dishes[currentIndex];
  modelEntity = document.createElement('a-gltf-model');
  modelEntity.setAttribute('id', 'burgerModelEntity');
  modelEntity.setAttribute('src', dish.src);
  modelEntity.setAttribute('scale', dish.scale);
  modelEntity.setAttribute('rotation', dish.rotation || '0 0 0');
  modelContainer.appendChild(modelEntity);

  updateUI(dish);
  updateRotation();
  updateLights(dish.lights);
}

// Left / Right Button Handlers
document.getElementById('leftBtn').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + dishes.length) % dishes.length;
  updateModel();
});

document.getElementById('rightBtn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % dishes.length;
  updateModel();
});

// Mouse rotation - only horizontal
document.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousX = e.clientX;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousX;
  previousX = e.clientX;
  currentYRotation += deltaX * 0.5;
  updateRotation();
});

// Touch rotation - only horizontal
document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isTouching = true;
    previousX = e.touches[0].clientX;
  }
});

document.addEventListener('touchend', () => {
  isTouching = false;
});

document.addEventListener('touchmove', (e) => {
  if (!isTouching || e.touches.length !== 1) return;
  const touch = e.touches[0];
  const deltaX = touch.clientX - previousX;
  previousX = touch.clientX;
  currentYRotation += deltaX * 0.5;
  updateRotation();
});

function exitVR() {
  const scene = document.querySelector('a-scene');
  if (scene && scene.exitVR) scene.exitVR();
}

const scene = document.querySelector('a-scene');
scene.addEventListener('enter-vr', () => {
  document.getElementById('exit-ar-btn').style.display = 'block';
});
scene.addEventListener('exit-vr', () => {
  document.getElementById('exit-ar-btn').style.display = 'none';
});

initModel();
