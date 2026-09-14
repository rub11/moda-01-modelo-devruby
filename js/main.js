/* ==========================================================================
   AURA BEAUTY — LÓGICA INTERATIVA JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Estado da Aplicação
  let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
  let favorites = JSON.parse(localStorage.getItem('aura_favorites')) || [];
  let currentTestimonialIndex = 0;
  
  // Respostas do Beauty Quiz
  const quizAnswers = { step1: '', step2: '', step3: '' };

  // Elementos do DOM
  const mainHeader = document.getElementById('mainHeader');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const navMenu = document.getElementById('navMenu');
  
  const searchToggleBtn = document.getElementById('searchToggleBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchDrawer = document.getElementById('searchDrawer');
  const searchInput = document.getElementById('searchInput');

  const productsGrid = document.getElementById('productsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const cartBtn = document.getElementById('cartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartCountEl = document.getElementById('cartCount');
  const cartDrawerCountEl = document.getElementById('cartDrawerCount');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTotalEl = document.getElementById('cartTotal');

  const favoritesBtn = document.getElementById('favoritesBtn');
  const favoritesCountEl = document.getElementById('favoritesCount');

  const productModalOverlay = document.getElementById('productModalOverlay');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalProductContent = document.getElementById('modalProductContent');

  const toastContainer = document.getElementById('toastContainer');

  // 1. INICIALIZAÇÃO
  function init() {
    renderProducts(productsData);
    updateCartUI();
    updateFavoritesUI();
    setupHeaderScroll();
    setupMobileMenu();
    setupSearchDrawer();
    setupCartDrawer();
    setupModal();
    setupQuiz();
    setupTestimonialsCarousel();
    setupNewsletter();
    setupScrollAnimations();
    setupKitOffer();
  }

  // 2. STICKY HEADER COM SCROLL
  function setupHeaderScroll() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        mainHeader.classList.add('header-scrolled');
      } else {
        mainHeader.classList.remove('header-scrolled');
      }
    });
  }

  // 3. MENU MOBILE HAMBÚRGUER
  function setupMobileMenu() {
    hamburgerBtn?.addEventListener('click', () => navMenu.classList.add('active'));
    closeMenuBtn?.addEventListener('click', () => navMenu.classList.remove('active'));

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        navMenu.classList.remove('active');
        const filter = link.getAttribute('data-filter');
        if (filter) {
          e.preventDefault();
          const target = document.getElementById('produtos');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            filterProducts(filter);
          }
        }
      });
    });
  }

  // 4. DRAWER DE BUSCA
  function setupSearchDrawer() {
    searchToggleBtn?.addEventListener('click', () => {
      searchDrawer.classList.toggle('active');
      if (searchDrawer.classList.contains('active')) {
        searchInput.focus();
      }
    });

    closeSearchBtn?.addEventListener('click', () => searchDrawer.classList.remove('active'));

    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = productsData.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.shortDescription.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
      renderProducts(filtered);
    });
  }

  // 5. RENDERIZAÇÃO DE PRODUTOS E FILTROS
  function renderProducts(items) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (items.length === 0) {
      productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 3rem;">Nenhum produto encontrado.</p>`;
      return;
    }

    items.forEach(product => {
      const isFav = favorites.includes(product.id);
      const starsHTML = getStarsHTML(product.rating);

      const card = document.createElement('article');
      card.className = 'product-card fade-in visible';
      card.innerHTML = `
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <button class="product-fav-btn ${isFav ? 'active' : ''}" data-id="${product.id}" aria-label="Favoritar produto">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <div class="product-img-wrapper" data-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <span class="product-quick-view"><i class="fa-regular fa-eye"></i> Visualizar</span>
        </div>
        <div class="product-info">
          <div class="product-rating">${starsHTML} <span>(${product.reviewsCount})</span></div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-desc">${product.shortDescription}</p>
          <div class="product-footer">
            <span class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
            <button class="add-cart-btn" data-id="${product.id}">
              <i class="fa-solid fa-plus"></i> Adicionar
            </button>
          </div>
        </div>
      `;

      // Eventos dos botões do card
      card.querySelector('.product-fav-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(product.id);
      });

      card.querySelector('.product-img-wrapper').addEventListener('click', () => {
        openModal(product.id);
      });

      card.querySelector('.add-cart-btn').addEventListener('click', () => {
        addToCart(product.id);
      });

      productsGrid.appendChild(card);
    });
  }

  function getStarsHTML(rating) {
    let html = '';
    const full = Math.floor(rating);
    for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
    if (rating % 1 !== 0) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    return html;
  }

  function filterProducts(category) {
    filterBtns.forEach(btn => {
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (category === 'all') {
      renderProducts(productsData);
    } else {
      const filtered = productsData.filter(p => p.category === category);
      renderProducts(filtered);
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-filter');
      filterProducts(cat);
    });
  });

  // Evento das Categorias Principais
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      const target = document.getElementById('produtos');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        filterProducts(cat);
      }
    });
  });

  // 6. CARRINHO DE COMPRAS / SACOLA
  function setupCartDrawer() {
    cartBtn?.addEventListener('click', openCart);
    closeCartBtn?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
  }

  function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }

  function addToCart(productId, qty = 1) {
    const existingIndex = cart.findIndex(item => item.id === productId);
    const product = productsData.find(p => p.id === productId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({ id: productId, quantity: qty });
    }

    saveCart();
    updateCartUI();
    showToast(`${product.name} adicionado à sacola!`);
  }

  function updateCartQuantity(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
      cart[itemIndex].quantity += delta;
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
      saveCart();
      updateCartUI();
    }
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
  }

  function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }

  function updateCartUI() {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = totalCount;
    if (cartDrawerCountEl) cartDrawerCountEl.textContent = totalCount;

    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-bag-shopping" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-border);"></i>
          <p>Sua sacola está vazia.</p>
        </div>`;
      if (cartSubtotalEl) cartSubtotalEl.textContent = 'R$ 0,00';
      if (cartTotalEl) cartTotalEl.textContent = 'R$ 0,00';
      return;
    }

    let total = 0;

    cart.forEach(item => {
      const product = productsData.find(p => p.id === item.id);
      if (!product) return;

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${product.name}</h4>
          <div class="cart-item-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
          <div class="cart-item-qty">
            <button class="qty-btn minus-btn" data-id="${product.id}"><i class="fa-solid fa-minus"></i></button>
            <span>${item.quantity}</span>
            <button class="qty-btn plus-btn" data-id="${product.id}"><i class="fa-solid fa-plus"></i></button>
            <button class="remove-item-btn" data-id="${product.id}"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      `;

      itemEl.querySelector('.minus-btn').addEventListener('click', () => updateCartQuantity(product.id, -1));
      itemEl.querySelector('.plus-btn').addEventListener('click', () => updateCartQuantity(product.id, 1));
      itemEl.querySelector('.remove-item-btn').addEventListener('click', () => removeFromCart(product.id));

      cartItemsContainer.appendChild(itemEl);
    });

    if (cartSubtotalEl) cartSubtotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (cartTotalEl) cartTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }

  // 7. FAVORITOS
  function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    const product = productsData.find(p => p.id === productId);

    if (index > -1) {
      favorites.splice(index, 1);
      showToast(`${product.name} removido dos favoritos.`);
    } else {
      favorites.push(productId);
      showToast(`${product.name} salvo nos favoritos!`);
    }

    localStorage.setItem('aura_favorites', JSON.stringify(favorites));
    updateFavoritesUI();
    // Atualiza a grid para refletir o estado do coração
    const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
    filterProducts(activeFilter);
  }

  function updateFavoritesUI() {
    if (favoritesCountEl) favoritesCountEl.textContent = favorites.length;
  }

  favoritesBtn?.addEventListener('click', () => {
    if (favorites.length === 0) {
      showToast("Você ainda não salvou nenhum produto nos favoritos.");
      return;
    }
    const favProducts = productsData.filter(p => favorites.includes(p.id));
    const target = document.getElementById('produtos');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      renderProducts(favProducts);
    }
  });

  // 8. MODAL QUICK VIEW
  function setupModal() {
    closeModalBtn?.addEventListener('click', closeModal);
    productModalOverlay?.addEventListener('click', (e) => {
      if (e.target === productModalOverlay) closeModal();
    });
  }

  function openModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product || !modalProductContent) return;

    const starsHTML = getStarsHTML(product.rating);

    modalProductContent.innerHTML = `
      <div class="modal-img-wrapper">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="modal-info">
        <div class="product-rating">${starsHTML} <span>(${product.reviewsCount} avaliações)</span></div>
        <h2 class="modal-title">${product.name}</h2>
        <div class="modal-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
        <p class="modal-desc">${product.fullDescription}</p>
        <button class="btn btn-primary" id="modalAddCartBtn">
          <i class="fa-solid fa-bag-shopping"></i> Adicionar à Sacola
        </button>
      </div>
    `;

    document.getElementById('modalAddCartBtn')?.addEventListener('click', () => {
      addToCart(product.id);
      closeModal();
    });

    productModalOverlay.classList.add('active');
  }

  function closeModal() {
    productModalOverlay.classList.remove('active');
  }

  // 9. BEAUTY QUIZ LOGIC
  function setupQuiz() {
    const quizSteps = document.querySelectorAll('.quiz-step');
    const quizResult = document.getElementById('quizResult');
    const quizRecommendedGrid = document.getElementById('quizRecommendedGrid');
    const restartQuizBtn = document.getElementById('restartQuizBtn');

    document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const currentStepEl = btn.closest('.quiz-step');
        const stepNum = parseInt(currentStepEl.getAttribute('data-step'));
        const val = btn.getAttribute('data-value');

        if (stepNum === 1) quizAnswers.step1 = val;
        if (stepNum === 2) quizAnswers.step2 = val;
        if (stepNum === 3) quizAnswers.step3 = val;

        currentStepEl.classList.remove('active');

        const nextStepEl = document.querySelector(`.quiz-step[data-step="${stepNum + 1}"]`);
        if (nextStepEl) {
          nextStepEl.classList.add('active');
        } else {
          // Exibir Resultado
          showQuizResults();
        }
      });
    });

    function showQuizResults() {
      if (!quizResult || !quizRecommendedGrid) return;

      // Filtra produtos com base nas tags selecionadas
      let matches = productsData.filter(p => {
        return p.category === quizAnswers.step1 || p.tags.includes(quizAnswers.step2) || p.tags.includes(quizAnswers.step3);
      });

      // Se houver menos de 3, pega os primeiros do catálogo
      if (matches.length < 3) {
        matches = productsData.slice(0, 3);
      } else {
        matches = matches.slice(0, 3);
      }

      quizRecommendedGrid.innerHTML = '';
      matches.forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-card';
        item.innerHTML = `
          <div class="product-img-wrapper">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="product-info">
            <h4 class="product-name">${product.name}</h4>
            <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            <button class="add-cart-btn margin-top-2" style="width:100%" data-id="${product.id}">Adicionar</button>
          </div>
        `;
        item.querySelector('.add-cart-btn').addEventListener('click', () => addToCart(product.id));
        quizRecommendedGrid.appendChild(item);
      });

      quizResult.style.display = 'block';
    }

    restartQuizBtn?.addEventListener('click', () => {
      quizResult.style.display = 'none';
      quizSteps.forEach(step => step.classList.remove('active'));
      document.querySelector('.quiz-step[data-step="1"]')?.classList.add('active');
    });
  }

  // 10. CARROSSEL DE DEPOIMENTOS
  function setupTestimonialsCarousel() {
    const slides = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');

    if (slides.length === 0) return;

    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      currentTestimonialIndex = (index + slides.length) % slides.length;
      slides[currentTestimonialIndex].classList.add('active');
      if (dots[currentTestimonialIndex]) dots[currentTestimonialIndex].classList.add('active');
    }

    prevBtn?.addEventListener('click', () => showSlide(currentTestimonialIndex - 1));
    nextBtn?.addEventListener('click', () => showSlide(currentTestimonialIndex + 1));

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => showSlide(idx));
    });

    // Auto rotate
    setInterval(() => {
      showSlide(currentTestimonialIndex + 1);
    }, 6000);
  }

  // 11. VALIDAÇÃO NEWSLETTER
  function setupNewsletter() {
    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('newsletterEmail');
    const errorMsg = document.getElementById('newsletterError');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        errorMsg.style.display = 'block';
      } else {
        errorMsg.style.display = 'none';
        showToast("Obrigado por assinar nossa newsletter!");
        emailInput.value = '';
      }
    });
  }

  // 12. KIT EM OFERTA
  function setupKitOffer() {
    const buyKitBtn = document.getElementById('buyKitBtn');
    buyKitBtn?.addEventListener('click', () => {
      // Adiciona itens do kit (IDs 5, 6, 7)
      addToCart(5, 1);
      addToCart(6, 1);
      addToCart(7, 1);
      openCart();
    });
  }

  // 13. ANIMAÇÕES DE SCROLL (Intersection Observer)
  function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // 14. TOAST NOTIFICATIONS
  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Inicializa tudo
  init();
});