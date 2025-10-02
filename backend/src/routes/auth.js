const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

const sendError = (res, statusCode, message, details = null) => {
    const errorResponse = {
        error: true,
        message,
        timestamp: new Date().toISOString()
    };

    if (details && process.env.NODE_ENV === 'development') {
        errorResponse.details = details;
    }

    return res.status(statusCode).json(errorResponse);
};

const sendSuccess = (res, data, message = null, statusCode = 200) => {
    const response = {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };

    if (message) {
        response.message = message;
    }

    return res.status(statusCode).json(response);
};

router.post('/login', async (req, res) => {
    try {
        const { username, password, tenantId = 'default' } = req.body;

        if (!username || !password) {
            return sendError(res, 400, 'Benutzername und Passwort sind erforderlich');
        }

        if (username.trim().length < 3) {
            return sendError(res, 400, 'Benutzername muss mindestens 3 Zeichen lang sein');
        }

        if (password.length < 8) {
            return sendError(res, 400, 'Passwort muss mindestens 8 Zeichen lang sein');
        }

        const user = await User.findByCredentials(username, password, tenantId);
        const token = generateToken(user);

        await AuditLog.log({
            userId: user.id,
            username: user.username,
            userRole: user.role,
            action: 'login_success',
            resourceType: 'auth',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            requestMethod: req.method,
            requestPath: req.originalUrl,
            tenantId: user.tenantId
        });

        return sendSuccess(res, {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                displayName: user.displayName,
                tenantId: user.tenantId
            },
            expiresIn: '7d'
        }, 'Login erfolgreich');

    } catch (error) {
        console.error('Login Error:', error);

        await AuditLog.log({
            userId: null,
            username: req.body.username || 'unknown',
            userRole: 'unknown',
            action: 'login_failed',
            resourceType: 'auth',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            requestMethod: req.method,
            requestPath: req.originalUrl,
            tenantId: req.body.tenantId || 'default',
            details: { error: error.message }
        });

        if (error.message.includes('gesperrt')) {
            return sendError(res, 423, error.message);
        }

        return sendError(res, 401, 'Ungültige Anmeldedaten');
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, displayName, tenantId = 'default' } = req.body;

        if (!username || !email || !password) {
            return sendError(res, 400, 'Benutzername, E-Mail und Passwort sind erforderlich');
        }

        if (username.trim().length < 3) {
            return sendError(res, 400, 'Benutzername muss mindestens 3 Zeichen lang sein');
        }

        if (password.length < 8) {
            return sendError(res, 400, 'Passwort muss mindestens 8 Zeichen lang sein');
        }

        const existingUser = await User.findOne({
            $or: [
                { username: username.toLowerCase(), tenantId },
                { email: email.toLowerCase(), tenantId }
            ]
        });

        if (existingUser) {
            return sendError(res, 409, 'Benutzername oder E-Mail bereits vergeben');
        }

        const user = new User({
            username,
            email,
            password,
            displayName: displayName || username,
            tenantId,
            role: 'viewer'
        });

        await user.save();

        const token = generateToken(user);

        sendSuccess(res, {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                displayName: user.displayName,
                tenantId: user.tenantId
            },
            expiresIn: '7d'
        }, 'Registrierung erfolgreich', 201);

    } catch (error) {
        console.error('Registration Error:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return sendError(res, 400, 'Validierungsfehler', validationErrors);
        }

        sendError(res, 500, 'Fehler bei der Registrierung', error.message);
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        sendSuccess(res, {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            displayName: req.user.displayName,
            tenantId: req.user.tenantId,
            lastLogin: req.user.lastLogin,
            createdAt: req.user.createdAt
        }, 'User-Daten erfolgreich abgerufen');

    } catch (error) {
        console.error('Error fetching user data:', error);
        sendError(res, 500, 'Fehler beim Abrufen der Benutzerdaten', error.message);
    }
});

router.post('/logout', authMiddleware, async (req, res) => {
    await AuditLog.log({
        userId: req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        action: 'logout',
        resourceType: 'auth',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        requestMethod: req.method,
        requestPath: req.originalUrl,
        tenantId: req.user.tenantId
    });

    console.log(`User logged out: ${req.user.username}`);
    sendSuccess(res, null, 'Logout erfolgreich.');
});

module.exports = router;