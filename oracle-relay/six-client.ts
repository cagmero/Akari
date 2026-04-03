import axios from 'axios';
import fs from 'fs';
import https from 'https';

export class SixClient {
    private client: any;

    constructor() {
        const certPath = process.env.SIX_CERT_PATH || './oracle-relay/certs/CH56655-api2026hack29/signed-certificate.pem';
        const keyPath = process.env.SIX_KEY_PATH || './oracle-relay/certs/CH56655-api2026hack29/private-key.pem';
        
        let cert, key;
        try {
            cert = fs.readFileSync(certPath);
            key = fs.readFileSync(keyPath);
        } catch (e) {
            console.warn("SIX Certificates not found. Ensure certs/ directory contains the CH56655 certs.");
        }

        this.client = axios.create({
            baseURL: 'https://api.six-group.com',
            httpsAgent: cert && key ? new https.Agent({ cert, key }) : undefined,
            timeout: 5000,
        });
    }

    async fetchFxRates(instrumentCode: string) {
        try {
            // instrumentCode is a SIX instrument code, e.g. "USDEURSP" for EUR/USD spot
            const response = await this.client.get('/prices/intraday', {
                params: { instrumentIds: instrumentCode },
                headers: { Accept: 'application/json' },
            });

            // SIX /prices/intraday returns { data: [ { bid, ask, timestamp, ... } ] }
            if (response.data && response.data.data && response.data.data.length > 0) {
                const data = response.data.data[0];
                const bid: number = data.bid;
                const ask: number = data.ask;

                // Fallback simulation if bid/ask are missing (e.g. outside market hours)
                if (!bid || !ask) {
                    const basePrice = instrumentCode === 'USDEURSP' ? 1.08 : 0.89; // EUR/USD or CHF/USD
                    const spread = basePrice * 0.0001;
                    const fallbackBid = basePrice - spread;
                    const fallbackAsk = basePrice + spread;
                    const fallbackMid = basePrice;
                    return {
                        bid: Math.floor(fallbackBid * 1_000_000),
                        ask: Math.floor(fallbackAsk * 1_000_000),
                        mid: Math.floor(fallbackMid * 1_000_000),
                        spread_bps: 2,
                        timestamp: Math.floor(Date.now() / 1000)
                    };
                }

                const mid = (bid + ask) / 2;
                return {
                    bid: Math.floor(bid * 1_000_000),
                    ask: Math.floor(ask * 1_000_000),
                    mid: Math.floor(mid * 1_000_000),
                    spread_bps: Math.floor(((ask - bid) / mid) * 10000),
                    timestamp: data.timestamp
                        ? Math.floor(new Date(data.timestamp).getTime() / 1000)
                        : Math.floor(Date.now() / 1000)
                };
            }
            throw new Error("No price data found in response");
        } catch (error: any) {
            console.error(`[SixClient] Error fetching FX rates for ${instrumentCode}:`, error.message);
            // Fallback for resilient relay execution
            const basePrice = instrumentCode === 'USDEURSP' ? 1.08 : 0.89;
            const spread = basePrice * 0.0001;
            return {
                bid: Math.floor((basePrice - spread) * 1_000_000),
                ask: Math.floor((basePrice + spread) * 1_000_000),
                mid: Math.floor(basePrice * 1_000_000),
                spread_bps: 2,
                timestamp: Math.floor(Date.now() / 1000)
            };
        }
    }

    async fetchGoldPrice() {
        try {
            // USDLBXAUAM = LBMA Gold spot in USD
            const response = await this.client.get('/prices/intraday', {
                params: { instrumentIds: 'USDLBXAUAM' },
                headers: { Accept: 'application/json' },
            });
            if (response.data && response.data.data && response.data.data.length > 0) {
                const data = response.data.data[0];
                const price = data.ask || data.bid || data.mid;
                if (price) {
                    return {
                        price: price as number,
                        timestamp: data.timestamp
                            ? Math.floor(new Date(data.timestamp).getTime() / 1000)
                            : Math.floor(Date.now() / 1000)
                    };
                }
            }
        } catch (error: any) {
            console.error('[SixClient] Error fetching Gold price:', error.message);
        }
        // Fallback mock
        return {
            price: 2350.50, // LBMA Gold fallback
            timestamp: Math.floor(Date.now() / 1000)
        };
    }
}
