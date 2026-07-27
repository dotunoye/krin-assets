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
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );
  document
    .querySelectorAll(".pop-in, .jump-text")
    .forEach((el) => revealObserver.observe(el));

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector("input, button, select, textarea, a")?.focus();
  };
  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("open");
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
    tabList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tab]");
      if (!button) return;
      const scope = tabList.closest("[data-tabs]");
      scope.querySelectorAll("[data-tab]").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      scope.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.hidden = panel.id !== button.dataset.tab;
      });
    });
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
