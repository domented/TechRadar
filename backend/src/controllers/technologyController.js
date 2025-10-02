// src/controllers/technologyController.js
//
// Controller für Technology API-Endpoints

const Technology = require('../models/Technology');

// konsistente Error-Responses
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

// erfolgreiche Responses
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

const getAllTechnologies = async (req, res) => {
    try {
        // Mandanten-ID oder Default
        const tenantId = req.tenantId || 'default';

        // Query-Parameter
        const { status, category, ring, search, limit = 50, offset = 0 } = req.query;

        let query = { tenantId };

        // Optionale Filter
        if (status && ['draft', 'published'].includes(status)) {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        if (ring) {
            query.ring = ring;
        }

        let technologies;

        // Volltextsuche / normale Abfrage
        if (search && search.trim().length > 0) {
            technologies = await Technology.searchTechnologies(tenantId, search.trim())
                .limit(parseInt(limit))
                .skip(parseInt(offset));
        } else {
            technologies = await Technology.find(query)
                .sort({ updatedAt: -1 })  // Neueste zuerst
                .limit(parseInt(limit))
                .skip(parseInt(offset));
        }

        // Anzahl der Gesamt-Ergebnisse
        const totalCount = await Technology.countDocuments(query);

        const response = {
            technologies,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasNext: (parseInt(offset) + parseInt(limit)) < totalCount
            },
            filters: {
                status,
                category,
                ring,
                search
            }
        };

        sendSuccess(res, response, `${technologies.length} Technologien gefunden`);

    } catch (error) {
        console.error('Error in getAllTechnologies:', error);
        sendError(res, 500, 'Fehler beim Abrufen der Technologien', error.message);
    }
};

const getTechnologyById = async (req, res) => {
    try {
        const tenantId = req.tenantId || 'default';
        const { id } = req.params;

        // Validierung der MongoDb ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, 400, 'Ungültige Technologie-ID');
        }

        const technology = await Technology.findOne({
            _id: id,
            tenantId
        });

        if (!technology) {
            return sendError(res, 404, 'Technologie nicht gefunden');
        }

        sendSuccess(res, technology, 'Technologie erfolgreich abgerufen');

    } catch (error) {
        console.error('Error in getTechnologyById:', error);
        sendError(res, 500, 'Fehler beim Abrufen der Technologie', error.message);
    }
};

const createTechnology = async (req, res) => {
    try {
        const tenantId = req.tenantId || 'default';

        // validieren und bereinigen
        const {
            name,
            category,
            ring,
            description,
            ringDescription,
            status = 'draft'
        } = req.body;

        // Validierung
        if (!name || !category || !description) {
            return sendError(res, 400, 'Name, Kategorie und Beschreibung sind Pflichtfelder');
        }

        // doppelte Namen innerhalb des Mandanten
        const existingTechnology = await Technology.findOne({
            name: name.trim(),
            tenantId
        });

        if (existingTechnology) {
            return sendError(res, 409, `Eine Technologie mit dem Namen "${name}" existiert bereits`);
        }

        // Neue Technology
        const technologyData = {
            name: name.trim(),
            category,
            description: description.trim(),
            status,
            tenantId
        };

        // Ring-Daten hinzufügen, wenn vorhanden
        if (ring) {
            technologyData.ring = ring;
        }

        if (ringDescription) {
            technologyData.ringDescription = ringDescription.trim();
        }

        const technology = new Technology(technologyData);

        // Save
        const savedTechnology = await technology.save();

        console.log(`New technolgy created: ${savedTechnology.name} (${savedTechnology.id})`);

        sendSuccess(res, savedTechnology, 'Technologie erfolgreich erstellt', 201);

    } catch (error) {
        console.error('Error in createTechnology:', error);

        // Mongoose-Validierungsfehler behandeln
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return sendError(res, 400, 'Validierungsfehler', validationErrors);
        }

        sendError(res, 500, 'Fehler beim Erstellen der Technologie', error.message);
    }
};

