import React, { useEffect, useRef, useState } from 'react';
import { curricula } from './curriculum.mjs';
import { programs, contact } from './content.mjs';
import LessonVideo from './LessonVideo.jsx';

const motion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function Lesson({ program }) {
  const lesson = curricula[program.id];
  const [index, setIndex] = useState(0);
  const track = useRef(null);
  const indexRef = useRef(0);
  const current = lesson.parts[index];

  function select(next) {
    const rail = track.current;
    const slide = rail?.children[next];
    if (!slide) return;
    rail.scrollTo({ left: slide.offsetLeft - rail.children[0].offsetLeft, behavior: motion() });
  }
  function syncIndex() {
    const rail = track.current;
    const step = rail.children[1].offsetLeft - rail.children[0].offsetLeft;
    const next = Math.min(lesson.parts.length - 1, Math.max(0, Math.round(rail.scrollLeft / step)));
    indexRef.current = next;
    setIndex(next);
  }
  // Preserve the selected exercise across changes in available screen width.
  useEffect(() => {
    const rail = track.current;
    let width = rail.clientWidth;
    const observer = new ResizeObserver(() => {
      if (width === rail.clientWidth) return;
      width = rail.clientWidth;
      const slide = rail.children[indexRef.current];
      rail.scrollTo({ left: slide.offsetLeft - rail.children[0].offsetLeft, behavior: 'instant' });
    });
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  return <div className="curriculum-lesson">
    <div className="curriculum-intro">
      <h3 id="curriculum-title">{program.name}</h3>
      <p className="curriculum-times"><span>평일</span> {lesson.times.join(' · ')}</p>
      <p className="curriculum-description">{lesson.intro}</p>
    </div>
    <div className="curriculum-exercises" role="group" aria-label={`${program.name} 운동 파트 선택`}>
      {lesson.parts.map((part, i) => <button key={part.image} type="button" aria-pressed={i === index}
        aria-controls="curriculum-carousel" onClick={() => select(i)}>
        <span>{part.title}{part.video && <small>영상</small>}</span><span aria-hidden="true">↗</span>
      </button>)}
    </div>
    <div className="curriculum-visual">
      <div id="curriculum-carousel" className="curriculum-track" ref={track} onScroll={syncIndex}
        role="region" aria-roledescription="캐러셀" aria-label={`${program.name} 운동 장면`} tabIndex={0}
        onKeyDown={e => {
          let next;
          if (e.key === 'ArrowRight') next = Math.min(index + 1, lesson.parts.length - 1);
          if (e.key === 'ArrowLeft') next = Math.max(index - 1, 0);
          if (e.key === 'Home') next = 0;
          if (e.key === 'End') next = lesson.parts.length - 1;
          if (next !== undefined) { e.preventDefault(); select(next); }
        }}>
        {lesson.parts.map((part, i) => <figure key={part.image} className="curriculum-slide" role="group"
          aria-roledescription="슬라이드" aria-label={`${i + 1} / ${lesson.parts.length}: ${part.title}`} aria-hidden={i !== index}>
          {part.video && i === index ? <LessonVideo key={part.video} part={part} /> :
            <img src={part.image} width="1672" height="941" loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
              alt={part.video ? `${program.name} 실제 수업 영상 미리보기` : `${program.name} ${part.title} 수업을 표현한 AI 콘셉트 이미지`} />}

        </figure>)}
      </div>
      <div className="curriculum-caption-row">
        <div className="curriculum-caption" aria-live="polite" aria-atomic="true">
          <h4>{current.title}</h4><p>{current.description}</p>
        </div>
        <div className="curriculum-controls" role="group" aria-label="운동 장면 이동">
          <button type="button" aria-label="이전 운동 장면" disabled={index === 0} onClick={() => select(index - 1)}>←</button>
          <span aria-hidden="true">{index + 1} / {lesson.parts.length}</span>
          <button type="button" aria-label="다음 운동 장면" disabled={index === lesson.parts.length - 1} onClick={() => select(index + 1)}>→</button>
        </div>
      </div>
    </div>
    <div className="curriculum-footer">
      <div><p className="curriculum-duration">수업 50분 진행 · 10분 휴식</p><p>주말 · 공휴일 휴무</p></div>
      <div className="curriculum-booking">
        <a className="button" href={contact.booking} target="_blank" rel="noopener noreferrer">상담예약 <span aria-hidden="true">↗</span><span className="sr-only"> (카카오 예약, 새 창)</span></a>
        <p>상담은 수업 시작 10분 전에 진행합니다.</p>
      </div>
    </div>
    <p className="curriculum-disclaimer">영상은 실제 수업을 편집한 장면이며, 운동 파트별 사진은 이해를 돕기 위한 AI 콘셉트 이미지입니다.</p>
  </div>;
}

export default function Curriculum({ selected, onSelect, onClose, panelRef }) {
  return <div id="curriculum-details" className="curriculum-panel" ref={panelRef} hidden={!selected}
    role="region" aria-labelledby={selected ? 'curriculum-title' : undefined} tabIndex={-1}
    onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}>
    {selected && <>
      <div className="curriculum-toolbar">
        <div className="curriculum-programs" role="group" aria-label="상세보기 프로그램 선택">
          {programs.map(program => <button key={program.id} type="button" aria-pressed={program.id === selected}
            onClick={() => onSelect(program.id)}>{program.name}</button>)}
        </div>
        <button type="button" className="curriculum-close" onClick={onClose}>상세보기 닫기 <span aria-hidden="true">×</span></button>
      </div>
      <Lesson key={selected} program={programs.find(program => program.id === selected)} />
    </>}
  </div>;
}
