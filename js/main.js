document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (navToggle && nav) {
    const closeNav = () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };
    navToggle.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });
    nav
      .querySelectorAll("a")
      .forEach((link) => link.addEventListener("click", closeNav));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  document.querySelectorAll(".jump-text").forEach((element) => {
    if (element.dataset.animated) return;
    const text = element.textContent;
    element.textContent = "";
    let charIndex = 0;
    text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) {
        element.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement("span");
      word.className = "jump-word";
      [...part].forEach((char) => {
        const span = document.createElement("span");
        span.className = "jump-char";
        span.style.setProperty("--char-index", charIndex++);
        span.style.setProperty(
          "--char-delay",
          `${charIndex * 0.1}s`,
        );
        span.style.setProperty(
          "--hover-delay",
          `${charIndex * 0.08}s`,
        );
        span.textContent = char;
        word.appendChild(span);
      });
      element.appendChild(word);
    });
    element.dataset.animated = "true";
    element.setAttribute("aria-label", text);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("animate-in", entry.isIntersecting);
      });
    },
    { threshold: 0.2 },
  );
  document
    .querySelectorAll(".pop-in, .jump-text, .animate-on-scroll")
    .forEach((el) => revealObserver.observe(el));

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("animate-in");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => modal.classList.add("animate-in")),
    );
    window.setTimeout(
      () => modal.querySelector("input, button, select, textarea, a")?.focus(),
      120,
    );
  };
  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("open", "animate-in");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };
  document
    .querySelectorAll("[data-open-modal]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        openModal(document.getElementById(button.dataset.openModal)),
      ),
    );
  document
    .querySelectorAll("[data-close-modal]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        closeModal(button.closest(".modal")),
      ),
    );
  document.querySelectorAll(".modal").forEach((modal) =>
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape")
      document.querySelectorAll(".modal.open").forEach(closeModal);
  });

  document.querySelectorAll(".tabs").forEach((tabList) => {
    const scope = tabList.closest("[data-tabs]");
    const tabs = [...tabList.querySelectorAll("[data-tab]")];

    const activateTab = (button, moveFocus = false) => {
      if (!scope || !button) return;
      const activeIndex = tabs.indexOf(button);
      tabList.style.setProperty("--active-tab", activeIndex);
      tabList.style.setProperty("--tab-count", tabs.length);

      tabs.forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.setAttribute("tabindex", active ? "0" : "-1");
      });

      scope.querySelectorAll(".tab-panel").forEach((panel) => {
        const active = panel.id === button.dataset.tab;
        panel.classList.remove("animate-in");
        panel.hidden = !active;
        if (active) {
          panel.classList.add("pop-in");
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (!panel.hidden && panel.id === button.dataset.tab)
                panel.classList.add("animate-in");
            }),
          );
        }
      });
      if (moveFocus) button.focus();
    };

    tabList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tab]");
      if (!button) return;
      activateTab(button);
    });
    tabList.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const current = tabs.indexOf(document.activeElement);
      let next = current;
      if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (current - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activateTab(tabs[next], true);
    });

    activateTab(tabList.querySelector("[data-tab].active") || tabs[0]);
  });

  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      const panel = document.getElementById(
        trigger.getAttribute("aria-controls"),
      );
      if (panel) panel.hidden = expanded;
    });
  });

  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const status = form.querySelector(".form-status");
      if (status) {
        status.textContent =
          "Thank you! Your message is ready for our team. We’ll be in touch shortly.";
        status.style.color = "#2E8C87";
      }
      form.reset();
    });
  });

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Grab all forms with this class
  const ajaxForms = document.querySelectorAll('.web3-ajax-form');
  const modal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('close-modal');

  // Loop through each form and attach the interceptor
  ajaxForms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault(); // Kill default redirect

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        });

        if (response.status === 200) {
          modal.style.display = 'flex'; // Pop the shared modal
          form.reset(); // Wipe the specific form that was submitted
        } else {
          console.error('API rejected the submission.');
        }
      } catch (error) {
        console.error('Network routing failed:', error);
      } finally {
        // Restore the specific button's state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  });

  // Modal Close Logic
  closeModalBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (modal && e.target === modal) {
      modal.style.display = 'none';
    }
  });
});


