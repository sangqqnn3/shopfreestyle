// Payments client - NOWPayments integration
// IMPORTANT: Do NOT call NOWPayments directly from the browser with your API key.
// Use a backend proxy that injects the NOWPayments 'x-api-key' and handles CORS.

class NowPaymentsClient {
    constructor(config = {}) {
        this.proxyBase = config.proxyBase || null; // e.g. '/api/nowpayments'
        this.enabled = Boolean(this.proxyBase);
    }

    setConfig(config) {
        this.proxyBase = config.proxyBase || this.proxyBase;
        this.enabled = Boolean(this.proxyBase);
    }

    // Create NOWPayments invoice via your proxy
    // amount: number (USD), orderId: string, description: string
    // returnUrl/cancelUrl: strings
    async createInvoice({ amount, orderId, description, customerEmail, returnUrl, cancelUrl, currency = 'usd' }) {
        if (!this.enabled) throw new Error('NOWPayments proxyBase is not configured');
        const resp = await fetch(`${this.proxyBase}/invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                price_amount: Number(amount),
                price_currency: currency,
                order_id: orderId,
                order_description: description || `Order ${orderId}`,
                success_url: returnUrl,
                cancel_url: cancelUrl,
                customer_email: customerEmail || undefined
            })
        });
        if (!resp.ok) throw new Error(`NOWPayments proxy error: ${resp.status}`);
        return await resp.json(); // expect { invoice_url, id, ... }
    }
}

// Global payments facade
window.payments = {
    nowpayments: new NowPaymentsClient((window.paymentsConfig && window.paymentsConfig.nowpayments) || {})
};


