import React, { useEffect, useRef, useState } from 'react';

// Only the selected slide mounts a player. Offscreen and hidden-tab playback pauses.
export default function LessonVideo({ part }) {
  const player = useRef(null);
  const visible = useRef(false);
  const wantsPlayback = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = player.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    wantsPlayback.current = !reduced.matches;
    const sync = () => {
      if (visible.current && !document.hidden && wantsPlayback.current) {
        video.play().catch(() => setPlaying(false));
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting && entry.intersectionRatio >= .5;
      sync();
    }, { threshold: [0, .5] });
    const motionChange = () => {
      if (reduced.matches) wantsPlayback.current = false;
      sync();
    };
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', motionChange);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', motionChange);
      video.pause();
    };
  }, []);
  function toggle() {
    const video = player.current;
    if (video.paused) {
      wantsPlayback.current = true;
      video.play().catch(() => setPlaying(false));
    } else {
      wantsPlayback.current = false;
      video.pause();
    }
  }
  return <div className="lesson-video">
    <video ref={player} src={part.video} poster={part.image} width="1280" height="720"
      muted playsInline loop controls preload="none" aria-label={`${part.title} — 무음 수업 영상`}
      onKeyDown={e => e.stopPropagation()}
      onPlay={() => { wantsPlayback.current = true; setPlaying(true); }}
      onPause={() => {
        if (visible.current && !document.hidden) wantsPlayback.current = false;
        setPlaying(false);
      }}
      onError={() => { setFailed(true); setPlaying(false); }} />
    <div className="lesson-video-actions">
      <span>{failed ? '영상을 불러오지 못했습니다.' : '실제 수업 영상 · 15초 · 무음'}</span>
      {!failed && <button type="button" onClick={toggle} aria-label={playing ? '수업 영상 일시정지' : '수업 영상 재생'}>{playing ? '일시정지' : '영상 재생'} <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span></button>}
      {failed && <a href={part.video} target="_blank" rel="noopener noreferrer">영상 직접 열기</a>}
    </div>
  </div>;
}