/* ==========================================================================
     PROPHETIC KIDS: INTERACTIVE NATIVE VIDEO TRAILER (Bug Fixes)
     ========================================================================== */
  const nativeVideoPlayer = document.getElementById('animation-video-player');

  if (nativeVideoPlayer) {
    // 1. Viewport Observer: Handle Autoplay (muted if necessary)
    // Browsers forbid unmuted autoplay on viewport entry without prior interaction.
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Attempt to play with sound first
          nativeVideoPlayer.play().catch(error => {
            console.warn("Unmuted autoplay blocked by browser. Continuing muted fallback.", error);
            // If browser blocks unmuted play, we must mute it to allow any playback
            nativeVideoPlayer.muted = true;
            nativeVideoPlayer.play();
          });
        } else {
          // Pause when scrolling out to save battery/bandwidth
          nativeVideoPlayer.pause();
        }
      });
    }, { 
      threshold: 0.4 // Triggers when 40% of the video is visible
    });

    videoObserver.observe(nativeVideoPlayer);

    // 2. Interaction Listener: UNMUTE ONLY (Fixes Pause/Resume Glitch)
    const videoContainer = nativeVideoPlayer.closest('.video-container');
    if (videoContainer) {
      videoContainer.addEventListener('click', (event) => {
        // BUG FIX: Since the video has HTML5 'controls' enabled, the BROWSER 
        // natively handles toggling play/pause when tapping the video area [cite: 1].
        // Our JS listener must ONLY ensure the video is UNMUTED upon this user 
        // interaction, which browsers permit. We no longer force play/pause in JS [cite: 1].
        nativeVideoPlayer.muted = false;
        
        // Let native controls handle the play/pause state naturally [cite: 1].
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
  const countdownWrapper = document.querySelector('.countdown-wrapper');
  
  if (countdownWrapper) {
    // Grab the target date from the HTML attribute
    const targetDateString = countdownWrapper.getAttribute('data-target-date');
    const countDownDate = new Date(targetDateString).getTime();

    // Get DOM elements
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    // Update the count down every 1 second
    const countdownTimer = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      // Time calculations
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Output the result and pad single digits with a zero
      if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
      if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

      // If the countdown is finished, clear interval and show zeroes or a message
      if (distance < 0) {
        clearInterval(countdownTimer);
        if (daysEl) daysEl.textContent = "00";
        if (hoursEl) hoursEl.textContent = "00";
        if (minutesEl) minutesEl.textContent = "00";
        if (secondsEl) secondsEl.textContent = "00";
        
        // Optional: Trigger an event or change CTA text when live
        const heroTitle = document.querySelector('.premiere-hero h1');
        if (heroTitle) heroTitle.textContent = "We Are Live.";
      }
    }, 1000);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const multiStepForms = document.querySelectorAll('.multi-step-form');
  
  multiStepForms.forEach(form => {
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const nextBtns = form.querySelectorAll('.btn-next');
    const prevBtns = form.querySelectorAll('.btn-prev');
    
    // Looks for the step indicator (e.g., "Step 1 of 4")
    const stepIndicator = form.closest('.modal-dialog')?.querySelector('#step-indicator, .step-indicator');
    
    let currentStep = 0;

    // 1. Handle "Next" Button & Validation
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStepEl = steps[currentStep];
        const inputs = Array.from(currentStepEl.querySelectorAll('input, select, textarea'));
        
        let isValid = true;
        for (let input of inputs) {
          if (!input.checkValidity()) {
            input.reportValidity(); // Triggers native browser warning
            isValid = false;
            break; 
          }
        }

        if (isValid) {
          steps[currentStep].classList.remove('active');
          currentStep++;
          steps[currentStep].classList.add('active');
          if (stepIndicator) stepIndicator.textContent = `Step ${currentStep + 1} of ${steps.length}`;
          
          const modalDialog = currentStepEl.closest('.modal-dialog');
          if (modalDialog) modalDialog.scrollTop = 0;
        }
      });
    });

    // 2. Handle "Back" Button
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        steps[currentStep].classList.remove('active');
        currentStep--;
        steps[currentStep].classList.add('active');
        if (stepIndicator) stepIndicator.textContent = `Step ${currentStep + 1} of ${steps.length}`;
      });
    });

    // 3. Handle Web3Forms AJAX Submission & Custom Success State
    // 3. Handle Web3Forms AJAX Submission & Custom Success State
    form.addEventListener('submit', function(e) {
      e.preventDefault(); // STOPS the default redirect
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(form);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json' // THIS IS THE MAGIC FIX
        },
        body: formData
      })
      .then(async (response) => {
        const json = await response.json(); // Read the exact response from Web3Forms

        if (response.status == 200) {
          // Hide the form temporarily
          form.style.display = 'none';
          
          // Create and inject a sleek success message
          const successMsg = document.createElement('div');
          successMsg.className = 'success-message';
          successMsg.style.cssText = 'text-align: center; padding: 3rem 1rem;';
          successMsg.innerHTML = `
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; background: rgba(255, 184, 0, 0.1); margin-bottom: 1.5rem;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 style="color: var(--text-dark); margin-bottom: 0.5rem; font-size: 2rem; font-weight: 800; letter-spacing: -0.02em;">Registration Complete</h3>
            <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.5; max-width: 400px; margin: 0 auto;">
              Your details have been securely received. Welcome to the community we will be in touch shortly.
            </p>
          `;
          form.parentNode.insertBefore(successMsg, form);

          // Wait 3.5 seconds, then reset everything and close modal
          setTimeout(() => {
            form.reset();
            steps.forEach(s => s.classList.remove('active'));
            currentStep = 0;
            steps[0].classList.add('active');
            if (stepIndicator) stepIndicator.textContent = `Step 1 of ${steps.length}`;
            
            successMsg.remove();
            form.style.display = 'block';
            
            // Close the modal
            const modal = form.closest('.modal');
            if (modal) {
              modal.classList.remove('open');
              document.body.style.overflow = ''; // Re-enable background scrolling
            }
          }, 3500);

        } else {
          // If Web3Forms rejects it, tell us exactly WHY (e.g. "Invalid Access Key")
          alert(json.message || "Something went wrong. Please try again.");
        }
      })
      .catch(error => {
        console.error(error);
        alert("Network error. Please check your connection");
      })
      .finally(() => {
        // ALWAYS put the button back to normal, even if it fails
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Target the specific video in the lore section
  const loreVideo = document.querySelector('.lore-section .film-frame video'); 
  const soundToggle = document.getElementById('lore-sound-toggle');
  const soundIcon = document.getElementById('lore-sound-icon');
  const soundText = document.getElementById('lore-sound-text');

  const mutedSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
  
  const unmutedSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;

  if (loreVideo && soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (loreVideo.muted) {
        loreVideo.muted = false;
        soundIcon.innerHTML = unmutedSVG;
        soundText.textContent = 'Mute';
      } else {
        loreVideo.muted = true;
        soundIcon.innerHTML = mutedSVG;
        soundText.textContent = 'Unmute';
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     COUNTDOWN LOGIC
     ========================================================================== */
  // CHANGE THIS TO YOUR ACTUAL PREMIERE DATE (Format: YYYY-MM-DDTHH:MM:SS)
  const premiereDate = '2026-11-20T18:00:00'; 
  
  function initCountdown(containerId, targetDateStr) {
    const container = document.getElementById(containerId);
    if (!container) return; // Exit if the timer isn't on this page

    const targetDate = new Date(targetDateStr).getTime();
    const daysEl = container.querySelector('.cd-days');
    const hoursEl = container.querySelector('.cd-hours');
    const minsEl = container.querySelector('.cd-mins');
    const secsEl = container.querySelector('.cd-secs');

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // If the countdown is over
      if (distance < 0) {
        clearInterval(interval);
        container.innerHTML = '<h3 style="color: var(--primary);">The Premiere is Live!</h3>';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // .padStart(2, '0') forces it to show '09' instead of '9'
      daysEl.textContent = days.toString().padStart(2, '0');
      hoursEl.textContent = hours.toString().padStart(2, '0');
      minsEl.textContent = minutes.toString().padStart(2, '0');
      secsEl.textContent = seconds.toString().padStart(2, '0');
    };

    updateTimer(); // Run once immediately so it doesn't flash '00'
    const interval = setInterval(updateTimer, 1000);
  }

  // Fire up the timers (It checks if they exist, so it won't break if one is missing)
  initCountdown('premiere-countdown', premiereDate);
  initCountdown('home-countdown', premiereDate);

  /* ==========================================================================
     SMART PROMO MODAL LOGIC (Home Page)
     ========================================================================== */
  const promoModal = document.getElementById('promo-modal');
  
  // Only trigger if the modal exists AND the user hasn't closed it this session
  if (promoModal && !sessionStorage.getItem('promoDismissed')) {
    
    // Wait 3 seconds, then pop it
    setTimeout(() => {
      promoModal.classList.add('open');
      promoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }, 3000);

    // Handle closing the promo
    const closeBtn = promoModal.querySelector('[data-close-promo]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        promoModal.classList.remove('open');
        promoModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; 
        
        // Save to sessionStorage so it doesn't bother them again
        sessionStorage.setItem('promoDismissed', 'true');
      });
    }
  }
});


