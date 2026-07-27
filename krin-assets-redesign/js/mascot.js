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
    image.src = section.dataset.mascotImg || "assets/mascot/krin-waving.png";
    void bubble.offsetWidth;
    bubbleTimer = window.setTimeout(
      () => bubble.classList.add("animate-in"),
      100,
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (entering.length) update(entering[0].target);
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.target === activeSection)
          activeSection = null;
      });
    },
    { threshold: 0.35 },
  );
  sections.forEach((section) => observer.observe(section));
  update(sections[0]);

  toggle.addEventListener("click", () => {
    const minimized = companion.classList.toggle("minimized");
    toggle.textContent = minimized ? "+" : "−";
    toggle.setAttribute(
      "aria-label",
      minimized ? "Show Krin the Dove" : "Minimize Krin the Dove",
    );
  });
});
