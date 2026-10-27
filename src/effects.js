export const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Reveal once, then release the observer. Content stays visible without JS. */
export function setupReveals() {
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      observer.disconnect();
      document.documentElement.classList.remove('motion-ready');
    }
  });
}

export function createCelebration(layer) {
  let cleanup;
  const clear = () => {
    window.clearTimeout(cleanup);
    layer.replaceChildren();
  };
  function celebrate() {
    clear();
    if (motionPreference.matches) return;
    const fragment = document.createDocumentFragment();
    const colours = ['#a86568', '#742e3b', '#d0a56e', '#d3a09c'];
    for (let index = 0; index < 38; index += 1) {
      const heart = document.createElement('span');
      heart.className = 'confetti-piece';
      heart.textContent = index % 3 ? '♡' : '✦';
      heart.style.setProperty('--x', `${Math.random() * 100}%`);
      heart.style.setProperty('--size', `${12 + Math.random() * 15}px`);
      heart.style.setProperty('--color', colours[index % colours.length]);
      heart.style.setProperty('--duration', `${2.8 + Math.random() * 1.6}s`);
      heart.style.setProperty('--delay', `${Math.random() * 0.6}s`);
      heart.style.setProperty('--drift', `${Math.random() * 150 - 75}px`);
      heart.style.setProperty('--spin', `${Math.random() * 240 - 120}deg`);
      fragment.append(heart);
    }
    layer.append(fragment);
    cleanup = window.setTimeout(clear, 5100);
  }
  motionPreference.addEventListener('change', (event) => { if (event.matches) clear(); });
  return { celebrate, clear };
}
