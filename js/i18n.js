// i18n - Internationalization Manager
class I18n {
    constructor() {
        this.currentLang = 'en';
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
            }
        };
    }

    t(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }

    setLanguage(lang) {
        // Force English only
        this.currentLang = 'en';
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
    // English-only; hide switcher
    return '';
}
