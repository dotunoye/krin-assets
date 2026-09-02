document.addEventListener("DOMContentLoaded", () => {
  const sections = [...document.querySelectorAll("section[data-mascot-msg]")];
  if (!sections.length) return;

  const companion = document.createElement("aside");
  companion.id = "mascot-companion";
  companion.className = "mascot-companion side-left";
  companion.setAttribute("aria-live", "polite");
  companion.innerHTML = `
    <img id="mascot-img" class="mascot-image" alt="" aria-hidden="true">
    <div class="mascot-bubble pop-in"><span id="mascot-text"></span></div>
    <button class="mascot-toggle" type="button" aria-label="Minimize Krin the Dove" title="Minimize Krin">−</button>`;
  document.body.appendChild(companion);

  const image = companion.querySelector("#mascot-img");
  const bubble = companion.querySelector(".mascot-bubble");
  const text = companion.querySelector("#mascot-text");
  const toggle = companion.querySelector(".mascot-toggle");
  let activeSection = null;
  let bubbleTimer = null;
  let scrollFrame = null;

  // Warm every pose into the browser cache before it is requested by a section.
  const poseCache = new Map();
  sections.forEach((section) => {
    const src = section.dataset.mascotImg || "assets/mascot/krin-waving.png";
    if (poseCache.has(src)) return;
    const preload = new Image();
    preload.decoding = "async";
    preload.src = src;
    poseCache.set(src, preload);
  });

  const update = (section) => {
    if (!section || section === activeSection) return;
    activeSection = section;
    window.clearTimeout(bubbleTimer);
    bubble.classList.remove("animate-in");
    companion.classList.toggle(
      "side-right",
      section.dataset.mascotSide === "right",
    );
    companion.classList.toggle(
      "side-left",
      section.dataset.mascotSide !== "right",
    );
    text.textContent = section.dataset.mascotMsg;
    const nextSrc =
      section.dataset.mascotImg || "assets/mascot/krin-waving.png";
    if (image.getAttribute("src") !== nextSrc) image.src = nextSrc;
    void bubble.offsetWidth;
    bubbleTimer = window.setTimeout(
      () => bubble.classList.add("animate-in"),
      100,
    );
  };

  // A viewport activation line works for short and very tall sections alike.
  // It also makes reverse scrolling deterministic, unlike intersection-ratio
  // thresholds that tall sections can never reach.
  const syncToScrollPosition = () => {
    scrollFrame = null;
    const activationLine = window.innerHeight * 0.42;
    const current =
      sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= activationLine && rect.bottom >= activationLine;
      }) ||
      [...sections].sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aDistance = Math.min(
          Math.abs(aRect.top - activationLine),
          Math.abs(aRect.bottom - activationLine),
        );
        const bDistance = Math.min(
          Math.abs(bRect.top - activationLine),
          Math.abs(bRect.bottom - activationLine),
        );
        return aDistance - bDistance;
      })[0];
    update(current);
  };

  const requestSync = () => {
    if (scrollFrame !== null) return;
    scrollFrame = requestAnimationFrame(syncToScrollPosition);
  };

  const observer = new IntersectionObserver(requestSync, {
    threshold: 0,
    rootMargin: "-35% 0px -55% 0px",
  });
  sections.forEach((section) => observer.observe(section));
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  requestSync();

  toggle.addEventListener("click", () => {
    const minimized = companion.classList.toggle("minimized");
    toggle.textContent = minimized ? "+" : "−";
    toggle.setAttribute(
      "aria-label",
      minimized ? "Show Krin the Dove" : "Minimize Krin the Dove",
    );
  });
});
