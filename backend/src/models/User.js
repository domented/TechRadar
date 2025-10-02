// src/models/User.js
//
// Mongoose-Modell für User-Dokumente in MongoDB

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Enum für Benutzerrollen
const USER_ROLES = ['admin', 'viewer'];

// User Schema Definition
const userSchema = new mongoose.Schema({
    // Benutzername
    username: {
        type: String,
        required: [true, 'Benutzername ist ein Pflichtfeld'],
        trim: true,
        minlength: [3, 'Benutzername muss mindestens 3 Zeichen lang sein'],
        maxlength: [50, 'Benutzername darf maximal 50 Zeichen lang sein'],
        lowercase: true,  // Automatisch in Kleinbuchstaben umwandeln
        index: true
    },

    // Email-Adresse
    email: {
        type: String,
        required: [true, 'E-Mail ist ein Pflichtfeld'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Ungültige E-Mail-Adresse'],
        index: true
    },

    // Passwort
    password: {
        type: String,
        required: [true, 'Passwort ist ein Pflichtfeld'],
        minlength: [8, 'Passwort muss mindestens 8 Zeichen lang sein'],
        select: false
    },

    // Rolle
    role: {
        type: String,
        required: true,
        enum: {
            values: USER_ROLES,
            message: 'Rolle muss entweder "admin" oder "viewer" sein'
        },
        default: 'viewer'
    },

    // Anzeigename
    displayName: {
        type: String,
        trim: true,
        maxlength: [100, 'Anzeigename darf maximal 100 Zeichen lang sein']
    },

    // Aktiv-Status
    isActive: {
        type: Boolean,
        default: true
    },

    // Letzter Login
    lastLogin: {
        type: Date
    },

    // Login-Versuche
    loginAttempts: {
        type: Number,
        default: 0
    },

    // Account gesperrt
    lockUntil: {
        type: Date
    },

    // Mandanten-ID
    tenantId: {
        type: String,
        required: [true, 'Mandanten-ID ist erforderlich'],
        index: true,
        default: 'default'
    },

    // Metadaten
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'users',
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;  // Passwort ni an Frontend senden
            delete ret.loginAttempts;
            delete ret.lockUntil;
            return ret;
        }
    }
});

// Compound Index
userSchema.index({ username: 1, tenantId: 1 }, { unique: true });
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

// Virtual für Account-Locked Status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-Save Middleware
userSchema.pre('save', async function(next) {
    // Nur hashen, wenn Passwort geändert wurde
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Salt generieren und Passwort hashen
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance Method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Fehler beim Passwort-Vergleich');
    }
};

// Instance Method
userSchema.methods.incLoginAttempts = function() {
    // Wenn Lock abgelaufen ist, zurücksetzen
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    // Ansonsten Versuche erhöhen
    const updates = { $inc: { loginAttempts: 1 } };

    // Nach 5 fehlgeschlagenen Versuchen: Account für 2 Stunden sperren
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 Stunden in Millisekunden

    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }

    return this.updateOne(updates);
};

// Instance Method
userSchema.methods.handleSuccessfulLogin = function() {
    return this.updateOne({
        $set: { lastLogin: Date.now() },
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

userSchema.statics.findByCredentials = async function(username, password, tenantId = 'default') {
    // User finden
    const user = await this.findOne({
        username: username.toLowerCase(),
        tenantId,
        isActive: true
    }).select('+password');

    if (!user) {
        throw new Error('Ungültige Anmeldedaten');
    }

    // Prüfen ob Account gesperrt ist
    if (user.isLocked) {
        const lockMinutesRemaining = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        throw new Error(`Account ist gesperrt. Versuchen Sie es in ${lockMinutesRemaining} Minuten erneut.`);
    }

    // Passwort check
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        // Fehlversuch registrieren
        await user.incLoginAttempts();
        throw new Error('Ungültige Anmeldedaten');
    }

    // Erfolgreichen Login
    await user.handleSuccessfulLogin();

    return user;
};

userSchema.statics.createDefaultAdmin = async function(tenantId = 'default') {
    const existingAdmin = await this.findOne({
        role: 'admin',
        tenantId
    });

    if (existingAdmin) {
        console.log('Default Admin bereits vorhanden');
        return existingAdmin;
    }

    const defaultAdmin = new this({
        username: 'admin',
        email: 'admin@techradar.local',
        password: 'Admin123!',  // In Produktion: Aus Umgebungsvariable lesen
        role: 'admin',
        displayName: 'System Administrator',
        tenantId
    });

    await defaultAdmin.save();
    console.log('Default Admin erstellt: admin / Admin123!');
    return defaultAdmin;
};

// Das Modell erstellen und exportieren
const User = mongoose.model('User', userSchema);

module.exports = User;