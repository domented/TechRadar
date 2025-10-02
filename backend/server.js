require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techradar';

const authRoutes = require('./src/routes/auth');
const auditLogRoutes = require('./src/routes/auditLogRoutes');
const { authMiddleware } = require('./src/middleware/auth');

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({
    limit: '10mb',
    strict: true
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const bodyStr = JSON.stringify(req.body);
        const truncatedBody = bodyStr.length > 200 ?
            bodyStr.substring(0, 200) + '...' : bodyStr;
        console.log(`Body: ${truncatedBody}`);
    }

    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/technologies', authMiddleware, require('./src/routes/technologyRoutes'));
app.use('/api/audit-logs', auditLogRoutes);

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techradar';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB');
    console.log(`Database: ${MONGODB_URI}`);
});

mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    try {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Technology Radar API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        version: process.env.npm_package_version || '1.0.0'
    });
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Technology Radar API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            technologies: {
                create: 'POST /api/technologies',
                list: 'GET /api/technologies',
                get: 'GET /api/technologies/:id',
                update: 'PUT /api/technologies/:id',
                delete: 'DELETE /api/technologies/:id',
                publish: 'PATCH /api/technologies/:id/publish'
            },
            auditLogs: {  // ← HINZUFÜGEN
                list: 'GET /api/audit-logs',
                stats: 'GET /api/audit-logs/stats'
        }
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: ['/health', '/api', '/api/technologies', '/api/audit-logs']
    });
});

app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);

    if (process.env.NODE_ENV === 'development') {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack
        });
    } else {
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Something went wrong on the server'
        });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('Technology Radar Backend starting...');
        console.log(`Server running on: http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`API info: http://localhost:${PORT}/api`);
        console.log('');
        console.log('Waiting for database connection...');
    });
}

module.exports = app;