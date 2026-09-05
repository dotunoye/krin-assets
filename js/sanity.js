/* Public, published content only. Never put a Sanity token in browser code. */
window.KrinCMS = (() => {
  const config = { projectId: 'uzt4h4aa', dataset: 'production', apiVersion: '2026-09-06' };
  async function fetchSanity(query, params = {}) {
    const url = new URL(`https://${config.projectId}.apicdn.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`);
    url.searchParams.set('query', query);
    url.searchParams.set('perspective', 'published');
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(`$${key}`, JSON.stringify(value)));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error(`Sanity request failed (${response.status})`);
      const payload = await response.json();
      if (payload.error || !Array.isArray(payload.result)) throw new Error('Invalid Sanity response');
      return payload.result;
    } finally { clearTimeout(timeout); }
  }
  function imageURL(source, width = 800) {
    try {
      const url = new URL(source);
      if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io') return '';
      url.searchParams.set('w', width);
      url.searchParams.set('fit', 'max');
      url.searchParams.set('auto', 'format');
      return url.href;
    } catch { return ''; }
  }
  function loadImage(image, source) {
    const host = image.parentElement;
    host.classList.add('cms-image-loading');
    host.classList.remove('cms-image-error');
    image.onload = () => host.classList.remove('cms-image-loading');
    image.onerror = () => {
      host.classList.remove('cms-image-loading');
      host.classList.add('cms-image-error');
    };
    if (source) image.src = source;
    else { image.removeAttribute('src'); image.onerror(); }
  }
  function trapFocus(event, modal) {
    if (event.key !== 'Tab' || modal.hidden) return;
    const buttons = [...modal.querySelectorAll('button:not([disabled]), [href], [tabindex="0"]')];
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return { fetchSanity, imageURL, loadImage, trapFocus };
})();
window.KRIN_GALLERY_PROVIDER = () => window.KrinCMS.fetchSanity(
  '*[_type == "galleryImage"] | order(_createdAt desc, _id) {_id, title, category, "imageUrl": image.asset->url}'
);
