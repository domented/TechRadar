const express = require('express');
const router = express.Router();

const {
    getAllTechnologies,
    getTechnologyById,
    createTechnology,
    updateTechnology,
    publishTechnology,
    deleteTechnology,
    getTechnologyStats
} = require('../controllers/technologyController');

const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { auditLogMiddleware } = require('../middleware/auditLog');

const validateTechnologyData = (req, res, next) => {
    console.log(`Technology API: ${req.method} ${req.originalUrl}`);

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!req.is('application/json')) {
            return res.status(415).json({
                error: 'Content-Type muss application/json sein'
            });
        }
    }
    next();
};

router.use(validateTechnologyData);

router.get('/stats', authMiddleware, getTechnologyStats);
router.get('/', authMiddleware, getAllTechnologies);
router.get('/:id', authMiddleware, getTechnologyById);

router.post('/',
    authMiddleware,
    adminMiddleware,
    auditLogMiddleware('technology_create', 'technology'),
    createTechnology
);

router.put('/:id',
    authMiddleware,
    adminMiddleware,
    auditLogMiddleware('technology_update', 'technology'),
    updateTechnology
);

router.patch('/:id/publish',
    authMiddleware,
    adminMiddleware,
    auditLogMiddleware('technology_publish', 'technology'),
    publishTechnology
);

router.delete('/:id',
    authMiddleware,
    adminMiddleware,
    auditLogMiddleware('technology_delete', 'technology'),
    deleteTechnology
);

router.use((error, req, res, next) => {
    console.error('Technology Route Error:', {
        method: req.method,
        url: req.originalUrl,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    res.status(500).json({
        error: 'Internal Server Error in Technology API',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;