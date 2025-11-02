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
        checkCouponAvailability(product);
    } else {
        console.error('Product not found');
    }
}

// Check if coupon is available for product
function checkCouponAvailability(product) {
    // Check if product has coupon code
    if (product.couponCode) {
        document.getElementById('productCouponSection').style.display = 'block';
    }
}

// Apply coupon
function applyCoupon() {
    const couponCode = document.getElementById('couponInput').value.toUpperCase().trim();
    const messageDiv = document.getElementById('couponMessage');
    
    if (!couponCode) {
        messageDiv.innerHTML = '<span style="color: #e74c3c;">Please enter a coupon code</span>';
        return;
    }
    
    // Get coupon from database
    const coupon = db.getCouponByCode(couponCode);
    
    if (!coupon) {
        messageDiv.innerHTML = '<span style="color: #e74c3c;">Invalid coupon code</span>';
        return;
    }
    
    // Check expiry
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    
    if (now > expiry) {
        messageDiv.innerHTML = '<span style="color: #e74c3c;">This coupon has expired</span>';
        return;
    }
    
    // Apply discount
    const productPrice = parseFloat(document.getElementById('currentPrice').textContent.replace('$', ''));
    let discount = 0;
    let finalPrice = productPrice;
    
    if (coupon.type === 'percentage') {
        discount = productPrice * (coupon.value / 100);
    } else {
        discount = coupon.value;
    }
    
    finalPrice = productPrice - discount;
    
    if (finalPrice < 0) finalPrice = 0;
    
    // Update UI
    const originalPriceElement = document.getElementById('currentPrice');
    const originalPriceHTML = originalPriceElement.outerHTML;
    
    originalPriceElement.innerHTML = `
        ${originalPriceElement.textContent}
        <div style="margin-top: 0.5rem;">
            <span style="color: #27ae60; font-size: 1.5rem; font-weight: 700;">$${finalPrice.toFixed(2)}</span>
            <span style="text-decoration: line-through; color: #999; margin-left: 0.5rem;">$${productPrice.toFixed(2)}</span>
        </div>
    `;
    
    messageDiv.innerHTML = `<span style="color: #27ae60;"><i class="fas fa-check-circle"></i> Coupon applied! You saved $${discount.toFixed(2)}</span>`;
    
    // Store applied coupon
    window.appliedCoupon = coupon;
    window.productDiscount = discount;
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
    const currentPriceEl = document.getElementById('currentPrice');
    currentPriceEl.textContent = '$' + product.price.toFixed(2);
    
    // Update original price if exists
    if (product.originalPrice && product.originalPrice > product.price) {
        const originalPriceEl = document.getElementById('originalPrice');
        originalPriceEl.textContent = '$' + product.originalPrice.toFixed(2);
        originalPriceEl.style.display = 'inline';
        
        // Calculate discount badge
        const discount = ((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(0);
        const badge = document.createElement('span');
        badge.className = 'discount-badge';
        badge.textContent = discount + '% OFF';
        currentPriceEl.parentElement.appendChild(badge);
    }
    
    // Update badges
    const badgesContainer = document.getElementById('productBadges');
    badgesContainer.innerHTML = '';
    if (product.isNew) {
        badgesContainer.innerHTML += '<span class="badge new">NEW</span>';
    }
    if (product.isHot) {
        badgesContainer.innerHTML += '<span class="badge hot">HOT</span>';
    }
    
    // Update shipping info
    const shippingInfo = document.querySelector('.shipping-info');
    if (product.freeShipping) {
        shippingInfo.querySelector('.info-item:first-child strong').textContent = 'Free Shipping';
    } else if (product.shippingFee) {
        shippingInfo.querySelector('.info-item:first-child strong').textContent = 'Shipping: $' + product.shippingFee.toFixed(2);
    }
    
    // Update delivery days
    if (product.deliveryDays) {
        const deliveryText = shippingInfo.querySelector('.info-item:first-child p');
        deliveryText.textContent = 'Estimated delivery: ' + product.deliveryDays + ' days';
    }
    
    // Update main image if product has image
    if (product.image) {
        const mainImg = document.getElementById('mainProductImage');
        mainImg.src = product.image;
        
        // Update thumbnails with main image + gallery images
        const allImages = [product.image, ...(product.galleryImages || [])];
        const thumbnailContainer = document.querySelector('.thumbnail-sidebar');
        
        if (allImages.length > 0) {
            thumbnailContainer.innerHTML = allImages.map((imgUrl, index) => `
                <div class="thumbnail-item ${index === 0 ? 'active' : ''}" 
                     onclick="selectMainImage(this)" 
                     data-image="${imgUrl}">
                    <img src="${imgUrl}" alt="Thumbnail ${index + 1}">
                </div>
            `).join('');
        } else {
            // Fallback to old method if no gallery
            document.querySelectorAll('.thumbnail-item').forEach(item => {
                const img = item.querySelector('img');
                if (img) img.src = product.image;
            });
        }
    }
    
    // Update colors if available
    if (product.colors && product.colors.length > 0) {
        const colorsContainer = document.querySelector('.product-options .option-items:first-child');
        colorsContainer.innerHTML = product.colors.map((color, index) => `
            <div class="option-item color-option ${index === 0 ? 'active' : ''}" 
                 data-option="${color}" 
                 onclick="selectOption(this, 'color')">
                <div class="color-swatch" style="background: ${color};"></div>
                <span>${color}</span>
            </div>
        `).join('');
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
    // Search icon - only if visible
    const searchIcon = document.getElementById('searchIcon');
    if (searchIcon && searchIcon.style.display !== 'none') {
        // Remove existing listeners to avoid duplicates
        const newSearchIcon = searchIcon.cloneNode(true);
        searchIcon.parentNode.replaceChild(newSearchIcon, searchIcon);
        newSearchIcon.addEventListener('click', () => {
            document.getElementById('searchModal').style.display = 'block';
        });
    }
    
    // Cart icon - avoid duplicate
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon && !cartIcon.dataset.listenerAttached) {
        cartIcon.addEventListener('click', openCart);
        cartIcon.dataset.listenerAttached = 'true';
    }
    
    // User icon - avoid duplicate
    const userIcon = document.getElementById('userIcon');
    if (userIcon && !userIcon.dataset.listenerAttached) {
        userIcon.addEventListener('click', toggleUserDropdown);
        userIcon.dataset.listenerAttached = 'true';
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

