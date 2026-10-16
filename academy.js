// Keep existing shared URLs and installed-app launches on the Firebase club.
const clubPages = ['dashboard','players','gyms','board','record','post-detail','admin-dashboard'];
const initialHash = location.hash.slice(1);
const installedClub = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
if (installedClub || new URLSearchParams(location.search).has('postId') || clubPages.includes(initialHash) || initialHash.startsWith('modal-')) {
  location.replace(`club.html${location.search}${location.hash}`);
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
