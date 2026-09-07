(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const money = value => `₦${value.toLocaleString('en-NG')}`;
  let mapInitializer = () => {};
  // Defined before the asynchronous Google script can invoke its callback.
  window.initMap = () => mapInitializer();

  function start() {
    let cart;
    try {
      const stored = JSON.parse(localStorage.getItem('krinCart'));
      cart = Array.isArray(stored) ? stored : [];
    } catch { cart = []; }
    // Upgrade legacy duplicate rows without losing their item counts.
    cart = cart.reduce((items, item) => {
      if (!item || item.id == null || !Number.isFinite(Number(item.price))) return items;
      const id = String(item.id);
      const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
      const existing = items.find(entry => entry.id === id);
      if (existing) {
        existing.quantity += quantity;
        existing.image ||= item.image || '';
      } else items.push({ id, name: String(item.name || 'Product'), price: Math.max(0, parseInt(item.price, 10)), image: item.image || '', quantity });
      return items;
    }, []);
    localStorage.setItem('krinCart', JSON.stringify(cart));
    let paying = false;
    const badge = byId('cart-badge');
    const updateBadge = () => {
      if (!badge) return;
      badge.textContent = cart.reduce((count, item) => count + item.quantity, 0);
      badge.style.display = cart.length ? 'flex' : 'none';
    };
    let renderPage = () => {};
    const saveCart = () => {
      localStorage.setItem('krinCart', JSON.stringify(cart));
      updateBadge();
      renderPage();
    };
    updateBadge();
    const feedbackTimers = new WeakMap();
    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('#paystack-checkout-btn')) return;
      const button = event.target.closest('button.krin-btn-buy');
      if (!button || button.disabled || paying) return;
      const id = button.dataset.id;
      const name = button.dataset.title || button.dataset.name;
      const price = parseInt(button.dataset.price, 10);
      const image = button.dataset.image || '';
      if (!id || !name || !button.dataset.price || !Number.isFinite(price) || price < 0) return;
      event.preventDefault();
      const existing = cart.find(item => item.id === id);
      if (existing) { existing.quantity += 1; existing.image = image || existing.image; }
      else cart.push({ id, name, price, image, quantity: 1 });
      saveCart();
      const previous = feedbackTimers.get(button);
      clearTimeout(previous?.timer);
      const text = previous?.text || button.textContent;
      button.textContent = 'Added ✓';
      const timer = setTimeout(() => {
        button.textContent = text;
        feedbackTimers.delete(button);
      }, 1500);
      feedbackTimers.set(button, { text, timer });
    });

    window.increaseQty = id => {
      if (paying) return;
      const item = cart.find(item => item.id === String(id));
      if (!item) return;
      item.quantity += 1;
      saveCart();
    };
    window.decreaseQty = id => {
      if (paying) return;
      const index = cart.findIndex(item => item.id === String(id));
      if (index < 0) return;
      if (--cart[index].quantity === 0) cart.splice(index, 1);
      saveCart();
    };

    function renderItems(container) {
      if (!container) return;
      // Keep keyboard focus on the same stepper after replacing its DOM.
      const focused = container.contains(document.activeElement) ? document.activeElement : null;
      const focusId = focused?.dataset.itemId;
      const focusAction = focused?.dataset.quantityAction;
      container.replaceChildren(...cart.map(item => {
        const row = document.createElement('div');
        row.className = 'cart-item cart-product-row';
        const thumbnail = document.createElement('div');
        thumbnail.className = 'cart-thumbnail';
        const image = document.createElement('img');
        image.alt = item.name;
        image.width = image.height = 70;
        image.loading = 'lazy';
        image.addEventListener('error', () => { thumbnail.textContent = 'No image'; });
        if (item.image) { image.src = item.image; thumbnail.append(image); }
        else thumbnail.textContent = 'No image';
        const details = document.createElement('div');
        details.className = 'cart-product-details';
        const title = document.createElement('strong');
        title.textContent = item.name;
        const unit = document.createElement('span');
        unit.className = 'cart-unit-price';
        unit.textContent = `${money(item.price)} each`;
        details.append(title, unit);
        const actions = document.createElement('div');
        actions.className = 'cart-product-actions';
        const total = document.createElement('strong');
        total.textContent = money(item.price * item.quantity);
        const stepper = document.createElement('div');
        stepper.className = 'cart-quantity';
        const count = document.createElement('span');
        count.textContent = item.quantity;
        count.setAttribute('aria-label', `Quantity: ${item.quantity}`);
        const buttons = ['decrease', 'increase'].map(action => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = action === 'increase' ? '+' : '−';
          button.dataset.itemId = item.id;
          button.dataset.quantityAction = action;
          button.setAttribute('aria-label', `${action === 'increase' ? 'Increase' : 'Decrease'} quantity of ${item.name}`);
          button.addEventListener('click', () => action === 'increase' ? window.increaseQty(item.id) : window.decreaseQty(item.id));
          return button;
        });
        stepper.append(buttons[0], count, buttons[1]);
        actions.append(total, stepper);
        row.append(thumbnail, details, actions);
        return row;
      }));
      if (!cart.length) container.textContent = 'Your cart is empty.';
      if (focusId) {
        const buttons = [...container.querySelectorAll('[data-quantity-action]')];
        (buttons.find(button => button.dataset.itemId === focusId && button.dataset.quantityAction === focusAction) || buttons[0])?.focus();
      }
    }
    const subtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    function renderDrawer() {
      renderItems(byId('cart-items-container'));
      if (byId('cart-total-price')) byId('cart-total-price').textContent = money(subtotal());
    }

    function initShop(grid) {
      const drawer = byId('cart-drawer');
      const overlay = byId('cart-overlay');
      renderPage = renderDrawer;
      const toggle = open => {
        if (open) renderPage();
        drawer?.classList.toggle('is-open', open);
        overlay?.classList.toggle('is-open', open);
      };
      byId('cart-toggle')?.addEventListener('click', () => toggle(true));
      byId('close-cart')?.addEventListener('click', () => toggle(false));
      overlay?.addEventListener('click', () => toggle(false));
      renderPage();
      initProducts(grid);
    }

    function initCheckout(container) {
      if (!cart.length) { window.location.replace('shop.html'); return; }
      const zone = byId('delivery-zone');
      const address = byId('customer-address');
      const email = byId('customer-email');
      const phone = byId('customer-phone');
      const pay = byId('paystack-checkout-btn');
      let finalTotal = 0;
      const updateTotal = () => {
        const fee = Math.max(0, parseInt(zone?.value, 10) || 0);
        finalTotal = subtotal() + fee;
        for (const [id, value] of [['summary-subtotal', subtotal()], ['summary-delivery', fee], ['summary-total', finalTotal]]) {
          if (byId(id)) byId(id).textContent = money(value);
        }
      };
      renderPage = () => {
        if (!cart.length) { window.location.replace('shop.html'); return; }
        renderItems(container); updateTotal();
      };
      renderPage();
      zone?.addEventListener('change', updateTotal);

      let map, marker, geocoder, timer;
      let revision = 0;
      const setCoordinates = position => {
        if (!position) return;
        if (byId('customer-lat')) byId('customer-lat').value = position.lat();
        if (byId('customer-lng')) byId('customer-lng').value = position.lng();
      };
      const locate = () => {
        clearTimeout(timer);
        const query = address?.value.trim();
        if (!query || !geocoder) return;
        const request = ++revision;
        geocoder.geocode({ address: query, region: 'ng' }, (results, status) => {
          if (request !== revision || query !== address?.value.trim()) return;
          if (status !== 'OK' || !results?.[0]?.geometry?.location) return;
          const position = results[0].geometry.location;
          marker.setPosition(position);
          map.panTo(position);
          map.setZoom(16);
          setCoordinates(position);
        });
      };
      mapInitializer = () => {
        const element = byId('delivery-map');
        if (map || !element || !window.google?.maps?.Map) return;
        const center = { lat: 6.4698, lng: 3.5852 };
        map = new google.maps.Map(element, { center, zoom: 14, disableDefaultUI: true, zoomControl: true });
        marker = new google.maps.Marker({ position: center, map, draggable: true });
        geocoder = new google.maps.Geocoder();
        marker.addListener('position_changed', () => setCoordinates(marker.getPosition()));
        marker.addListener('dragstart', () => { ++revision; clearTimeout(timer); });
        marker.addListener('dragend', () => setCoordinates(marker.getPosition()));
        setCoordinates(marker.getPosition());
        locate();
      };
      address?.addEventListener('input', () => {
        ++revision;
        clearTimeout(timer);
        timer = setTimeout(locate, 650);
      });
      address?.addEventListener('change', locate);
      address?.addEventListener('blur', locate);
      window.initMap();

      pay?.addEventListener('click', event => {
        event.preventDefault();
        if (paying) return;
        if (!email?.value.trim() || !phone?.value.trim() || !address?.value.trim() || (zone && zone.value === '')) {
          alert('Please fill in all delivery details before paying.');
          return;
        }
        if (!email.checkValidity()) { email.reportValidity(); return; }
        updateTotal();
        if (!Number.isFinite(finalTotal) || finalTotal <= 0) { alert('Please check your order total.'); return; }
        if (!window.PaystackPop?.setup) { alert('Payment service is still loading. Please try again.'); return; }
        const lat = byId('customer-lat')?.value;
        const lng = byId('customer-lng')?.value;
        const mapLink = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}` : '';
        paying = true;
        pay.disabled = true;
        const release = () => { paying = false; pay.disabled = false; };
        try {
          const handler = window.PaystackPop.setup({
            key: 'pk_live_2755ae9aa1c61210b4dcd7d0e73951ff9c6b4060',
            email: email.value.trim(), amount: Math.round(finalTotal * 100), currency: 'NGN',
            ref: `KRIN_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
            metadata: { custom_fields: [
              { display_name: 'Phone', variable_name: 'phone', value: phone.value.trim() },
              { display_name: 'Address', variable_name: 'address', value: address.value.trim() },
              { display_name: 'Zone', variable_name: 'delivery_zone', value: zone?.selectedOptions[0]?.text || '' },
              { display_name: 'Map Pin', variable_name: 'map_link', value: mapLink },
              { display_name: 'Items', variable_name: 'cart_items', value: cart.map(item => `${item.name} × ${item.quantity}`).join(', ') },
            ] },
            callback: function () {
              cart = [];
              localStorage.removeItem('krinCart');
              updateBadge();
              window.location.replace('shop.html');
            },
            onClose: release,
          });
          handler.openIframe();
        } catch (error) {
          release();
          console.error('Unable to open payment', error);
          alert('Unable to open payment. Please try again.');
        }
      });
    }

    if (byId('shop-grid')) initShop(byId('shop-grid'));
    if (byId('checkout-items-container')) initCheckout(byId('checkout-items-container'));
  }

  function initProducts(grid) {
    if (!window.KrinCMS) return;
    const { fetchSanity, imageURL, loadImage, trapFocus } = window.KrinCMS;
    const status = document.getElementById("shop-status");
    const retry = document.getElementById("shop-retry");
    const modal = document.getElementById("product-modal");
    if (!status || !retry) return;
    const modalReady = modal && ['h2', '.product-description', '.product-price', '.product-modal-action', 'img', '[data-product-close]'].every(selector => modal.querySelector(selector));
    let lastTrigger;
    const money = (value) => `₦${value.toLocaleString("en-NG")}`;

    function buyButton(product) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "krin-btn-buy";
      Object.assign(button.dataset, {
        id: product._id, title: product.title, name: product.title, price: product.price, image: product.imageUrl || "",
      });
      button.textContent = "Add to Cart";
      return button;
    }

    function close() { modal.hidden = true; document.body.classList.remove("modal-open"); lastTrigger?.focus(); }
    
    function open(product, trigger) {
      if (!modalReady) return;
      lastTrigger = trigger;
      modal.querySelector("h2").textContent = product.title;
      modal.querySelector(".product-description").textContent = product.description || "";
      modal.querySelector(".product-price").textContent = money(product.price);
      modal.querySelector(".product-modal-action").replaceChildren(buyButton(product));
      const image = modal.querySelector("img");
      image.alt = product.title;
      loadImage(image, imageURL(product.imageUrl, 1800));
      modal.hidden = false;
      document.body.classList.add("modal-open");
      modal.querySelector("[data-product-close]").focus();
    }

    if (modalReady) modal.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-product-close]")) close(); });
    document.addEventListener("keydown", (event) => { if (!modalReady || modal.hidden) return; if (event.key === "Escape") close(); trapFocus(event, modal); });

    async function load() {
      retry.hidden = true; status.textContent = "Loading items…"; status.classList.add("cms-loading"); grid.setAttribute("aria-busy", "true");
      try {
        const products = await fetchSanity('*[_type == "product"] | order(title asc, _id) {_id, title, description, price, "imageUrl": image.asset->url}');
        const valid = products.filter((p) => typeof p._id === "string" && typeof p.title === "string" && Number.isFinite(p.price) && p.price >= 0);
        grid.replaceChildren(
          ...valid.map((product) => {
            const card = document.createElement("article");
            card.className = "product-card";
            const trigger = document.createElement("button");
            trigger.type = "button"; trigger.className = "product-image-wrapper product-image-trigger"; trigger.setAttribute("aria-label", `View ${product.title}`);
            const image = document.createElement("img");
            image.alt = product.title; image.loading = "lazy";
            trigger.append(image); loadImage(image, imageURL(product.imageUrl));
            trigger.addEventListener("click", () => open(product, trigger));
            const info = document.createElement("div");
            info.className = "product-info";
            const title = document.createElement("h3");
            title.className = "product-title"; title.textContent = product.title;
            const price = document.createElement("p");
            price.className = "product-price"; price.textContent = money(product.price);
            info.append(title, price, buyButton(product));
            card.append(trigger, info);
            return card;
          })
        );
        status.textContent = valid.length ? `${valid.length} products available.` : "New products are coming soon.";
      } catch (error) {
        status.textContent = "Unable to load products. Check your connection and try again."; retry.hidden = false;
      } finally {
        status.classList.remove("cms-loading"); grid.setAttribute("aria-busy", "false");
      }
    }
    retry.addEventListener("click", load);
    load();  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
