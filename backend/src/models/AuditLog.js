const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['admin', 'viewer'],
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login_success',
            'login_failed',
            'logout',
            'technology_create',
            'technology_update',
            'technology_delete',
            'technology_publish',
            'user_create',
            'user_update'
        ]
    },
    resourceType: {
        type: String,
        enum: ['technology', 'user', 'auth']
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    resourceName: String,
    ipAddress: String,
    userAgent: String,
    requestMethod: String,
    requestPath: String,
    details: mongoose.Schema.Types.Mixed,
    tenantId: {
        type: String,
        required: true,
        default: 'default',
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    collection: 'auditlogs'
});

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, timestamp: -1 });

auditLogSchema.statics.log = async function(data) {
    try {
        const log = new this(data);
        await log.save();
        console.log(`Audit Log: ${data.action} by ${data.username}`);
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;