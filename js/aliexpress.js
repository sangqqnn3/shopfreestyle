// AliExpress Dropship Open Platform client (frontend stub)
// Note: The official API requires app_key/app_secret and signed requests.
// Use a backend proxy to sign requests and bypass CORS. This client talks to that proxy.

class AliExpressAPI {
    constructor(config = {}) {
        this.apiBase = config.apiBase || null; // e.g. '/api/aliexpress'
        this.enabled = Boolean(this.apiBase);
    }

    setConfig(config) {
        this.apiBase = config.apiBase || this.apiBase;
        this.enabled = Boolean(this.apiBase);
    }

    async fetchProductByUrl(productUrl) {
        if (!this.enabled) throw new Error('AliExpress API proxy is not configured');
        const resp = await fetch(`${this.apiBase}/product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: productUrl })
        });
        if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
        const data = await resp.json();
        return this.normalizeProduct(data);
    }

    async searchProducts(query) {
        if (!this.enabled) throw new Error('AliExpress API proxy is not configured');
        const resp = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}`);
        if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
        const list = await resp.json();
        return Array.isArray(list) ? list.map(this.normalizeProduct) : [];
    }

    // Normalize product data to our internal structure
    normalizeProduct(raw) {
        const images = raw.images || raw.image_urls || [];
        return {
            title: raw.title || raw.product_title || 'Unknown',
            titleVi: raw.title_vi || raw.product_title_vi || raw.title || 'Unknown',
            originalPrice: Number(raw.original_price || raw.list_price || raw.price || 0),
            salePrice: Number(raw.sale_price || raw.price || raw.original_price || 0),
            discount: raw.discount || this.calcDiscount(raw.list_price || raw.original_price, raw.sale_price || raw.price),
            rating: Number(raw.rating || raw.avg_rating || 0),
            reviews: Number(raw.reviews || raw.review_count || 0),
            images: images.length ? images : (raw.image ? [raw.image] : []),
            specs: raw.specs || [],
            description: raw.description || '',
            descriptionVi: raw.description_vi || '',
            keywords: (raw.keywords || []).join(', '),
            tags: (raw.tags || []).join(', ')
        };
    }

    calcDiscount(original, sale) {
        const o = Number(original || 0), s = Number(sale || 0);
        if (!o || !s || s >= o) return 0;
        return Math.round(((o - s) / o) * 100);
    }
}

// Global instance with default disabled config; set via window.aliConfig in admin page if needed
window.aliExpressAPI = new AliExpressAPI(window.aliConfig || {});


