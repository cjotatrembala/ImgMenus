const products = [
  {
    id: "panda-rockstar",
    title: "Rockstar Elite Account",
    category: "Rockstar Accounts",
    description: "Verified Rockstar profile with premium progress, secure handoff, and instant delivery.",
    price: 79.9,
    rating: 4.9,
    image: "assests/baixados34.png",
    delivery: "Instant delivery"
  },
  {
    id: "discord-nitro",
    title: "Discord Nitro Ready Account",
    category: "Discord Accounts",
    description: "Fresh Discord account prepared for communities, servers, and premium activation.",
    price: 39.9,
    rating: 4.8,
    image: "assests/noty.png",
    delivery: "Instant delivery"
  },
  {
    id: "gaming-vault",
    title: "Gaming Vault Bundle",
    category: "Gaming Accounts",
    description: "Multi-game account bundle with verified credentials and post-purchase support.",
    price: 119.9,
    rating: 4.7,
    image: "assests/cursorcheat3.png",
    delivery: "Instant delivery"
  },
  {
    id: "gift-card-pro",
    title: "Global Gift Card Code",
    category: "Gift Cards",
    description: "Digital gift card code for fast redemption across popular gaming stores.",
    price: 50,
    rating: 4.9,
    image: "assests/slider.png",
    delivery: "Instant delivery"
  },
  {
    id: "premium-boost",
    title: "Premium Boost Service",
    category: "Premium Services",
    description: "Managed service package for account setup, redemption, and marketplace guidance.",
    price: 149.9,
    rating: 5,
    image: "assests/lista3.png",
    delivery: "Priority delivery"
  },
  {
    id: "discord-community",
    title: "Discord Community Kit",
    category: "Discord Accounts",
    description: "Account and server-start kit with custom notification styling and security checklist.",
    price: 69.9,
    rating: 4.8,
    image: "assests/cursorcheat2.png",
    delivery: "Instant delivery"
  }
];

