// Enhanced JavaScript with advanced interactivity
class AmazonClone {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.products = [];
        
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.updateCartCount();
        this.bindEvents();
        this.initializePage();
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            this.products = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    bindEvents() {
        // Search functionality
        const searchBtn = document.querySelector('.search-btn');
        const searchInput = document.querySelector('.search-input');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
            
            // Live search suggestions
            searchInput.addEventListener('input', debounce(() => {
                this.showSearchSuggestions();
            }, 300));
        }

        // Cart icon animation on hover
        const cartLink = document.querySelector('.nav-link[href="/cart"]');
        if (cartLink) {
            cartLink.addEventListener('mouseenter', () => {
                cartLink.style.transform = 'scale(1.1)';
            });
            cartLink.addEventListener('mouseleave', () => {
                cartLink.style.transform = 'scale(1)';
            });
        }
    }

    initializePage() {
        const currentPath = window.location.pathname;
        
        switch (currentPath) {
            case '/':
                this.initHomePage();
                break;
            case '/cart':
                this.initCartPage();
                break;
            case '/orders':
                this.initOrdersPage();
                break;
            default:
                if (currentPath.startsWith('/product/')) {
                    this.initProductPage();
                }
        }
    }

    initHomePage() {
        this.animateProductCards();
        this.initQuickView();
    }

    initProductPage() {
        this.initImageZoom();
        this.initQuantitySelector();
        this.loadRelatedProducts();
    }

    initCartPage() {
        this.displayCartItems();
        this.updateCartSummary();
    }

    initOrdersPage() {
        this.displayOrders();
    }

    // Enhanced cart functionality
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('Product not found!', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.title} added to cart!`, 'success');
        this.animateCartIcon();
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartCount();
            this.showNotification(`${item.title} removed from cart!`, 'success');
            
            if (window.location.pathname === '/cart') {
                this.displayCartItems();
                this.updateCartSummary();
            }
        }
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartCount();
            
            if (window.location.pathname === '/cart') {
                this.displayCartItems();
                this.updateCartSummary();
            }
        }
    }

    displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const emptyCart = document.getElementById('empty-cart');
        
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
        
        let cartHTML = '';
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            cartHTML += `
                <div class="cart-item fade-in">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGOEY4RjgiLz48dGV4dCB4PSI2MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+'" />
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.title}</h3>
                        <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="amazonClone.updateQuantity(${item.id}, -1)">−</button>
                            <div class="quantity-display">${item.quantity}</div>
                            <button class="quantity-btn" onclick="amazonClone.updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <div style="margin-top: 12px; font-weight: 600; color: var(--error-color);">
                            Subtotal: ₹${itemTotal.toLocaleString()}
                        </div>
                    </div>
                    <button class="remove-btn" onclick="amazonClone.removeFromCart(${item.id})">
                        Remove
                    </button>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = cartHTML;
    }

    updateCartSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        
        if (!subtotalElement || !totalElement) return;
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 499 ? 0 : 99;
        const total = subtotal + shipping;
        
        subtotalElement.textContent = `₹${subtotal.toLocaleString()}`;
        totalElement.textContent = `₹${total.toLocaleString()}`;
        
        // Update shipping info
        const shippingElement = document.getElementById('shipping');
        if (shippingElement) {
            shippingElement.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        const orderId = 'ORD' + Date.now();
        const orderTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = orderTotal > 499 ? 0 : 99;
        
        const newOrder = {
            id: orderId,
            items: [...this.cart],
            subtotal: orderTotal,
            shipping: shipping,
            total: orderTotal + shipping,
            status: 'Processing',
            date: new Date().toLocaleDateString(),
            estimatedDelivery: this.getEstimatedDelivery()
        };
        
        this.orders.push(newOrder);
        this.saveOrders();
        
        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        
        this.showNotification(`Order placed successfully! Order ID: ${orderId}`, 'success');
        
        // Redirect to orders page
        setTimeout(() => {
            window.location.href = '/orders';
        }, 2000);
    }

    displayOrders() {
        const ordersContainer = document.getElementById('orders-list');
        const noOrders = document.getElementById('no-orders');
        
        if (!ordersContainer) return;

        if (this.orders.length === 0) {
            if (noOrders) noOrders.style.display = 'block';
            return;
        }
        
        if (noOrders) noOrders.style.display = 'none';
        
        let ordersHTML = '';
        
        this.orders.reverse().forEach(order => {
            let statusClass = 'status-processing';
            if (order.status === 'Delivered') statusClass = 'status-delivered';
            else if (order.status === 'Shipped') statusClass = 'status-shipped';
            
            let itemsHTML = '';
            order.items.forEach(item => {
                itemsHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                        <div>
                            <strong>${item.title}</strong><br>
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">Qty: ${item.quantity}</span>
                        </div>
                        <div style="font-weight: 600; color: var(--error-color);">
                            ₹${(item.price * item.quantity).toLocaleString()}
                        </div>
                    </div>
                `;
            });
            
            ordersHTML += `
                <div class="order-item fade-in">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Order ID: ${order.id}</div>
                            <div class="order-date">Placed on: ${order.date}</div>
                            ${order.estimatedDelivery ? `<div class="order-date">Estimated delivery: ${order.estimatedDelivery}</div>` : ''}
                        </div>
                        <div>
                            <span class="order-status ${statusClass}">${order.status}</span>
                        </div>
                    </div>
                    <div class="order-items">
                        ${itemsHTML}
                    </div>
                    <div class="summary-row total">
                        <span>Total Amount:</span>
                        <span>₹${order.total.toLocaleString()}</span>
                    </div>
                </div>
            `;
        });
        
        ordersContainer.innerHTML = ordersHTML;
        
        // Simulate order status updates
        this.simulateOrderUpdates();
    }

    simulateOrderUpdates() {
        setTimeout(() => {
            if (this.orders.length > 0) {
                const latestOrder = this.orders[this.orders.length - 1];
                if (latestOrder.status === 'Processing') {
                    latestOrder.status = 'Shipped';
                    this.saveOrders();
                    this.displayOrders();
                    this.showNotification('Your latest order has been shipped!', 'success');
                }
            }
        }, 5000);
    }

    // Search functionality
    async handleSearch() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput?.value.trim();
        
        if (!query) return;
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            
            this.displaySearchResults(results, query);
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Search failed. Please try again.', 'error');
        }
    }

    displaySearchResults(results, query) {
        const container = document.querySelector('.container');
        if (!container) return;
        
        let resultsHTML = `
            <div class="search-results">
                <h2 class="section-title">Search Results for "${query}" (${results.length} items)</h2>
                <div class="products-grid">
        `;
        
        results.forEach(product => {
            resultsHTML += this.generateProductCard(product);
        });
        
        resultsHTML += `
                </div>
            </div>
        `;
        
        container.innerHTML = resultsHTML;
        this.animateProductCards();
    }

    generateProductCard(product) {
        const discountBadge = product.discount ? `<div class="discount-badge">${product.discount}% OFF</div>` : '';
        const fastDeliveryBadge = product.fastDelivery ? `<div class="fast-delivery">Fast Delivery</div>` : '';
        
        return `
            <div class="product-card fade-in" onclick="window.location.href='/product/${product.id}'">
                ${discountBadge}
                ${fastDeliveryBadge}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGOEY4RjgiLz48dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='" />
                </div>
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">
                    <span class="current-price">₹${product.price.toLocaleString()}</span>
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-rating">
                    <span class="stars">${this.generateStars(product.rating)}</span>
                    <span class="reviews">(${product.reviews})</span>
                </div>
                <div class="product-features">
                    ${product.features.slice(0, 3).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); amazonClone.addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        if (hasHalfStar) {
            stars += '☆';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        
        return stars;
    }

    // Animation functions
    animateProductCards() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }

    animateCartIcon() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.style.animation = 'none';
            setTimeout(() => {
                cartCount.style.animation = 'pulse 0.5s ease-in-out';
            }, 10);
        }
    }

    // Utility functions
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.style.display = 'inline-block';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    getEstimatedDelivery() {
        const today = new Date();
        const deliveryDate = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now
        return deliveryDate.toLocaleDateString();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '10000';
        notification.style.maxWidth = '300px';
        notification.style.animation = 'fadeInUp 0.3s ease-out';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application
const amazonClone = new AmazonClone();

// Global functions for EJS templates
window.addToCart = (productId) => amazonClone.addToCart(productId);
window.removeFromCart = (productId) => amazonClone.removeFromCart(productId);
window.updateQuantity = (productId, change) => amazonClone.updateQuantity(productId, change);
window.checkout = () => amazonClone.checkout();

// Add fade-out animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
