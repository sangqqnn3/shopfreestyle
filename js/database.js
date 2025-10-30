// Database Manager for localStorage
class Database {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default data if not exists
        const users = localStorage.getItem('users');
        if (!users) {
            // Create default admin user
            const defaultUsers = [{
                id: 'admin_001',
                name: 'Admin',
                email: 'admin@luxedropship.com',
                password: 'admin123',
                role: 'admin',
                createdAt: Date.now()
            }];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify([
                {
                    id: 'watch1',
                    name: 'Đồng hồ nữ cao cấp',
                    nameEn: 'Premium Women\'s Watch',
                    price: 89.95,
                    category: 'women-watches',
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Đồng hồ nữ cao cấp với thiết kế sang trọng',
                    descriptionEn: 'Premium women\'s watch with elegant design',
                    stock: 50,
                    createdAt: Date.now()
                },
                {
                    id: 'bracelet1',
                    name: 'Vòng tay vàng',
                    nameEn: 'Gold Bracelet',
                    price: 39.95,
                    category: 'jewelry',
                    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Vòng tay vàng 18k cao cấp',
                    descriptionEn: 'Premium 18k gold bracelet',
                    stock: 30,
                    createdAt: Date.now()
                },
                {
                    id: 'bag1',
                    name: 'Túi xách da cao cấp',
                    nameEn: 'Premium Leather Bag',
                    price: 99.95,
                    category: 'bags',
                    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Túi xách da thật cao cấp',
                    descriptionEn: 'Premium genuine leather bag',
                    stock: 25,
                    createdAt: Date.now()
                },
                {
                    id: 'watch2',
                    name: 'Đồng hồ nam thể thao',
                    nameEn: 'Men\'s Sports Watch',
                    price: 109.95,
                    category: 'men-watches',
                    image: 'https://images.unsplash.com/photo-1523170335258-f5b6c6a4450b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Đồng hồ nam thể thao bền bỉ',
                    descriptionEn: 'Durable men\'s sports watch',
                    stock: 40,
                    createdAt: Date.now()
                }
            ]));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
    }

    // User Management
    addUser(user) {
        const users = this.getUsers();
        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...user,
            createdAt: Date.now(),
            role: user.role || 'customer'
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    }

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    }

    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    deleteUser(id) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(filtered));
        return true;
    }

    // Product Management
    addProduct(product) {
        const products = this.getProducts();
        const newProduct = {
            id: 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...product,
            createdAt: Date.now()
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        return newProduct;
    }

    getProducts() {
        return JSON.parse(localStorage.getItem('products') || '[]');
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    }

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('products', JSON.stringify(products));
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(filtered));
        return true;
    }

    // Order Management
    addOrder(order) {
        const orders = this.getOrders();
        const newOrder = {
            id: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...order,
            status: order.status || 'pending',
            createdAt: Date.now()
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        return newOrder;
    }

    getOrders() {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    }

    getOrderById(id) {
        const orders = this.getOrders();
        return orders.find(o => o.id === id);
    }

    updateOrder(id, updates) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            localStorage.setItem('orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    }
}

// Initialize database
const db = new Database();
