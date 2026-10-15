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
document.querySelectorAll('[data-consult]').forEach((button) => {
  button.addEventListener('click', () => {
    consultTrigger = button;
    document.querySelector('#consult-program').value = button.dataset.program || '아직 고민 중이에요';
    closeMenu();
    dialog.showModal();
    window.dispatchEvent(new Event("academy:consult-open"));
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
}});
dialog.addEventListener('close', () => consultTrigger?.focus());

document.querySelectorAll('[data-day]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-day]').forEach((day) => day.setAttribute('aria-pressed', String(day === button)));
    document.querySelector('#day-schedule').innerHTML = Number(button.dataset.day) >= 5
      ? '<div class="schedule-closed"><span>REST & RECOVER</span><strong>정기휴무</strong><p>토요일·일요일은 쉬어갑니다.</p></div>'
      : '<div class="schedule-row"><strong>10:00—11:00</strong><span>오전 운영</span></div><div class="schedule-row break"><strong>11:00—15:00</strong><span>휴게시간</span></div><div class="schedule-row"><strong>15:00—22:00</strong><span>오후 운영</span></div>';
  });
});
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
// Register the same worker on both entry points so existing installations receive updates.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
