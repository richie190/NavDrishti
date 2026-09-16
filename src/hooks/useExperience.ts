import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { MotionState } from '../data/mission';

gsap.registerPlugin(ScrollTrigger);

export function useExperience(ready: boolean) {
  const [active, setActive] = useState(0);
  const [tour, setTour] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const motion = useRef<MotionState>({ chapter: 0, reduced, pointer: { x: 0, y: 0 }, controls: { icebergs: true, routes: true, seaIce: true, orbit: false, zoom: 1, focus: false }, scenario: 'single', simulation: 0 });
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    motion.current.reduced = reduced;
    if (!ready) return;
    const smooth = new Lenis({ lerp: 0.075, smoothWheel: !reduced, syncTouch: false });
    lenis.current = smooth;
    const tick = (time: number) => smooth.raf(time * 1000);
    smooth.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    const sections = [...document.querySelectorAll<HTMLElement>('[data-chapter]')];
    let offsets = sections.map(section => section.offsetTop);
    const refresh = () => { offsets = sections.map(section => section.offsetTop); };
    ScrollTrigger.addEventListener('refreshInit', refresh);
    const driver = { scroll: window.scrollY };
    const animation = gsap.to(driver, {
      scroll: () => document.documentElement.scrollHeight - window.innerHeight,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: reduced ? true : 0.65, invalidateOnRefresh: true },
      onUpdate: () => {
        const y = driver.scroll;
        let index = 0;
        while (index < offsets.length - 1 && y >= offsets[index + 1]) index++;
        const next = offsets[index + 1] ?? document.documentElement.scrollHeight;
        motion.current.chapter = index + Math.min(1, (y - offsets[index]) / Math.max(1, next - offsets[index]));
        setActive(previous => previous === index ? previous : index);
        document.documentElement.style.setProperty('--journey', String(y / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
      },
    });
    const context = gsap.context(() => {
      sections.slice(1).forEach(section => {
        if (section.id === 'capabilities') {
          section.querySelectorAll('[data-reveal]').forEach(element => {
            gsap.fromTo(element, { y: reduced ? 0 : 35, opacity: 0 }, { y: 0, opacity: 1, duration: reduced ? .01 : 1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 93%', toggleActions: 'play none none reverse' } });
          });
          return;
        }
        gsap.fromTo(section.querySelectorAll('[data-reveal]'), { y: reduced ? 0 : 50, opacity: 0 }, {
          y: 0, opacity: 1, stagger: 0.09, duration: reduced ? 0.01 : 1.05, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 76%', toggleActions: 'play none none reverse' },
        });
      });
      if (!reduced) gsap.fromTo('.command-preview', { rotateX: 16, rotateY: -19, rotateZ: 3, y: 60 }, { rotateX: 0, rotateY: 0, rotateZ: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '.command-preview-stage', start: 'top 95%', end: 'bottom 55%', scrub: 1 } });
    });
    const pointer = (event: PointerEvent) => { motion.current.pointer = { x: event.clientX / innerWidth * 2 - 1, y: event.clientY / innerHeight * 2 - 1 }; };
    window.addEventListener('pointermove', pointer, { passive: true });
    ScrollTrigger.refresh();
    return () => {
      context.revert(); animation.scrollTrigger?.kill(); animation.kill();
      ScrollTrigger.removeEventListener('refreshInit', refresh);
      gsap.ticker.remove(tick); smooth.destroy(); lenis.current = null;
      window.removeEventListener('pointermove', pointer);
    };
  }, [ready, reduced]);

  useEffect(() => {
    if (!tour || !ready) return;
    const stop = () => setTour(false);
    const step = (_time: number, delta: number) => {
      window.scrollBy(0, delta * 0.13);
      if (scrollY >= document.documentElement.scrollHeight - innerHeight - 2) stop();
    };
    gsap.ticker.add(step);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    return () => { gsap.ticker.remove(step); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', stop); };
  }, [tour, ready]);

  const go = (id: string) => {
    setTour(false);
    const target = document.getElementById(id);
    if (target) {
      if (lenis.current) lenis.current.scrollTo(target, { duration: reduced ? 0 : 1.8 });
      else target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
    }
  };
  return { motion, active, tour, setTour, reduced, go, lenis };
}
