document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  const { fetchSanity, imageURL, loadImage, trapFocus } = window.KrinCMS;
  const status = document.getElementById('shop-status');
  const retry = document.getElementById('shop-retry');
  const modal = document.getElementById('product-modal');
  let lastTrigger;
  const money = value => `₦${value.toLocaleString('en-NG')}`;
  function buyButton(product) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'krin-btn-buy';
    Object.assign(button.dataset, { id: product._id, title: product.title, name: product.title, price: product.price, image: product.imageUrl || '' });
    button.textContent = 'Add to Cart';
    return button;
  }
  function close() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastTrigger?.focus();
  }
  function open(product, trigger) {
    lastTrigger = trigger;
    modal.querySelector('h2').textContent = product.title;
    modal.querySelector('.product-description').textContent = product.description || '';
    modal.querySelector('.product-price').textContent = money(product.price);
    modal.querySelector('.product-modal-action').replaceChildren(buyButton(product));
    const image = modal.querySelector('img');
    image.alt = product.title;
    loadImage(image, imageURL(product.imageUrl, 1800));
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('[data-product-close]').focus();
  }
  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.closest('[data-product-close]')) close();
  });
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') close();
    trapFocus(event, modal);
  });
  async function load() {
    retry.hidden = true;
    status.textContent = 'Loading items…';
    status.classList.add('cms-loading');
    grid.setAttribute('aria-busy', 'true');
    try {
      const products = await fetchSanity('*[_type == "product"] | order(title asc, _id) {_id, title, description, price, "imageUrl": image.asset->url}');
      const valid = products.filter(p => typeof p._id === 'string' && typeof p.title === 'string' && Number.isFinite(p.price) && p.price >= 0);
      grid.replaceChildren(...valid.map(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'product-image-wrapper product-image-trigger';
        trigger.setAttribute('aria-label', `View ${product.title}`);
        const image = document.createElement('img');
        image.alt = product.title;
        image.loading = 'lazy';
        trigger.append(image);
        loadImage(image, imageURL(product.imageUrl));
        trigger.addEventListener('click', () => open(product, trigger));
        const info = document.createElement('div');
        info.className = 'product-info';
        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = product.title;
        const price = document.createElement('p');
        price.className = 'product-price';
        price.textContent = money(product.price);
        info.append(title, price, buyButton(product));
        card.append(trigger, info);
        return card;
      }));
      status.textContent = valid.length ? `${valid.length} products available.` : 'New products are coming soon.';
    } catch (error) {
      console.error(error);
      status.textContent = 'Unable to load products. Check your connection and try again.';
      retry.hidden = false;
    } finally {
      status.classList.remove('cms-loading');
      grid.setAttribute('aria-busy', 'false');
    }
  }
  retry.addEventListener('click', load);
  load();
});
