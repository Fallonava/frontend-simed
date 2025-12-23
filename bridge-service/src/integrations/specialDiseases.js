const axios = require('axios');
const logger = require('../utils/logger');

class SpecialDiseasesClient {
    constructor() {
        this.sitbURL = process.env.SITB_API_URL || 'https://sitb.kemkes.go.id/api';
        this.sihaURL = process.env.SIHA_API_URL || 'https://siha.kemkes.go.id/api';
        this.apiKey = process.env.KEMKES_API_KEY; // Shared for some dev portals
    }

    /**
     * Report TB Case to SITB
     */
    async reportTB(caseData) {
        try {
            const response = await axios.post(`${this.sitbURL}/report`, caseData, {
                headers: { 'X-API-Key': this.apiKey }
            });
            logger.info('SITB: TB Case reported successfully');
            return response.data;
        } catch (error) {
            logger.error('SITB: Failed to report TB case', error.response?.data);
            throw error;
        }
    }

    /**
     * Report HIV Case to SIHA
     */
    async reportHIV(caseData) {
        try {
            const response = await axios.post(`${this.sihaURL}/report`, caseData, {
                headers: { 'X-API-Key': this.apiKey }
            });
            logger.info('SIHA: HIV Case reported successfully');
            return response.data;
        } catch (error) {
            logger.error('SIHA: Failed to report HIV case', error.response?.data);
            throw error;
        }
    }
}

module.exports = new SpecialDiseasesClient();
