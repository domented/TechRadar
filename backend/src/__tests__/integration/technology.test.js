const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../server');
const User = require('../../models/User');
const Technology = require('../../models/Technology');

let mongoServer;
let adminToken;
let viewerToken;

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Admin-User erstellen
    const adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    });
    await adminUser.save();

    // Viewer erstellen
    const viewerUser = new User({
        username: 'viewer',
        email: 'viewer@example.com',
        password: 'password123',
        role: 'viewer'
    });
    await viewerUser.save();

    // Tokens holen
    const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'password123' });
    adminToken = adminLogin.body.data.token;

    const viewerLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'viewer', password: 'password123' });
    viewerToken = viewerLogin.body.data.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Technology.deleteMany({});
});

describe('POST /api/technologies', () => {
    const validTechnology = {
        name: 'React',
        category: 'Languages & Frameworks',
        ring: 'Adopt',
        description: 'A JavaScript library for building user interfaces with components',
        isActive: true
    };

    it('should allow admin to create technology', async () => {
        const response = await request(app)
            .post('/api/technologies')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(validTechnology);

        expect(response.status).toBe(201);
        expect(response.body.data.name).toBe('React');
        expect(response.body.data.category).toBe('Languages & Frameworks');
    });

    it('should prevent viewer from creating technology', async () => {
        const response = await request(app)
            .post('/api/technologies')
            .set('Authorization', `Bearer ${viewerToken}`)
            .send(validTechnology);

        expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
        const response = await request(app)
            .post('/api/technologies')
            .send(validTechnology);

        expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
        const response = await request(app)
            .post('/api/technologies')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'React'
            });

        expect(response.status).toBe(400);
    });
});

describe('GET /api/technologies', () => {
    beforeEach(async () => {
        await Technology.create([
            {
                name: 'React',
                category: 'Languages & Frameworks',
                ring: 'Adopt',
                description: 'UI Library for building user interfaces',
                isActive: true,
                tenantId: 'default'
            },
            {
                name: 'Vue',
                category: 'Languages & Frameworks',
                ring: 'Trial',
                description: 'Progressive JavaScript Framework for UIs',
                isActive: true,
                tenantId: 'default'
            },
            {
                name: 'Angular',
                category: 'Languages & Frameworks',
                ring: 'Hold',
                description: 'TypeScript-based web framework by Google',
                isActive: false,
                tenantId: 'default'
            }
        ]);
    });

    it('should return all active technologies', async () => {
        const response = await request(app)
            .get('/api/technologies')
            .set('Authorization', `Bearer ${viewerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        const technologies = Array.isArray(response.body.data)
            ? response.body.data
            : response.body.data.technologies || [];
        expect(technologies.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by ring', async () => {
        const response = await request(app)
            .get('/api/technologies?ring=Adopt')
            .set('Authorization', `Bearer ${viewerToken}`);

        expect(response.status).toBe(200);
        const technologies = Array.isArray(response.body.data)
            ? response.body.data
            : response.body.data.technologies || [];

        const adoptTechs = technologies.filter(t => t.ring === 'Adopt');
        expect(adoptTechs.length).toBeGreaterThan(0);
    });
});

describe('GET /api/technologies/:id', () => {
    let technologyId;

    beforeEach(async () => {
        const tech = await Technology.create({
            name: 'React',
            category: 'Languages & Frameworks',
            ring: 'Adopt',
            description: 'UI Library for building modern interfaces',
            isActive: true,
            tenantId: 'default'
        });
        technologyId = tech._id;
    });

    it('should return technology by id', async () => {
        const response = await request(app)
            .get(`/api/technologies/${technologyId}`)
            .set('Authorization', `Bearer ${viewerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe('React');
    });

    it('should return 404 for non-existent id', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .get(`/api/technologies/${fakeId}`)
            .set('Authorization', `Bearer ${viewerToken}`);

        expect(response.status).toBe(404);
    });

    it('should require authentication', async () => {
        const response = await request(app)
            .get(`/api/technologies/${technologyId}`);

        expect(response.status).toBe(401);
    });
});

describe('PUT /api/technologies/:id', () => {
    let technologyId;

    beforeEach(async () => {
        const tech = await Technology.create({
            name: 'React',
            category: 'Languages & Frameworks',
            ring: 'Adopt',
            description: 'UI Library for building user interfaces',
            isActive: true,
            tenantId: 'default'
        });
        technologyId = tech._id;
    });

    it('should allow admin to update technology', async () => {
        const response = await request(app)
            .put(`/api/technologies/${technologyId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                ring: 'Trial',
                description: 'Updated description with more details here'
            });

        expect(response.status).toBe(200);
        expect(response.body.data.ring).toBe('Trial');
    });

    it('should prevent viewer from updating technology', async () => {
        const response = await request(app)
            .put(`/api/technologies/${technologyId}`)
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({ ring: 'Hold' });

        expect(response.status).toBe(403);
    });
});

describe('DELETE /api/technologies/:id', () => {
    let technologyId;

    beforeEach(async () => {
        const tech = await Technology.create({
            name: 'React',
            category: 'Languages & Frameworks',
            ring: 'Adopt',
            description: 'UI Library for building user interfaces',
            isActive: true,
            tenantId: 'default'
        });
        technologyId = tech._id;
    });

    it('should allow admin to delete technology', async () => {
        const response = await request(app)
            .delete(`/api/technologies/${technologyId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);

        const tech = await Technology.findById(technologyId);
        expect(tech).toBeNull();
    });

    it('should prevent viewer from deleting technology', async () => {
        const response = await request(app)
            .delete(`/api/technologies/${technologyId}`)
            .set('Authorization', `Bearer ${viewerToken}`);

        expect(response.status).toBe(403);
    });
});