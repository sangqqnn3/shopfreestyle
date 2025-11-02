// Category Page Logic
let currentCategory = '';
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;
let currentView = 'grid';
let sortOrder = 'default';

// Initialize category page
document.addEventListener('DOMContentLoaded', function() {
    // Get category from page
    const path = window.location.pathname;
    if (path.includes('watches')) {
        currentCategory = 'watches';
    } else if (path.includes('jewelry')) {
        currentCategory = 'jewelry';
    } else if (path.includes('bags')) {
        currentCategory = 'bags';
    }
    
    // Initialize page
    if (currentCategory) {
        loadCategoryProducts();
        setupFilters();
        setupPriceRange();
        loadRecentlyViewed();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load cart
    if (typeof loadCart === 'function') {
        loadCart();
    }
});

// Load products for current category
function loadCategoryProducts() {
    const allProducts = db.getProducts();
    
    // Map category names to database categories
    const categoryMap = {
        'watches': ['women-watches', 'men-watches', 'watch'],
        'jewelry': ['jewelry'],
        'bags': ['bags']
    };
    
    const validCategories = categoryMap[currentCategory] || [];
    
    // Filter products by category
    filteredProducts = allProducts.filter(product => {
        const productCategory = product.category || '';
        return validCategories.some(cat => productCategory.includes(cat));
    });
    
    // If no products match, create sample data
    if (filteredProducts.length === 0) {
        filteredProducts = generateSampleProducts();
    }
    
    // Apply filters and display
    applyFilters();
}

// Generate sample products based on category
function generateSampleProducts() {
    const samples = {
        'watches': [
            {
                id: 'watch1',
                name: 'Premium Women\'s Watch',
                nameEn: 'Premium Women\'s Watch',
                price: 89.95,
                category: 'women-watches',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Elegant women\'s watch with luxurious design',
                descriptionEn: 'Elegant women\'s watch with luxurious design',
                stock: 50,
                isNew: true
            },
            {
                id: 'watch2',
                name: 'Men\'s Sports Watch',
                nameEn: 'Men\'s Sports Watch',
                price: 109.95,
                category: 'men-watches',
                image: 'https://images.unsplash.com/photo-1523170335258-f5b6c6a4450b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Durable sports watch for active men',
                descriptionEn: 'Durable sports watch for active men',
                stock: 40,
                isNew: false
            },
            {
                id: 'watch3',
                name: 'Luxury Gold Watch',
                nameEn: 'Luxury Gold Watch',
                price: 299.95,
                category: 'men-watches',
                image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Premium gold watch with automatic movement',
                descriptionEn: 'Premium gold watch with automatic movement',
                stock: 20,
                isNew: true
            },
            {
                id: 'watch4',
                name: 'Elegant Rose Gold Watch',
                nameEn: 'Elegant Rose Gold Watch',
                price: 159.95,
                category: 'women-watches',
                image: 'https://images.unsplash.com/photo-1553763721-4db4b783b84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Beautiful rose gold watch for elegant women',
                descriptionEn: 'Beautiful rose gold watch for elegant women',
                stock: 35,
                isNew: false
            }
        ],
        'jewelry': [
            {
                id: 'jewelry1',
                name: 'Gold Bracelet',
                nameEn: 'Gold Bracelet',
                price: 39.95,
                category: 'jewelry',
                image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Premium 18k gold bracelet',
                descriptionEn: 'Premium 18k gold bracelet',
                stock: 30,
                isNew: false
            },
            {
                id: 'jewelry2',
                name: 'Diamond Necklace',
                nameEn: 'Diamond Necklace',
                price: 199.95,
                category: 'jewelry',
                image: 'https://images.unsplash.com/photo-1603561596112-0a132a758d67?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Stunning diamond necklace',
                descriptionEn: 'Stunning diamond necklace',
                stock: 15,
                isNew: true
            },
            {
                id: 'jewelry3',
                name: 'Silver Earrings',
                nameEn: 'Silver Earrings',
                price: 29.95,
                category: 'jewelry',
                image: 'https://images.unsplash.com/photo-1611967164521-abae8fba4668?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Elegant silver earrings set',
                descriptionEn: 'Elegant silver earrings set',
                stock: 50,
                isNew: false
            }
        ],
        'bags': [
            {
                id: 'bag1',
                name: 'Premium Leather Bag',
                nameEn: 'Premium Leather Bag',
                price: 99.95,
                category: 'bags',
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Genuine leather handbag',
                descriptionEn: 'Genuine leather handbag',
                stock: 25,
                isNew: true
            },
            {
                id: 'bag2',
                name: 'Stylish Backpack',
                nameEn: 'Stylish Backpack',
                price: 79.95,
                category: 'bags',
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Modern backpack for daily use',
                descriptionEn: 'Modern backpack for daily use',
                stock: 30,
                isNew: false
            },
            {
                id: 'bag3',
                name: 'Designer Tote Bag',
                nameEn: 'Designer Tote Bag',
                price: 69.95,
                category: 'bags',
                image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                description: 'Spacious tote bag for shopping',
                descriptionEn: 'Spacious tote bag for shopping',
                stock: 20,
                isNew: true
            }
        ]
    };
    
    return samples[currentCategory] || [];
}

// Setup filter event listeners
function setupFilters() {
    // Checkbox filters
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// Setup price range slider
function setupPriceRange() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceMinValue = document.getElementById('priceMinValue');
    const priceMaxValue = document.getElementById('priceMaxValue');
    
    if (priceMin && priceMax && priceMinValue && priceMaxValue) {
        // Update display values
        function updatePriceDisplay() {
            priceMinValue.textContent = priceMin.value;
            priceMaxValue.textContent = priceMax.value;
        }
        
        priceMin.addEventListener('input', () => {
            if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
                priceMin.value = priceMax.value;
            }
            updatePriceDisplay();
            applyFilters();
        });
        
        priceMax.addEventListener('input', () => {
            if (parseInt(priceMax.value) < parseInt(priceMin.value)) {
                priceMax.value = priceMin.value;
            }
            updatePriceDisplay();
            applyFilters();
        });
    }
}

