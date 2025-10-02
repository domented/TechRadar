const AuditLog = require('../models/AuditLog');

const auditLogMiddleware = (action, resourceType = null) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function(data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                setImmediate(async () => {
                    try {
                        const logData = {
                            userId: req.user?.id,
                            username: req.user?.username || 'unknown',
                            userRole: req.user?.role || 'unknown',
                            action: action,
                            resourceType: resourceType,
                            resourceId: req.params.id || req.body?.id,
                            resourceName: req.body?.name,
                            ipAddress: req.ip || req.connection.remoteAddress,
                            userAgent: req.get('user-agent'),
                            requestMethod: req.method,
                            requestPath: req.originalUrl,
                            tenantId: req.user?.tenantId || 'default',
                            details: {
                                body: sanitizeBody(req.body),
                                query: req.query
                            }
                        };

                        await AuditLog.log(logData);
                    } catch (error) {
                        console.error('Audit logging failed:', error);
                    }
                });
            }

            return originalSend.call(this, data);
        };

        next();
    };
};

function sanitizeBody(body) {
    if (!body) return {};

    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.token;

    return sanitized;
}

module.exports = { auditLogMiddleware };