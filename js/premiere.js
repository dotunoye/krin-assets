// document.addEventListener('DOMContentLoaded', () => {
//   const pill = document.querySelector('.countdown-pill');
  
//   if (pill) {
//     const targetDateString = pill.getAttribute('data-target-date');
//     const countDownDate = new Date(targetDateString).getTime();

//     const daysEl = document.getElementById('cd-days');
//     const hoursEl = document.getElementById('cd-hours');
//     const minutesEl = document.getElementById('cd-minutes');
//     const secondsEl = document.getElementById('cd-seconds');

//     const timer = setInterval(() => {
//       const distance = countDownDate - new Date().getTime();

//       if (distance < 0) {
//         clearInterval(timer);
//         [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => { if(el) el.textContent = "00"; });
//         return;
//       }

//       const d = Math.floor(distance / (1000 * 60 * 60 * 24));
//       const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//       const s = Math.floor((distance % (1000 * 60)) / 1000);

//       if(daysEl) daysEl.textContent = d.toString().padStart(2, '0');
//       if(hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
//       if(minutesEl) minutesEl.textContent = m.toString().padStart(2, '0');
//       if(secondsEl) secondsEl.textContent = s.toString().padStart(2, '0');
//     }, 1000);
//   }
// });



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