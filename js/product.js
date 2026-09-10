document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('product-page');
  if (!page) return;
  const content = document.getElementById('product-content');
  const status = document.getElementById('product-status');
  const retry = document.getElementById('product-retry');
  const id = new URLSearchParams(window.location.search).get('id')?.trim();
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);

  async function loadProduct() {
    retry.hidden = true;
    page.setAttribute('aria-busy', 'true');
    status.classList.add('cms-loading');
    status.textContent = 'Loading product…';
    try {
      if (!id) {
        status.textContent = 'Choose a product from the shop to view its details.';
        return;
      }
      const { fetchSanity, imageURL, loadImage } = window.KrinCMS;
      // Keep the result as an array to match the shared fetchSanity contract.
      const [product] = await fetchSanity(
        '*[_type == "product" && _id == $id]{_id, title, description, price, "imageUrl": image.asset->url, "galleryUrls": gallery[].asset->url}',
        { id },
      );
      if (!product) {
        document.title = 'Product not found | Krin Asset';
        status.textContent = 'This product is no longer available. Explore the shop for more.';
        return;
      }
      if (typeof product.title !== 'string' || !Number.isFinite(product.price) || product.price < 0) throw new Error('Incomplete product details');
      document.title = `${product.title} | Krin Asset`;
      document.querySelector('meta[name="description"]').content = String(product.description || product.title).replace(/\s+/g, ' ').trim().slice(0, 160);
      const images = [...new Set([product.imageUrl, ...(product.galleryUrls || [])])].filter(url => imageURL(url));
      const title = escapeHTML(product.title);
      content.innerHTML = `
        <div class="product-main-image"><img id="product-main-image" alt="${title}" fetchpriority="high"></div>
        <div class="product-thumbnails" role="group" aria-label="Product images">
          ${images.map((url, index) => `
            <button type="button" class="product-thumbnail${index === 0 ? ' active' : ''}" data-image-index="${index}"
              aria-label="View image ${index + 1} of ${title}" aria-pressed="${index === 0}">
              <img alt="${title}, image ${index + 1}" loading="lazy">
            </button>
          `).join('')}
        </div>
        <div class="product-page-details">
          <div class="product-detail-header">
            <h1>${title}</h1>
            <button type="button" class="krin-btn-buy product-add-button"
              data-id="${escapeHTML(product._id)}" data-name="${title}" data-title="${title}"
              data-price="${escapeHTML(product.price)}" data-image="${escapeHTML(product.imageUrl || '')}">Add to Cart</button>
          </div>
          <p class="product-detail-price">₦${product.price.toLocaleString('en-NG')}</p>
          <p class="product-detail-description">${escapeHTML(product.description || '')}</p>
        </div>
      `;
      const mainImage = document.getElementById('product-main-image');
      loadImage(mainImage, imageURL(images[0], 1800));
      content.querySelectorAll('[data-image-index]').forEach((button, index) => {
        loadImage(button.querySelector('img'), imageURL(images[index], 180));
        button.addEventListener('click', () => {
          loadImage(mainImage, imageURL(images[index], 1800));
          mainImage.alt = `${product.title}, image ${index + 1}`;
          content.querySelectorAll('[data-image-index]').forEach(thumbnail => {
            const active = thumbnail === button;
            thumbnail.classList.toggle('active', active);
            thumbnail.setAttribute('aria-pressed', String(active));
          });
        });
      });
      status.textContent = '';
    } catch (error) {
      console.error('Unable to load product', error);
      status.textContent = 'Unable to load this product. Check your connection and try again.';
      retry.hidden = false;
    } finally {
      status.classList.remove('cms-loading');
      page.setAttribute('aria-busy', 'false');
    }
  }
  retry.addEventListener('click', loadProduct);
  loadProduct();
});
