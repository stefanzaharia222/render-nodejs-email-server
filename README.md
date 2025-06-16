# Email Server Node.js

Un server Node.js simplu și eficient pentru trimiterea de email-uri prin cereri POST.

## Caracteristici

- 🚀 Server Express.js rapid și ușor
- 📧 Trimitere email prin Nodemailer
- 🛡️ Rate limiting pentru protecția împotriva spam-ului
- ✅ Validare de date cu Joi
- 🔒 Suport pentru variabile de mediu
- 🌐 CORS activat pentru cereri cross-origin
- ❤️ Health check endpoint

## Instalare

1. **Clonează repositorul și navighează în directorul proiectului:**
```bash
cd email-server
```

2. **Instalează dependențele:**
```bash
npm install
```

3. **Configurează variabilele de mediu:**
```bash
cp .env.example .env
```

4. **Editează fișierul `.env` cu credențialele tale SMTP:**
```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@zahariacompany.com
SMTP_PASS=your_password
SMTP_ENCRYPTION=ssl
SMTP_FROM_ADDRESS=contact@zahariacompany.com
SMTP_FROM_NAME=Zaharia Company
PORT=3000
```

## Configurare Hostinger

Pentru a folosi Hostinger ca provider SMTP:

1. Folosește credențialele contului tău de email Hostinger
2. **Port 465** cu **SSL** sau **Port 587** cu **TLS**
3. Nu ai nevoie de app password special, folosește parola normală a email-ului

## Utilizare

### Pornește serverul

```bash
# Producție
npm start

# Dezvoltare (cu nodemon)
npm run dev
```

Serverul va rula pe `http://localhost:3000` (sau portul specificat în `.env`).

### API Endpoints

#### Health Check
```http
GET /health
```

**Răspuns:**
```json
{
  "status": "OK",
  "message": "Email server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Trimite Email
```http
POST /send-email
Content-Type: application/json
```

**Body:**
```json
{
  "to": "destinatar@example.com",
  "subject": "Subiectul email-ului",
  "text": "Conținut text simplu",
  "html": "<h1>Conținut HTML</h1><p>Email-ul tău aici</p>",
  "from": "expeditor@example.com" // optional
}
```

**Răspuns de succes:**
```json
{
  "success": true,
  "message": "Email trimis cu succes",
  "messageId": "unique-message-id"
}
```

**Răspuns de eroare:**
```json
{
  "success": false,
  "error": "Descrierea erorii",
  "details": ["Detalii suplimentare"]
}
```

### Exemple de utilizare

#### cURL
```bash
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "Acesta este un email de test"
  }'
```

#### JavaScript (fetch)
```javascript
const response = await fetch('http://localhost:3000/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Salut!</h1><p>Acesta este un email de test.</p>'
  })
});

const result = await response.json();
console.log(result);
```

## Rate Limiting

Serverul implementează rate limiting pentru a preveni abuzul:
- **10 email-uri per IP** într-o fereastră de **15 minute**
- Mesaj de eroare personalizat în română

## Validare Date

Toate cererea sunt validate folosind Joi:
- **to**: Email valid (obligatoriu)
- **subject**: String între 1-200 caractere (obligatoriu)
- **text** sau **html**: Cel puțin unul este obligatoriu
- **from**: Email valid (opțional)

## Securitate

- Rate limiting pentru protecția împotriva spam-ului
- Validare strictă a datelor de intrare
- Variabile de mediu pentru credențiale sensibile
- Limitare dimensiune payload (10MB)
- Error handling sigur (nu expune detalii în producție)

## Deployment

### Render.com
1. Conectează repositorul la Render
2. Setează variabilele de mediu în dashboard-ul Render
3. Deploy automat la fiecare push

### Heroku
```bash
# Login și creare aplicație
heroku login
heroku create nume-aplicatie

# Setează variabilele de mediu
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=your_email@gmail.com
heroku config:set SMTP_PASS=your_app_password

# Deploy
git push heroku main
```

## Licență

MIT
