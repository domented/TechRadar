# I.BA_WEBLAB.F2501
# Projektbeschreibung - Technologie-Radar von Dominik Rohner

Die allgemeine Projektbeschreibung wird in Umfang und Aufbau gemäss dem vorgegebenen Technologie-Radar umgesetzt (ohne weitere Ergänzung): https://github.com/web-programming-lab/web-programming-lab-projekt/blob/main/Technologie-Radar.md

## Technologie-Stack
Um das Technologie-Radar angemessen umzusetzen wird der folgende Technologie-Stack verwendet:
* **Frontend**: Angular
* **Backend**: ExpressJS
* **Datenbank**: MongoDB
* **VCS**: GitHub Repository: https://github.com/domented/TechRadar
* **Projekt-Dokumentation**: Falls genehmigt, würde die Projektdokumentation in Craft erstellt und verlinkt werden.

----------

# TechRadar - Technologie-Radar

# Project Description and Documentation (in German)
- [Architekturdokumentation](https://s.craft.me/jtGjZgLjvCD46A)
- [Fazit und Reflexion](https://s.craft.me/YIZmNQ38HQIrEy)
- [Arbeitsjournal](https://s.craft.me/9dwRsANPlRM3Of)

- [Backup (Google Drive mit PDFs)](https://drive.google.com/drive/folders/1YP0td4eUAUhqx2HyR1Us9NNuS7BOUlCe?usp=sharing)

# How to Start the TechRadar Project

## Prerequisites
Before starting the project, make sure you have the following installed:
- **Node.js**
    - Version: Recommended: 18+
- **MongoDB** (Ensure a local or cloud-based MongoDB instance is running)
    - Version: Recommended: 6+
- **Git** (For cloning the repository)

## 1. Clone the Repository
```sh
git clone https://github.com/domented/I.BA_WEBLAB.F2501.git
cd I.BA_WEBLAB.F2501
```

## 2. Install Backend Dependencies
```sh
cd backend
npm install
```

## 3. Install Frontend Dependencies
```sh
cd ..
npm install
```

## 4. Configure Backend
**Important:** Create a `.env` file in the `backend/` folder (it's not included in the repository):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/techradar
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Customize admin credentials
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_EMAIL=admin@techradar.local
DEFAULT_ADMIN_PASSWORD=Admin123!
```

## 5. Start MongoDB
**Local Installation:**
```sh
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - Start MongoDB as service
```

**Or use MongoDB Atlas** (Cloud)

## 6. Setup Admin User
**Important:** This script must be run manually - users are **not** created automatically on backend start!

```sh
cd backend
node scripts/setupAdmin.js
```

**Optional:** Create demo viewer user
```sh
node scripts/setupAdmin.js --create-demo-users
```

## 7. Start Backend
```sh
cd backend
npm run dev
```
Backend runs on: `http://localhost:3000`

## 8. Start Frontend
Open new terminal:
```sh
ng serve
```
Frontend runs on: `http://localhost:4200`

## 9. Open Browser
```sh
http://localhost:4200
```

## 10. Enter Login Credentials

| Username | Password   | Role    |
|----------|------------|---------|
| admin    | Admin123!  | Admin   |
| viewer   | Viewer123! | Viewer* |

*Only available if created with `--create-demo-users` option

## That's it!

---

**Note:** The `.env` file is not included in the repository for security reasons. Make sure to create it before starting the backend.