const state = {
  cart: JSON.parse(localStorage.getItem("panda-cart") || "{}"),
  tickets: JSON.parse(localStorage.getItem("panda-tickets") || "[]"),
  role: localStorage.getItem("panda-role") || "customer",
  userEmail: localStorage.getItem("panda-email") || "customer@pandamarket.gg"
};

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const productGrid = document.querySelector("[data-product-grid]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const categoryFilter = document.querySelector("[data-category-filter]");
const searchInput = document.querySelector("[data-search]");
const roleSelect = document.querySelector("[data-role-select]");
const roleStatus = document.querySelector("[data-role-status]");
const adminGrid = document.querySelector("[data-admin-grid]");
const adminLocked = document.querySelector("[data-admin-locked]");
const ticketList = document.querySelector("[data-ticket-list]");
const paymentModal = document.querySelector("[data-payment-modal]");
const qrCode = document.querySelector("[data-qr-code]");
const pixCode = document.querySelector("[data-pix-code]");
const paymentStatus = document.querySelector("[data-payment-status]");
const toastStack = document.querySelector("[data-toast-stack]");

function saveCart() {
  localStorage.setItem("panda-cart", JSON.stringify(state.cart));
}

function saveTickets() {
  localStorage.setItem("panda-tickets", JSON.stringify(state.tickets));
}

function toast(message) {
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  toastStack.appendChild(item);
  setTimeout(() => item.remove(), 3200);
}

function getCartProducts() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => {
      const product = products.find((entry) => entry.id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean);
}

function renderCategories() {
  const categories = [...new Set(products.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesQuery = [product.title, product.description, product.category]
      .join(" ")
      .toLowerCase()
      .includes(query);
    return matchesCategory && matchesQuery;
  });

  productGrid.innerHTML = filteredProducts
    .map((product) => `
      <article class="product-card reveal">
        <img class="product-image" src="${product.image}" alt="${product.title}">
        <div class="product-meta">
          <span>${product.category}</span>
          <span>★ ${product.rating.toFixed(1)}</span>
        </div>
        <span class="badge">${product.delivery}</span>
        <div>
          <h3>${product.title}</h3>
          <p>${product.description}</p>
        </div>
        <div class="product-footer">
          <span class="price">${money.format(product.price)}</span>
          <button class="btn btn-primary small" type="button" data-add-product="${product.id}">Add to Cart</button>
        </div>
      </article>
    `)
    .join("");
}

function renderCart() {
  const items = getCartProducts();
  const total = items.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const count = items.reduce((sum, product) => sum + product.quantity, 0);

  cartCount.textContent = count;
  cartTotal.textContent = money.format(total);

  if (!items.length) {
    cartItems.innerHTML = '<div class="cart-item">Your cart is empty. Add a product to start checkout.</div>';
    return;
  }

  cartItems.innerHTML = items
    .map((product) => `
      <article class="cart-item">
        <div class="cart-item-top">
          <div>
            <h3>${product.title}</h3>
            <span>${money.format(product.price)} each</span>
          </div>
          <strong>${money.format(product.price * product.quantity)}</strong>
        </div>
        <div class="quantity-row">
          <button type="button" aria-label="Decrease quantity" data-qty="${product.id}" data-direction="-1">−</button>
          <strong>${product.quantity}</strong>
          <button type="button" aria-label="Increase quantity" data-qty="${product.id}" data-direction="1">+</button>
          <button class="btn btn-danger small" type="button" data-remove="${product.id}">Remove</button>
        </div>
      </article>
    `)
    .join("");
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  renderCart();
  toast("Product added to cart");
}

function changeQuantity(id, direction) {
  state.cart[id] = (state.cart[id] || 0) + Number(direction);
  if (state.cart[id] <= 0) {
    delete state.cart[id];
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete state.cart[id];
  saveCart();
  renderCart();
  toast("Product removed from cart");
}

function renderRole() {
  roleSelect.value = state.role;
  const permissions = state.role === "admin"
    ? "Admin access enabled: manage products, orders, payments, tickets, customers, content, and prices."
    : "Customer access enabled: purchase products, open tickets, and view personal order history.";
  roleStatus.textContent = `${state.userEmail} — ${permissions}`;
  adminGrid.hidden = state.role !== "admin";
  adminLocked.hidden = state.role === "admin";
  renderTickets();
}

function renderTickets() {
  const visibleTickets = state.role === "admin"
    ? state.tickets
    : state.tickets.filter((ticket) => ticket.email === state.userEmail);

  document.querySelector("[data-admin-tickets]").textContent = state.tickets.length;
  document.querySelector("[data-admin-products]").textContent = products.length;

  if (!visibleTickets.length) {
    ticketList.innerHTML = '<div class="ticket-item">No tickets yet. New messages will show notifications here.</div>';
    return;
  }

  ticketList.innerHTML = visibleTickets
    .map((ticket) => `
      <article class="ticket-item">
        <div class="ticket-top">
          <div>
            <h3>${ticket.subject}</h3>
            <span>${ticket.email}</span>
          </div>
          <span class="notification-dot">${ticket.status}</span>
        </div>
        <p>${ticket.message}</p>
        ${ticket.reply ? `<p><strong>Admin reply:</strong> ${ticket.reply}</p>` : ""}
        ${state.role === "admin" ? `
          <div class="ticket-actions">
            <button class="btn btn-secondary small" type="button" data-reply-ticket="${ticket.id}">Reply</button>
            <button class="btn btn-danger small" type="button" data-close-ticket="${ticket.id}">Close</button>
          </div>
        ` : ""}
      </article>
    `)
    .join("");
}

function createTicket(subject, message) {
  state.tickets.unshift({
    id: crypto.randomUUID(),
    subject,
    message,
    email: state.userEmail,
    status: "New message",
    reply: ""
  });
  saveTickets();
  renderTickets();
  toast("Support ticket opened");
}

function adminReply(ticketId) {
  const ticket = state.tickets.find((entry) => entry.id === ticketId);
  if (!ticket) return;
  ticket.reply = "Admin response: We received your request and will help with redemption shortly.";
  ticket.status = "Admin replied";
  saveTickets();
  renderTickets();
  toast("Admin reply sent");
}

function closeTicket(ticketId) {
  const ticket = state.tickets.find((entry) => entry.id === ticketId);
  if (!ticket) return;
  ticket.status = "Closed";
  saveTickets();
  renderTickets();
  toast("Ticket closed");
}

function startCheckout() {
  const items = getCartProducts();
  const total = items.reduce((sum, product) => sum + product.price * product.quantity, 0);
  if (!items.length) {
    toast("Add products before checkout");
    return;
  }

  const paymentId = `PM-${Date.now()}`;
  const code = [
    "000201",
    `26580014br.gov.bcb.pix0136${paymentId}`,
    "52040000",
    "5303986",
    `540${total.toFixed(2)}`,
    "5802BR",
    "5913PANDA MARKET",
    "6009SAO PAULO",
    "62070503***",
    "6304A13F"
  ].join("");

  pixCode.value = code;
  qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(code)}`;
  paymentStatus.textContent = "Waiting for payment approval...";
  paymentModal.hidden = false;

  setTimeout(() => {
    paymentStatus.textContent = "Payment approved. Order confirmed and ready for instant delivery.";
    state.cart = {};
    saveCart();
    renderCart();
    toast("Payment approved and order confirmed");
  }, 3500);
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-product]");
  const quickAdd = event.target.closest("[data-quick-add]");
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  const replyButton = event.target.closest("[data-reply-ticket]");
  const closeButton = event.target.closest("[data-close-ticket]");

  if (addButton) addToCart(addButton.dataset.addProduct);
  if (quickAdd) addToCart(quickAdd.dataset.quickAdd);
  if (qtyButton) changeQuantity(qtyButton.dataset.qty, qtyButton.dataset.direction);
  if (removeButton) removeFromCart(removeButton.dataset.remove);
  if (replyButton) adminReply(replyButton.dataset.replyTicket);
  if (closeButton) closeTicket(closeButton.dataset.closeTicket);
});

document.querySelector("[data-menu-toggle]").addEventListener("click", () => {
  document.querySelector("[data-main-nav]").classList.toggle("is-open");
});

document.querySelector("[data-main-nav]").addEventListener("click", () => {
  document.querySelector("[data-main-nav]").classList.remove("is-open");
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

document.querySelector("[data-checkout]").addEventListener("click", startCheckout);

document.querySelector("[data-close-payment]").addEventListener("click", () => {
  paymentModal.hidden = true;
});

document.querySelector("[data-copy-pix]").addEventListener("click", async () => {
  await navigator.clipboard.writeText(pixCode.value);
  toast("PIX copy-and-paste code copied");
});

document.querySelector(".auth-card").addEventListener("submit", (event) => {
  event.preventDefault();
  state.role = roleSelect.value;
  state.userEmail = document.querySelector("[data-auth-email]").value || "customer@pandamarket.gg";
  localStorage.setItem("panda-role", state.role);
  localStorage.setItem("panda-email", state.userEmail);
  renderRole();
  toast(`${state.role === "admin" ? "Admin" : "Customer"} session started`);
});

document.querySelector("[data-ticket-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const subject = document.querySelector("[data-ticket-subject]");
  const message = document.querySelector("[data-ticket-message]");
  createTicket(subject.value, message.value);
  event.target.reset();
});

renderCategories();
renderProducts();
renderCart();
renderRole();
