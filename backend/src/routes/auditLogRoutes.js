const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            action,
            userId,
            startDate,
            endDate,
            limit = 100,
            offset = 0
        } = req.query;

        const tenantId = req.user.tenantId || 'default';
        const query = { tenantId };

        if (action) query.action = action;
        if (userId) query.userId = userId;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .populate('userId', 'username email role');

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: total > parseInt(offset) + parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            error: true,
            message: 'Fehler beim Abrufen der Audit Logs'
        });
    }
});

router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const tenantId = req.user.tenantId || 'default';

        const stats = await AuditLog.aggregate([
            { $match: { tenantId } },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching audit log stats:', error);
        res.status(500).json({
            error: true,
            message: 'Fehler beim Abrufen der Statistiken'
        });
    }
});

module.exports = router;