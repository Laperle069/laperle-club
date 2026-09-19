/* Shared celebration choreography; business events remain owned by each page. */
(() => {
  if (!window.gsap) return;
  const gsap = window.gsap;
  const active = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function stop(root) {
    const state = active.get(root);
    if (!state) return;
    state.timeline.kill();
    state.context.revert();
    state.shine?.remove();
    root.classList.remove('mp-gsap');
    active.delete(root);
  }
  function play(root) {
    stop(root);
    if (!root || reduced.matches || document.hidden) return;
    root.classList.add('mp-gsap');
    const kind = root.dataset.kind;
    const compact = root.classList.contains('mp-compact');
    const reward = root.querySelector('.mp-reward:not([hidden]):not(.hide)');
    let shine;
    if (reward) {
      shine = document.createElement('span'); shine.className = 'mp-gsap-shine';
      shine.setAttribute('aria-hidden', 'true'); reward.appendChild(shine);
    }
    let timeline;
    const context = gsap.context(() => {
      const q = selector => [...root.querySelectorAll(selector)];
      timeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });
      timeline.from(q('.mp-pearl'), { y: kind === 'redeem' ? 0 : 24, scale: kind === 'redeem' ? 1.15 : 0.78, opacity: 0.4 }, 0)
        .from(q('.mp-orbit'), { scale: 0.65, opacity: 0, duration: 0.95 }, 0.08)
        .from(q('.mp-halo'), { scale: 0.7, opacity: 0, duration: 1.1 }, 0.05)
        .from(q('.mp-copy'), { y: 8, opacity: 0.45, duration: 0.55 }, 0.14);
      if (kind === 'unlock' || kind === 'both') {
        timeline.fromTo(q('.mp-left'), { x: 0, rotation: 0, opacity: 0.8 }, { x: -48, rotation: -32, opacity: 0, duration: 0.85 }, 0.05)
          .fromTo(q('.mp-right'), { x: 0, rotation: 0, opacity: 0.8 }, { x: 48, rotation: 32, opacity: 0, duration: 0.85 }, 0.05);
      }
      if (kind === 'redeem') timeline.from(q('.mp-check'), { scale: 0.5, opacity: 0, duration: 0.45, ease: 'back.out(1.5)' }, 0.2);
      if (reward) timeline.from(reward, { y: 12, scale: 0.97, opacity: 0.4 }, kind === 'both' ? 0.5 : 0.25);
      if (shine) timeline.fromTo(shine, { xPercent: -120 }, { xPercent: 120, duration: 0.95, ease: 'power1.inOut' }, kind === 'both' ? 0.65 : 0.4);
      if (kind !== 'redeem') q('.mp-dust i').forEach((dot, index) => {
        const angle = index / 12 * Math.PI * 2;
        timeline.fromTo(dot, { x: 0, y: 0, scale: 0.5, opacity: 0 }, {
          keyframes: [{ opacity: 0.65, duration: 0.15 }, { x: Math.cos(angle) * 90, y: Math.sin(angle) * 75, scale: 0.2, opacity: 0, duration: 0.7 }]
        }, 0.18 + (index % 3) * 0.04);
      });
      if (compact) timeline.duration(0.65);
    }, root);
    active.set(root, { timeline, context, shine });
  }
  window.LaPerleCelebration = { play, stop };
  const settle = () => { for (const root of [...active.keys()]) { root.classList.remove('mp-play'); stop(root); } };
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  reduced.addEventListener('change', () => { if (reduced.matches) settle(); });
})();