/* ==========================================================================
     SMART PROMO MODAL LOGIC (Home Page)
     ========================================================================== */
  const promoModal = document.getElementById('promo-modal');
  
  if (promoModal && !sessionStorage.getItem('promoDismissed')) {
    
    // Slide in after 3 seconds
    setTimeout(() => {
      promoModal.classList.add('open');
      promoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; 
    }, 3000);

    // Bulletproof close logic: handles the X button AND clicking the dark background
    promoModal.addEventListener('click', (e) => {
      // Check if they clicked the 'X' button or the dark blurred background
      if (e.target.closest('[data-close-modal]') || e.target === promoModal) {
        promoModal.classList.remove('open');
        promoModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // FORCE unlocks the page scrolling
        
        sessionStorage.setItem('promoDismissed', 'true');
      }
    });
  }

  /* ==========================================================================
     GLOBAL MODAL CLOSE HANDLER (Fixes the Scroll Freeze)
     ========================================================================== */
  document.addEventListener('click', (e) => {
    // 1. Check if they clicked an 'X' close button
    const closeBtn = e.target.closest('[data-close-modal]');
    
    // 2. Check if they clicked the dark transparent background of an open modal
    const clickedBackdrop = e.target.classList.contains('modal') && e.target.classList.contains('open');

    // If either happened, shut it down and unlock the screen
    if (closeBtn || clickedBackdrop) {
      // Figure out exactly which modal needs to close
      const modalToClose = closeBtn ? closeBtn.closest('.modal') : e.target;
      
      if (modalToClose) {
        // Hide the modal
        modalToClose.classList.remove('open');
        modalToClose.setAttribute('aria-hidden', 'true');
        
        // THE MAGIC KEY: Force the body to allow scrolling again
        document.body.style.overflow = ''; 

        // If it was the promo modal they just closed, tell sessionStorage to leave them alone
        if (modalToClose.id === 'promo-modal') {
          sessionStorage.setItem('promoDismissed', 'true');
        }
      }
    }
  });