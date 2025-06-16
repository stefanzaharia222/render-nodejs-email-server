# 🚀 Deploy pe Render.com

## Pasul 1: Urcă pe GitHub
Urmează instrucțiunile din terminal pentru a urca proiectul pe GitHub.

## Pasul 2: Creează serviciul pe Render.com

### 1. Conectează Repository-ul
- Mergi la [https://dashboard.render.com/](https://dashboard.render.com/)
- Click pe **New Web Service**
- Conectează contul GitHub și alege repository-ul `render-nodejs-email-server`

### 2. Configurează Serviciul
- **Name**: `email-server` (sau orice nume preferi)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: (lasă gol)

### 3. Setează Variabilele de Mediu
În secțiunea **Environment Variables**, adaugă:

```
NODE_ENV=production
PORT=10000
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@zahariacompany.com
SMTP_PASS=**************
SMTP_ENCRYPTION=ssl
SMTP_FROM_ADDRESS=contact@zahariacompany.com
SMTP_FROM_NAME=Zaharia Company
```

### 4. Deploy
- Click pe **Create Web Service**
- Așteaptă deploy-ul (va dura 2-3 minute)
- Render va afișa URL-ul public (ex: `https://email-server-xyz.onrender.com`)

## Pasul 3: Testează Deployment-ul

### Health Check
```bash
curl https://your-app.onrender.com/api/health
```

### Test Contact Form
```bash
curl -X POST https://your-app.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "projectType": "webapp",
    "budget": "5000-10000",
    "deadline": "2025-08-15",
    "description": "Test message for deployment verification."
  }'
```

## Pasul 4: Integrare cu Frontend

În aplicația frontend, folosește URL-ul Render pentru cereri:

```javascript
const response = await fetch('https://your-app.onrender.com/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(contactData)
});
```

## ⚠️ Note Importante

1. **Primul request** pe Render poate fi lent (serviciul "se trezește")
2. **Plan gratuit** Render: serviciul se oprește după 15 min de inactivitate
3. **Pentru producție**: consideră upgrade la plan plătit
4. **Monitorizare**: verifică logurile în dashboard-ul Render
5. **CORS**: serverul acceptă cereri de pe orice domeniu

## 🔧 Troubleshooting

### Erori comune:
- **Build failed**: verifică că `package.json` are script `start`
- **SMTP errors**: verifică credențialele în Environment Variables
- **Port errors**: Render folosește automat variabila `PORT`

### Verifică logurile:
- În dashboard Render → serviciul tău → tab **Logs**
- Caută erori de SMTP sau conectivitate

## 📧 Configurație Email

Pentru **Gmail** (alternativ):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_ENCRYPTION=tls
```

Pentru **SendGrid** (recomandat pentru producție):
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

✅ **Deployment complet! Serverul de contact este live pe Render.com** 🎉
