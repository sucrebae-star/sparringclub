import React, { useEffect, useRef, useState } from "react";
import {
  assetRoot,
  contact,
  navigation,
  programs,
  schedule,
} from "./content.mjs";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function BookingLink({
  children = "체험 예약하기",
  className = "button",
  ...props
}) {
  return (
    <a
      className={className}
      href={contact.booking}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
      <Arrow />
      <span className="sr-only"> (카카오 예약, 새 창)</span>
    </a>
  );
}
function ExternalLink({ href, children, ...props }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <Arrow />
      <span className="sr-only"> (새 창)</span>
    </a>
  );
}
function Logo() {
  return (
    <svg
      className="academy-logo"
      viewBox="420 680 1680 1140"
      role="img"
      aria-label="복싱사관학교 공식 로고"
    >
      <image
        href={`${assetRoot}boxing-logo-original.png`}
        width="2500"
        height="2500"
      />
    </svg>
  );
}
function Photo({ name, alt, className = "", ...props }) {
  return (
    <img
      src={`${assetRoot}${name}`}
      width="1672"
      height="941"
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      {...props}
    />
  );
}
function Header() {
  const menuRef = useRef(null),
    [open, setOpen] = useState(false);
  function closeMenu(restoreFocus = false) {
    if (menuRef.current) {
      menuRef.current.open = false;
      setOpen(false);
      if (restoreFocus) menuRef.current.querySelector("summary").focus();
    }
  }
  useEffect(() => {
    const escape = (e) => {
      if (e.key === "Escape" && menuRef.current?.open) closeMenu(true);
    };
    const outside = (e) => {
      if (menuRef.current?.open && !menuRef.current.contains(e.target))
        closeMenu();
    };
    const wide = window.matchMedia("(min-width: 1200px)");
    const resize = () => {
      if (wide.matches) closeMenu();
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("click", outside);
    wide.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("click", outside);
      wide.removeEventListener("change", resize);
    };
  }, []);
  return (
    <header className="site-header">
      <div className="shell header-inner flex items-center justify-between gap-6">
        <a
          className="brand flex items-center"
          href="./"
          aria-label="복싱사관학교 효천본관 홈"
        >
          <Logo />
          <span>
            복싱사관학교 <span className="branch">효천본관</span>
          </span>
        </a>
        <nav className="desktop-nav flex items-center" aria-label="주 메뉴">
          {navigation.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <BookingLink className="button header-cta" />
        <details
          ref={menuRef}
          className="mobile-menu"
          onToggle={(e) => setOpen(e.currentTarget.open)}
        >
          <summary
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <span className="menu-icon" aria-hidden="true" />
            <span>메뉴</span>
          </summary>
          <nav
            id="mobile-navigation"
            aria-label="모바일 메뉴"
            onClick={(e) => {
              if (e.target.closest("a")) closeMenu();
            }}
          >
            {navigation.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
            <BookingLink />
          </nav>
        </details>
      </div>
    </header>
  );
}
function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <picture className="hero-photo">
        <source
          media="(max-width: 700px)"
          srcSet={`${assetRoot}hero-mobile.webp`}
          width="941"
          height="1672"
        />
        <img
          src={`${assetRoot}hero-desktop.webp`}
          width="1672"
          height="941"
          alt="붉은 조명의 체육관에서 함께 복싱과 전신 운동을 하는 콘셉트 이미지"
          fetchPriority="high"
          loading="eager"
        />
      </picture>
      <div className="shell hero-inner">
        <div className="hero-copy">
          <h1 id="hero-title">
            강해지는 하루,
            <br />
            <span>달라지는 일상.</span>
          </h1>
          <p className="hero-description">
            복싱의 기술과 기능성 트레이닝의 에너지를 하나로.
            <br className="desktop-break" /> 당신의 일상에 건강한 변화를 만드는
            복싱사관학교 효천본관.
          </p>
          <p className="english hero-motto">TRAIN STRONG. LIVE BETTER.</p>
          <div className="hero-actions flex flex-wrap gap-4">
            <a className="button button-outline" href="#programs">
              프로그램 알아보기 <span aria-hidden="true">→</span>
            </a>
            <BookingLink />
          </div>
        </div>
      </div>
    </section>
  );
}
function Philosophy() {
  return (
    <section
      id="about"
      className="philosophy light"
      aria-labelledby="about-title"
    >
      <div className="shell philosophy-grid grid items-center">
        <div className="philosophy-copy">
          <p className="eyebrow">OUR PHILOSOPHY</p>
          <h2 id="about-title">운동 그 이상의 가치</h2>
          <p>
            복싱은 단순한 운동이 아닙니다.
            <br />더 건강한 몸과 마음, 자신감과 스트레스 해소.
            <br />
            그리고 한계를 넘어서는 성장의 경험입니다.
          </p>
          <p>
            복싱사관학교 효천본관은 꾸준함을 바탕으로
            <br className="desktop-break" /> 누구나 즐겁게 운동을 이어갈 수 있는
            <br className="desktop-break" /> 환경을 만들어갑니다.
          </p>
          <p className="english philosophy-motto">
            DISCIPLINE MAKES
            <br />A STRONGER YOU.
          </p>
        </div>
        <Photo
          name="philosophy.webp"
          alt="샌드백 훈련에 집중하는 복서의 콘셉트 이미지"
          className="philosophy-photo"
        />
      </div>
    </section>
  );
}
function Programs() {
  return (
    <section
      id="programs"
      className="programs section-pad"
      aria-labelledby="programs-title"
    >
      <div className="shell">
        <div className="section-intro grid items-end">
          <div>
            <p className="eyebrow">PROGRAMS</p>
            <h2 id="programs-title">
              당신의 목적에 맞는
              <br />
              다양한 프로그램
            </h2>
          </div>
          <p>
            누구나, 언제든, 더 나은 자신을 만날 수 있습니다.
            <br />
            복싱사관학교 효천본관이 함께합니다.
          </p>
        </div>
        <div className="program-grid grid md:grid-cols-3 gap-6">
          {programs.map((program) => (
            <article key={program.id} id={program.id} className="program">
              <Photo name={program.image} alt={program.alt} />
              <h3>{program.name}</h3>
              <p>{program.description}</p>
              <details className="program-details">
                <summary>
                  수업 자세히 보기 <span aria-hidden="true">+</span>
                </summary>
                <p>{program.detail}</p>
                <a href="#schedule">
                  수업 시간표 보기 <span aria-hidden="true">→</span>
                </a>
              </details>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Morning() {
  return (
    <section className="morning photo-banner" aria-labelledby="morning-title">
      <Photo
        name="morning.webp"
        alt="아침 햇빛이 들어오는 공간에서 함께 케틀벨 운동을 하는 콘셉트 이미지"
      />
      <div className="shell banner-inner">
        <div className="banner-copy">
          <p className="eyebrow">MORNING TRAINING</p>
          <h2 id="morning-title" className="display-english">
            START STRONG.
            <br />
            OWN YOUR DAY.
          </h2>
          <p className="banner-subtitle">아침을 바꾸면 하루가 달라집니다.</p>
          <p className="accent-note">10:00 피지컬 트레이닝</p>
        </div>
      </div>
    </section>
  );
}
function Facilities() {
  return (
    <section
      id="space"
      className="facilities light"
      aria-labelledby="facilities-title"
    >
      <div className="shell flex items-center">
        <div>
          <p className="eyebrow">FACILITIES</p>
          <h2 id="facilities-title">시설 안내</h2>
        </div>
        <p>샤워실 · 탈의실 구비</p>
      </div>
    </section>
  );
}
function Schedule() {
  return (
    <section
      id="schedule"
      className="schedule section-pad"
      aria-labelledby="schedule-title"
    >
      <div className="shell schedule-grid grid">
        <div>
          <p className="eyebrow">수업 시간표</p>
          <h2 id="schedule-title" className="display-english">
            YOUR TIME.
            <br />
            YOUR TRAINING.
          </h2>
          <p className="schedule-message">
            지속하는 사람이
            <br />더 강해집니다.
          </p>
        </div>
        <table>
          <caption className="sr-only">평일 수업 시작 시간과 프로그램</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">시간</th>
              <th scope="col">프로그램</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(([time, program]) => (
              <tr key={time}>
                <th scope="row">
                  <time>{time}</time>
                </th>
                <td>{program}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="schedule-info">
          <p>
            평일 <strong>10:00~22:00</strong>
          </p>
          <p>주말 · 공휴일 휴무</p>
          <p>수업 50분 진행 / 10분 휴식</p>
          <p className="english schedule-motto">
            SAME PLACE.
            <br />A STRONGER YOU.
          </p>
        </div>
      </div>
    </section>
  );
}
function FirstVisit() {
  return (
    <section
      id="guide"
      className="first-visit light"
      aria-labelledby="guide-title"
    >
      <div className="shell first-visit-grid grid items-center">
        <div>
          <p className="eyebrow">FIRST VISIT</p>
          <h2 id="guide-title">
            첫 운동,
            <br className="tablet-break" /> 이렇게 준비하세요
          </h2>
          <p className="english">BE READY FOR YOUR FIRST ROUND</p>
        </div>
        <div className="equipment">
          <Photo
            name="first-visit.webp"
            alt="첫 운동에 필요한 실내용 운동화, 개인 줄넘기, 개인 물병"
          />
          <ul className="grid grid-cols-3">
            <li>깨끗한 실내용 운동화</li>
            <li>개인 줄넘기</li>
            <li>개인 물병</li>
          </ul>
          <p>
            상담은 각 운동시간 <strong>10분 전</strong>에 진행합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
function Reservation() {
  return (
    <section
      id="reservation"
      className="reservation photo-banner"
      aria-labelledby="reservation-title"
    >
      <Photo
        name="reservation.webp"
        alt="복싱 글러브와 링 로프를 담은 콘셉트 이미지"
      />
      <div className="shell banner-inner">
        <div className="banner-copy">
          <p className="eyebrow">체험 · 상담 예약</p>
          <h2 id="reservation-title" className="display-english">
            YOUR FIRST ROUND
            <br />
            STARTS HERE
          </h2>
          <p className="banner-subtitle">체험과 상담을 지금 시작하세요</p>
          <p className="booking-description">
            카카오 예약에서 원하는 날짜와 시간을 선택해 주세요.
            <br />
            예약 요청 후 확정 안내를 확인해 주세요.
          </p>
          <BookingLink />
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid grid">
          <a className="footer-brand" href="./">
            <Logo />
            <span>복싱사관학교 효천본관</span>
          </a>
          <div>
            <h2>상담 및 체험 예약</h2>
            <BookingLink className="footer-link" />
            <a className="footer-link" href={contact.telephone}>
              {contact.phone}
            </a>
          </div>
          <div id="visit">
            <h2>위치 및 운영시간</h2>
            <address>{contact.address}</address>
            <p>
              평일 10:00~22:00
              <br />
              주말 · 공휴일 휴무
            </p>
            <ExternalLink className="footer-link" href={contact.map}>
              네이버 지도
            </ExternalLink>
          </div>
          <div>
            <h2>스파링클럽</h2>
            <p>
              함께 더 멀리,
              <br />
              스파링으로 성장합니다.
            </p>
            <a className="footer-link" href="club.html">
              스파링클럽 바로가기 <Arrow />
            </a>
          </div>
          <div>
            <h2>SNS</h2>
            <ExternalLink className="footer-link" href={contact.instagram}>
              Instagram
            </ExternalLink>
            <ExternalLink className="footer-link" href={contact.place}>
              네이버 플레이스
            </ExternalLink>
          </div>
        </div>
        <div className="footer-bottom flex flex-wrap justify-between gap-6">
          <p className="english">
            STRONGER PEOPLE.
            <br />
            BRIGHTER TOMORROWS.
          </p>
          <div>
            <p>© 2026 복싱사관학교 효천본관</p>
            <p>
              수업·운동 사진은 실제 회원이나 시설을 촬영한 사진이 아닌 AI 콘셉트
              이미지입니다.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        본문 바로가기
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Philosophy />
        <Programs />
        <Morning />
        <Facilities />
        <Schedule />
        <FirstVisit />
        <Reservation />
      </main>
      <Footer />
      <div className="mobile-booking">
        <BookingLink />
      </div>
    </>
  );
}
