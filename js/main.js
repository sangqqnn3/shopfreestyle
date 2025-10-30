// Main Application Logic
let cart = [];
const PAYOUT_PAGE_URL = 'payout.html';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language switcher
    initLanguageSwitcher();
    
    // Load products and categories
    loadProducts();
    loadCategories();
    
    // Load cart
    loadCart();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update page with current language
    i18n.updatePage();
});

// Initialize Language Switcher
function initLanguageSwitcher() {
    const switcher = document.getElementById('languageSwitcher');
    switcher.innerHTML = `
        <button class="lang-btn ${i18n.getLanguage() === 'en' ? 'active' : ''}" 
                onclick="changeLanguage('en')" data-lang="en">
            🇺🇸 EN
        </button>
        <button class="lang-btn ${i18n.getLanguage() === 'vi' ? 'active' : ''}" 
                onclick="changeLanguage('vi')" data-lang="vi">
            🇻🇳 VI
        </button>
    `;
}

function changeLanguage(lang) {
    i18n.setLanguage(lang);
    initLanguageSwitcher();
    loadProducts(); // Reload products with new language
}

// Load Products
function loadProducts() {
    const products = db.getProducts();
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid || products.length === 0) return;
    
    const lang = i18n.getLanguage();
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            ${product.id.includes('watch') || product.id.includes('bag') ? 
                `<div class="new-badge" data-i18n="new">${i18n.t('new')}</div>` : ''}
            <img src="${product.image}" alt="${lang === 'en' ? product.nameEn : product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${lang === 'en' ? product.nameEn : product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="product-button" onclick="addToCart('${product.id}')" data-i18n="buyNow">
                    ${i18n.t('buyNow')}
                </button>
            </div>
        </div>
    `).join('');
}

// Load Categories
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    const lang = i18n.getLanguage();
    
    const categories = [
        {
            id: 'women-watches',
            name: lang === 'en' ? 'Women\'s Watches' : 'Đồng hồ nữ',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 89.95
        },
        {
            id: 'men-watches',
            name: lang === 'en' ? 'Men\'s Watches' : 'Đồng hồ nam',
            image: 'https://images.unsplash.com/photo-1523170335258-f5b6c6a4450b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 109.95
        },
        {
            id: 'jewelry',
            name: lang === 'en' ? 'Jewelry' : 'Trang sức',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 39.95
        },
        {
            id: 'bags',
            name: lang === 'en' ? 'Bags' : 'Túi xách',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 99.95
        }
    ];
    
    if (categoriesGrid) {
        categoriesGrid.innerHTML = categories.map(cat => `
            <div class="category-card" onclick="initiatePayment('${cat.id}', ${cat.price})">
                <div class="category-image" style="background-image: url('${cat.image}')"></div>
                <div class="category-overlay">
                    <h3 class="category-title">${cat.name}</h3>
                    <button class="category-button" data-i18n="shopNow">${i18n.t('shopNow')}</button>
                </div>
            </div>
        `).join('');
    }
}

// Add to Cart
function addToCart(productId) {
    const product = db.getProductById(productId);
    if (!product) {
        const productData = getProductData(productId);
        if (!productData) {
            alert('Product not found');
            return;
        }
        cart.push({
            id: productId,
            name: i18n.getLanguage() === 'en' ? productData.nameEn : productData.name,
            price: productData.price,
            image: productData.image || ''
        });
    } else {
        const lang = i18n.getLanguage();
        cart.push({
            id: product.id,
            name: lang === 'en' ? product.nameEn : product.name,
            price: product.price,
            image: product.image
        });
    }
    
    updateCart();
    saveCart();
    openCart();
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCart();
}

// Update Cart UI
function updateCart() {
    const cartContent = document.getElementById('cartContent');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p data-i18n="cartEmpty">${i18n.t('cartEmpty')}</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        updateCartIcon();
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = '$' + total.toFixed(2);
    
    cartContent.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    updateCartIcon();
}

// Update Cart Icon
function updateCartIcon() {
    const cartIcon = document.getElementById('cartIcon');
    if (cart.length > 0) {
        cartIcon.innerHTML = `
            <i class="fas fa-shopping-bag"></i>
            <span style="position: absolute; top: -8px; right: -8px; background: var(--primary-color); color: white; 
                         border-radius: 50%; width: 20px; height: 20px; font-size: 12px; 
                         display: flex; align-items: center; justify-content: center;">
                ${cart.length}
            </span>
        `;
        cartIcon.style.position = 'relative';
    } else {
        cartIcon.innerHTML = '<i class="fas fa-shopping-bag"></i>';
    }
}

// Load Cart
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCart();
}

// Save Cart
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Open Cart
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
}

// Close Cart
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
}

// Go to Checkout
function goToCheckout() {
    if (cart.length === 0) {
        alert(i18n.t('cartEmpty'));
        return;
    }
    
    // Save cart to localStorage for payout page
    saveCart();
    
    // Create order
    const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        userId: auth.currentUser ? auth.currentUser.id : null
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    window.location.href = PAYOUT_PAGE_URL;
}

// Initiate Payment
function initiatePayment(productId, amount) {
    const product = db.getProductById(productId);
    const lang = i18n.getLanguage();
    
    if (!product) {
        const productData = getProductData(productId);
        if (productData) {
            addToCart(productId);
            goToCheckout();
            return;
        }
    }
    
    const orderData = {
        productId: productId,
        productName: lang === 'en' ? product.nameEn : product.name,
        amount: amount,
        currency: 'USD',
        orderId: generateOrderId(),
        timestamp: Date.now(),
        userId: auth.currentUser ? auth.currentUser.id : null
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    
    // Add to cart and redirect
    addToCart(productId);
    setTimeout(() => {
        window.location.href = PAYOUT_PAGE_URL;
    }, 300);
}

// Get Product Data (fallback)
function getProductData(productId) {
    const products = {
        'watch1': { name: 'Đồng hồ nữ cao cấp', nameEn: 'Premium Women\'s Watch', price: 89.95, image: '' },
        'bracelet1': { name: 'Vòng tay vàng', nameEn: 'Gold Bracelet', price: 39.95, image: '' },
        'bag1': { name: 'Túi xách da cao cấp', nameEn: 'Premium Leather Bag', price: 99.95, image: '' },
        'watch2': { name: 'Đồng hồ nam thể thao', nameEn: 'Men\'s Sports Watch', price: 109.95, image: '' },
        'women-watches': { name: 'Bộ sưu tập đồng hồ nữ', nameEn: 'Women\'s Watches Collection', price: 89.95, image: '' },
        'men-watches': { name: 'Bộ sưu tập đồng hồ nam', nameEn: 'Men\'s Watches Collection', price: 109.95, image: '' },
        'jewelry': { name: 'Bộ sưu tập trang sức', nameEn: 'Jewelry Collection', price: 39.95, image: '' },
        'bags': { name: 'Bộ sưu tập túi xách', nameEn: 'Bags Collection', price: 99.95, image: '' }
    };
    return products[productId];
}

// Generate Order ID
function generateOrderId() {
    return 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Setup Event Listeners
function setupEventListeners() {
    // Cart icon click
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
    
    // Search icon click
    const searchIcon = document.getElementById('searchIcon');
    const searchModal = document.getElementById('searchModal');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            searchModal.style.display = 'block';
        });
    }
}

// Search Products
function searchProducts(event) {
    const query = event.target.value.toLowerCase().trim();
    const products = db.getProducts();
    const lang = i18n.getLanguage();

    const results = products.filter(product => {
        const name = lang === 'en' ? product.nameEn : product.name;
        const category = product.category || '';
        const keywords = (product.keywords || '').toLowerCase();
        const tags = (product.tags || '').toLowerCase();
        return (
            name.toLowerCase().includes(query) ||
            category.toLowerCase().includes(query) ||
            keywords.includes(query) ||
            tags.includes(query)
        );
    });

    const searchResults = document.getElementById('searchResults');
    if (!query) {
        searchResults.innerHTML = '<p>Type to search products...</p>';
        return;
    }

    if (results.length === 0) {
        searchResults.innerHTML = '<p>No products found</p>';
    } else {
        searchResults.innerHTML = results.map(product => `
            <div onclick="closeSearch(); window.location.href='#products'; addToCart('${product.id}')" 
                 style="padding: 1rem; border-bottom: 1px solid #ddd; cursor: pointer;">
                <strong>${lang === 'en' ? product.nameEn : product.name}</strong> - $${product.price.toFixed(2)}
            </div>
        `).join('');
    }
}

function closeSearch() {
    document.getElementById('searchModal').style.display = 'none';
}

// Login/Register Modals
function showLoginModal(e) {
    if (e) e.preventDefault();
    document.getElementById('userDropdown').classList.add('hidden');
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showRegisterModal(e) {
    if (e) e.preventDefault();
    document.getElementById('userDropdown').classList.add('hidden');
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmailInput').value;
    const password = document.getElementById('loginPasswordInput').value;

    const result = auth.login(email, password);
    if (result.success) {
        alert('Login successful!');
        closeLoginModal();
        location.reload(); // Reload to update UI
    } else {
        alert(result.message);
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerNameInput').value;
    const email = document.getElementById('registerEmailInput').value;
    const password = document.getElementById('registerPasswordInput').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirmInput').value;

    if (password !== passwordConfirm) {
        alert('Passwords do not match!');
        return;
    }

    const result = auth.register({ name, email, password });
    if (result.success) {
        alert('Registration successful!');
        closeRegisterModal();
        location.reload();
    } else {
        alert(result.message);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registerModal) {
        closeRegisterModal();
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

