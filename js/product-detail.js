// Product Detail Page Logic
let selectedColor = 'white';
let selectedSize = 'standard';
let quantity = 1;
let wishlistActive = false;

// Initialize product detail page
document.addEventListener('DOMContentLoaded', function() {
    // Load product details from URL or localStorage
    loadProductDetails();
    
    // Setup event listeners
    setupDetailEventListeners();
    
    // Load cart
    if (typeof loadCart === 'function') {
        loadCart();
    }
});

// Load product details
function loadProductDetails() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'watch1';
    
    // Load product from database
    const product = db.getProductById(productId);
    
    if (product) {
        displayProductDetails(product);
        loadRelatedProducts(product.category);
    } else {
        console.error('Product not found');
    }
}

// Display product details
function displayProductDetails(product) {
    const lang = i18n ? i18n.getLanguage() : 'en';
    
    // Update breadcrumb
    document.getElementById('categoryBreadcrumb').textContent = product.category || 'Category';
    document.getElementById('productNameBreadcrumb').textContent = lang === 'en' ? (product.nameEn || product.name) : product.name;
    
    // Update product title
    document.getElementById('productTitle').textContent = lang === 'en' ? (product.nameEn || product.name) : product.name;
    
    // Update price
    document.getElementById('currentPrice').textContent = '$' + product.price.toFixed(2);
    
    // Update main image if product has image
    if (product.image) {
        const mainImg = document.getElementById('mainProductImage');
        mainImg.src = product.image;
        
        // Update all thumbnails
        document.querySelectorAll('.thumbnail-item').forEach(item => {
            const img = item.querySelector('img');
            if (img) img.src = product.image;
        });
    }
    
    // Store product ID for cart
    window.currentProductId = product.id;
}

// Select main image
function selectMainImage(element) {
    const imageUrl = element.getAttribute('data-image');
    document.getElementById('mainProductImage').src = imageUrl;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
}

// Select option (color, size)
function selectOption(element, type) {
    // Remove active from siblings
    const parent = element.parentElement;
    parent.querySelectorAll('.option-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
    
    // Store selection
    const value = element.getAttribute('data-option');
    if (type === 'color') {
        selectedColor = value;
    } else if (type === 'size') {
        selectedSize = value;
    }
}

// Change quantity
function changeQuantity(delta) {
    const qtyInput = document.getElementById('quantity');
    let currentQty = parseInt(qtyInput.value) || 1;
    currentQty += delta;
    
    if (currentQty < 1) currentQty = 1;
    if (currentQty > 10) currentQty = 10;
    
    qtyInput.value = currentQty;
    quantity = currentQty;
}

// Add to cart from detail page
function addToCartFromDetail() {
    if (!window.currentProductId) {
        alert('Product ID not found');
        return;
    }
    
    // Add product to cart
    for (let i = 0; i < quantity; i++) {
        addToCart(window.currentProductId);
    }
    
    // Show success message
    showNotification('Product added to cart!', 'success');
}

// Buy now
function buyNow() {
    if (!window.currentProductId) {
        alert('Product ID not found');
        return;
    }
    
    // Add to cart and go to checkout
    addToCartFromDetail();
    setTimeout(() => {
        if (typeof goToCheckout === 'function') {
            goToCheckout();
        }
    }, 300);
}

// Toggle wishlist
function toggleWishlist() {
    const btn = document.querySelector('.btn-wishlist');
    wishlistActive = !wishlistActive;
    
    if (wishlistActive) {
        btn.classList.add('active');
        btn.querySelector('i').classList.remove('far');
        btn.querySelector('i').classList.add('fas');
        showNotification('Added to wishlist!', 'success');
    } else {
        btn.classList.remove('active');
        btn.querySelector('i').classList.remove('fas');
        btn.querySelector('i').classList.add('far');
        showNotification('Removed from wishlist', 'info');
    }
}

// Show tab content
function showTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
}

// Open image zoom
function openImageZoom() {
    const img = document.getElementById('mainProductImage');
    // Simple zoom implementation
    if (img.style.transform === 'scale(2)') {
        img.style.transform = 'scale(1)';
    } else {
        img.style.transform = 'scale(2)';
    }
}

// Load related products
function loadRelatedProducts(category) {
    const allProducts = db.getProducts();
    const relatedProducts = allProducts
        .filter(p => p.category === category && p.id !== window.currentProductId)
        .slice(0, 4);
    
    const container = document.getElementById('relatedProducts');
    if (!container || relatedProducts.length === 0) return;
    
    const lang = i18n ? i18n.getLanguage() : 'en';
    
    container.innerHTML = relatedProducts.map(product => `
        <div class="product-card">
            ${product.isNew ? '<div class="new-badge">NEW</div>' : ''}
            <img src="${product.image}" alt="${product.nameEn || product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${lang === 'en' ? (product.nameEn || product.name) : product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="product-button" onclick="window.location.href='product.html?id=${product.id}'">
                    View Product
                </button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupDetailEventListeners() {
    // Search icon
    const searchIcon = document.getElementById('searchIcon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            document.getElementById('searchModal').style.display = 'block';
        });
    }
    
    // Cart icon
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
    
    // User icon
    const userIcon = document.getElementById('userIcon');
    if (userIcon) {
        userIcon.addEventListener('click', toggleUserDropdown);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const searchIcon = document.getElementById('searchIcon');
    const userIcon = document.getElementById('userIcon');
    
    if (dropdown && !dropdown.contains(event.target) && !userIcon.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

