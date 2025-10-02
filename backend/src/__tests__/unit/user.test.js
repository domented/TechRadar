const User = require('../../models/User');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('User Model', () => {
    test('should hash password before saving', async () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'viewer',
            tenantId: 'test'
        });

        await user.save();
        expect(user.password).not.toBe('password123');
        expect(user.password.length).toBeGreaterThan(50); // bcrypt hash
    });

    test('should compare password correctly', async () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'viewer',
            tenantId: 'test'
        });
        await user.save();

        const isValid = await user.comparePassword('password123');
        expect(isValid).toBe(true);

        const isInvalid = await user.comparePassword('wrongpassword');
        expect(isInvalid).toBe(false);
    });

    test('should increment login attempts', async () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'viewer',
            tenantId: 'test'
        });
        await user.save();

        await user.incLoginAttempts();
        const updated = await User.findById(user._id);
        expect(updated.loginAttempts).toBe(1);
    });

    test('should lock account after 5 failed attempts', async () => {
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'viewer',
            tenantId: 'test',
            loginAttempts: 4
        });
        await user.save();

        await user.incLoginAttempts();
        const updated = await User.findById(user._id);
        expect(updated.lockUntil).toBeDefined();
        expect(updated.isLocked).toBe(true);
    });
});