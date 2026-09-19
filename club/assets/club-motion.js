/* La Perle: progressive motion, with native scrolling and visible content by default. */
(() => {
  const { gsap, ScrollTrigger } = window;
  const club = document.getElementById('club');
  if (!gsap || !ScrollTrigger || !club) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const seen = new WeakSet();
    const triggers = new Map();
    const tweens = new Set();
    let frame = 0;
    const selectors = '#member, #praemienBox, #zielBox, #gewinneBox, #adventBox, #empfBox, #fbBox';
    function reveal(element) {
      if (seen.has(element)) return;
      seen.add(element);
      if (element.contains(document.activeElement)) return;
      const tween = gsap.from(element, {
        y: element.id === 'member' ? 14 : 10,
        opacity: 0.55, duration: 0.65, ease: 'power2.out',
        clearProps: 'transform,opacity',
        onComplete() { tweens.delete(this); }
      });
      tweens.add(tween);
    }
    function sync() {
      frame = 0;
      const active = !club.classList.contains('hide');
      club.querySelectorAll(selectors).forEach(element => {
        const visible = active && !element.classList.contains('hide');
        if (!visible && triggers.has(element)) {
          triggers.get(element).kill(); triggers.delete(element);
        }
        if (!visible || seen.has(element) || triggers.has(element)) return;
        triggers.set(element, ScrollTrigger.create({
          trigger: element, start: 'top 94%', once: true,
          onEnter: () => reveal(element)
        }));
      });
      ScrollTrigger.refresh();
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new MutationObserver(schedule);
    observer.observe(club, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    const focus = event => {
      for (const tween of tweens) {
        if (tween.targets().some(element => element.contains(event.target))) tween.progress(1);
      }
    };
    club.addEventListener('focusin', focus);
    schedule();
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      club.removeEventListener('focusin', focus);
      triggers.forEach(trigger => trigger.kill());
      tweens.forEach(tween => tween.revert());
    };
  });
})();
