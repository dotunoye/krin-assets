// ==========================================
// 1. GLOBAL MAP LOGIC (Runs on Checkout Page)
// ==========================================
let deliveryMap, marker, geocoder;

window.initMap = function() {
  const mapContainer = document.getElementById("delivery-map");
  if (!mapContainer) return; // Don't run this on the Shop page

  const defaultPos = { lat: 6.4698, lng: 3.5852 }; 
  deliveryMap = new google.maps.Map(mapContainer, {
    zoom: 14, center: defaultPos, disableDefaultUI: true, zoomControl: true,
  });
  marker = new google.maps.Marker({ position: defaultPos, map: deliveryMap, draggable: true });
  geocoder = new google.maps.Geocoder();

  marker.addListener("dragend", () => {
    const position = marker.getPosition();
    document.getElementById("customer-lat").value = position.lat();
    document.getElementById("customer-lng").value = position.lng();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 2. GLOBAL CART STATE (Runs on all pages)
  // ==========================================
  let cart = JSON.parse(localStorage.getItem("krinCart")) || [];
  const badge = document.getElementById("cart-badge");

  const updateBadge = () => {
    if (badge) {
      badge.textContent = cart.length;
      badge.style.display = cart.length > 0 ? "flex" : "none";
    }
  };
  updateBadge();

  // ==========================================
  // 3. SHOP PAGE LOGIC (Sanity + Drawer)
  // ==========================================
  const grid = document.getElementById("shop-grid");
  if (grid) {
    const { fetchSanity, imageURL, loadImage, trapFocus } = window.KrinCMS;
    const status = document.getElementById("shop-status");
    const retry = document.getElementById("shop-retry");
    const modal = document.getElementById("product-modal");
    let lastTrigger;
    const money = (value) => `₦${value.toLocaleString("en-NG")}`;

    // --- Sanity Fetching ---
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

    modal.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-product-close]")) close(); });
    document.addEventListener("keydown", (event) => { if (modal.hidden) return; if (event.key === "Escape") close(); trapFocus(event, modal); });

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
    load();

    // --- Simple Cart Drawer Logic ---
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    const itemsContainer = document.getElementById("cart-items-container");
    const totalEl = document.getElementById("cart-total-price");

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".krin-btn-buy");
      // Ignore clicks on the proceed to checkout button in the drawer
      if (!btn || btn.tagName.toLowerCase() === 'a') return; 
      
      const item = { id: btn.dataset.id, name: btn.dataset.title || btn.dataset.name, price: parseInt(btn.dataset.price) };
      cart.push(item);
      localStorage.setItem("krinCart", JSON.stringify(cart));
      updateBadge();
      const originalText = btn.textContent;
      btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = originalText), 1500);
    });

    const renderDrawer = () => {
      if(!itemsContainer) return;
      itemsContainer.innerHTML = "";
      let subtotal = 0;
      if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; padding-top:20px;">Your cart is empty.</p>';
      } else {
        cart.forEach((item, index) => {
          subtotal += item.price;
          itemsContainer.innerHTML += `
            <div class="cart-item">
              <span>${String(item.name).replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char])}</span>
              <div style="display:flex; align-items:center; gap:10px;">
                <strong>₦${item.price.toLocaleString()}</strong>
                <button onclick="window.removeDrawerItem(${index})" style="color:#e63946; border:none; background:none; cursor:pointer; font-weight:bold; font-size:18px;">&times;</button>
              </div>
            </div>
          `;
        });
      }
      if(totalEl) totalEl.textContent = `₦${subtotal.toLocaleString()}`;
    };

    window.removeDrawerItem = (index) => {
      cart.splice(index, 1);
      localStorage.setItem("krinCart", JSON.stringify(cart));
      updateBadge();
      renderDrawer();
    };

    const openCart = () => { renderDrawer(); drawer.classList.add("is-open"); overlay.classList.add("is-open"); };
    const closeCart = () => { drawer.classList.remove("is-open"); overlay.classList.remove("is-open"); };

    document.getElementById("cart-toggle")?.addEventListener("click", openCart);
    document.getElementById("close-cart")?.addEventListener("click", closeCart);
    overlay?.addEventListener("click", closeCart);
  }

  // ==========================================
  // 4. CHECKOUT PAGE LOGIC (Form & Paystack)
  // ==========================================
  const checkoutContainer = document.getElementById("checkout-items-container");
  if (checkoutContainer) {
    if (cart.length === 0) window.location.href = "shop.html";

    const subtotalEl = document.getElementById("summary-subtotal");
    const deliveryEl = document.getElementById("summary-delivery");
    const totalEl = document.getElementById("summary-total");
    const deliverySelect = document.getElementById("delivery-zone");
    const addressInput = document.getElementById("customer-address");
    
    // Form Inputs
    const emailInput = document.getElementById("customer-email");
    const phoneInput = document.getElementById("customer-phone");

    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let finalTotal = subtotal;

    // Render items
    cart.forEach(item => {
      checkoutContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>${String(item.name).replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char])}</span>
          <strong>₦${item.price.toLocaleString()}</strong>
        </div>
      `;
    });
    subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;

    const updateCheckoutTotal = () => {
      let deliveryFee = parseInt(deliverySelect.value) || 0;
      finalTotal = subtotal + deliveryFee;
      deliveryEl.textContent = `₦${deliveryFee.toLocaleString()}`;
      totalEl.textContent = `₦${finalTotal.toLocaleString()}`;
    };

    deliverySelect.addEventListener('change', updateCheckoutTotal);
    updateCheckoutTotal(); 

    // Auto-Move Map
    if (addressInput) {
      addressInput.addEventListener('change', () => {
        const address = addressInput.value.trim();
        if (address && geocoder && deliveryMap) {
          geocoder.geocode({ address: address + ', Lagos, Nigeria' }, (results, status) => {
            if (status === 'OK') {
              const loc = results[0].geometry.location;
              deliveryMap.setCenter(loc);
              marker.setPosition(loc);
              deliveryMap.setZoom(16);
              document.getElementById("customer-lat").value = loc.lat();
              document.getElementById("customer-lng").value = loc.lng();
            }
          });
        }
      });
    }

    // --- LIVE PAYSTACK INTEGRATION ---
    document.getElementById("paystack-checkout-btn").addEventListener("click", (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const address = addressInput.value.trim();
      const lat = document.getElementById("customer-lat").value;
      const lng = document.getElementById("customer-lng").value;
      const zoneText = deliverySelect.options[deliverySelect.selectedIndex]?.text;

      if (!email || !phone || !address || deliverySelect.value === "") {
        return alert("Please fill in all delivery details before paying.");
      }

      let handler = PaystackPop.setup({
        key: 'pk_live_2755ae9aa1c61210b4dcd7d0e73951ff9c6b4060', // Swap to live key before launch
        email: email,
        amount: finalTotal * 100, // Kobo
        currency: 'NGN',
        ref: 'KRIN_' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
          custom_fields: [
            { display_name: "Phone", variable_name: "phone", value: phone },
            { display_name: "Zone", variable_name: "delivery_zone", value: zoneText },
            { display_name: "Address", variable_name: "address", value: address },
            { display_name: "Items", variable_name: "cart_items", value: cart.map(i => `${i.name}`).join(', ') },
            { display_name: "Map Pin", variable_name: "map_link", value: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` }
          ]
        },
        callback: function(response) {
          alert(`Payment successful! Receipt sent to ${email}.`);
          localStorage.removeItem("krinCart");
          window.location.href = "shop.html"; 
        },
        onClose: function() {
          alert('Transaction cancelled.');
        }
      });

      handler.openIframe();
    });
  }
});