const updateTechnology = async (req, res) => {
    try {
        const tenantId = req.tenantId || 'default';
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, 400, 'Ungültige Technologie-ID');
        }

        const existingTechnology = await Technology.findOne({
            _id: id,
            tenantId
        });

        if (!existingTechnology) {
            return sendError(res, 404, 'Technologie nicht gefunden');
        }

        // Status speichern
        const oldStatus = existingTechnology.status;

        // Update-Daten
        const allowedFields = ['name', 'category', 'description', 'ring', 'ringDescription', 'status'];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                existingTechnology[field] = typeof req.body[field] === 'string'
                    ? req.body[field].trim()
                    : req.body[field];
            }
        }

        // Status after dem Update
        const newStatus = existingTechnology.status;

        if (oldStatus === 'draft' && newStatus === 'published') {
            existingTechnology.publishedAt = new Date();
            console.log('Manually setting publishedAt for status change');
        }

        if (oldStatus === 'published' && newStatus === 'draft') {
            existingTechnology.publishedAt = undefined;
            console.log('Removing publishedAt (back to draft)');
        }

        // Name-Dubletten
        if (req.body.name) {
            const duplicateCheck = await Technology.findOne({
                name: req.body.name.trim(),
                tenantId,
                _id: { $ne: id }
            });

            if (duplicateCheck) {
                return sendError(res, 409, `Eine andere Technologie mit dem Namen "${req.body.name}" existiert bereits`);
            }
        }

        console.log('About to save technology...');
        const updatedTechnology = await existingTechnology.save();

        console.log(`Technology updated: ${updatedTechnology.name} (${updatedTechnology.id})`);
        console.log(`Status: ${oldStatus} → ${updatedTechnology.status}`);
        console.log(`PublishedAt: ${updatedTechnology.publishedAt}`);

        sendSuccess(res, updatedTechnology, 'Technologie erfolgreich aktualisiert');

    } catch (error) {
        console.error('Error in updateTechnology:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return sendError(res, 400, 'Validierungsfehler', validationErrors);
        }

        sendError(res, 500, 'Fehler beim Aktualisieren der Technologie', error.message);
    }
};

const publishTechnology = async (req, res) => {
    try {
        const tenantId = req.tenantId || 'default';
        const { id } = req.params;
        const { ring, ringDescription } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, 400, 'Ungültige Technologie-ID');
        }

        if (!ring || !ringDescription) {
            return sendError(res, 400, 'Ring und Ring-Beschreibung sind für die Publikation erforderlich');
        }

        // Technologie finden
        const technology = await Technology.findOne({
            _id: id,
            tenantId
        });

        if (!technology) {
            return sendError(res, 404, 'Technologie nicht gefunden');
        }

        if (technology.status === 'published') {
            return sendError(res, 400, 'Technologie ist bereits veröffentlicht');
        }

        // Publikations-Methode
        const publishedTechnology = await technology.publish(ring, ringDescription.trim());

        console.log(`Technology published: ${publishedTechnology.name} (${publishedTechnology.id})`);

        sendSuccess(res, publishedTechnology, 'Technologie erfolgreich veröffentlicht');

    } catch (error) {
        console.error('Error in publishTechnology:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return sendError(res, 400, 'Validierungsfehler', validationErrors);
        }

        sendError(res, 500, 'Fehler beim Veröffentlichen der Technologie', error.message);
    }
};

const deleteTechnology = async (req, res) => {
    try {
        const tenantId = req.tenantId || 'default';
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, 400, 'Ungültige Technologie-ID');
        }

        const technology = await Technology.findOne({
            _id: id,
            tenantId
        });

        if (!technology) {
            return sendError(res, 404, 'Technologie nicht gefunden');
        }

        // Check Entwurf für Löschung
        if (technology.status === 'published') {
            return sendError(res, 400, 'Veröffentlichte Technologien können nicht gelöscht werden');
        }

        await Technology.findByIdAndDelete(id);

        console.log(`Technology deleted: ${technology.name} (${technology.id})`);

        sendSuccess(res, { id }, 'Technologie erfolgreich gelöscht');

    } catch (error) {
        console.error('Error in deleteTechnology:', error);
        sendError(res, 500, 'Fehler beim Löschen der Technologie', error.message);
    }
};

const getTechnologyStats = async (req, res) => {
    try {
        const tenantId = req.tenantId || 'default';

        const stats = await Technology.aggregate([
            { $match: { tenantId } },
            {
                $group: {
                    _id: null,
                    totalTechnologies: { $sum: 1 },
                    publishedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draftCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Statistiken nach Kategorien
        const categoryStats = await Technology.aggregate([
            { $match: { tenantId, status: 'published' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Statistiken nach Ringen
        const ringStats = await Technology.aggregate([
            { $match: { tenantId, status: 'published' } },
            {
                $group: {
                    _id: '$ring',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const result = {
            overview: stats[0] || { totalTechnologies: 0, publishedCount: 0, draftCount: 0 },
            byCategory: categoryStats,
            byRing: ringStats
        };

        sendSuccess(res, result, 'Statistiken erfolgreich abgerufen');

    } catch (error) {
        console.error('Error in getTechnologyStats:', error);
        sendError(res, 500, 'Fehler beim Abrufen der Statistiken', error.message);
    }
};

// Controller-Funktionen
module.exports = {
    getAllTechnologies,
    getTechnologyById,
    createTechnology,
    updateTechnology,
    publishTechnology,
    deleteTechnology,
    getTechnologyStats
};