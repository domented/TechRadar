// src/middleware/auth.js
//
// Authentication und Authorization Middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Hilfsfunktion für Error-Responses
const sendAuthError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        error: true,
        message,
        timestamp: new Date().toISOString()
    });
};

const authMiddleware = async (req, res, next) => {
    try {
        // JWT_SECRET check
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET ist nicht in Umgebungsvariablen definiert!');
            return sendAuthError(res, 500, 'Server-Konfigurationsfehler');
        }

        // Token aus Authorization Header extrahieren
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return sendAuthError(res, 401, 'Keine Authentifizierung. Bitte melden Sie sich an.');
        }

        // Format: "Bearer <token>"
        if (!authHeader.startsWith('Bearer ')) {
            return sendAuthError(res, 401, 'Ungültiges Token-Format. Erwartet: Bearer <token>');
        }

        const token = authHeader.substring(7); // "Bearer " entfernen

        if (!token || token.trim().length === 0) {
            return sendAuthError(res, 401, 'Token ist leer');
        }

        // Token verifizieren
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return sendAuthError(res, 401, 'Token ist abgelaufen. Bitte melden Sie sich erneut an.');
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return sendAuthError(res, 401, 'Ungültiges Token');
            }
            throw jwtError; // Andere Fehler weiterwerfen
        }

        // User-Load aus Datenbank
        const user = await User.findOne({
            _id: decoded.userId,
            tenantId: decoded.tenantId,
            isActive: true
        });

        if (!user) {
            return sendAuthError(res, 401, 'Benutzer nicht gefunden oder deaktiviert');
        }

        // User-Daten an Request anhängen
        req.user = user;
        req.userId = user._id;
        req.tenantId = user.tenantId;

        // Log Debugging
        if (process.env.NODE_ENV === 'development') {
            console.log(`Authenticated: ${user.username} (${user.role})`);
        }

        next();

    } catch (error) {
        console.error('Authentication Error:', error);
        return sendAuthError(res, 500, 'Fehler bei der Authentifizierung');
    }
};

const adminMiddleware = (req, res, next) => {
    // Prüfen ob User vorhanden
    if (!req.user) {
        return sendAuthError(res, 401, 'Authentifizierung erforderlich');
    }

    // Rolle check
    if (req.user.role !== 'admin') {
        return sendAuthError(
            res,
            403,
            'Zugriff verweigert. Admin-Berechtigung erforderlich.'
        );
    }

    // Admin-Status
    req.isAdmin = true;

    if (process.env.NODE_ENV === 'development') {
        console.log(`Admin access granted: ${req.user.username}`);
    }

    next();
};

const optionalAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Kein Token vorhanden
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.isAuthenticated = false;
        return next();
    }

    // Token vorhanden
    try {
        await authMiddleware(req, res, next);
        req.isAuthenticated = true;
    } catch (error) {
        console.warn('Optional Auth Failed:', error.message);
        req.isAuthenticated = false;
        next();
    }
};

const generateToken = (user, expiresIn = '7d') => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET nicht konfiguriert');
    }

    const payload = {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn,
        issuer: 'techradar-api',
        audience: 'techradar-client'
    });
};

const refreshTokenMiddleware = async (req, res, next) => {
    // normale Authentifizierung
    await authMiddleware(req, res, () => {
        // Token-Ablaufdatum check
        const authHeader = req.headers.authorization;
        const token = authHeader.substring(7);
        const decoded = jwt.decode(token);

        // Token 24h neue Generierung
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        const hoursRemaining = expiresIn / 3600;

        if (hoursRemaining < 24) {
            const newToken = generateToken(req.user);
            // Neuen Token im Response-Header zurückgeben
            res.setHeader('X-New-Token', newToken);
            console.log(`Token refreshed for user: ${req.user.username}`);
        }

        next();
    });
};

// Middleware-Functions
module.exports = {
    authMiddleware,
    adminMiddleware,
    optionalAuthMiddleware,
    refreshTokenMiddleware,
    generateToken
};