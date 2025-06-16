# Email Server Node.js

Un server Node.js simplu și eficient pentru trimiterea de email-uri prin cereri POST, cu funcționalitate specială pentru formulare de contact.

## Caracteristici

- 🚀 Server Express.js rapid și ușor
- 📧 Trimitere email prin Nodemailer
- 📝 Endpoint special pentru formulare de contact cu notificări duale
- 🛡️ Rate limiting pentru protecția împotriva spam-ului
- ✅ Validare de date cu Joi
- 🔒 Suport pentru variabile de mediu
- 🌐 CORS activat pentru cereri cross-origin
- ❤️ Health check endpoints

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

#### API Health Check
```http
GET /api/health
```

**Răspuns:**
```json
{
  "status": "OK",
  "message": "Contact API is running",
  "endpoints": {
    "contact": "/api/contact",
    "health": "/api/health"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Contact Form (Nou!)
```http
POST /api/contact
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Ioan Popescu",
  "email": "ioan@agentia.ro", 
  "company": "Digital Agency SRL",
  "projectType": "webapp",
  "budget": "5000-10000",
  "deadline": "2025-08-15",
  "description": "Descrierea detaliată a proiectului...",
  "_subject": "Cerere nouă de contact: Ioan Popescu - Digital Agency SRL"
}
```

**Tipuri de proiect acceptate:**
- `webapp` - Aplicație Web
- `mobile` - Aplicație Mobilă  
- `desktop` - Aplicație Desktop
- `other` - Altele

**Ce face endpoint-ul:**
1. **Trimite notificare internă** către:
   - contact@zahariacompany.com
   - stefanzaharia222@gmail.com
2. **Trimite email de confirmare** clientului
3. **Returnează confirmarea** că ambele emailuri au fost trimise

**Răspuns de succes:**
```json
{
  "success": true,
  "message": "Cererea a fost trimisă cu succes. Vei primi un email de confirmare în scurt timp.",
  "details": {
    "internalMessageId": "internal-email-id",
    "clientMessageId": "client-email-id"
  }
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

#### Contact Form - cURL
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ioan Popescu",
    "email": "ioan@agentia.ro",
    "company": "Digital Agency SRL", 
    "projectType": "webapp",
    "budget": "5000-10000",
    "deadline": "2025-08-15",
    "description": "Avem nevoie de o aplicație web pentru gestionarea proiectelor interne."
  }'
```

#### Contact Form - JavaScript (fetch)
```javascript
const contactData = {
  name: 'Maria Ionescu',
  email: 'maria@startup.ro',
  company: 'Tech Startup SRL',
  projectType: 'mobile',
  budget: '10000-20000', 
  deadline: '2025-12-01',
  description: 'Căutăm să dezvoltăm o aplicație mobilă inovatoare pentru iOS și Android.'
};

const response = await fetch('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(contactData)
});

const result = await response.json();
console.log(result);
```

#### Email Generic - cURL
```bash
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "Acesta este un email de test"
  }'
```

#### Email Generic - JavaScript (fetch)
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

### Email Generic (endpoint /send-email)
- **to**: Email valid (obligatoriu)
- **subject**: String între 1-200 caractere (obligatoriu)
- **text** sau **html**: Cel puțin unul este obligatoriu
- **from**: Email valid (opțional)

### Contact Form (endpoint /api/contact)
- **name**: String între 2-100 caractere (obligatoriu)
- **email**: Email valid (obligatoriu)
- **company**: String între 2-100 caractere (obligatoriu)
- **projectType**: `webapp`, `mobile`, `desktop`, sau `other` (obligatoriu)
- **budget**: String (obligatoriu)
- **deadline**: String (obligatoriu)
- **description**: String între 10-2000 caractere (obligatoriu)
- **_subject**: String (opțional, pentru subiectul emailului intern)

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
