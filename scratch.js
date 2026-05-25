const axios = require('axios');
const API_URL = 'https://api.sandbox.tunzaa.co.tz/v1'; // Assuming from environment
const TENANT_ID = '90c9aad8-4201-4416-8af6-c5561b7e6b35';

async function test() {
    try {
        const client = axios.create({
            baseURL: 'https://staging-api.tunzaa.com/v1', // Let's use the one from config.ts if possible. Wait, I should read config.ts
        });
    } catch(e) {}
}
