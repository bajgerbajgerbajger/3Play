# 3Play - Video Sharing Platform

Moderní video platforma pro sdílení a objevování video obsahu.

## Funkce

- **Nahrávání videí** - Podpora pro MP4, WebM, MOV až do 2GB
- **Streamování** - Adaptivní streamování s kvalitními možnostmi
- **Uživatelské profily** - Vlastní kanály, odběry, sledující
- **Interakce** - Komentáře, lajky, sdílení
- **Vyhledávání** - Pokročilé vyhledávání s filtry
- **Kategorie** - Zábava, hudba, hry, vzdělávání, sport, technologie, zprávy
- **i18n** - Podpora pro češtinu a angličtinu

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router DOM
- i18next (internacionalizace)
- React Player

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT autentizace
- Socket.IO (real-time)
- Multer (upload souborů)

## Struktura projektu

```
3Play/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios konfigurace
│   │   ├── components/    # React komponenty
│   │   │   ├── Layout/    # Layout (Navbar, Sidebar)
│   │   │   └── Video/     # Video komponenty
│   │   ├── i18n/          # Překlady
│   │   │   └── locales/  # CS, EN locale soubory
│   │   ├── pages/         # Route stránky
│   │   └── store/         # Zustand store
│   └── package.json
├── server/                # Express backend
│   ├── config/            # Konfigurace (db, security, email)
│   ├── middleware/        # Middleware (auth, upload)
│   ├── models/            # Mongoose modely
│   ├── routes/            # API routy
│   ├── services/          # Služby (email)
│   └── server.js          # Hlavní entry point
├── docs/                  # Dokumentace
├── nginx/                 # Nginx konfigurace
├── docker-compose.yml     # Docker Compose
└── package.json           # Root orchestrace
```

## Instalace

### Požadavky
- Node.js 18+
- MongoDB
- Docker (volitelně)

### Lokální vývoj

1. **Klonujte repozitář**
```bash
git clone <repo-url>
cd 3Play
```

2. **Nainstalujte závislosti**
```bash
# Všechny současně (root)
npm install

# Nebo odděleně
cd client && npm install
cd ../server && npm install
```

3. **Nastavte environment proměnné**

Vytvořte `.env` soubor v `server/`:
```env
MONGODB_URI=mongodb://localhost:27017/3play
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

4. **Spusťte aplikaci**

```bash
# Z root adresáře (spustí client i server)
npm run dev

# Nebo odděleně
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

5. **Otevřete prohlížeč**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Docker

```bash
# Spustit všechny služby
docker-compose up -d

# Zastavit
docker-compose down
```

## API Endpoints

### Autentizace
- `POST /api/auth/register` - Registrace
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/logout` - Odhlášení
- `POST /api/auth/refresh` - Obnovení tokenu
- `POST /api/auth/verify-email` - Ověření e-mailu

### Videa
- `GET /api/videos` - Seznam videí
- `GET /api/videos/:id` - Detail videa
- `POST /api/videos` - Nahrát video (auth required)
- `POST /api/videos/:id/like` - Lajkovat video
- `POST /api/videos/:id/view` - Zvýšit počet zobrazení

### Uživatelé
- `GET /api/users/:id` - Profil uživatele
- `GET /api/users/:id/videos` - Videa uživatele
- `POST /api/users/:id/subscribe` - Odebírat kanál

## Překlady

Aplikace podporuje:
- Čeština (cs) - výchozí
- Angličtina (en)

Překlady jsou v `client/src/i18n/locales/`

## Deployment

### Render.com

1. Push na GitHub
2. Importujte projekt na Render
3. Nastavte environment proměnné:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL`
4. Deploy automaticky přes GitHub Actions

## License

MIT