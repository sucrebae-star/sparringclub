// 이미지 로딩을 실행하지 않는 URL 참조표입니다.
export const academyAssets = Object.freeze({
  heroDesktop: new URL("./hero-desktop.webp", import.meta.url).href,
  heroMobile: new URL("./hero-mobile.webp", import.meta.url).href,
  philosophy: new URL("./philosophy.webp", import.meta.url).href,
  physical: new URL("./program-physical.webp", import.meta.url).href,
  boxing: new URL("./program-boxing.webp", import.meta.url).href,
  kids: new URL("./program-kids.webp", import.meta.url).href,
  morning: new URL("./morning.webp", import.meta.url).href,
  firstVisit: new URL("./first-visit.webp", import.meta.url).href,
  reservation: new URL("./reservation.webp", import.meta.url).href,
  logo: new URL("./boxing-logo-original.png", import.meta.url).href
});
export const academyFacilities = Object.freeze({ text: "샤워실 · 탈의실 구비", image: null });
