// Exemplu de utilizare a endpoint-ului de contact
// Asigură-te că serverul rulează cu: npm start

const API_URL = 'http://localhost:3000';

// Funcție pentru trimiterea unei cereri de contact
async function sendContactRequest(contactData) {
  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Cererea de contact a fost trimisă cu succes!');
      console.log('📧 Message ID (intern):', result.details.internalMessageId);
      console.log('📧 Message ID (client):', result.details.clientMessageId);
      console.log('💬 Mesaj:', result.message);
    } else {
      console.error('❌ Eroare la trimiterea cererii:', result.error);
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

// Exemplu de cerere de contact conform instrucțiunilor
const contactRequest = {
  "name": "Ioan Popescu",
  "email": "ioan@agentia.ro", 
  "company": "Digital Agency SRL",
  "projectType": "webapp",
  "budget": "5000-10000",
  "deadline": "2025-08-15",
  "description": "Avem nevoie de o aplicație web pentru gestionarea proiectelor interne. Aplicația ar trebui să permită managementul taskurilor, colaborarea în echipă și raportarea progresului. Dorim o soluție modernă, responsivă și ușor de utilizat care să se integreze cu sistemele existente.",
  "_subject": "Cerere nouă de contact: Ioan Popescu - Digital Agency SRL"
};

// Alte exemple de cereri de contact
const contactRequestMobile = {
  "name": "Maria Ionescu",
  "email": "maria@startup.ro",
  "company": "Tech Startup SRL",
  "projectType": "mobile",
  "budget": "10000-20000",
  "deadline": "2025-12-01",
  "description": "Căutăm să dezvoltăm o aplicație mobilă inovatoare pentru iOS și Android care să revolutioneze modul în care utilizatorii interacționează cu serviciile noastre. Aplicația trebuie să aibă o interfață intuitivă, funcționalități avansate și integrări cu platforme terțe."
};

const contactRequestOther = {
  "name": "Andrei Popescu",
  "email": "andrei@consulting.ro",
  "company": "Business Consulting",
  "projectType": "other",
  "budget": "2000-5000",
  "deadline": "2025-07-30",
  "description": "Avem nevoie de consultanță pentru optimizarea infrastructurii IT existente și implementarea unor soluții cloud. Proiectul implică analiza sistemelor curente, recomandări pentru îmbunătățiri și suport pentru migrarea în cloud."
};

// Funcție pentru testarea API-ului de contact
async function testContactAPI() {
  console.log('🧪 Testare API de contact...\n');
  
  // Test health check pentru API
  try {
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const health = await healthResponse.json();
    console.log('❤️  API Health check:', health.message);
    console.log('📋 Endpoints disponibile:', health.endpoints);
    console.log('⏰ Timestamp:', health.timestamp);
    console.log('');
  } catch (error) {
    console.error('❌ API-ul nu răspunde. Asigură-te că serverul rulează cu: npm start');
    return;
  }

  // Dezcommentează liniile de mai jos pentru a trimite cereri de test
  // ATENȚIE: Asigură-te că ai configurat .env cu credențialele corecte!
  // Emailurile vor fi trimise la adresele reale specificate!
  
  console.log('🔄 Pentru a testa trimiterea de emailuri, dezcommentează liniile din funcția testContactAPI()');
  console.log('⚠️  ATENȚIE: Emailurile vor fi trimise la adresele reale specificate!\n');
  
  // await sendContactRequest(contactRequest);
  // console.log('\n' + '='.repeat(60) + '\n');
  // await sendContactRequest(contactRequestMobile);
  // console.log('\n' + '='.repeat(60) + '\n');
  // await sendContactRequest(contactRequestOther);
}

// Funcție pentru testare rapidă cu date dummy (nu trimite emailuri reale)
async function quickTest() {
  console.log('🔍 Test rapid - verificare validare date...\n');
  
  // Test cu date incomplete (ar trebui să dea eroare de validare)
  const incompleteData = {
    "name": "Test",
    "email": "invalid-email",
    // lipsesc alte câmpuri obligatorii
  };
  
  const result = await sendContactRequest(incompleteData);
  if (!result.success) {
    console.log('✅ Validarea funcționează corect - datele incomplete sunt respinse');
  }
}

// Rulează testul
console.log('📧 Contact Form API Test\n');
console.log('Alegere test:');
console.log('1. testContactAPI() - test complet (trimite emailuri reale)');
console.log('2. quickTest() - test rapid (doar validare)\n');

// Rulează testul rapid în mod implicit
quickTest();

// Pentru test complet, dezcommentează:
// testContactAPI();

// Export pentru utilizare în alte module
module.exports = {
  sendContactRequest,
  testContactAPI,
  quickTest,
  examples: {
    contactRequest,
    contactRequestMobile,
    contactRequestOther
  }
};
