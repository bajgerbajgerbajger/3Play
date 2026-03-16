# 3Play Video Platform

Kompletní video platforma s podporou nahrávání, streamování a správy obsahu.

## Funkce

- **Autentizace uživatelů**: Registrace, přihlášení, JWT tokeny, ověření emailu
- **Nahrávání videí**: Drag & drop, podpora více formátů, automatická konverze
- **Streamování**: Adaptivní streamování, různé kvality, náhledy
- **Správa obsahu**: Knihovna, odběry, historie, stahování
- **Vyhledávání**: Full-text vyhledávání, filtry, tagy
- **Notifikace**: Emailové notifikace, real-time aktualizace

## Technologie

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Redis (caching, sessions)
- Socket.IO (real-time)
- FFmpeg (video processing)
- JWT (autentizace)

### Frontend
- React 18 + Vite
- React Router (routing)
- Zustand (state management)
- Tailwind CSS (styling)
- Axios (HTTP client)
- Socket.IO Client

### Mobilní aplikace
- React Native (připravuje se)

## Struktura projektu

```
3Play/
├── client/           # React frontend
├── server/           # Express backend
├── mobile/           # React Native mobile app
├── nginx/            # Nginx configuration
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── docker-compose.yml
```

## Požadavky

- Node.js 18+
- MongoDB 7.0+
- Redis 7+
- FFmpeg
- Docker & Docker Compose (volitelné)

## Rychlý start

### Lokální vývoj

1. **Klonování repozitáře:**
```bash
git clone <repo-url>
cd 3Play
```

2. **Instalace závislostí:**
```bash
npm run install:all
```

3. **Nastavení proměnných prostředí:**
```bash
cp server/.env.example server/.env
# Upravte .env podle vašeho prostředí
```

4. **Spuštění databází:**
```bash
docker-compose up -d mongodb redis
```

5. **Spuštění vývojového serveru:**
```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

### Docker Compose (produkce)

```bash
# Build a spuštění všech služeb
docker-compose up -d

- Web: http://localhost
- API: http://localhost:5000
```

## Proměnné prostředí

### Server (.env)

| Proměnná | Popis | Výchozí |
|----------|-------|---------|
| `NODE_ENV` | Prostředí | development |
| `PORT` | Port serveru | 5000 |
| `MONGODB_URI` | MongoDB connection string | required |
| `JWT_SECRET` | JWT secret klíč | required |
| `JWT_REFRESH_SECRET` | Refresh token secret | required |
| `CLIENT_URL` | URL frontendu | http://localhost:5173 |
| `SMTP_HOST` | SMTP server | optional |
| `SMTP_PORT` | SMTP port | 587 |
| `SMTP_USER` | SMTP uživatel | optional |
| `SMTP_PASSWORD` | SMTP heslo | optional |
| `USE_ETHEREAL` | Použít Ethereal pro test | false |

## API Endpointy

### Autentizace
- `POST /api/auth/register` - Registrace
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/logout` - Odhlášení
- `POST /api/auth/refresh` - Obnovení tokenu
- `POST /api/auth/verify-email` - Ověření emailu
- `POST /api/auth/resend-verification` - Znovu odeslat ověření

### Videa
- `GET /api/videos` - Seznam videí
- `GET /api/videos/:id` - Detail videa
- `POST /api/videos/upload` - Nahrát video
- `PUT /api/videos/:id` - Upravit video
- `DELETE /api/videos/:id` - Smazat video
- `POST /api/videos/:id/like` - Lajknout video
- `POST /api/videos/:id/view` - Zaznamenat zhlédnutí

### Uživatelé
- `GET /api/users/:id` - Profil uživatele
- `PUT /api/users/:id` - Upravit profil
- `GET /api/users/:id/videos` - Videa uživatele
- `POST /api/users/:id/subscribe` - Odběr

## Nasazení

### Render.com

1. Připojte repozitář k Render
2. Nastavte proměnné prostředí v dashboardu
3. Render automaticky nasadí při pushi do `master`

### Docker

```bash
# Build
docker-compose -f docker-compose.yml build

# Push do registry
docker-compose push
```

## Testování

```bash
# Server
cd server && npm test

# Client
cd client && npm run lint
```

## Licence

MIT

## Podpora

Pro podporu kontaktujte: support@3play.example.com
