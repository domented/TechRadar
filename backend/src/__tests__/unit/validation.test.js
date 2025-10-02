const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Technology = require('../../models/Technology');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Technology.deleteMany({});
});

describe('Technology Model Validation', () => {
    it('should validate required fields', async () => {
        const tech = new Technology({});

        let error;
        try {
            await tech.save();
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.errors.name).toBeDefined();
        expect(error.errors.category).toBeDefined();
    });

    it('should validate category enum values', async () => {
        const tech = new Technology({
            name: 'React',
            category: 'InvalidCategory',
            ring: 'Adopt',
            description: 'Test description with enough characters'
        });

        let error;
        try {
            await tech.save();
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.errors.category).toBeDefined();
    });

    it('should accept valid ring values', async () => {
        const rings = ['Adopt', 'Trial', 'Assess', 'Hold'];

        for (const ring of rings) {
            const tech = new Technology({
                name: `Tech-${ring}-${Date.now()}`,
                category: 'Languages & Frameworks',
                ring: ring,
                description: 'Test description with enough characters here'
            });

            await expect(tech.save()).resolves.toBeDefined();
        }
    });

    it('should allow duplicate technology names if no unique constraint', async () => {
        // Erste Technology erstellen
        await Technology.create({
            name: 'React',
            category: 'Languages & Frameworks',
            ring: 'Adopt',
            description: 'First React entry with enough text'
        });

        // Zweite Technoloy mit demselben Namen
        const duplicate = new Technology({
            name: 'React',
            category: 'Tools',
            ring: 'Trial',
            description: 'Different tech but same name'
        });

        const saved = await duplicate.save();
        expect(saved).toBeDefined();
        expect(saved.name).toBe('React');
    });

    it('should set default values', async () => {
        const tech = await Technology.create({
            name: 'Vue',
            category: 'Languages & Frameworks',
            ring: 'Adopt',
            description: 'Test description with enough characters'
        });

        // Überprüft nur die Werte, die tatsächlich im Model definiert sind
        expect(tech.tenantId).toBe('default');
        expect(tech.createdAt).toBeDefined();
        expect(tech.updatedAt).toBeDefined();

        if (tech.schema.path('isActive')) {
            expect(tech.isActive).toBeDefined();
        }
    });

    it('should validate description minimum length', async () => {
        const tech = new Technology({
            name: 'React',
            category: 'Languages & Frameworks',
            ring: 'Adopt',
            description: 'Short'
        });

        let error;
        try {
            await tech.save();
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.errors.description).toBeDefined();
    });

    it('should validate ring enum values', async () => {
        const validRings = ['Adopt', 'Trial', 'Assess', 'Hold'];

        for (const ring of validRings) {
            const tech = new Technology({
                name: `Test-${ring}-${Date.now()}`,
                category: 'Languages & Frameworks',
                ring: ring,
                description: 'Valid technology with proper description'
            });

            await expect(tech.save()).resolves.toBeDefined();
        }
    });

    it('should reject invalid ring values', async () => {
        const tech = new Technology({
            name: 'InvalidRingTech',
            category: 'Languages & Frameworks',
            ring: 'InvalidRing',
            description: 'Technology with invalid ring value'
        });

        let error;
        try {
            await tech.save();
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
    });
});