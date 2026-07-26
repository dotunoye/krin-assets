document.addEventListener('DOMContentLoaded', () => {
  const sections = [...document.querySelectorAll('section[data-mascot-msg]')];
  if (!sections.length) return;

  const companion = document.createElement('aside');
  companion.className = 'mascot-companion side-left';
  companion.setAttribute('aria-live', 'polite');
  companion.innerHTML = `
    <img class="mascot-image" alt="" aria-hidden="true">
    <div class="mascot-bubble"></div>
    <button class="mascot-toggle" type="button" aria-label="Minimize Krin the Dove" title="Minimize Krin">−</button>`;
  document.body.appendChild(companion);

  const image = companion.querySelector('.mascot-image');
  const bubble = companion.querySelector('.mascot-bubble');
  const toggle = companion.querySelector('.mascot-toggle');
  let activeSection = null;

  const update = section => {
    if (!section || section === activeSection) return;
    activeSection = section;
    companion.classList.add('is-changing');
    window.setTimeout(() => {
      companion.classList.toggle('side-right', section.dataset.mascotSide === 'right');
      companion.classList.toggle('side-left', section.dataset.mascotSide !== 'right');
      bubble.textContent = section.dataset.mascotMsg;
      image.src = section.dataset.mascotImg || 'assets/mascot/krin-waving.png';
      companion.classList.remove('is-changing');
    }, 160);
  };
  update(sections[0]);

  const visibility = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => visibility.set(entry.target, entry.intersectionRatio));
    const best = [...visibility.entries()].sort((a,b) => b[1] - a[1])[0];
    if (best && best[1] > 0) update(best[0]);
  }, { threshold: [0,.15,.3,.5,.7], rootMargin: '-18% 0px -30%' });
  sections.forEach(section => observer.observe(section));

  toggle.addEventListener('click', () => {
    const minimized = companion.classList.toggle('minimized');
    toggle.textContent = minimized ? '+' : '−';
    toggle.setAttribute('aria-label', minimized ? 'Show Krin the Dove' : 'Minimize Krin the Dove');
  });
});