// document.addEventListener("DOMContentLoaded", () => {
//   const grid = document.getElementById("shop-grid");
//   if (!grid) return;
//   const { fetchSanity, imageURL, loadImage, trapFocus } = window.KrinCMS;
//   const status = document.getElementById("shop-status");
//   const retry = document.getElementById("shop-retry");
//   const modal = document.getElementById("product-modal");
//   let lastTrigger;
//   const money = (value) => `₦${value.toLocaleString("en-NG")}`;
//   function buyButton(product) {
//     const button = document.createElement("button");
//     button.type = "button";
//     button.className = "krin-btn-buy";
//     Object.assign(button.dataset, {
//       id: product._id,
//       title: product.title,
//       name: product.title,
//       price: product.price,
//       image: product.imageUrl || "",
//     });
//     button.textContent = "Add to Cart";
//     return button;
//   }
//   function close() {
//     modal.hidden = true;
//     document.body.classList.remove("modal-open");
//     lastTrigger?.focus();
//   }
//   function open(product, trigger) {
//     lastTrigger = trigger;
//     modal.querySelector("h2").textContent = product.title;
//     modal.querySelector(".product-description").textContent =
//       product.description || "";
//     modal.querySelector(".product-price").textContent = money(product.price);
//     modal
//       .querySelector(".product-modal-action")
//       .replaceChildren(buyButton(product));
//     const image = modal.querySelector("img");
//     image.alt = product.title;
//     loadImage(image, imageURL(product.imageUrl, 1800));
//     modal.hidden = false;
//     document.body.classList.add("modal-open");
//     modal.querySelector("[data-product-close]").focus();
//   }
//   modal.addEventListener("click", (event) => {
//     if (event.target === modal || event.target.closest("[data-product-close]"))
//       close();
//   });
//   document.addEventListener("keydown", (event) => {
//     if (modal.hidden) return;
//     if (event.key === "Escape") close();
//     trapFocus(event, modal);
//   });
//   async function load() {
//     retry.hidden = true;
//     status.textContent = "Loading items…";
//     status.classList.add("cms-loading");
//     grid.setAttribute("aria-busy", "true");
//     try {
//       const products = await fetchSanity(
//         '*[_type == "product"] | order(title asc, _id) {_id, title, description, price, "imageUrl": image.asset->url}',
//       );
//       const valid = products.filter(
//         (p) =>
//           typeof p._id === "string" &&
//           typeof p.title === "string" &&
//           Number.isFinite(p.price) &&
//           p.price >= 0,
//       );
//       grid.replaceChildren(
//         ...valid.map((product) => {
//           const card = document.createElement("article");
//           card.className = "product-card";
//           const trigger = document.createElement("button");
//           trigger.type = "button";
//           trigger.className = "product-image-wrapper product-image-trigger";
//           trigger.setAttribute("aria-label", `View ${product.title}`);
//           const image = document.createElement("img");
//           image.alt = product.title;
//           image.loading = "lazy";
//           trigger.append(image);
//           loadImage(image, imageURL(product.imageUrl));
//           trigger.addEventListener("click", () => open(product, trigger));
//           const info = document.createElement("div");
//           info.className = "product-info";
//           const title = document.createElement("h3");
//           title.className = "product-title";
//           title.textContent = product.title;
//           const price = document.createElement("p");
//           price.className = "product-price";
//           price.textContent = money(product.price);
//           info.append(title, price, buyButton(product));
//           card.append(trigger, info);
//           return card;
//         }),
//       );
//       status.textContent = valid.length
//         ? `${valid.length} products available.`
//         : "New products are coming soon.";
//     } catch (error) {
//       console.error(error);
//       status.textContent =
//         "Unable to load products. Check your connection and try again.";
//       retry.hidden = false;
//     } finally {
//       status.classList.remove("cms-loading");
//       grid.setAttribute("aria-busy", "false");
//     }
//   }
//   retry.addEventListener("click", load);
//   load();
// });

