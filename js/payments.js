// NOWPayments direct client (NOT SAFE for production, only for internal demo/testing)
// API key is public here: anyone can use it. NEVER use this on a live public site!

class NowPaymentsClient {
    constructor() {
        this.apiKey = '4MDH72X-2154M9W-GAB5DEX-ETDACFD';
        this.enabled = true;
    }
    setConfig(config) {}
    async createInvoice({ amount, orderId, description, customerEmail, returnUrl, cancelUrl, currency = 'usd' }) {
        const resp = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            },
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
        if (!resp.ok) throw new Error(`NOWPayments error: ${resp.status}`);
        return await resp.json();
    }
}
window.payments = { nowpayments: new NowPaymentsClient() };


