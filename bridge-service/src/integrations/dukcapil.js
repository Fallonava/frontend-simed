const axios = require('axios');
const logger = require('../utils/logger');

class DukcapilClient {
    constructor() {
        this.baseURL = process.env.DUKCAPIL_API_URL || 'https://dukcapil.kemendagri.go.id/api';
        this.apiKey = process.env.DUKCAPIL_API_KEY;
    }

    /**
     * Validate NIK via Dukcapil API
     */
    async validateNIK(nik) {
        try {
            // In real scenario, this involves PKS (Perjanjian Kerja Sama) and secure endpoint
            const response = await axios.get(`${this.baseURL}/validate/${nik}`, {
                headers: { 'X-API-Key': this.apiKey }
            });

            return response.data; // { valid: true, data: { name: "...", address: "..." } }
        } catch (error) {
            logger.error(`Dukcapil validation failed for NIK ${nik}`, error.response?.data || error.message);
            // Fallback for demo: if no API key, treat all as valid but log warning
            if (!this.apiKey) {
                logger.warn('SIRS: No Dukcapil API Key, bypassing validation');
                return { valid: true, note: 'Bypassed (No API Key)' };
            }
            throw error;
        }
    }
}

module.exports = new DukcapilClient();
