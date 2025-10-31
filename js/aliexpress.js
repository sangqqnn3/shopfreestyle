// AliExpress Dropship Open Platform client
// Supports both backend API proxy and direct URL fetching with CORS proxy

class AliExpressAPI {
    constructor(config = {}) {
        this.apiBase = config.apiBase || null; // e.g. '/api/aliexpress'
        this.enabled = Boolean(this.apiBase);
        this.useCorsProxy = config.useCorsProxy !== false; // Default true
        this.corsProxy = config.corsProxy || 'https://api.allorigins.win/get?url=';
    }

    setConfig(config) {
        this.apiBase = config.apiBase || this.apiBase;
        this.enabled = Boolean(this.apiBase);
        this.useCorsProxy = config.useCorsProxy !== false;
        this.corsProxy = config.corsProxy || this.corsProxy;
    }

    async fetchProductByUrl(productUrl) {
        // Try backend API first if configured
        if (this.enabled && this.apiBase) {
            try {
                const resp = await fetch(`${this.apiBase}/product`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: productUrl })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    return this.normalizeProduct(data);
                }
            } catch (error) {
                console.warn('Backend API failed, trying direct fetch:', error);
            }
        }

        // Fallback: Fetch directly from URL using CORS proxy
        return await this.fetchProductDirectly(productUrl);
    }

    async fetchProductDirectly(productUrl) {
        try {
            // Extract product ID from URL
            const productId = this.extractProductId(productUrl);
            if (!productId) {
                throw new Error('Could not extract product ID from URL');
            }

            // Try multiple methods to fetch product data
            let productData = null;

            // Method 1: Try to fetch via AliExpress API endpoint (if accessible)
            try {
                productData = await this.fetchViaApi(productId);
                if (productData) return this.normalizeProduct(productData);
            } catch (e) {
                console.log('API method failed, trying HTML parsing:', e);
            }

            // Method 2: Fetch HTML and parse product data
            productData = await this.fetchViaHtml(productUrl);
            if (productData) return this.normalizeProduct(productData);

            throw new Error('Could not fetch product data from URL');
        } catch (error) {
            console.error('Error fetching product directly:', error);
            throw new Error('Failed to fetch product data: ' + error.message);
        }
    }

    async fetchViaHtml(productUrl) {
        try {
            const proxyUrl = this.corsProxy + encodeURIComponent(productUrl);
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to parse as JSON first (AllOrigins format)
            let html = '';
            const contentType = response.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
                const data = await response.json();
                // AllOrigins returns { contents: "html" }
                if (data.contents) {
                    html = data.contents;
                } else if (data.body) {
                    html = data.body;
                } else if (typeof data === 'string') {
                    html = data;
                } else {
                    throw new Error('Unexpected JSON format from proxy');
                }
            } else {
                // Direct HTML response
                html = await response.text();
            }
            
            if (!html || html.length < 100) {
                throw new Error('Received empty or invalid HTML from URL');
            }

            // Create a temporary DOM to parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Extract product data from JSON-LD or script tags
            let productJson = null;

            // Try to find JSON-LD data
            const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
            for (const script of jsonLdScripts) {
                try {
                    const json = JSON.parse(script.textContent);
                    if (json['@type'] === 'Product' || json.name) {
                        productJson = json;
                        break;
                    }
                } catch (e) {}
            }

            // If no JSON-LD, try to find data in window.runParams or similar
            if (!productJson) {
                const allScripts = doc.querySelectorAll('script');
                for (const script of allScripts) {
                    const text = script.textContent;
                    // Look for product data patterns
                    if (text.includes('runParams') || text.includes('productInfo') || text.includes('window.runParams')) {
                        try {
                            // Try to extract JSON from script
                            const match = text.match(/window\.runParams\s*=\s*({[\s\S]*?});/);
                            if (match) {
                                const runParams = JSON.parse(match[1]);
                                if (runParams.data) {
                                    productJson = runParams.data;
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                }
            }

            // If still no data, parse HTML elements
            if (!productJson) {
                productJson = this.parseHtmlElements(doc, productUrl);
            }

            return productJson;
        } catch (error) {
            console.error('Error fetching via HTML:', error);
            throw error;
        }
    }

    parseHtmlElements(doc, url) {
        const data = {};

        // Extract title
        const titleEl = doc.querySelector('h1[data-pl="product-title"], .product-title-text, h1');
        data.title = titleEl ? titleEl.textContent.trim() : 'Product';

        // Extract price
        const priceEl = doc.querySelector('.price-current, .notranslate, [data-pl="main-price"], .price');
        if (priceEl) {
            const priceText = priceEl.textContent.trim();
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
                data.salePrice = parseFloat(priceMatch[0]);
            }
        }

        // Extract original price
        const originalPriceEl = doc.querySelector('.price-original, .price-was, [data-pl="origin-price"]');
        if (originalPriceEl) {
            const priceText = originalPriceEl.textContent.trim();
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
                data.originalPrice = parseFloat(priceMatch[0]);
            }
        }

        // Extract images
        const imageEls = doc.querySelectorAll('.images-view img, .product-images img, [data-src], [data-image]');
        data.images = [];
        imageEls.forEach(img => {
            const src = img.getAttribute('data-src') || img.getAttribute('src') || img.getAttribute('data-image');
            if (src && src.includes('http') && !data.images.includes(src)) {
                data.images.push(src);
            }
        });

        // Extract rating
        const ratingEl = doc.querySelector('[data-pl="rating-score"], .overview-rating-average, .rating-value');
        if (ratingEl) {
            const ratingText = ratingEl.textContent.trim();
            const ratingMatch = ratingText.match(/[\d.]+/);
            if (ratingMatch) {
                data.rating = parseFloat(ratingMatch[0]);
            }
        }

        // Extract review count
        const reviewEl = doc.querySelector('[data-pl="reviews-count"], .reviews-count, .review-count');
        if (reviewEl) {
            const reviewText = reviewEl.textContent.trim();
            const reviewMatch = reviewText.match(/[\d,]+/);
            if (reviewMatch) {
                data.reviews = parseInt(reviewMatch[0].replace(/,/g, ''));
            }
        }

        // Extract description
        const descEl = doc.querySelector('.product-description, .detail-desc, [data-pl="description"]');
        if (descEl) {
            data.description = descEl.textContent.trim();
        }

        // Extract specifications
        data.specs = [];
        const specEls = doc.querySelectorAll('.product-prop, .props-item, .spec-item');
        specEls.forEach(el => {
            const label = el.querySelector('.props-name, .spec-label, dt')?.textContent.trim();
            const value = el.querySelector('.props-value, .spec-value, dd')?.textContent.trim();
            if (label && value) {
                data.specs.push({ label, value });
            }
        });

        return data;
    }

    async fetchViaApi(productId) {
        // Try AliExpress public API endpoints (may not always work due to CORS)
        const apiUrl = `https://www.aliexpress.com/item-ajax/${productId}/description.html`;
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            // API endpoint might not be accessible
            throw error;
        }
        return null;
    }

    extractProductId(url) {
        if (!url) return null;
        
        // Pattern 1: /item/.../1234567890.html
        const match1 = url.match(/\/item\/[^\/]*-(\d+)\.html/);
        if (match1) return match1[1];
        
        // Pattern 2: /item/1234567890.html
        const match2 = url.match(/\/(\d+)\.html/);
        if (match2) return match2[1];
        
        // Pattern 3: item-ajax/1234567890
        const match3 = url.match(/item-ajax\/(\d+)/);
        if (match3) return match3[1];
        
        return null;
    }

    async searchProducts(query) {
        if (this.enabled && this.apiBase) {
            const resp = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}`);
            if (resp.ok) {
                const list = await resp.json();
                return Array.isArray(list) ? list.map(p => this.normalizeProduct(p)) : [];
            }
        }
        throw new Error('Search requires backend API');
    }

    // Normalize product data to our internal structure
    normalizeProduct(raw) {
        if (!raw) {
            throw new Error('Invalid product data');
        }

        const images = raw.images || raw.image_urls || raw.imageList || [];
        const title = raw.title || raw.product_title || raw.name || 'Product';
        
        return {
            title: title,
            titleVi: raw.titleVi || raw.title_vi || raw.product_title_vi || title,
            originalPrice: Number(raw.originalPrice || raw.original_price || raw.list_price || raw.price || 0),
            salePrice: Number(raw.salePrice || raw.sale_price || raw.price || raw.original_price || 0),
            discount: raw.discount || this.calcDiscount(raw.list_price || raw.original_price || raw.originalPrice, raw.sale_price || raw.price || raw.salePrice),
            rating: Number(raw.rating || raw.avg_rating || raw.averageRating || 0),
            reviews: Number(raw.reviews || raw.review_count || raw.reviewCount || 0),
            images: images.length ? images : (raw.image ? [raw.image] : []),
            specs: raw.specs || raw.specifications || [],
            description: raw.description || raw.desc || '',
            descriptionVi: raw.descriptionVi || raw.description_vi || raw.descVi || '',
            keywords: Array.isArray(raw.keywords) ? raw.keywords.join(', ') : (raw.keywords || ''),
            tags: Array.isArray(raw.tags) ? raw.tags.join(', ') : (raw.tags || '')
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


