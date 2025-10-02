// src/models/Technology.js
//
// Mongoose-Modell für Technology-Dokumente in MongoDB

const mongoose = require('mongoose');

// Enum-Definitionen
const TECHNOLOGY_CATEGORIES = [
    'Techniques',
    'Tools',
    'Platforms',
    'Languages & Frameworks'
];

const TECHNOLOGY_RINGS = [
    'Assess',
    'Trial',
    'Adopt',
    'Hold'
];

const TECHNOLOGY_STATUS = [
    'draft',
    'published'
];

// Schema-Definition
const technologySchema = new mongoose.Schema({
    // Grundlegende Informationen
    name: {
        type: String,
        required: [true, 'Name ist ein Pflichtfeld'],
        trim: true,                    // Entfernt nachfolgende Leerzeichen
        minlength: [2, 'Name muss mindestens 2 Zeichen lang sein'],
        maxlength: [100, 'Name darf maximal 100 Zeichen lang sein'],
        index: true                    // Index für schnelle Suchen
    },

    category: {
        type: String,
        required: [true, 'Kategorie ist ein Pflichtfeld'],
        enum: {
            values: TECHNOLOGY_CATEGORIES,
            message: 'Kategorie muss eine der folgenden sein: {VALUES}'
        },
        index: true                    // Index für Filterung nach Kategorien
    },

    // Technologie-Beschreibung
    description: {
        type: String,
        required: [true, 'Beschreibung ist ein Pflichtfeld'],
        trim: true,
        minlength: [10, 'Beschreibung muss mindestens 10 Zeichen lang sein'],
        maxlength: [1000, 'Beschreibung darf maximal 1000 Zeichen lang sein']
    },

    // Ring-Einordnung
    ring: {
        type: String,
        enum: {
            values: TECHNOLOGY_RINGS,
            message: 'Ring muss eine der folgenden sein: {VALUES}'
        },
        index: true,
        // Custom Validation
        validate: {
            validator: function(value) {
                // Wenn Status 'published' ist, muss Ring gesetzt sein
                if (this.status === 'published') {
                    return value != null && value.trim().length > 0;
                }
                return true; // Für Drafts ist Ring optional
            },
            message: 'Ring ist für veröffentlichte Technologien erforderlich'
        }
    },

    // Beschreibung der Ring-Einordnung
    ringDescription: {
        type: String,
        trim: true,
        maxlength: [2000, 'Ring-Beschreibung darf maximal 2000 Zeichen lang sein'],
        // Custom Validation
        validate: {
            validator: function(value) {
                if (this.status === 'published') {
                    return value != null && value.trim().length >= 20;
                }
                return true;
            },
            message: 'Ring-Beschreibung ist für veröffentlichte Technologien erforderlich (mindestens 20 Zeichen)'
        }
    },

    // Workflow-Status
    status: {
        type: String,
        required: true,
        enum: {
            values: TECHNOLOGY_STATUS,
            message: 'Status muss entweder "draft" oder "published" sein'
        },
        default: 'draft',
        index: true                    // Index für Filterung nach Status
    },

    // Metadaten für Nachverfolgung und Audit
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true               // Kann nach der Erstellung nicht mehr angepasst werden
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    publishedAt: {
        type: Date,
        validate: {
            validator: function(value) {
                // publishedAt darf nur gesetzt werden, wenn Status 'published' ist
                if (value && this.status !== 'published') {
                    return false;
                }
                return true;
            },
            message: 'Publikationsdatum kann nur für veröffentlichte Technologien gesetzt werden'
        }
    },

    // Mandanten-ID für Multi-Tenancy
    tenantId: {
        type: String,
        required: [true, 'Mandanten-ID ist erforderlich'],
        index: true,
        default: 'default'
    }
}, {
    // Schema-Optionen
    timestamps: true,                 // Automatische createdAt/updatedAt Felder
    collection: 'technologies',       // Expliziter Collection-Name

    // JSON-Serialisierung konfigurieren
    toJSON: {
        transform: function(doc, ret) {
            // MongoDB _id in id umwandeln
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Compound Index
technologySchema.index({ tenantId: 1, status: 1 });
technologySchema.index({ tenantId: 1, category: 1 });
technologySchema.index({ tenantId: 1, ring: 1 });

// Text-Index für Volltextsuche in Name und Beschreibung
technologySchema.index({
    name: 'text',
    description: 'text',
    ringDescription: 'text'
}, {
    weights: {
        name: 10,
        description: 5,
        ringDescription: 1
    }
});

// Pre-Save-Middleware
technologySchema.pre('save', function(next) {
    console.log('PRE-SAVE MIDDLEWARE TRIGGERED');
    console.log('Status:', this.status);
    console.log('Status modified?', this.isModified('status'));
    console.log('Current publishedAt:', this.publishedAt);

    this.updatedAt = new Date();

    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        console.log('Setting publishedAt NOW');
        this.publishedAt = new Date();
    }

    if (this.isModified('status') && this.status === 'draft') {
        console.log('Removing publishedAt (draft)');
        this.publishedAt = undefined;
    }

    console.log('   Final publishedAt:', this.publishedAt);
    next();
});

// Virtual Fields
technologySchema.virtual('isPublished').get(function() {
    return this.status === 'published';
});

technologySchema.virtual('isDraft').get(function() {
    return this.status === 'draft';
});

// Dauer seit der Erstellung in Tagen
technologySchema.virtual('ageInDays').get(function() {
    return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Instance Methods
technologySchema.methods.publish = function(ring, ringDescription) {
    if (!ring || !ringDescription) {
        throw new Error('Ring und Ring-Beschreibung sind für die Publikation erforderlich');
    }

    this.status = 'published';
    this.ring = ring;
    this.ringDescription = ringDescription;
    this.publishedAt = new Date();

    return this.save();
};

technologySchema.methods.unpublish = function() {
    this.status = 'draft';
    this.publishedAt = undefined;

    return this.save();
};

// Static Methods
technologySchema.statics.findByTenant = function(tenantId, status = null) {
    const query = { tenantId };
    if (status) {
        query.status = status;
    }
    return this.find(query).sort({ updatedAt: -1 });
};

technologySchema.statics.findPublishedByCategory = function(tenantId, category) {
    return this.find({
        tenantId,
        status: 'published',
        category
    }).sort({ name: 1 });
};

technologySchema.statics.searchTechnologies = function(tenantId, searchTerm) {
    return this.find({
        tenantId,
        $text: { $search: searchTerm }
    }, {
        score: { $meta: 'textScore' }  // Relevanz für Sortierung
    }).sort({
        score: { $meta: 'textScore' },
        updatedAt: -1
    });
};

technologySchema.index({ name: 1, tenantId: 1 }, { unique: true });

// erstellen und exportieren
const Technology = mongoose.model('Technology', technologySchema);

module.exports = Technology;