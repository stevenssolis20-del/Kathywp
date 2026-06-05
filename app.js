document.addEventListener('DOMContentLoaded', () => {
    console.log('APP CARGADO');

    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartCount = document.getElementById('cartCount');
    const cartTotalText = document.getElementById('cartTotalText');
    const finalizeOrder = document.getElementById('finalizeOrder');
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMessage = document.getElementById('newsletterMessage');
    const sections = document.querySelectorAll('section');
    const addButtons = document.querySelectorAll('.add-to-cart');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    const cart = {};

    const formatPrice = (value) => `S/. ${value.toFixed(2)}`;

    const updateCartSummary = () => {
        const items = Object.values(cart);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

        if (cartCount) {
            cartCount.textContent = totalQuantity;
        }

        if (cartTotalText) {
            cartTotalText.textContent = formatPrice(totalValue);
        }

        if (finalizeOrder) {
            finalizeOrder.disabled = totalQuantity === 0;
        }
    };

    const attachCartControls = () => {
        if (!cartItemsContainer) {
            return;
        }

        cartItemsContainer.querySelectorAll('.qty-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const id = button.dataset.id;

                if (!id) {
                    return;
                }

                if (action === 'increase') {
                    cart[id].quantity += 1;
                } else if (action === 'decrease') {
                    cart[id].quantity -= 1;
                    if (cart[id].quantity <= 0) {
                        delete cart[id];
                    }
                }

                renderCartItems();
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item').forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                if (!id) {
                    return;
                }

                delete cart[id];
                renderCartItems();
            });
        });
    };

    const renderCartItems = () => {
        const items = Object.values(cart);

        if (!cartItemsContainer) {
            return;
        }

        if (items.length === 0) {
            cartItemsContainer.innerHTML = `<p>Tu carrito está vacío.</p>`;
            updateCartSummary();
            return;
        }

        const cartHtml = items
            .map((item) => {
                const lineTotal = item.quantity * item.price;
                return `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <strong>${item.name}</strong>
                            <div class="cart-quantity">
                                <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                            </div>
                            <span>Cantidad: ${item.quantity}</span>
                        </div>
                        <div class="cart-item-value">
                            <span>${formatPrice(item.price)}</span>
                            <span>Total: ${formatPrice(lineTotal)}</span>
                            <button class="remove-item" data-id="${item.id}" aria-label="Eliminar producto">Eliminar</button>
                        </div>
                    </div>
                `;
            })
            .join('');

        cartItemsContainer.innerHTML = cartHtml;
        updateCartSummary();
        attachCartControls();
    };

    const subscribeNewsletter = (email) => {
        if (!newsletterMessage) {
            return;
        }

        newsletterMessage.textContent = `¡Gracias! El correo ${email} ha sido registrado.`;
        newsletterMessage.classList.remove('error');
        newsletterMessage.classList.add('success');
    };

    const showNewsletterError = (message) => {
        if (!newsletterMessage) {
            return;
        }

        newsletterMessage.textContent = message;
        newsletterMessage.classList.remove('success');
        newsletterMessage.classList.add('error');
    };

    const handleNewsletterSubmit = (event) => {
        event.preventDefault();

        if (!newsletterForm) {
            return;
        }

        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value.trim() : '';
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !validEmail.test(email)) {
            showNewsletterError('Por favor ingresa un correo válido.');
            if (emailInput) {
                emailInput.focus();
            }
            return;
        }

        subscribeNewsletter(email);

        if (emailInput) {
            emailInput.value = '';
        }

        const mailto = `mailto:info@cacaoconrostro.pe?subject=Suscripción%20newsletter&body=Quiero%20suscribirme%20al%20newsletter%20con%20el%20correo%20${encodeURIComponent(email)}`;
        window.location.href = mailto;
    };

    const createSectionObserver = () => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
            }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });
    };

    const handleFinalizeOrder = () => {
        const items = Object.values(cart);
        if (items.length === 0) {
            return;
        }

        const orderLines = items
            .map((item) => `${item.quantity}x ${item.name} = ${formatPrice(item.quantity * item.price)}`)
            .join('%0A');
        const total = formatPrice(items.reduce((sum, item) => sum + item.quantity * item.price, 0));
        const subject = 'Pedido%20Cacao%20con%20Rostro';
        const body = `Quiero%20realizar%20este%20pedido:%0A${orderLines}%0A%0ATotal:%20${encodeURIComponent(total)}`;
        window.location.href = `mailto:info@cacaoconrostro.pe?subject=${subject}&body=${body}`;
    };

    const openCart = () => {
        if (cartSidebar) {
            cartSidebar.classList.add('open');
        }
        if (cartOverlay) {
            cartOverlay.classList.add('show');
        }
    };

    const closeCartSidebar = () => {
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
        if (cartOverlay) {
            cartOverlay.classList.remove('show');
        }
    };

    const addToCart = (id, name, price) => {
        const productId = String(id);

        if (!cart[productId]) {
            cart[productId] = { id: productId, name, price, quantity: 0 };
        }

        cart[productId].quantity += 1;
        renderCartItems();
    };

    if (cartToggle) {
        cartToggle.addEventListener('click', openCart);
    }

    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCartSidebar);
    }

    const toggleMenu = () => {
        if (!navMenu) {
            return;
        }

        navMenu.classList.toggle('open');
        const expanded = navMenu.classList.contains('open');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    if (navMenu) {
        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    if (finalizeOrder) {
        finalizeOrder.addEventListener('click', handleFinalizeOrder);
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    if (addButtons.length) {
        addButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const name = button.dataset.name;
                const price = parseFloat(button.dataset.price) || 0;

                if (!id || !name) {
                    return;
                }

                addToCart(id, name, price);
            });
        });
    }

    renderCartItems();
    createSectionObserver();
});