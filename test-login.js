const axios = require('axios');

const client = axios.create({
    baseURL: "https://api.demo.tunzaa.co.tz/v1",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Tenant-ID": "90c9aad8-4201-4416-8af6-c5561b7e6b35",
        "X-Environment": "sandbox",
    }
});

async function run() {
    const ts = Date.now();
    const phone = `2557${ts.toString().slice(-8)}`;
    const email = `test${ts}@example.com`;
    const password = "password@123";

    try {
        console.log(`1. Registering user with phone ${phone} and email ${email}...`);
        const regRes = await client.post('/auth/register', {
            first_name: "Test",
            last_name: "User",
            phone_number: phone,
            email: email,
            password: password
        });
        console.log("Registration success!");

        console.log(`2. Attempting to login with email ${email}...`);
        const loginRes = await client.post('/auth/login', {
            identifier: email,
            password: password,
            is_phone: false
        });
        console.log("Email login success!", loginRes.data.user_id);

        console.log(`3. Attempting to login with phone ${phone}...`);
        const loginRes2 = await client.post('/auth/login', {
            identifier: phone,
            password: password,
            is_phone: true
        });
        console.log("Phone login success!", loginRes2.data.user_id);

    } catch (e) {
        console.error("ERROR:", e.response?.status, e.response?.data || e.message);
    }
}

run();
