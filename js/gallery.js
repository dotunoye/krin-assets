document.addEventListener("DOMContentLoaded", async () => {
  // Escape CMS/cart values before inserting them into HTML text or attributes.
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const grid = document.getElementById("gallery-grid");
  const status = document.getElementById("gallery-status");
  const filters = document.getElementById("gallery-filters");
  const modal = document.getElementById("krin-modal");
  const modalImage = document.getElementById("krin-modal-img");
  const modalCaption = document.getElementById("krin-modal-caption");
  if (!grid || !status || !filters || !modal || !modalImage) return;

  const { imageURL, loadImage, trapFocus } = window.KrinCMS;
  const loadItems = async () => (await window.KRIN_GALLERY_PROVIDER()).map(item => ({
    id: item._id, title: item.title || 'Krin Asset memory',
    alt: item.title || 'Krin Asset memory', category: item.category || 'Community',
    src: imageURL(item.imageUrl), full: imageURL(item.imageUrl, 1800),
  })).filter(item => item.id && item.src);

  let items = [];
  let activeCategory = "All";
  let lastTrigger = null;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        entry.target.classList.toggle("is-visible", entry.isIntersecting),
      );
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
  );

  const renderGallery = () => {
    revealObserver.disconnect();
    const visibleItems =
      activeCategory === "All"
        ? items
        : items.filter((item) => item.category === activeCategory);
    grid.innerHTML = visibleItems.map(item => `
      <button type="button" class="reveal-item" data-gallery-id="${escapeHTML(item.id)}" aria-label="Open ${escapeHTML(item.title)}">
        <img alt="${escapeHTML(item.alt)}" loading="lazy" decoding="async">
        <span class="gallery-item-label">${escapeHTML(item.title)}</span>
      </button>
    `).join('');
    grid.querySelectorAll('[data-gallery-id]').forEach((button, index) => {
      loadImage(button.querySelector('img'), visibleItems[index].src);
      revealObserver.observe(button);
    });
    status.textContent = visibleItems.length
      ? `Showing ${visibleItems.length} ${visibleItems.length === 1 ? "memory" : "memories"}.`
      : "No gallery images match this category yet.";
  };

  const renderFilters = () => {
    const categories = [
      "All",
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ];
    filters.innerHTML = categories.map(category => `
      <button type="button" class="filter-pill${category === 'All' ? ' active' : ''}"
        data-gallery-filter="${escapeHTML(category)}" aria-pressed="${category === 'All'}">
        ${escapeHTML(category)}
      </button>
    `).join('');
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    modalImage.removeAttribute("src");
    lastTrigger?.focus();
  };

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-filter]");
    if (!button) return;
    activeCategory = button.dataset.galleryFilter;
    filters.querySelectorAll("[data-gallery-filter]").forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    renderGallery();
  });

  grid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-gallery-id]");
    if (!trigger) return;
    const item = items.find(
      (galleryItem) => galleryItem.id === trigger.dataset.galleryId,
    );
    if (!item) return;
    lastTrigger = trigger;
    loadImage(modalImage, item.full);
    modalImage.alt = item.alt;
    modalCaption.textContent = item.title;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".gallery-modal-close")?.focus();
  });

  modal.addEventListener("click", (event) => {
    if (
      event.target.matches("[data-gallery-close]") ||
      event.target === modal
    )
      closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
    trapFocus(event, modal);
  });

  const retry = document.getElementById('gallery-retry');
  async function load() {
  retry.hidden = true;
  status.classList.remove('error');
  status.classList.add('cms-loading');
  status.textContent = 'Loading our memories…';
  grid.setAttribute('aria-busy', 'true');
  try {
    items = await loadItems();
    renderFilters();
    renderGallery();
  } catch (error) {
    console.error(error);
    status.textContent =
      "The gallery could not be loaded right now. Please try again shortly.";
    status.classList.add("error");
    retry.hidden = false;
  } finally {
    status.classList.remove('cms-loading');
    grid.setAttribute('aria-busy', 'false');
  }
  }
  retry.addEventListener('click', load);
  load();
});
