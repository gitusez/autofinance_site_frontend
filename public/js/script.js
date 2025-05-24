// --- Гамбургер-меню ---
const burgerBtn = document.getElementById('burgerBtn');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');

if (burgerBtn && menuOverlay && closeMenu) {
  burgerBtn.addEventListener('click', function() {
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  closeMenu.addEventListener('click', function() {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });
  menuOverlay.addEventListener('click', function(e) {
    if (e.target === menuOverlay) {
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// --- Плавный скролл к услугам по клику на стрелку ---
const scrollToServices = document.getElementById('scrollToServices');
const servicesSection = document.getElementById('services');
if (scrollToServices && servicesSection) {
  scrollToServices.addEventListener('click', function(e) {
    e.preventDefault();
    servicesSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// --- Клик по логотипу возвращает на главную ---
const logoHome = document.getElementById('logoHome');
if (logoHome) {
  logoHome.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'index.html';
  });
}

// Плавное появление about-photos
window.addEventListener('DOMContentLoaded', function() {
  const aboutPhotos = document.querySelector('.about-photos');
  if (aboutPhotos) setTimeout(() => aboutPhotos.classList.add('visible'), 200);
});

// Навешиваем на все ссылки меню и основные навигационные ссылки (теперь обычный переход)
function setupMenuLinks() {
  const selector = '.menu-list a, .service-card, .cta-btn, .footer-link, .hero-arrow, .back-button';
  document.querySelectorAll(selector).forEach(link => {
    if (link.tagName === 'A' && link.href && !link.href.endsWith('#')) {
      // обычный переход
      link.addEventListener('click', function() {
        // Закрыть меню при переходе по ссылке
        if (menuOverlay && menuOverlay.classList.contains('active')) {
          menuOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    } else if (link.classList.contains('service-card')) {
      // обычный переход
    }
  });
}
setupMenuLinks(); 