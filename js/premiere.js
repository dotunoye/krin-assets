document.addEventListener('DOMContentLoaded', () => {
  
  // 1. SCROLL REVEAL ANIMATIONS (The "Movie Trailer" Pacing)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealOptions = {
    root: null,
    threshold: 0.15, // Triggers when 15% of the element is visible
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // 2. MODAL LOGIC FOR TEASER
  const openBtns = document.querySelectorAll('[data-open-modal]');
  const closeBtns = document.querySelectorAll('[data-close-modal]');
  const modal = document.getElementById('teaser-modal');

  if (modal) {
    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        
        // If you add an actual <video> or <iframe> later, 
        // you would write code here to pause it when the modal closes.
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("teaser-modal");
  const open = document.querySelector("[data-open-teaser]");
  const close = document.querySelector("[data-close-teaser]");
  const closeModal = () => {
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };
  open?.addEventListener("click", () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    close?.focus();
  });
  close?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.14 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => observer.observe(element));
});