// let deliveryMap; 
// let marker; 
// let geocoder;

// // Google Maps global initialization with Geocoding
// window.initMap = function() {
//   const defaultPos = { lat: 6.4698, lng: 3.5852 }; 
//   deliveryMap = new google.maps.Map(document.getElementById("delivery-map"), {
//     zoom: 14, center: defaultPos, disableDefaultUI: true, zoomControl: true,
//   });
//   marker = new google.maps.Marker({ position: defaultPos, map: deliveryMap, draggable: true });
//   geocoder = new google.maps.Geocoder();

//   marker.addListener("dragend", () => {
//     const position = marker.getPosition();
//     document.getElementById("customer-lat").value = position.lat();
//     document.getElementById("customer-lng").value = position.lng();
//   });
// };

// document.addEventListener("DOMContentLoaded", () => {
//   let cart = JSON.parse(localStorage.getItem("krinCart")) || [];
//   const badge = document.getElementById("cart-badge");
//   const drawer = document.getElementById("cart-drawer");
//   const overlay = document.getElementById("cart-overlay");
//   const itemsContainer = document.getElementById("cart-items-container");
//   const totalEl = document.getElementById("cart-total-price");
//   const deliverySelect = document.getElementById("delivery-zone");
//   const checkoutBtn = document.getElementById("checkout-action-btn");
//   const checkoutDetails = document.getElementById("checkout-details");
//   const addressInput = document.getElementById("customer-address");

