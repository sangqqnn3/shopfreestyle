// Admin Panel Logic
// Security check function
function checkAdminAccess() {
    // Check if database is initialized
    if (!db || typeof db === 'undefined') {
        console.error('Database not initialized');
        return false;
    }

    // Check if auth is initialized
    if (!auth || typeof auth === 'undefined') {
        console.error('Auth not initialized');
        return false;
    }

    // Check if user is logged in
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
        return false;
    }

    // Get user from database
    const user = db.getUserById(userId);
    if (!user) {
        return false;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth to initialize
    setTimeout(function() {
        // Strict security check
        if (!checkAdminAccess()) {
            alert('Access denied. Admin login required.');
            window.location.href = 'index.html';
            return;
        }

        // Load dashboard
        loadDashboard();
        loadUsers();
        loadProducts();
        loadOrders();
    }, 100);
});

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));

    // Show selected tab
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Reload data based on tab
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'products') {
        loadProducts();
    } else if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'aliexpress') {
        // AliExpress tab loaded
    }
}

// Dashboard
function loadDashboard() {
    const users = db.getUsers();
    const products = db.getProducts();
    const orders = db.getOrders();

    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);
}

// Users Management
function loadUsers() {
    const users = db.getUsers();
    const tbody = document.getElementById('usersTableBody');

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td><span style="padding: 0.25rem 0.5rem; background: ${user.role === 'admin' ? '#d4af37' : '#ccc'}; 
                            color: white; border-radius: 3px;">${user.role}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-edit" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showUserForm(userId = null) {
    const form = document.getElementById('userForm');
    const title = document.getElementById('userFormTitle');

    if (userId) {
        const user = db.getUserById(userId);
        title.textContent = 'Edit User';
        document.getElementById('userId').value = userId;
        document.getElementById('userName').value = user.name || '';
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPassword').value = '';
        document.getElementById('userRole').value = user.role || 'customer';
    } else {
        title.textContent = 'Add User';
        document.getElementById('userId').value = '';
        document.getElementById('userForm').querySelector('form').reset();
    }

    form.classList.add('active');
}

function closeUserForm() {
    document.getElementById('userForm').classList.remove('active');
}

function saveUser(e) {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value
    };

    if (userId) {
        // Update
        const password = document.getElementById('userPassword').value;
        if (password) {
            userData.password = password;
        }
        db.updateUser(userId, userData);
        alert('User updated successfully!');
    } else {
        // Add new
        const password = document.getElementById('userPassword').value;
        if (!password) {
            alert('Password is required for new users!');
            return;
        }
        db.addUser({ ...userData, password });
        alert('User added successfully!');
    }

    closeUserForm();
    loadUsers();
    loadDashboard();
}

function editUser(userId) {
    showUserForm(userId);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        db.deleteUser(userId);
        alert('User deleted successfully!');
        loadUsers();
        loadDashboard();
    }
}

// Products Management
function loadProducts() {
    const products = db.getProducts();
    const tbody = document.getElementById('productsTableBody');

    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.nameEn}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;"></td>
            <td>${product.nameEn || 'N/A'}</td>
            <td>${product.name || 'N/A'}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.category || 'N/A'}</td>
            <td>${product.stock || 0}</td>
            <td>
                <button class="btn btn-edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showProductForm(productId = null) {
    const form = document.getElementById('productForm');
    const title = document.getElementById('productFormTitle');

    if (productId) {
        const product = db.getProductById(productId);
        title.textContent = 'Edit Product';
        document.getElementById('productId').value = productId;
        document.getElementById('productNameEn').value = product.nameEn || '';
        document.getElementById('productNameVi').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productStock').value = product.stock || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescEn').value = product.descriptionEn || '';
        document.getElementById('productDescVi').value = product.description || '';
    } else {
        title.textContent = 'Add Product';
        document.getElementById('productId').value = '';
        document.getElementById('productForm').querySelector('form').reset();
    }

    form.classList.add('active');
}

function closeProductForm() {
    document.getElementById('productForm').classList.remove('active');
}

function saveProduct(e) {
    e.preventDefault();
    const productId = document.getElementById('productId').value;
    const productData = {
        nameEn: document.getElementById('productNameEn').value,
        name: document.getElementById('productNameVi').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        descriptionEn: document.getElementById('productDescEn').value,
        description: document.getElementById('productDescVi').value
    };

    if (productId) {
        // Update
        db.updateProduct(productId, productData);
        alert('Product updated successfully!');
    } else {
        // Add new
        db.addProduct(productData);
        alert('Product added successfully!');
    }

    closeProductForm();
    loadProducts();
    loadDashboard();
}

