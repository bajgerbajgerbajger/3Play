# 3Play API Dokumentace

Kompletní REST API reference pro 3Play Video Platformu.

## Základní URL

- **Vývoj**: `http://localhost:5000/api`
- **Produkce**: `https://api.3play.example.com/api`

## Autentizace

API používá JWT tokeny. Přidejte token do hlavičky každého požadavku:

```http
Authorization: Bearer <your-jwt-token>
```

## HTTP Status kódy

- `200 OK` - Požadavek úspěšný
- `201 Created` - Zdroj vytvořen
- `400 Bad Request` - Chybný požadavek
- `401 Unauthorized` - Chybí autentizace
- `403 Forbidden` - Nedostatečná oprávnění
- `404 Not Found` - Zdroj nenalezen
- `429 Too Many Requests` - Rate limit překročen
- `500 Internal Server Error` - Chyba serveru

## Chybové odpovědi

```json
{
  "success": false,
  "message": "Popis chyby",
  "errors": ["Detailní chyby"] // volitelné
}
```

---

## Autentizace

### Registrace

```http
POST /auth/register
```

**Tělo požadavku:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Odpověď:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "username": "username",
      "isVerified": false
    }
  }
}
```

### Přihlášení

```http
POST /auth/login
```

**Tělo požadavku:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Odpověď:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Obnovení tokenu

```http
POST /auth/refresh
```

**Tělo požadavku:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Odpověď:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Odhlášení

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Odpověď:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Ověření emailu

```http
POST /auth/verify-email
```

**Tělo požadavku:**
```json
{
  "token": "verification-token-from-email"
}
```

### Znovu odeslat ověření

```http
POST /auth/resend-verification
Authorization: Bearer <token>
```

---

## Videa

### Seznam videí

```http
GET /videos?page=1&limit=20&sort=createdAt&order=desc
```

**Query parametry:**
- `page` - Číslo stránky (výchozí: 1)
- `limit` - Počet položek na stránku (výchozí: 20, max: 100)
- `sort` - Seřazení podle: `createdAt`, `views`, `likes`, `title`
- `order` - Pořadí: `asc`, `desc`
- `search` - Vyhledávací dotaz

**Odpověď:**
```json
{
  "success": true,
  "data": {
    "videos": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### Detail videa

```http
GET /videos/:id
```

**Odpověď:**
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "...",
      "title": "Video Title",
      "description": "Description...",
      "url": "/uploads/videos/video.mp4",
      "thumbnail": "/uploads/thumbnails/thumb.jpg",
      "duration": 360,
      "views": 1000,
      "likes": 50,
      "user": { ... },
      "createdAt": "2024-01-01T00:00:00Z",
      "tags": ["tag1", "tag2"]
    }
  }
}
```

### Nahrát video

```http
POST /videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form data:**
- `video` - Soubor videa (required, max 2GB)
- `title` - Název videa (required, max 100 znaků)
- `description` - Popis videa (optional, max 5000 znaků)
- `tags` - Tagy oddělené čárkou (optional)
- `thumbnail` - Obrázek náhledu (optional)

**Odpověď:**
```json
{
  "success": true,
  "message": "Video uploaded successfully and is being processed",
  "data": {
    "video": {
      "id": "...",
      "title": "...",
      "status": "processing",
      "url": "/uploads/videos/..."
    }
  }
}
```

### Upravit video

```http
PUT /videos/:id
Authorization: Bearer <token>
```

**Tělo požadavku:**
```json
{
  "title": "Nový název",
  "description": "Nový popis",
  "tags": ["tag1", "tag2"],
  "status": "public" // nebo "private"
}
```

### Smazat video

```http
DELETE /videos/:id
Authorization: Bearer <token>
```

### Like video

```http
POST /videos/:id/like
Authorization: Bearer <token>
```

### Unlike video

```http
DELETE /videos/:id/like
Authorization: Bearer <token>
```

### Zaznamenat zhlédnutí

```http
POST /videos/:id/view
```

---

## Uživatelé

### Profil uživatele

```http
GET /users/:id
```

**Odpověď:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "username",
      "displayName": "Display Name",
      "avatar": "/uploads/avatars/...",
      "bio": "User bio...",
      "subscribers": 1000,
      "videos": 50,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Upravit profil

```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form data:**
- `displayName` - Zobrazované jméno
- `bio` - Bio (max 500 znaků)
- `avatar` - Obrázek avatara

### Videa uživatele

```http
GET /users/:id/videos?page=1&limit=20
```

### Odběr

```http
POST /users/:id/subscribe
Authorization: Bearer <token>
```

### Zrušit odběr

```http
DELETE /users/:id/subscribe
Authorization: Bearer <token>
```

### Seznam odběrů

```http
GET /users/:id/subscriptions?page=1&limit=20
```

### Seznam odběratelů

```http
GET /users/:id/subscribers?page=1&limit=20
```

---

## Health Check

```http
GET /health
```

**Odpověď:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 12345,
  "environment": "production"
}
```

---

## Rate Limiting

API má následující limity:

- **Obecné endpointy**: 100 požadavků za 15 minut
- **Autentizovaní uživatelé**: 1000 požadavků za 15 minut
- **Autentizační endpointy**: 10 pokusů za hodinu
- **Nahrávání**: 5 videí za 15 minut

Rate limit informace jsou v hlavičkách odpovědi:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## CORS

API podporuje CORS pro následující metody:
- `GET`
- `POST`
- `PUT`
- `DELETE`
- `PATCH`
- `OPTIONS`

Povolené hlavičky:
- `Content-Type`
- `Authorization`
- `X-CSRF-Token`

---

## WebSocket (Socket.IO)

Real-time aktualizace přes Socket.IO:

```javascript
import { io } from 'socket.io-client';

const socket = io('https://api.3play.example.com', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Události
socket.on('video:processing', (data) => {
  console.log('Video processing:', data);
});

socket.on('video:ready', (data) => {
  console.log('Video ready:', data);
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

---

## Příklady použití

### JavaScript/Fetch

```javascript
// Přihlášení
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Nahrání videa
const uploadVideo = async (formData, token) => {
  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};

// Seznam videí
const getVideos = async (page = 1) => {
  const response = await fetch(`/api/videos?page=${page}`);
  return response.json();
};
```

### cURL

```bash
# Přihlášení
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Nahrání videa
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "title=My Video" \
  -F "description=Description"

# Seznam videí
curl http://localhost:5000/api/videos?page=1&limit=20
```
