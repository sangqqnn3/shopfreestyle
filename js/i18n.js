// i18n - Internationalization Manager
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // Navigation
                home: 'Home',
                watches: 'Watches',
                jewelry: 'Jewelry',
                bags: 'Bags',
                about: 'About',
                login: 'Login',
                register: 'Register',
                logout: 'Logout',
                admin: 'Admin',
                cart: 'Cart',
                
                // Hero Section
                heroTitle: 'Discover the New Collection',
                heroSubtitle: 'Premium watches, jewelry and bags from trusted brands',
                shopNow: 'Shop Now',
                
                // Categories
                shopByCategory: 'Shop by Category',
                womensWatches: 'Women\'s Watches',
                mensWatches: 'Men\'s Watches',
                jewelry: 'Jewelry',
                bags: 'Bags',
                
                // Products
                bestselling: 'Bestsellers',
                new: 'New',
                addToCart: 'Add to Cart',
                buyNow: 'Buy Now with BitPay',
                
                // Footer
                products: 'Products',
                guides: 'Guides',
                aboutUs: 'About Us',
                support: 'Support',
                
                // Cart
                cartEmpty: 'Your cart is empty',
                checkout: 'Checkout',
                total: 'Total',
                
                // Payment
                paymentMethods: 'Payment Methods Accepted',
                
                // General
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                submit: 'Submit',
                cancel: 'Cancel',
                save: 'Save',
                delete: 'Delete',
                edit: 'Edit'
            },
            vi: {
                // Navigation
                home: 'Trang chủ',
                watches: 'Đồng hồ',
                jewelry: 'Trang sức',
                bags: 'Túi xách',
                about: 'Giới thiệu',
                login: 'Đăng nhập',
                register: 'Đăng ký',
                logout: 'Đăng xuất',
                admin: 'Quản trị',
                cart: 'Giỏ hàng',
                
                // Hero Section
                heroTitle: 'Khám phá bộ sưu tập mới',
                heroSubtitle: 'Đồng hồ, trang sức và túi xách cao cấp từ các thương hiệu uy tín',
                shopNow: 'Mua ngay',
                
                // Categories
                shopByCategory: 'Mua sắm theo danh mục',
                womensWatches: 'Đồng hồ nữ',
                mensWatches: 'Đồng hồ nam',
                jewelry: 'Trang sức',
                bags: 'Túi xách',
                
                // Products
                bestselling: 'Sản phẩm bán chạy',
                new: 'Mới',
                addToCart: 'Thêm vào giỏ',
                buyNow: 'Mua ngay với BitPay',
                
                // Footer
                products: 'Sản phẩm',
                guides: 'Hướng dẫn',
                aboutUs: 'Về chúng tôi',
                support: 'Hỗ trợ',
                
                // Cart
                cartEmpty: 'Giỏ hàng của bạn đang trống',
                checkout: 'Thanh toán',
                total: 'Tổng cộng',
                
                // Payment
                paymentMethods: 'Chấp nhận thanh toán',
                
                // General
                loading: 'Đang tải...',
                error: 'Lỗi',
                success: 'Thành công',
                submit: 'Gửi',
                cancel: 'Hủy',
                save: 'Lưu',
                delete: 'Xóa',
                edit: 'Sửa'
            }
        };
    }

    t(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.updatePage();
    }

    getLanguage() {
        return this.currentLang;
    }

    updatePage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        
        // Update input placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Update alt texts
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            element.alt = this.t(key);
        });
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLang } 
        }));
    }
}

// Initialize i18n
const i18n = new I18n();

// Language Switcher Component
function createLanguageSwitcher() {
    return `
        <div class="language-switcher">
            <button class="lang-btn ${i18n.getLanguage() === 'en' ? 'active' : ''}" 
                    onclick="i18n.setLanguage('en')" 
                    data-lang="en">
                🇺🇸 EN
            </button>
            <button class="lang-btn ${i18n.getLanguage() === 'vi' ? 'active' : ''}" 
                    onclick="i18n.setLanguage('vi')" 
                    data-lang="vi">
                🇻🇳 VI
            </button>
        </div>
    `;
}
