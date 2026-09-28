document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('teaser-modal');
  const open = document.querySelector('[data-open-teaser]');
  const close = document.querySelector('[data-close-teaser]');
  const closeModal = () => { modal?.classList.remove('open'); modal?.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); };
  open?.addEventListener('click', () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); close?.focus(); });
  close?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .14 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
});
