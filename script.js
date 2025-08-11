// Ensure script runs after DOM loaded
document.addEventListener('DOMContentLoaded', () => {

  // --- Edit this dishes array to match your assets (glb + thumbnail images)
  const dishes = [
    {
      id: 'model1',
      title: '🍔 Classic Cheeseburger',
      price: '₹199',
      desc: 'Juicy beef patty, melted cheese, fresh lettuce & tomato served on a toasted bun.',
      model: 'assest/burger_tripo-v2.glb',
      scale: '20 20 20',
      rotation: '0 180 0',
      thumb: 'assest/thumb_burger.jpg'
    },
    // },
    // {
    //   id: 'model2',
    //   title: '🍜 Veg Chowmein',
    //   price: '₹149',
    //   desc: 'Stir-fried noodles with fresh vegetables and special sauce.',
    //   model: 'assets/chaumin.glb',
    //   scale: '18 18 18',
    //   rotation: '0 180 0',
    //   thumb: 'assets/thumb_chaumin.jpg'
    // },
    // {
    //   id: 'model4',
    //   title: '🍔 Mc Double',
    //   price: '₹229',
    //   desc: 'Two patties, onions, pickles and special sauce on sesame bun.',
    //   model: 'assets/mc_double_burger.glb',
    //   scale: '10 10 10',
    //   rotation: '0 180 0',
    //   thumb: 'assets/thumb_mcdouble.jpg'
    // },
    {
      id: 'model3',
      title: '🍕 Cheesy Pizza',
      price: '₹299',
      desc: 'Thin crust pizza with melted mozzarella, tangy tomato sauce, and herbs.',
      model: 'assest/pizza.glb',
      scale: '8 8 8',
      rotation: '-25 0 0',
      thumb: 'assets/thumb_pizza.jpg'
    } 
  ];
  // ------------------

  const menuBody = document.getElementById('menuBody');
  const viewerModal = document.getElementById('viewerModal');
  const modalClose = document.getElementById('modalClose');

  // modal fields
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const modalModelHolder = document.getElementById('modalModelHolder');
  const modalScene = document.getElementById('modalScene');
  const modalAssets = document.getElementById('modalAssets');

  // create table rows
  function renderMenu() {
    menuBody.innerHTML = '';
    dishes.forEach((dish, i) => {
      const tr = document.createElement('tr');

      // left column: text
      const tdText = document.createElement('td');
      const title = document.createElement('h3'); title.className = 'dish-name'; title.textContent = dish.title;
      const price = document.createElement('p'); price.className = 'dish-price'; price.textContent = dish.price;
      const desc = document.createElement('p'); desc.className = 'dish-desc'; desc.textContent = dish.desc;
      tdText.appendChild(title);
      tdText.appendChild(price);
      tdText.appendChild(desc);

      // right column: preview a-frame embedded
      const tdPreview = document.createElement('td');
      tdPreview.className = 'preview-cell';

      const previewBox = document.createElement('div');
      previewBox.className = 'preview-box';
      previewBox.tabIndex = 0; // keyboard focusable
      previewBox.setAttribute('role', 'button');
      previewBox.setAttribute('aria-label', `Open ${dish.title} 3D viewer`);

      // small embedded scene
      const sceneWrapper = document.createElement('div');
      sceneWrapper.style.width = '100%';
      sceneWrapper.style.height = '100%';

      const sceneEl = document.createElement('a-scene');
      sceneEl.setAttribute('embedded', '');
      sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
      sceneEl.setAttribute('background', 'color: #ffffff');

      // Add camera
      const cam = document.createElement('a-entity');
      cam.setAttribute('camera', '');
      cam.setAttribute('position', '0 0.6 1.2');

      // Lights
      const ambient = document.createElement('a-entity');
      ambient.setAttribute('light', 'type: ambient; intensity: 1.0');

      const directional = document.createElement('a-entity');
      directional.setAttribute('light', 'type: directional; intensity: 2');
      directional.setAttribute('position', '1 1 1');

      // Model entity (load by URL directly)
      const modelEntity = document.createElement('a-entity');
      modelEntity.setAttribute('gltf-model', `url(${dish.model})`);
      modelEntity.setAttribute('position', '0 0 -20');
      modelEntity.setAttribute('rotation', dish.rotation || '0 0 0');
      modelEntity.setAttribute('scale', dish.scale || '1 1 1');

      // Continuous rotation animation for preview (only Y axis)
      modelEntity.setAttribute('animation', 'property: rotation; to: 0 540 0; loop: true; dur: 7000; easing: linear');

      // Add to the scene
      sceneEl.appendChild(ambient);
      sceneEl.appendChild(directional);
      sceneEl.appendChild(modelEntity);
      sceneEl.appendChild(cam);

      sceneWrapper.appendChild(sceneEl);
      previewBox.appendChild(sceneWrapper);

      // click opens modal
      previewBox.addEventListener('click', () => openModal(dish));
      previewBox.addEventListener('keypress', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') openModal(dish);
      });

      tdPreview.appendChild(previewBox);

      tr.appendChild(tdText);
      tr.appendChild(tdPreview);
      menuBody.appendChild(tr);
    });
  }

  // Open modal and load the doc into modalScene
function openModal(dish) {
  // update text
  modalTitle.textContent = dish.title;
  modalPrice.textContent = dish.price;
  modalDesc.textContent = dish.desc;

  // cleanup
  while (modalModelHolder.firstChild) modalModelHolder.removeChild(modalModelHolder.firstChild);
  while (modalAssets.firstChild) modalAssets.removeChild(modalAssets.firstChild);

  // create asset
  const assetItem = document.createElement('a-asset-item');
  assetItem.setAttribute('id', `asset-${dish.id}`);
  assetItem.setAttribute('src', dish.model);
  modalAssets.appendChild(assetItem);

  // create model entity
  const modelEntity = document.createElement('a-entity');
  modelEntity.setAttribute('id', `modalModel-${dish.id}`);
  modelEntity.setAttribute('gltf-model', `#asset-${dish.id}`);
  modelEntity.setAttribute('position', '0 0 -20');
  modelEntity.setAttribute('rotation', dish.rotation || '0 180 0');
  modelEntity.setAttribute('scale', dish.scale || '1 1 1');

  // add to holder
  modalModelHolder.appendChild(modelEntity);

  // show modal
  viewerModal.setAttribute('aria-hidden', 'false');
  modalClose.focus();

  // --- Interaction behaviour: auto-rotate until user interacts ---
  // auto-rotate using a tiny RAF loop (more control than A-Frame animation)
  let isUserInteracting = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let currentRotation = { x: 0, y: parseFloat((dish.rotation || '0 180 0').split(' ')[1]) || 180 };
  // if dish.rotation provided, use its Y as starting value

  // gentle auto-rotate speed (degrees per second)
  const AUTO_ROTATE_SPEED = 18; // change if you want faster/slower

  let lastFrameTime = performance.now();
  let rafId = null;

  function rafLoop(now) {
    const dt = (now - lastFrameTime) / 1000; // seconds
    lastFrameTime = now;
    if (!isUserInteracting) {
      currentRotation.y = (currentRotation.y + AUTO_ROTATE_SPEED * dt) % 360;
    modelEntity.setAttribute('rotation', `0 ${currentRotation.y} 0`);
    }
    rafId = requestAnimationFrame(rafLoop);
  }
  // start loop after small delay so model loads
  lastFrameTime = performance.now();
  rafId = requestAnimationFrame(rafLoop);

  // pointer (mouse/touch) handlers for rotate
  function onPointerDown(ev) {
    isUserInteracting = true;
    // normalize pointer x,y
    const p = getPointerPos(ev);
    lastPointerX = p.x;
    lastPointerY = p.y;
    // capture pointer for mouse
    if (ev.pointerId) ev.target.setPointerCapture && ev.target.setPointerCapture(ev.pointerId);
  }

  function onPointerMove(ev) {
    if (!isUserInteracting) return;
    const p = getPointerPos(ev);
    const dx = p.x - lastPointerX;
    const dy = p.y - lastPointerY;
    lastPointerX = p.x;
    lastPointerY = p.y;

    // sensitivity tuning
    const ROTATE_SENS = 0.3; // degrees per pixel
    currentRotation.y = (currentRotation.y + dx * ROTATE_SENS) % 360;
    currentRotation.x = Math.max(-45, Math.min(45, currentRotation.x + dy * ROTATE_SENS)); // clamp X tilt
    modelEntity.setAttribute('rotation', `${currentRotation.x} ${currentRotation.y} 0`);
  }

  function onPointerUp(ev) {
    isUserInteracting = false;
    // release pointer if captured
    if (ev.pointerId) ev.target.releasePointerCapture && ev.target.releasePointerCapture(ev.pointerId);
  }

  // wheel zoom (desktop)
  function onWheel(ev) {
    ev.preventDefault();
    const cam = document.querySelector('#modalCamera');
    if (!cam) return;
    // get current camera position
    const pos = cam.getAttribute('position');
    // move camera forward/back on Z axis
    const Z_MIN = 1.5, Z_MAX = 6;
    const step = ev.deltaY > 0 ? 0.15 : -0.15;
    const newZ = Math.max(Z_MIN, Math.min(Z_MAX, pos.z + step));
    cam.setAttribute('position', `${pos.x} ${pos.y} ${newZ}`);
  }

  // simple pinch-to-zoom for touch (two-finger)
  let lastTouchDist = null;
  function onTouchStart(ev) {
    if (ev.touches && ev.touches.length === 2) {
      isUserInteracting = true;
      lastTouchDist = distanceTouches(ev.touches[0], ev.touches[1]);
    }
  }
  function onTouchMove(ev) {
    if (ev.touches && ev.touches.length === 2 && lastTouchDist) {
      const d = distanceTouches(ev.touches[0], ev.touches[1]);
      const diff = d - lastTouchDist;
      lastTouchDist = d;
      // apply zoom by moving camera
      const cam = document.querySelector('#modalCamera');
      if (!cam) return;
      const pos = cam.getAttribute('position');
      const step = diff * -0.01; // tune sensitivity
      const Z_MIN = 1.5, Z_MAX = 6;
      const newZ = Math.max(Z_MIN, Math.min(Z_MAX, pos.z + step));
      cam.setAttribute('position', `${pos.x} ${pos.y} ${newZ}`);
    } else if (ev.touches && ev.touches.length === 1) {
      // treat as single pointer drag
      onPointerMove({ type: 'touch', touches: ev.touches, preventDefault: () => {}, target: modalSceneEl });
    }
  }
  function onTouchEnd(ev) {
    if (!ev.touches || ev.touches.length < 2) {
      lastTouchDist = null;
    }
    if (!ev.touches || ev.touches.length === 0) {
      isUserInteracting = false;
    }
  }

  // helpers
  function getPointerPos(ev) {
    if (ev.touches && ev.touches.length > 0) {
      return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    }
    return { x: ev.clientX, y: ev.clientY };
  }
  function distanceTouches(a, b) {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // attach listeners on the scene wrapper so both mouse and touch captured
  const modalSceneEl = document.querySelector('#modalScene');

  // pointer events (supports mouse + pointer)
  modalSceneEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // touch fallback
  modalSceneEl.addEventListener('touchstart', onTouchStart, {passive: false});
  window.addEventListener('touchmove', onTouchMove, {passive: false});
  window.addEventListener('touchend', onTouchEnd);

  // wheel
  modalSceneEl.addEventListener('wheel', onWheel, { passive: false });

  // cleanup when modal closes
  function cleanupInteraction() {
    cancelAnimationFrame(rafId);
    modalSceneEl.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    modalSceneEl.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    modalSceneEl.removeEventListener('wheel', onWheel);
  }

  // hook cleanup to modal close
  const closeOnce = () => {
    cleanupInteraction();
    viewerModal.setAttribute('aria-hidden', 'true');
    // remove model and assets
    while (modalModelHolder.firstChild) modalModelHolder.removeChild(modalModelHolder.firstChild);
    while (modalAssets.firstChild) modalAssets.removeChild(modalAssets.firstChild);
    modalClose.removeEventListener('click', closeOnce);
    document.removeEventListener('keydown', escHandler);
  };
  function escHandler(e) { if (e.key === 'Escape') closeOnce(); }
  modalClose.addEventListener('click', closeOnce);
  document.addEventListener('keydown', escHandler);

setTimeout(() => {
  const sceneEl = document.querySelector('#modalScene');
  sceneEl.emit('render-target-loaded');
  window.dispatchEvent(new Event('resize'));
}, 50);

}


function closeModal() {
  // Move focus to a safe place before hiding
  document.activeElement.blur();
  document.body.focus(); // Optional, taaki focus kahi valid jagah ho

  // Hide modal
  viewerModal.setAttribute('aria-hidden', 'true');

  // Cleanup
  while (modalModelHolder.firstChild) modalModelHolder.removeChild(modalModelHolder.firstChild);
  while (modalAssets.firstChild) modalAssets.removeChild(modalAssets.firstChild);

  // Optional: pause A-Frame renderer if needed
}


  // Bind close actions
  modalClose.addEventListener('click', closeModal);
  viewerModal.addEventListener('click', (e) => {
    if (e.target === viewerModal) closeModal(); // click outside content closes
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Initial render
  renderMenu();

});