//   const updateBadge = () => {
//     badge.textContent = cart.length;
//     badge.style.display = cart.length > 0 ? "flex" : "none";
//   };

//   // Auto-Move Map when they type an address (Triggers when they click out of the box)
//   if (addressInput) {
//     addressInput.addEventListener('change', () => {
//       const address = addressInput.value.trim();
//       if (address && geocoder && deliveryMap) {
//         // Appending "Lagos, Nigeria" forces the search to stay local
//         geocoder.geocode({ address: address + ', Lagos, Nigeria' }, (results, status) => {
//           if (status === 'OK') {
//             const loc = results[0].geometry.location;
//             deliveryMap.setCenter(loc);
//             marker.setPosition(loc);
//             deliveryMap.setZoom(16); // Zoom in closer on their street
//             document.getElementById("customer-lat").value = loc.lat();
//             document.getElementById("customer-lng").value = loc.lng();
//           }
//         });
//       }
//     });
//   }

//   // Two-Step Checkout Button Logic
//   checkoutBtn?.addEventListener("click", (e) => {
//     e.preventDefault();
    
//     if (cart.length === 0) return alert("Your cart is empty.");

//     if (checkoutDetails.classList.contains("collapsed")) {
//       // Step 1: Open the drawer
//       checkoutDetails.classList.remove("collapsed");
//       checkoutBtn.textContent = "Proceed to Payment";
      
//       // Wake up the map
//       if (typeof google !== 'undefined' && deliveryMap) {
//         setTimeout(() => {
//           google.maps.event.trigger(deliveryMap, "resize");
//           const currentLat = parseFloat(document.getElementById("customer-lat").value);
//           const currentLng = parseFloat(document.getElementById("customer-lng").value);
//           deliveryMap.setCenter({ lat: currentLat, lng: currentLng });
//         }, 400); 
//       }
//     } else {
//       // Step 2: Actually process the payment
//       alert("UI is locked in! Ready for the Paystack block.");
//     }
//   });

//   document.addEventListener("click", (e) => {
//     const btn = e.target.closest(".krin-btn-buy");
//     if (!btn || btn.id === "checkout-action-btn") return; 
//     const item = {
//       id: btn.dataset.id,
//       name: btn.dataset.title || btn.dataset.name, 
//       price: parseInt(btn.dataset.price),
//     };
//     cart.push(item);
//     localStorage.setItem("krinCart", JSON.stringify(cart));
//     updateBadge();
//     const originalText = btn.textContent;
//     btn.textContent = "Added ✓";
//     setTimeout(() => (btn.textContent = originalText), 1500);
//   });

//   const updateCheckoutTotal = () => {
//     let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
//     let deliveryFee = parseInt(deliverySelect?.value) || 0;
//     let finalTotal = subtotal + deliveryFee;
//     totalEl.textContent = `₦${finalTotal.toLocaleString()}`;
//   };

//   if (deliverySelect) deliverySelect.addEventListener('change', updateCheckoutTotal);

//   const renderCart = () => {
//     itemsContainer.innerHTML = "";
//     if (cart.length === 0) {
//       itemsContainer.innerHTML = '<p style="text-align:center; padding-top:20px;">Your cart is empty.</p>';
//     } else {
//       cart.forEach((item, index) => {
//         itemsContainer.innerHTML += `
//           <div class="cart-item">
//             <span>${String(item.name).replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char])}</span>
//             <div style="display:flex; align-items:center; gap:10px;">
//               <strong>₦${item.price.toLocaleString()}</strong>
//               <button onclick="window.removeItem(${index})" style="color:#e63946; border:none; background:none; cursor:pointer; font-weight:bold; font-size:18px;">&times;</button>
//             </div>
//           </div>
//         `;
//       });
//     }
//     updateCheckoutTotal();
//   };

