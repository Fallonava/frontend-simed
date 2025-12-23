const axios = require('axios');
const logger = require('../utils/logger');

class SatusehatClient {
    constructor() {
        this.baseURL = process.env.SATUSEHAT_BASE_URL || 'https://api-satusehat.kemkes.go.id/fhir-r4/v1';
        this.clientId = process.env.SATUSEHAT_CLIENT_ID;
        this.clientSecret = process.env.SATUSEHAT_CLIENT_SECRET;
        this.tokenURL = process.env.SATUSEHAT_AUTH_URL || 'https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);

            const response = await axios.post(this.tokenURL, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

            logger.info('SATUSEHAT access token obtained');
            return this.accessToken;
        } catch (error) {
            logger.error('Failed to obtain SATUSEHAT token', error.response?.data || error.message);
            throw error;
        }
    }

    async createResource(resourceType, resource) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.post(
                `${this.baseURL}/${resourceType}`,
                resource,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logger.info(`Created ${resourceType}`, { id: response.data.id });
            return response.data;
        } catch (error) {
            logger.error(`Failed to create ${resourceType}`, {
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    }

    async updateResource(resourceType, id, resource) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.put(
                `${this.baseURL}/${resourceType}/${id}`,
                resource,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            logger.info(`Updated ${resourceType}/${id}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to update ${resourceType}/${id}`, error.response?.data);
            throw error;
        }
    }

    async searchResource(resourceType, params) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.get(
                `${this.baseURL}/${resourceType}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params
                }
            );

            return response.data;
        } catch (error) {
            logger.error(`Failed to search ${resourceType}`, error.response?.data);
            throw error;
        }
    }
}

module.exports = new SatusehatClient();