function editProduct(productId) {
    showProductForm(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        db.deleteProduct(productId);
        alert('Product deleted successfully!');
        loadProducts();
        loadDashboard();
    }
}

// Orders Management
function loadOrders() {
    // Get orders from both database and localStorage
    const dbOrders = db.getOrders();
    const localStorageOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Combine and sort orders
    const allOrders = [...dbOrders, ...localStorageOrders].sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    );
    
    const tbody = document.getElementById('ordersTableBody');

    if (allOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = allOrders.map(order => {
        const user = order.userId ? db.getUserById(order.userId) : null;
        const customer = order.customer;
        const items = order.items || [{ name: order.productName || 'N/A', price: order.amount || 0 }];
        
        // Customer info
        let customerInfo = 'Guest';
        if (customer) {
            customerInfo = `${customer.name} | ${customer.phone}`;
        } else if (user) {
            customerInfo = user.name || user.email;
        }
        
        // Items text
        const itemsText = items.map(item => `${item.name} (x${item.quantity || 1})`).join(', ');
        
        return `
            <tr>
                <td>${order.id}</td>
                <td>
                    <div>
                        <strong>${customerInfo}</strong><br>
                        <small style="color: #666;">${customer?.email || user?.email || 'No email'}</small>
                    </div>
                </td>
                <td>
                    <div style="max-width: 200px; font-size: 0.9rem;">
                        ${itemsText}
                    </div>
                </td>
                <td>$${(order.total || order.amount || 0).toFixed(2)}</td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; background: ${order.status === 'completed' ? '#27ae60' : '#f39c12'}; color: white; border-radius: 3px; font-size: 0.8rem;">
                        ${order.status || 'pending'}
                    </span>
                </td>
                <td>${new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-sm" onclick="viewOrderDetails('${order.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm" onclick="updateOrderStatus('${order.id}')" title="Update Status">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm" onclick="copyAliExpressInfo('${order.id}')" title="Copy for AliExpress">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStatus(orderId) {
    // Find order in both database and localStorage
    let order = db.getOrderById(orderId);
    let isLocalStorageOrder = false;
    
    if (!order) {
        const localStorageOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        order = localStorageOrders.find(o => o.id === orderId);
        isLocalStorageOrder = true;
    }
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    const newStatus = prompt('Enter new status (pending/completed/cancelled):', order.status || 'pending');
    
    if (newStatus && ['pending', 'completed', 'cancelled'].includes(newStatus)) {
        if (isLocalStorageOrder) {
            // Update in localStorage
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const orderIndex = orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
                localStorage.setItem('orders', JSON.stringify(orders));
            }
        } else {
            // Update in database
            db.updateOrder(orderId, { status: newStatus });
        }
        
        alert('Order status updated!');
        loadOrders();
        loadDashboard();
    }
}

function viewOrderDetails(orderId) {
    // Find order in both database and localStorage
    let order = db.getOrderById(orderId);
    let isLocalStorageOrder = false;
    
    if (!order) {
        const localStorageOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        order = localStorageOrders.find(o => o.id === orderId);
        isLocalStorageOrder = true;
    }
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    const customer = order.customer;
    const items = order.items || [];
    
    let details = `Order ID: ${order.id}\n`;
    details += `Status: ${order.status || 'pending'}\n`;
    details += `Total: $${(order.total || order.amount || 0).toFixed(2)}\n`;
    details += `Created: ${new Date(order.createdAt || order.date).toLocaleString()}\n\n`;
    
    if (customer) {
        details += `Customer Information:\n`;
        details += `Name: ${customer.name}\n`;
        details += `Phone: ${customer.phone}\n`;
        details += `Email: ${customer.email}\n`;
        details += `Address: ${customer.fullAddress || 'N/A'}\n`;
        details += `Payment Method: ${order.paymentMethod || 'N/A'}\n\n`;
    }
    
    details += `Items:\n`;
    items.forEach((item, index) => {
        details += `${index + 1}. ${item.name} (x${item.quantity || 1}) - $${item.price.toFixed(2)}\n`;
    });
    
    alert(details);
}

function copyAliExpressInfo(orderId) {
    // Find order in both database and localStorage
    let order = db.getOrderById(orderId);
    let isLocalStorageOrder = false;
    
    if (!order) {
        const localStorageOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        order = localStorageOrders.find(o => o.id === orderId);
        isLocalStorageOrder = true;
    }
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    const customer = order.customer;
    if (!customer) {
        alert('No customer information found!');
        return;
    }
    
    // Format for AliExpress order
    let aliExpressInfo = `=== ALIEXPRESS ORDER INFO ===\n`;
    aliExpressInfo += `Order ID: ${order.id}\n`;
    aliExpressInfo += `Customer: ${customer.name}\n`;
    aliExpressInfo += `Phone: ${customer.phone}\n`;
    aliExpressInfo += `Email: ${customer.email}\n`;
    aliExpressInfo += `Full Address:\n${customer.fullAddress}\n\n`;
    
    aliExpressInfo += `Items to Order:\n`;
    const items = order.items || [];
    items.forEach((item, index) => {
        aliExpressInfo += `${index + 1}. ${item.name} (Quantity: ${item.quantity || 1})\n`;
    });
    
    aliExpressInfo += `\nTotal Amount: $${(order.total || order.amount || 0).toFixed(2)}\n`;
    aliExpressInfo += `Payment Method: ${order.paymentMethod || 'N/A'}\n`;
    aliExpressInfo += `Status: ${order.status || 'pending'}\n`;
    aliExpressInfo += `Order Date: ${new Date(order.createdAt || order.date).toLocaleString()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(aliExpressInfo).then(() => {
        alert('AliExpress order information copied to clipboard!\n\nYou can now paste this information when creating the order on AliExpress.');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = aliExpressInfo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('AliExpress order information copied to clipboard!\n\nYou can now paste this information when creating the order on AliExpress.');
    });
}

// AliExpress Integration
let currentProductData = null;

// Helper function to validate AliExpress URL
function isValidAliExpressUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Clean the URL
    url = url.trim();
    
    // Check if it's a valid AliExpress URL pattern
    const aliExpressPatterns = [
        /^https?:\/\/(www\.)?aliexpress\.(com|ru|es|fr|it|de|nl|pt|pl|tr|co\.jp|co\.uk)\/item\/[^\/]+\.html/,
        /^https?:\/\/[a-z]{2}\.aliexpress\.com\/item\/[^\/]+\.html/,
        /^https?:\/\/(www\.)?aliexpress\.(com|ru|es|fr|it|de|nl|pt|pl|tr|co\.jp|co\.uk)\/store\/product\/[^\/]+\.html/
    ];
    
    return aliExpressPatterns.some(pattern => pattern.test(url));
}

// Helper function to extract product ID from URL
function extractProductIdFromUrl(url) {
    if (!url) return null;
    
    // Try to extract product ID from URL patterns
    const match = url.match(/\/(\d+)\.html/);
    if (match) return match[1];
    
    // Alternative pattern
    const match2 = url.match(/\/item\/[^\/]*-(\d+)\.html/);
    if (match2) return match2[1];
    
    return null;
}

async function searchAliExpressProduct() {
    try {
        const urlInput = document.getElementById('aliexpressUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Vui lòng nhập URL sản phẩm AliExpress');
            updateApiStatus('error', 'Chưa nhập URL');
            return;
        }

        // Validate URL format
        if (!isValidAliExpressUrl(url)) {
            alert('URL không hợp lệ! Vui lòng nhập URL AliExpress đúng định dạng.\n\nVí dụ: https://www.aliexpress.com/item/1234567890.html');
            updateApiStatus('error', 'URL không hợp lệ');
            return;
        }

        updateApiStatus('loading', 'Đang tải dữ liệu sản phẩm...');

        let data;
        if (window.aliExpressAPI && window.aliExpressAPI.enabled) {
            // Use real proxy-backed API if configured
            try {
                data = await window.aliExpressAPI.fetchProductByUrl(url);
            } catch (apiError) {
                console.error('API Error:', apiError);
                updateApiStatus('error', 'Không thể kết nối đến API backend');
                alert('Lỗi API: ' + apiError.message + '\n\nVui lòng kiểm tra cấu hình API backend hoặc liên hệ quản trị viên.');
                return;
            }
        } else {
            // API chưa được cấu hình - không trả về dữ liệu mẫu
            updateApiStatus('error', 'API backend chưa được cấu hình');
            
            const productId = extractProductIdFromUrl(url);
            const message = productId 
                ? `API backend chưa được cấu hình.\n\nĐã phát hiện Product ID: ${productId}\n\nĐể sử dụng tính năng này, vui lòng:\n1. Cấu hình API backend trong admin.html\n2. Thiết lập window.aliConfig = { apiBase: '/api/aliexpress' }\n3. Đảm bảo backend proxy đã được khởi động`
                : `API backend chưa được cấu hình.\n\nURL hợp lệ nhưng không thể trích xuất Product ID.\n\nVui lòng cấu hình API backend để tiếp tục.`;
            
            alert(message);
            
            // Clear any previous preview
            document.getElementById('productPreview')?.classList.add('hidden');
            return;
        }

        if (!data) {
            updateApiStatus('error', 'Không tìm thấy dữ liệu sản phẩm');
            alert('Không thể lấy dữ liệu từ URL này. Vui lòng kiểm tra lại URL hoặc thử lại sau.');
            return;
        }

        currentProductData = data;
        displayProductPreview(data);
        fillImportForm(data);
        updateApiStatus('success', 'Đã tải dữ liệu sản phẩm thành công');
    } catch (error) {
        console.error('Error in searchAliExpressProduct:', error);
        updateApiStatus('error', 'Lỗi khi tải dữ liệu');
        alert('Lỗi: ' + error.message);
        
        // Clear preview on error
        document.getElementById('productPreview')?.classList.add('hidden');
    }
}

function updateApiStatus(status, message) {
    const statusElement = document.getElementById('apiStatus');
    const icon = statusElement.querySelector('i');
    const text = statusElement.querySelector('span');
    
    statusElement.className = 'status-indicator';
    
    switch (status) {
        case 'loading':
            statusElement.style.background = '#fff3cd';
            statusElement.style.color = '#856404';
            icon.style.color = '#ffc107';
            icon.className = 'fas fa-spinner fa-spin';
            break;
        case 'success':
            statusElement.style.background = '#d4edda';
            statusElement.style.color = '#155724';
            icon.style.color = '#28a745';
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            statusElement.style.background = '#f8d7da';
            statusElement.style.color = '#721c24';
            icon.style.color = '#dc3545';
            icon.className = 'fas fa-exclamation-circle';
            break;
        default:
            statusElement.style.background = '#d4edda';
            statusElement.style.color = '#155724';
            icon.style.color = '#28a745';
            icon.className = 'fas fa-circle';
    }
    
    text.textContent = `API Status: ${message}`;
}

function displayProductPreview(productData) {
    const preview = document.getElementById('productPreview');
    preview.classList.remove('hidden');
    
    // Update main image
    document.getElementById('previewMainImage').src = productData.images[0];
    
    // Update thumbnails
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    thumbnailGallery.innerHTML = productData.images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
            <img src="${img}" alt="Thumbnail ${index + 1}">
        </div>
    `).join('');
    
    // Update product details
    document.getElementById('previewTitle').textContent = productData.title;
    document.getElementById('previewOriginalPrice').textContent = `$${productData.originalPrice.toFixed(2)}`;
    document.getElementById('previewSalePrice').textContent = `$${productData.salePrice.toFixed(2)}`;
    document.getElementById('previewDiscount').textContent = `${productData.discount}% OFF`;
    
    // Update rating
    const ratingElement = document.getElementById('previewRating');
    const stars = ratingElement.querySelectorAll('i');
    const fullStars = Math.floor(productData.rating);
    const hasHalfStar = productData.rating % 1 >= 0.5;
    
    stars.forEach((star, index) => {
        if (index < fullStars) {
            star.className = 'fas fa-star';
        } else if (index === fullStars && hasHalfStar) {
            star.className = 'fas fa-star-half-alt';
        } else {
            star.className = 'far fa-star';
        }
    });
    
    document.getElementById('previewRatingText').textContent = `(${productData.reviews} reviews)`;
    
    // Update specifications
    const specsElement = document.getElementById('previewSpecs');
    specsElement.innerHTML = productData.specs.map(spec => `
        <div class="spec-item">
            <span class="spec-label">${spec.label}:</span>
            <span class="spec-value">${spec.value}</span>
        </div>
    `).join('');
}

function changeMainImage(imageSrc, thumbnailElement) {
    // Update main image
    document.getElementById('previewMainImage').src = imageSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    thumbnailElement.classList.add('active');
}

function fillImportForm(productData) {
    // Fill basic information
    document.getElementById('aliexpressNameEn').value = productData.title;
    document.getElementById('aliexpressNameVi').value = productData.titleVi;
    
    // Fill pricing
    document.getElementById('aliexpressOriginalPrice').value = productData.originalPrice;
    document.getElementById('aliexpressPrice').value = productData.salePrice;
    updateProfitMargin();
    
    // Fill images
    document.getElementById('aliexpressImage').value = productData.images[0];
    document.getElementById('aliexpressGallery').value = productData.images.slice(1).join('\n');
    
    // Fill descriptions
    document.getElementById('aliexpressDescEn').value = productData.description;
    document.getElementById('aliexpressDescVi').value = productData.descriptionVi;
    
    // Fill SEO
    document.getElementById('aliexpressKeywords').value = productData.keywords;
    document.getElementById('aliexpressTags').value = productData.tags;
    
    // Set default stock
    document.getElementById('aliexpressStock').value = 50;
}

function updateProfitMargin() {
    const originalPrice = parseFloat(document.getElementById('aliexpressOriginalPrice').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('aliexpressPrice').value) || 0;
    
    if (originalPrice > 0 && sellingPrice > 0) {
        const profit = sellingPrice - originalPrice;
        const margin = ((profit / sellingPrice) * 100).toFixed(1);
        document.getElementById('profitMargin').value = `$${profit.toFixed(2)} (${margin}%)`;
    } else {
        document.getElementById('profitMargin').value = '';
    }
}

// Add event listeners for profit margin calculation
document.addEventListener('DOMContentLoaded', function() {
    const priceInputs = ['aliexpressOriginalPrice', 'aliexpressPrice'];
    priceInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateProfitMargin);
        }
    });
});

function importAliExpressProduct(e) {
    e.preventDefault();
    
    const productData = {
        nameEn: document.getElementById('aliexpressNameEn').value,
        name: document.getElementById('aliexpressNameVi').value,
        price: parseFloat(document.getElementById('aliexpressPrice').value),
        stock: parseInt(document.getElementById('aliexpressStock').value),
        category: document.getElementById('aliexpressCategory').value,
        image: document.getElementById('aliexpressImage').value,
        descriptionEn: document.getElementById('aliexpressDescEn').value,
        description: document.getElementById('aliexpressDescVi').value,
        keywords: document.getElementById('aliexpressKeywords').value,
        tags: document.getElementById('aliexpressTags').value,
        gallery: document.getElementById('aliexpressGallery').value.split('\n').filter(url => url.trim())
    };

    try {
        const newProduct = db.addProduct(productData);
        alert('Product imported successfully!');
        
        // Save to import history
        const importData = {
            id: newProduct.id,
            nameEn: productData.nameEn,
            nameVi: productData.name,
            price: productData.price,
            category: productData.category,
            image: productData.image,
            timestamp: new Date().toISOString(),
            status: 'imported'
        };
        
        const imports = JSON.parse(localStorage.getItem('aliexpressImports') || '[]');
        imports.push(importData);
        localStorage.setItem('aliexpressImports', JSON.stringify(imports));
        
        // Clear form
        document.getElementById('aliexpressUrl').value = '';
        document.getElementById('aliexpressForm').reset();
        document.getElementById('productPreview').classList.add('hidden');
        updateApiStatus('ready', 'Ready');
        
        // Reload products, dashboard, and history
        loadProducts();
        loadDashboard();
        loadImportHistory();
        
        // Switch to Products tab
        document.querySelectorAll('.admin-tab')[2].click();
    } catch (error) {
        alert('Error importing product: ' + error.message);
    }
}

// Auto-fill form helper (for manual use)
function autoFillProductForm(nameEn, nameVi, price, image, category) {
    document.getElementById('aliexpressNameEn').value = nameEn || '';
    document.getElementById('aliexpressNameVi').value = nameVi || '';
    document.getElementById('aliexpressPrice').value = price || '';
    document.getElementById('aliexpressImage').value = image || '';
    document.getElementById('aliexpressCategory').value = category || 'women-watches';
    document.getElementById('aliexpressStock').value = 50;
}

// Additional helper functions
function previewImage(inputId) {
    const imageUrl = document.getElementById(inputId).value;
    if (imageUrl) {
        const preview = document.getElementById('productPreview');
        if (preview) {
            preview.classList.remove('hidden');
            document.getElementById('previewMainImage').src = imageUrl;
        }
    }
}

function clearAliExpressForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.getElementById('aliexpressForm').reset();
        document.getElementById('productPreview').classList.add('hidden');
        document.getElementById('aliexpressUrl').value = '';
        updateApiStatus('ready', 'Ready');
    }
}

function saveAsDraft() {
    const formData = {
        nameEn: document.getElementById('aliexpressNameEn').value,
        nameVi: document.getElementById('aliexpressNameVi').value,
        price: document.getElementById('aliexpressPrice').value,
        originalPrice: document.getElementById('aliexpressOriginalPrice').value,
        stock: document.getElementById('aliexpressStock').value,
        category: document.getElementById('aliexpressCategory').value,
        image: document.getElementById('aliexpressImage').value,
        gallery: document.getElementById('aliexpressGallery').value,
        descriptionEn: document.getElementById('aliexpressDescEn').value,
        descriptionVi: document.getElementById('aliexpressDescVi').value,
        keywords: document.getElementById('aliexpressKeywords').value,
        tags: document.getElementById('aliexpressTags').value,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const drafts = JSON.parse(localStorage.getItem('aliexpressDrafts') || '[]');
    drafts.push(formData);
    localStorage.setItem('aliexpressDrafts', JSON.stringify(drafts));

    alert('Draft saved successfully!');
    loadImportHistory();
}

function loadImportHistory() {
    const historyElement = document.getElementById('importHistory');
    if (!historyElement) return;

    const drafts = JSON.parse(localStorage.getItem('aliexpressDrafts') || '[]');
    const imports = JSON.parse(localStorage.getItem('aliexpressImports') || '[]');
    
    const allItems = [...imports, ...drafts].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    if (allItems.length === 0) {
        historyElement.innerHTML = '<p style="text-align: center; color: #6c757d;">No import history found.</p>';
        return;
    }

    historyElement.innerHTML = allItems.map(item => `
        <div class="history-item">
            <img src="${item.image || 'https://via.placeholder.com/50x50'}" alt="Product">
            <div class="history-details">
                <h5>${item.nameEn || 'Untitled Product'}</h5>
                <p>${item.category} • $${item.price} • ${new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
            <div class="history-actions">
                ${item.status === 'draft' ? 
                    `<button class="btn btn-info" onclick="loadDraft('${item.timestamp}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>` : 
                    `<button class="btn btn-secondary" onclick="viewProduct('${item.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>`
                }
                <button class="btn btn-secondary" onclick="deleteHistoryItem('${item.timestamp}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function loadDraft(timestamp) {
    const drafts = JSON.parse(localStorage.getItem('aliexpressDrafts') || '[]');
    const draft = drafts.find(d => d.timestamp === timestamp);
    
    if (draft) {
        // Fill form with draft data
        Object.keys(draft).forEach(key => {
            const element = document.getElementById(`aliexpress${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element) {
                element.value = draft[key];
            }
        });
        
        // Update profit margin
        updateProfitMargin();
        
        // Show preview if image exists
        if (draft.image) {
            previewImage('aliexpressImage');
        }
        
        alert('Draft loaded successfully!');
    }
}

function deleteHistoryItem(timestamp) {
    if (confirm('Are you sure you want to delete this item?')) {
        const drafts = JSON.parse(localStorage.getItem('aliexpressDrafts') || '[]');
        const imports = JSON.parse(localStorage.getItem('aliexpressImports') || '[]');
        
        const updatedDrafts = drafts.filter(d => d.timestamp !== timestamp);
        const updatedImports = imports.filter(i => i.timestamp !== timestamp);
        
        localStorage.setItem('aliexpressDrafts', JSON.stringify(updatedDrafts));
        localStorage.setItem('aliexpressImports', JSON.stringify(updatedImports));
        
        loadImportHistory();
    }
}

// Initialize import history when tab is loaded
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));

    // Show selected tab
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Reload data based on tab
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'products') {
        loadProducts();
    } else if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'aliexpress') {
        loadImportHistory();
        // Check API status when tab is opened
        checkApiStatus();
    }
}

// Check API configuration status
function checkApiStatus() {
    if (window.aliExpressAPI && window.aliExpressAPI.enabled) {
        updateApiStatus('success', 'API đã được cấu hình và sẵn sàng');
    } else {
        updateApiStatus('error', 'API backend chưa được cấu hình');
    }
}

