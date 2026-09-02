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
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const gridItems = document.querySelectorAll('.reveal-item');
  const modal = document.getElementById('scatter-modal');
  const modalImg = document.getElementById('scatter-modal-img');
  const backdrop = document.getElementById('modal-backdrop');

  // The Scroll Reveal Logic
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Stop observing once revealed so it doesn't animate repeatedly
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -10% 0px', // Triggers slightly before hitting the bottom
    threshold: 0.1
  });

  gridItems.forEach(item => revealObserver.observe(item));

  // The Modal Logic
  let isModalOpen = false;

  document.getElementById('gallery-grid').addEventListener('click', (e) => {
    const item = e.target.closest('.reveal-item');
    if (!item) return;

    modalImg.src = item.dataset.fullSrc;
    modal.hidden = false;
    isModalOpen = true;
  });

  const closeModal = () => {
    if (!isModalOpen) return;
    modal.hidden = true;
    isModalOpen = false;
    modalImg.src = ''; 
  };

  backdrop.addEventListener('click', closeModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});

const modal = document.getElementById('krin-modal');
  const modalImg = document.getElementById('krin-modal-img');
  const backdrop = document.getElementById('krin-modal-backdrop');

  // 1. Open the Modal
  document.getElementById('gallery-grid').addEventListener('click', (e) => {
    // Only trigger if they clicked an actual grid item
    const item = e.target.closest('.reveal-item');
    if (!item) return;

    // Pull the high-res image source from the data attribute
    modalImg.src = item.dataset.fullSrc;
    modal.hidden = false;
  });

  // 2. Close on Backdrop Click
  backdrop.addEventListener('click', () => {
    modal.hidden = true;
    modalImg.src = ''; // Clear the src so the previous image doesn't flash next time
  });

  // 3. Close on Escape Key (Standard UX best practice)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      modal.hidden = true;
      modalImg.src = '';
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
  let cart = JSON.parse(localStorage.getItem('krinCart')) || [];
  
  const badge = document.getElementById('cart-badge');
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const itemsContainer = document.getElementById('cart-items-container');
  const totalEl = document.getElementById('cart-total-price');
  
  // 1. Update the little red bubble
  const updateBadge = () => {
    badge.textContent = cart.length;
    badge.style.display = cart.length > 0 ? 'flex' : 'none';
  };

  // 2. Add to Cart Logic
  document.querySelectorAll('.krin-btn-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = {
        id: e.target.dataset.id,
        name: e.target.dataset.name,
        price: parseInt(e.target.dataset.price)
      };
      
      cart.push(item);
      localStorage.setItem('krinCart', JSON.stringify(cart));
      updateBadge();
      
      // UX Feedback
      const originalText = e.target.textContent;
      e.target.textContent = 'Added ✓';
      setTimeout(() => e.target.textContent = originalText, 1500);
    });
  });

  // 3. Render the Drawer
  const renderCart = () => {
    itemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
      itemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      cart.forEach((item, index) => {
        total += item.price;
        itemsContainer.innerHTML += `
          <div class="cart-item">
            <span>${item.name}</span>
            <span>₦${item.price.toLocaleString()}</span>
            <button onclick="removeItem(${index})" style="color:red; border:none; background:none; cursor:pointer;">X</button>
          </div>
        `;
      });
    }
    totalEl.textContent = `₦${total.toLocaleString()}`;
  };

  // Remove item helper (needs to be global for inline onclick)
  window.removeItem = (index) => {
    cart.splice(index, 1);
    localStorage.setItem('krinCart', JSON.stringify(cart));
    updateBadge();
    renderCart();
  };

  // 4. Drawer Toggles
  const openCart = () => {
    renderCart();
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
  };

  const closeCart = () => {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
  };

  document.getElementById('cart-toggle').addEventListener('click', openCart);
  document.getElementById('close-cart').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

  // 5. The WhatsApp Checkout Engine
  document.getElementById('whatsapp-checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) return alert('Add items to cart first.');

    const KRIN_WHATSAPP_NUMBER = "2348072495976"; // Change to actual business number
    
    let message = "*New Order from Krin Asset Shop* %0A%0A";
    let total = 0;

    cart.forEach(item => {
      message += `- ${item.name} (₦${item.price.toLocaleString()}) %0A`;
      total += item.price;
    });

    message += `%0A*Total: ₦${total.toLocaleString()}*%0A%0A_Please let me know how to make payment._`;

    // Clear cart after redirecting
    localStorage.removeItem('krinCart'); 
    cart = [];
    updateBadge();
    closeCart();

    // Fire the redirect
    window.open(`https://wa.me/${KRIN_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  });

  updateBadge();
});

