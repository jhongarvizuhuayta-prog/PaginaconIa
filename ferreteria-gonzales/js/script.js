/* =============================================
   FERRETERÍA GONZALES — script.js
   ============================================= */

// ── ESTADO DEL CARRITO ──────────────────────
let cart = [];

// ── NAVEGACIÓN ENTRE SECCIONES ──────────────
const sections = ['inicio', 'productos', 'contacto'];

function showSection(sectionId) {
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar links activos
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });
}

function scrollToSection(sectionId) {
  showSection(sectionId);
}

// Eventos de navegación
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(link.dataset.section);
  });
});

// ── CARRITO ─────────────────────────────────
const cartSidebar  = document.getElementById('cartSidebar');
const cartOverlay  = document.getElementById('cartOverlay');
const cartBtn      = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsEl  = document.getElementById('cartItems');
const cartTotalEl  = document.getElementById('cartTotal');
const cartCountEl  = document.getElementById('cartCount');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
}

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ── AGREGAR AL CARRITO ───────────────────────
function addToCart(name, price, btn) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1, id: Date.now() });
  }

  // Feedback visual en botón
  const original = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Agregado';
  btn.classList.add('added');
  setTimeout(() => {
    btn.innerHTML = original;
    btn.classList.remove('added');
  }, 1500);

  updateCartUI();
  openCart();
  showToast(`✓ ${name} agregado al carrito`);
}

// ── ACTUALIZAR UI DEL CARRITO ────────────────
function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Badge del botón
  cartCountEl.textContent = totalItems;
  if (totalItems > 0) {
    cartCountEl.classList.add('visible');
  } else {
    cartCountEl.classList.remove('visible');
  }

  // Total
  cartTotalEl.textContent = formatPrice(totalPrice) + ' Bs';

  // Lista de items
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty"><i class="fas fa-shopping-basket" style="font-size:2rem;display:block;margin-bottom:8px;opacity:0.3;"></i>Tu carrito está vacío</p>';
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" id="item-${item.id}">
      <div class="cart-item-icon">
        <i class="fas fa-tools"></i>
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
        <span class="cart-item-price">${formatPrice(item.price * item.qty)} Bs</span>
        <button class="remove-item" onclick="removeItem(${item.id})" title="Quitar">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// ── CAMBIAR CANTIDAD ─────────────────────────
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  updateCartUI();
}

// ── QUITAR ITEM ──────────────────────────────
function removeItem(id) {
  const item = cart.find(i => i.id === id);
  if (item) showToast(`✗ ${item.name} eliminado`);
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

// ── FINALIZAR COMPRA ─────────────────────────
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('⚠ Tu carrito está vacío');
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Simular confirmación
  cartItemsEl.innerHTML = `
    <div style="text-align:center; padding: 2rem 1rem; animation: fadeInUp 0.4s ease;">
      <div style="font-size:3rem; margin-bottom:1rem;">✅</div>
      <h3 style="font-family:'Barlow Condensed',sans-serif; font-size:1.4rem; color:#27ae60; margin-bottom:0.5rem;">¡Compra realizada!</h3>
      <p style="color:#7f8c8d; font-size:0.9rem; margin-bottom:1rem;">Tu pedido por <strong style="color:#d68910;">${formatPrice(total)} Bs</strong> ha sido registrado.<br/>Te contactaremos pronto al WhatsApp.</p>
      <p style="font-size:0.8rem; color:#aaa;">📞 +591 7 234 5678</p>
    </div>
  `;
  cartTotalEl.textContent = '0 Bs';
  cartCountEl.textContent = '0';
  cartCountEl.classList.remove('visible');
  cart = [];
  showToast('🎉 ¡Pedido confirmado! Te contactaremos pronto');
});

// ── FILTROS DE PRODUCTOS ─────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const cat = card.dataset.cat;
      if (filter === 'all' || cat === filter) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.3s ease';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ── FORMULARIO DE CONTACTO ───────────────────
function submitForm() {
  const nombre = document.getElementById('formNombre').value.trim();
  const email  = document.getElementById('formEmail').value.trim();
  const msg    = document.getElementById('formMsg').value.trim();

  if (!nombre || !email || !msg) {
    showToast('⚠ Por favor completa todos los campos');
    return;
  }

  // Simular envío
  showToast(`📨 Mensaje enviado, ${nombre}. ¡Pronto te contactamos!`);
  document.getElementById('formNombre').value = '';
  document.getElementById('formEmail').value = '';
  document.getElementById('formTel').value = '';
  document.getElementById('formMsg').value = '';
}

// ── TOAST ────────────────────────────────────
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── FORMATO DE PRECIO ─────────────────────────
function formatPrice(num) {
  return num.toLocaleString('es-BO');
}

// ── NAVBAR SCROLL ────────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
  } else {
    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.4)';
  }
});

// ── INICIALIZAR ──────────────────────────────
showSection('inicio');
updateCartUI();
