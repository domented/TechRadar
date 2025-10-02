// scripts/setupAdmin.js
//
// Script zum Erstellen des initialen Admin-Users. Dazu "node scripts/setupAdmin.js" und "node scripts/setupAdmin.js --create-demo-users" im Terminal ausführen.

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techradar';

async function setupAdmin() {
    try {
        console.log('Technology Radar - Admin Setup');
        console.log('=' .repeat(50));

        console.log('Verbindung mit der MongoDb wird ausgeführt.');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Verbindung konnte erfolgreich hergestellt werden.\n');

        // Checkt ob bereits ein Admin existiert.
        const existingAdmin = await User.findOne({
            role: 'admin',
            tenantId: 'default'
        });

        if (existingAdmin) {
            console.log('Ein Admin-User ist bereits existent. Skript muss nicht zweimal ausgeführt werden.:');
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   E-Mail: ${existingAdmin.email}`);
            console.log(`   Erstellt: ${existingAdmin.createdAt.toLocaleDateString('de-DE')}`);
            console.log('\nKein neuer ADmin wurde erstellt!');

            // Check, ob Admin-Passwort zurückgesetzt werden soll.
            if (process.argv.includes('--reset-password')) {
                console.log('\nSetze Admin-Passwort zurück...');
                existingAdmin.password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
                await existingAdmin.save();
                console.log('Passwort wurde zurückgesetzt');
                console.log(`Neues Passwort: ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!'}`);
            }
        } else {
            console.log('Erstelle den Default Admin...\n');

            const adminData = {
                username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
                email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@techradar.local',
                password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!',
                role: 'admin',
                displayName: 'System Administrator',
                tenantId: 'default'
            };

            const admin = new User(adminData);
            await admin.save();

            console.log('Admin-User wurde erfolgreich erstellt!');
            console.log('\nLogin-Credentials:');
            console.log('=' .repeat(50));
            console.log(`   Username: ${adminData.username}`);
            console.log(`   E-Mail:   ${adminData.email}`);
            console.log(`   Passwort: ${adminData.password}`);
            console.log(`   Rolle:    ${adminData.role}`);
            console.log('=' .repeat(50));
        }

        // Statistiken
        const totalUsers = await User.countDocuments({ tenantId: 'default' });
        const adminCount = await User.countDocuments({ role: 'admin', tenantId: 'default' });
        const viewerCount = await User.countDocuments({ role: 'viewer', tenantId: 'default' });

        console.log('\nUser-Statistiken:');
        console.log(`   Gesamt:  ${totalUsers}`);
        console.log(`   Admins:  ${adminCount}`);
        console.log(`   Viewers: ${viewerCount}`);

        // Default-Viewer erstellen.
        if (process.argv.includes('--create-demo-users')) {
            console.log('\nErstelle Demo-User...');

            const viewerExists = await User.findOne({
                username: 'viewer',
                tenantId: 'default'
            });

            if (!viewerExists) {
                const viewer = new User({
                    username: 'viewer',
                    email: 'viewer@techradar.local',
                    password: 'Viewer123!',
                    role: 'viewer',
                    displayName: 'Demo Viewer',
                    tenantId: 'default'
                });
                await viewer.save();
                console.log('Default-Viewer erstellt: viewer / Viewer123!');
            } else {
                console.log('Default-Viewer existiert bereits.');
            }
        }

        console.log('\nSetup abgeschlossen.');
        console.log('\nOptions:');
        console.log('   --reset-password    : Admin-Passwort zurücksetzen');
        console.log('   --create-demo-users : Demo-User erstellen');

    } catch (error) {
        console.error('\nFehler während des Setup:', error.message);
        if (error.code === 11000) {
            console.error('   User existiert bereits');
        }
        process.exit(1);
    } finally {
        // Verbindung schließen
        await mongoose.connection.close();
        console.log('\nDatenbankverbindung zur MongoDB geschlossen');
        process.exit(0);
    }
}

// Script ausführen
setupAdmin();