// Apply filters
function applyFilters() {
    let filtered = [...filteredProducts];
    
    // Price filter
    const minPrice = parseInt(document.getElementById('priceMin').value) || 0;
    const maxPrice = parseInt(document.getElementById('priceMax').value) || 1000;
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    // Category-specific filters
    const checkedFilters = {};
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]:checked');
    filterCheckboxes.forEach(cb => {
        const name = cb.name;
        if (!checkedFilters[name]) {
            checkedFilters[name] = [];
        }
        checkedFilters[name].push(cb.value);
    });
    
    // Apply checked filters
    if (Object.keys(checkedFilters).length > 0) {
        filtered = filtered.filter(product => {
            // This is a simplified filter - customize based on your product data structure
            return true; // For now, accept all products
        });
    }
    
    // Update filtered products
    filteredProducts = filtered;
    
    // Update display
    updateProductsDisplay();
}

// Update products display
function updateProductsDisplay() {
    const container = document.getElementById('productsContainer');
    const countElement = document.getElementById('productsCount');
    
    if (!container) return;
    
    // Update count
    if (countElement) {
        countElement.textContent = `${filteredProducts.length} products found`;
    }
    
    // Sort products
    const sortedProducts = sortProductsArray(filteredProducts);
    
    // Paginate
    const paginatedProducts = paginateProducts(sortedProducts);
    
    // Display
    displayProducts(paginatedProducts);
    
    // Update pagination
    updatePagination(sortedProducts.length);
}

// Sort products array
function sortProductsArray(products) {
    const sorted = [...products];
    
    switch(sortOrder) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            sorted.sort((a, b) => (a.nameEn || a.name).localeCompare(b.nameEn || b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => (b.nameEn || b.name).localeCompare(a.nameEn || a.name));
            break;
        case 'newest':
            sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            break;
        default:
            // Keep original order
            break;
    }
    
    return sorted;
}

