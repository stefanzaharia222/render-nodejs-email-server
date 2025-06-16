// Exemplu de utilizare a serverului de email
// Asigură-te că serverul rulează cu: npm start

const API_URL = 'http://localhost:3000';

// Funcție pentru trimiterea unui email
async function sendEmail(emailData) {
  try {
    const response = await fetch(`${API_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email trimis cu succes!');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Eroare la trimiterea email-ului:', result.error);
      if (result.details) {
        console.error('Detalii:', result.details);
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Eroare de rețea:', error.message);
    return { success: false, error: error.message };
  }
}

// Exemplu 1: Email cu text simplu
const emailText = {
  to: 'test@example.com',
  subject: 'Test Email cu Text',
  text: 'Acesta este un email de test cu conținut text simplu.',
  from: 'contact@zahariacompany.com'
};

// Exemplu 2: Email cu HTML
const emailHTML = {
  to: 'test@example.com',
  subject: 'Test Email cu HTML',
  html: `
    <h1>Salut!</h1>
    <p>Acesta este un email de test cu conținut <strong>HTML</strong>.</p>
    <ul>
      <li>Lista item 1</li>
      <li>Lista item 2</li>
    </ul>
    <p>Cu stimă,<br>Echipa Zaharia Company</p>
  `,
  from: 'contact@zahariacompany.com'
};

// Exemplu 3: Email complet cu text și HTML
const emailComplet = {
  to: 'test@example.com',
  subject: 'Email Complet de Test',
  text: 'Versiunea text a email-ului pentru clienți care nu suportă HTML.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Bun venit!</h2>
      <p>Acesta este un email de test cu formatare completă.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Informații importante:</h3>
        <ul>
          <li>Serverul de email funcționează perfect</li>
          <li>Suportă atât text cât și HTML</li>
          <li>Are rate limiting pentru siguranță</li>
        </ul>
      </div>
      <p style="color: #666; font-size: 12px;">
        Acest email a fost generat automat de serverul de email Node.js.<br>
        © 2025 Zaharia Company
      </p>
    </div>
  `,
  from: 'contact@zahariacompany.com'
};

// Funcție pentru testarea serverului
async function testServer() {
  console.log('🧪 Testare server de email...\n');
  
  // Test health check
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log('❤️  Health check:', health.message);
    console.log('⏰ Timestamp:', health.timestamp);
    console.log('');
  } catch (error) {
    console.error('❌ Serverul nu răspunde. Asigură-te că rulează cu: npm start');
    return;
  }

  // Dezcommentează linia de mai jos pentru a trimite un email de test
  // ATENȚIE: Asigură-te că ai configurat .env cu credențialele corecte!
  
  // await sendEmail(emailText);
  // await sendEmail(emailHTML);
  // await sendEmail(emailComplet);
}

// Rulează testul
testServer();

// Export pentru utilizare în alte module
module.exports = {
  sendEmail,
  testServer,
  examples: {
    emailText,
    emailHTML,
    emailComplet
  }
};
