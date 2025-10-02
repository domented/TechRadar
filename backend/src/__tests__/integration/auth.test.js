const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../server');
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
    // Bestehende Verbindung schließen
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
        // Testuser erstellen
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        await user.save();

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data.user.username).toBe('testuser');
    });

    it('should reject invalid password', async () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        await user.save();

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'nonexistent',
                password: 'password123'
            });

        expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser'
                // password fehlt
            });

        expect(response.status).toBe(400);
    });
});

describe('GET /api/technologies', () => {
    it('should require authentication', async () => {
        const response = await request(app)
            .get('/api/technologies');

        expect(response.status).toBe(401);
    });

    it('should allow access with valid token', async () => {
        // User und Token erstellen
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        await user.save();

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        const token = loginResponse.body.data.token;

        const response = await request(app)
            .get('/api/technologies')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });
});