// Paginate products
function paginateProducts(products) {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    return products.slice(start, end);
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    const lang = i18n ? i18n.getLanguage() : 'en';
    
    if (currentView === 'grid') {
        container.className = 'products-container grid-view';
        container.innerHTML = products.map(product => `
            <div class="product-card category-product-card">
                ${product.isNew ? '<div class="new-badge">NEW</div>' : ''}
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.nameEn || product.name}" class="product-image" 
                         onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                    <div class="product-overlay">
                        <button class="quick-view-btn" onclick="window.location.href='product.html?id=${product.id}'">
                            <i class="fas fa-eye"></i> Quick View
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title" style="cursor: pointer;" onclick="window.location.href='product.html?id=${product.id}'">${lang === 'en' ? (product.nameEn || product.name) : product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="product-button" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        container.className = 'products-container list-view';
        container.innerHTML = products.map(product => `
            <div class="product-card-list">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.nameEn || product.name}" class="product-image"
                         onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                    ${product.isNew ? '<div class="new-badge">NEW</div>' : ''}
                </div>
                <div class="product-details-list">
                    <h3 class="product-title" style="cursor: pointer;" onclick="window.location.href='product.html?id=${product.id}'">${lang === 'en' ? (product.nameEn || product.name) : product.name}</h3>
                    <p class="product-description">${lang === 'en' ? (product.descriptionEn || product.description) : product.description}</p>
                    <div class="product-actions-list">
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <div class="action-buttons">
                            <button class="quick-view-btn" onclick="window.location.href='product.html?id=${product.id}'">
                                <i class="fas fa-eye"></i> Quick View
                            </button>
                            <button class="product-button" onclick="addToCart('${product.id}')">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Update pagination
function updatePagination(totalProducts) {
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;
    
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    
    if (totalPages <= 1) {
        pageNumbers.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i}</button>`;
        } else {
            html += `<button class="page-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }
    
    pageNumbers.innerHTML = html;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateProductsDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    updateProductsDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Change view (grid/list)
function setView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update display
    updateProductsDisplay();
}

// Sort products
function sortProducts(order) {
    sortOrder = order;
    currentPage = 1; // Reset to first page
    updateProductsDisplay();
}

// Clear all filters
function clearFilters() {
    // Reset checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Reset price range
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) priceMin.value = 0;
    if (priceMax) priceMax.value = 1000;
    
    // Reset price display
    setupPriceRange();
    
    // Reload products
    loadCategoryProducts();
}

// Setup event listeners
function setupEventListeners() {
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

// Load recently viewed products
function loadRecentlyViewed() {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const section = document.getElementById('recentlyViewedSection');
    const container = document.getElementById('recentlyViewed');
    
    if (!section || !container || recentlyViewed.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }
    
    const products = db.getProducts();
    const viewedProducts = recentlyViewed
        .slice(-4) // Last 4 viewed
        .map(id => products.find(p => p.id === id))
        .filter(p => p);
    
    if (viewedProducts.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    const lang = i18n ? i18n.getLanguage() : 'en';
    
    container.innerHTML = viewedProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.nameEn || product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${lang === 'en' ? (product.nameEn || product.name) : product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="product-button" onclick="addToCart('${product.id}')">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Show quick view modal (placeholder)
function showQuickView(productId) {
    const product = db.getProductById(productId) || 
                   generateSampleProducts().find(p => p.id === productId);
    
    if (!product) return;
    
    // Simple alert for now - can be enhanced with modal
    alert(`Quick View: ${product.nameEn || product.name}\nPrice: $${product.price.toFixed(2)}\n\nClick Add to Cart to purchase.`);
}

// Search products
function searchProducts(event) {
    if (event.key === 'Enter') {
        performSearch();
    } else {
        const query = event.target.value.toLowerCase().trim();
        const searchResults = document.getElementById('searchResults');
        
        if (!searchResults) return;
        
        if (!query) {
            searchResults.innerHTML = '<p>Type to search products...</p>';
            return;
        }
        
        const allProducts = db.getProducts();
        const results = allProducts.filter(product => {
            const name = (product.nameEn || product.name).toLowerCase();
            const description = (product.descriptionEn || product.description).toLowerCase();
            return name.includes(query) || description.includes(query);
        });
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No products found</p>';
        } else {
            const lang = i18n ? i18n.getLanguage() : 'en';
            searchResults.innerHTML = results.map(product => `
                <div class="search-result-item" onclick="selectSearchProduct('${product.id}')">
                    <img src="${product.image}" alt="${product.name}" class="search-result-image">
                    <div class="search-result-info">
                        <strong>${lang === 'en' ? (product.nameEn || product.name) : product.name}</strong>
                        <p>$${product.price.toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Perform search
function performSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
        console.log('Searching for:', input.value);
    }
}

// Select search product
function selectSearchProduct(productId) {
    closeSearch();
    addToCart(productId);
}

// Close search
function closeSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) modal.style.display = 'none';
    
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    
    const results = document.getElementById('searchResults');
    if (results) results.innerHTML = '';
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

