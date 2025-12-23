const axios = require('axios');
const logger = require('../utils/logger');

class SisruteClient {
    constructor() {
        this.baseURL = process.env.SISRUTE_API_URL || 'https://sisrute.kemkes.go.id/api';
        this.apiKey = process.env.SISRUTE_API_KEY;
    }

    async sendResponse(referralId, response) {
        try {
            const result = await axios.post(
                `${this.baseURL}/rujukan/jawab/${referralId}`,
                response,
                {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
            logger.info(`Responded to SISRUTE referral ${referralId}`);
            return result.data;
        } catch (error) {
            logger.error(`Failed to respond to SISRUTE referral ${referralId}`, error.response?.data);
            throw error;
        }
    }

    async updateBedAvailability(roomStats) {
        try {
            const result = await axios.post(
                `${this.baseURL}/fasilitas/bed-monitoring`,
                roomStats,
                {
                    headers: { 'X-API-Key': this.apiKey }
                }
            );
            return result.data;
        } catch (error) {
            logger.error('Failed to sync beds to SISRUTE', error.response?.data);
            throw error;
        }
    }
}

module.exports = new SisruteClient();