//   window.removeItem = (index) => {
//     cart.splice(index, 1);
//     localStorage.setItem("krinCart", JSON.stringify(cart));
//     updateBadge();
//     renderCart();
    
//     // Auto-collapse form if cart hits 0
//     if (cart.length === 0) {
//       checkoutDetails.classList.add("collapsed");
//       checkoutBtn.textContent = "Checkout";
//     }
//   };

//   const openCart = () => {
//     renderCart();
//     drawer.classList.add("is-open");
//     overlay.classList.add("is-open");
//   };

//   const closeCart = () => {
//     drawer.classList.remove("is-open");
//     overlay.classList.remove("is-open");
//     // Reset checkout form state when closed
//     setTimeout(() => {
//       checkoutDetails.classList.add("collapsed");
//       checkoutBtn.textContent = "Checkout";
//     }, 300);
//   };

//   document.getElementById("cart-toggle").addEventListener("click", openCart);
//   document.getElementById("close-cart").addEventListener("click", closeCart);
//   overlay.addEventListener("click", closeCart);

//   updateBadge();
// });


// let deliveryMap, marker, geocoder;
// let cart = JSON.parse(localStorage.getItem("krinCart")) || [];

// // Boot them back to the shop if they try to access checkout with an empty cart
// if (cart.length === 0) {
//   window.location.href = "shop.html";
// }

// window.initMap = function() {
//   const defaultPos = { lat: 6.4698, lng: 3.5852 }; 
//   deliveryMap = new google.maps.Map(document.getElementById("delivery-map"), {
//     zoom: 14, center: defaultPos, disableDefaultUI: true, zoomControl: true,
//   });
//   marker = new google.maps.Marker({ position: defaultPos, map: deliveryMap, draggable: true });
//   geocoder = new google.maps.Geocoder();

//   marker.addListener("dragend", () => {
//     const position = marker.getPosition();
//     document.getElementById("customer-lat").value = position.lat();
//     document.getElementById("customer-lng").value = position.lng();
//   });
// };

// document.addEventListener("DOMContentLoaded", () => {
//   const itemsContainer = document.getElementById("checkout-items-container");
//   const subtotalEl = document.getElementById("summary-subtotal");
//   const deliveryEl = document.getElementById("summary-delivery");
//   const totalEl = document.getElementById("summary-total");
//   const deliverySelect = document.getElementById("delivery-zone");
//   const addressInput = document.getElementById("customer-address");

//   let subtotal = cart.reduce((sum, item) => sum + item.price, 0);

//   // Render items
//   cart.forEach(item => {
//     itemsContainer.innerHTML += `
//       <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
//         <span>${String(item.name).replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char])}</span>
//         <strong>₦${item.price.toLocaleString()}</strong>
//       </div>
//     `;
//   });
//   subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;

//   const updateCheckoutTotal = () => {
//     let deliveryFee = parseInt(deliverySelect.value) || 0;
//     let finalTotal = subtotal + deliveryFee;
//     deliveryEl.textContent = `₦${deliveryFee.toLocaleString()}`;
//     totalEl.textContent = `₦${finalTotal.toLocaleString()}`;
//   };

//   deliverySelect.addEventListener('change', updateCheckoutTotal);
//   updateCheckoutTotal(); // Initial math

//   // Auto-Move Map
//   if (addressInput) {
//     addressInput.addEventListener('change', () => {
//       const address = addressInput.value.trim();
//       if (address && geocoder && deliveryMap) {
//         geocoder.geocode({ address: address + ', Lagos, Nigeria' }, (results, status) => {
//           if (status === 'OK') {
//             const loc = results[0].geometry.location;
//             deliveryMap.setCenter(loc);
//             marker.setPosition(loc);
//             deliveryMap.setZoom(16);
//             document.getElementById("customer-lat").value = loc.lat();
//             document.getElementById("customer-lng").value = loc.lng();
//           }
//         });
//       }
//     });
//   }

//   // Paystack trigger placeholder
//   document.getElementById("paystack-checkout-btn").addEventListener("click", (e) => {
//     e.preventDefault();
//     alert("Ready to wire Paystack API here!");
//   });
// });


