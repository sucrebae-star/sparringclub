// Keep previously shared community links and tab bookmarks working at the root URL.
const clubPages = ['dashboard', 'players', 'gyms', 'board', 'record', 'post-detail', 'admin-dashboard'];
const initialHash = location.hash.slice(1);
const installedClub = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
if (installedClub || new URLSearchParams(location.search).has('postId') || clubPages.includes(initialHash) || initialHash.startsWith('modal-')) {
  location.replace(`club.html${location.search}${location.hash}`);
}

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '메뉴 열기');
  menu.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(expanded));
  menuToggle.setAttribute('aria-label', expanded ? '메뉴 닫기' : '메뉴 열기');
  menu.classList.toggle('is-open', expanded);
});
menu.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

const dialog = document.querySelector('#consult-dialog');
let consultTrigger;
let selectedPurpose = '';
document.querySelectorAll('[data-purpose]').forEach((option) => {
  option.addEventListener('click', () => {
    selectedPurpose = option.dataset.purpose;
    document.querySelectorAll('[data-purpose]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === option));
    });
  });
});
document.querySelectorAll('[data-consult]').forEach((button) => {
  button.addEventListener('click', () => {
    consultTrigger = button;
    const interest = button.dataset.program || selectedPurpose;
    const note = document.querySelector('#consult-interest');
    note.textContent = interest ? `관심 있는 운동: ${interest}. 카카오에서 예약할 때 이 내용을 알려주세요.` :
      '어떤 수업이 맞을지 몰라도 괜찮습니다. 상담에서 함께 살펴보세요.';
    closeMenu();
    dialog.showModal();
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
}});
dialog.addEventListener('close', () => consultTrigger?.focus());

document.querySelector('#copy-address').addEventListener('click', async () => {
  const address = '전북특별자치도 전주시 완산구 효천중앙로 57 모악빌딩 3층';
  try {
    await navigator.clipboard.writeText(address);
    document.querySelector('#copy-status').textContent = '주소를 복사했습니다.';
  } catch {
    document.querySelector('#copy-status').textContent = address;
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
// Content is visible by default; the observer only adds a brief entrance when supported.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealItems = document.querySelectorAll(
    'main section:not(.hero) h2, main section:not(.hero) h3, .program-feature .feature-media, .program-row-media, .guide-steps > div, .record-points > div, .space-gallery figure, .faq-list details'
  );
  revealItems.forEach((item, index) => {
    item.dataset.reveal = '';
    item.style.transitionDelay = `${(index % 4) * 65}ms`;
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.05, rootMargin: '0px 0px 70px 0px'});
  revealItems.forEach((item) => observer.observe(item));
  document.body.classList.add('can-animate');
}
// Register the same worker on both entry points so existing installations receive updates.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
