document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("gallery-grid");
  const status = document.getElementById("gallery-status");
  const filters = document.getElementById("gallery-filters");
  const modal = document.getElementById("krin-modal");
  const modalImage = document.getElementById("krin-modal-img");
  const modalCaption = document.getElementById("krin-modal-caption");
  if (!grid || !status || !filters || !modal || !modalImage) return;

  /*
   * Stable gallery data contract:
   * { id | _id, title, alt, category, image: { url } | imageUrl | src }
   *
   * A future Sanity adapter can assign an async function to
   * window.KRIN_GALLERY_PROVIDER and return GROQ results in this shape.
   * The renderer, filters, modal, and animation code remain unchanged.
   */
  const normalizeItem = (item) => ({
    id: item._id || item.id,
    title: item.title || item.alt || "Krin Asset memory",
    alt: item.alt || item.title || "Krin Asset memory",
    category: item.category || "Community",
    src: item.imageUrl || item.image?.url || item.src,
  });

  const localManifestProvider = async () => {
    const response = await fetch(
      grid.dataset.gallerySource || "assets/images/gallery-manifest.json",
      { cache: "no-cache" },
    );
    if (!response.ok)
      throw new Error(`Gallery manifest request failed: ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload) ? payload : payload.items;
  };

  const loadItems = async () => {
    const provider =
      typeof window.KRIN_GALLERY_PROVIDER === "function"
        ? window.KRIN_GALLERY_PROVIDER
        : localManifestProvider;
    const sourceItems = await provider();
    return sourceItems.map(normalizeItem).filter((item) => item.id && item.src);
  };

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
    grid.replaceChildren(
      ...visibleItems.map((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "reveal-item";
        button.dataset.galleryId = item.id;
        button.setAttribute("aria-label", `Open ${item.title}`);
        const image = document.createElement("img");
        image.src = item.src;
        image.alt = item.alt;
        image.loading = "lazy";
        image.decoding = "async";
        const label = document.createElement("span");
        label.className = "gallery-item-label";
        label.textContent = item.title;
        button.append(image, label);
        revealObserver.observe(button);
        return button;
      }),
    );
    status.textContent = visibleItems.length
      ? `Showing ${visibleItems.length} ${visibleItems.length === 1 ? "memory" : "memories"}.`
      : "No gallery images match this category yet.";
  };

  const renderFilters = () => {
    const categories = [
      "All",
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ];
    filters.replaceChildren(
      ...categories.map((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `filter-pill${category === "All" ? " active" : ""}`;
        button.dataset.galleryFilter = category;
        button.setAttribute("aria-pressed", String(category === "All"));
        button.textContent = category;
        return button;
      }),
    );
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
    modalImage.src = item.src;
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
  });

  try {
    items = await loadItems();
    renderFilters();
    renderGallery();
  } catch (error) {
    console.error(error);
    status.textContent =
      "The gallery could not be loaded right now. Please try again shortly.";
    status.classList.add("error");
  }
});
