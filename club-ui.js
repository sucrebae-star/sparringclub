// Presentation only: Firebase configuration, collections and matching rules live in club.html.
(() => {
  const names = {dashboard:'OVERVIEW',players:'FIND A BOXER',gyms:'GYMS',board:'COMMUNITY',record:'RECORD', 'post-detail':'COMMUNITY', 'admin-dashboard':'ADMIN'};
  const primary = document.querySelector('#club-find-partner');
  function syncPage(pageId) {
    document.querySelector('#club-current-page').textContent = names[pageId] || 'OVERVIEW';
    document.body.dataset.clubPage = pageId;
    document.querySelectorAll('#main-nav button').forEach(button => {
      if (button.id === `nav-${pageId}` || (pageId === 'post-detail' && button.id === 'nav-board')) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
    primary.textContent = pageId === 'players' ? '내 매칭 현황 확인 ↗' : '스파링 파트너 찾기 ↗';
    primary.onclick = pageId === 'players'
      ? () => { if (currentUser) openMatchStatus(); else openModal('loginModal'); }
      : () => showPage('players');
  }
  window.addEventListener('club:pagechange', event => syncPage(event.detail.pageId));
  syncPage(document.querySelector('.page.active')?.id || 'dashboard');

  // Keep keyboard focus inside legacy dialogs, including dialogs opened from generated cards.
  let activeModal = null;
  const previousFocus = new Map();
  const focusable = modal => [...modal.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"],[contenteditable="true"]')].filter(el => !el.disabled && el.getClientRects().length);
  document.querySelectorAll('.modal').forEach(modal => {
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-label', modal.querySelector('h2,h3')?.textContent.trim() || '스파링클럽 안내');
    modal.querySelectorAll('.close-btn').forEach(close => {
      close.setAttribute('role','button'); close.setAttribute('tabindex','0'); close.setAttribute('aria-label','닫기');
      close.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();close.click();} });
    });
  });
  const observer = new MutationObserver(() => {
    const open = [...document.querySelectorAll('.modal')].filter(modal => modal.style.display === 'flex');
    const latest = open.sort((a,b) => Number(getComputedStyle(a).zIndex) - Number(getComputedStyle(b).zIndex)).pop() || null;
    if (latest === activeModal) return;
    if (activeModal && !open.includes(activeModal)) previousFocus.get(activeModal)?.focus();
    activeModal = latest;
    document.body.classList.toggle('has-club-modal', Boolean(latest));
    if (latest) {previousFocus.set(latest,document.activeElement);focusable(latest)[0]?.focus();}
  });
  document.querySelectorAll('.modal').forEach(modal => observer.observe(modal,{attributes:true,attributeFilter:['style']}));
  document.addEventListener('keydown', event => {
    if (!activeModal) return;
    if (event.key === 'Escape' && !['uploadProgressModal','cropperModal'].includes(activeModal.id)) {closeModal(activeModal.id);return;}
    if (event.key !== 'Tab') return;
    const controls = focusable(activeModal), first = controls[0], last = controls.at(-1);
    if (!first) {event.preventDefault();return;}
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  });
  // Supply names to legacy controls while preserving their IDs and event handlers.
  document.querySelectorAll('input,select,textarea').forEach(input => {
    if (input.getAttribute('aria-label') || input.labels?.length) return;
    const previous = input.previousElementSibling;
    const label = previous?.tagName === 'LABEL' ? previous.textContent.trim() : input.placeholder || input.title || input.id;
    if (label) input.setAttribute('aria-label',label);
  });
})();
