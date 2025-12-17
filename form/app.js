const form = document.getElementById('dataForm');
const result = document.getElementById('result');
const obastSelect = document.getElementById('oblast');
const strediskoSelect = document.getElementById('stredisko');

// Cache for data
let dataCache = {
  oblasti: [],
  strediska: [],
  stroje: [],
  zamestnanci: []
};

function show(msg, isError = false) {
  result.textContent = msg;
  result.className = isError ? 'show' : 'show';
  result.style.color = isError ? 'crimson' : 'inherit';
  result.scrollIntoView({ behavior: 'smooth' });
}

// Načtení dat z endpointu
async function loadData() {
  const loadingStatus = document.getElementById('loadingStatus');
  
  console.log('🔄 Načítám data z Power Automate endpointu...');
  loadingStatus.innerHTML = '🔄 Načítám data z Power Automate...';
  
  try {
    const url = 'https://defaulta577f43ff7b842c9ba9927708e35b6.2b.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/35c595c9eaa44f76a491c62c826688e3/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=TB2CQhaJlSRJrkEcp766JNZe4lgvh_GKALpZ1lpxVmU';
    
    console.log('📡 Volám:', url.substring(0, 100) + '...');
    loadingStatus.innerHTML = '📡 Posílám požadavek...';
    
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('✅ Odpověď statusu:', resp.status, resp.statusText);
    loadingStatus.innerHTML = `📥 Přijata odpověď (status: ${resp.status})...`;
    
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    
    // Power Automate vrací nevalidní JSON formát (array místo objektu)
    // Pokusíme se to naparsovat ručně
    const textData = await resp.text();
    console.log('📦 Raw data:', textData.substring(0, 200) + '...');
    
    // Pokus o parsování jako JSON (může selhat kvůli špatnému formátu)
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      // Pokud není validní JSON, zkusíme to opravit
      console.warn('⚠️ Nevalidní JSON, pokouším se opravit...');
      const fixed = textData.replace(/^\[/, '{').replace(/\]$/, '}');
      data = JSON.parse(fixed);
    }
    
    console.log('📦 Data zpracována:', data);
    
    // Uložíme data do cache
    dataCache.oblasti = data.oblasti || [];
    dataCache.strediska = data.strediska || [];
    dataCache.stroje = data.stroje || [];
    dataCache.zamestnanci = data.zaměstnanci || data.zamestnanci || [];
    
    console.log('✅ Data uložena do cache');
    console.log('  - Oblasti:', dataCache.oblasti.length);
    console.log('  - Střediska:', dataCache.strediska.length);
    console.log('  - Stroje:', dataCache.stroje.length);
    console.log('  - Zaměstnanci:', dataCache.zamestnanci.length);
    
    // Naplníme výběrníky
    populateObasti();
    populateStrediska();
    populateZadavatele();
    populateSpoluautory();
    
    console.log('✅ Výběrníky naplněny');
    loadingStatus.innerHTML = '✅ Data načtena úspěšně!';
    loadingStatus.style.backgroundColor = '#d4edda';
    loadingStatus.style.borderColor = '#28a745';
    
    // Skryjeme status po 2 sekundách
    setTimeout(() => {
      loadingStatus.style.display = 'none';
    }, 2000);
    
  } catch (err) {
    console.error('❌ Chyba při načítání dat:', err.message);
    console.error('   Detaily:', err);
    
    // Zobrazíme chybu uživateli
    loadingStatus.innerHTML = `❌ Chyba: ${err.message}<br><small>Otevřete konzoli (F12) pro více detailů. Můžete pokračovat bez dat.</small>`;
    loadingStatus.style.backgroundColor = '#f8d7da';
    loadingStatus.style.borderColor = '#f5c6cb';
  }
}

function populateObasti() {
  obastSelect.innerHTML = '<option value="">-- Zvolte oblast --</option>';
  dataCache.oblasti.forEach(area => {
    const opt = document.createElement('option');
    opt.value = area.id;
    opt.textContent = area.value;
    obastSelect.appendChild(opt);
  });
}

function populateStrediska() {
  strediskoSelect.innerHTML = '<option value="">-- Zvolte středisko --</option>';
  dataCache.strediska.forEach(stredisko => {
    const opt = document.createElement('option');
    opt.value = stredisko.id;
    opt.textContent = stredisko.value;
    strediskoSelect.appendChild(opt);
  });
}

function populateStroje(searchTerm = '') {
  const selectedStrediskoId = parseInt(strediskoSelect.value);
  const strojeContainer = document.getElementById('strojeContainer');
  
  if (!selectedStrediskoId) {
    strojeContainer.innerHTML = '<p style="color:#999;font-style:italic">Nejprve vyberte středisko</p>';
    return;
  }
  
  // Filtrujeme stroje podle vybraného střediska
  let filteredStroje = dataCache.stroje.filter(
    stroj => stroj.stredisko === selectedStrediskoId
  );
  
  // Filtrování podle vyhledávacího textu
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredStroje = filteredStroje.filter(stroj => 
      stroj.value.toLowerCase().includes(lowerSearch)
    );
  }
  
  if (filteredStroje.length === 0) {
    strojeContainer.innerHTML = '<p style="color:#999;font-style:italic">' + 
      (searchTerm ? 'Žádné stroje nevyhovují vyhledávání' : 'Pro toto středisko nejsou žádné stroje') + 
      '</p>';
    return;
  }
  
  // Vytvoříme checkboxy
  let html = '<div style="display:grid;grid-template-columns:1fr;gap:4px">';
  filteredStroje.forEach(stroj => {
    html += `
      <label style="display:flex;align-items:center;padding:6px;cursor:pointer;border-radius:4px;margin:0" class="stroj-checkbox-label">
        <input type="checkbox" name="stroj" value="${stroj.id}" style="width:auto;margin-right:8px;cursor:pointer">
        <span>${stroj.value}</span>
      </label>
    `;
  });
  html += '</div>';
  
  strojeContainer.innerHTML = html;
  
  // Přidáme hover efekt
  const style = document.createElement('style');
  style.textContent = `
    .stroj-checkbox-label:hover {
      background-color: #e3f2fd;
    }
  `;
  if (!document.getElementById('stroj-checkbox-style')) {
    style.id = 'stroj-checkbox-style';
    document.head.appendChild(style);
  }
}

function populateZadavatele() {
  const zadavatelSelect = document.getElementById('zadavatel');
  zadavatelSelect.innerHTML = '<option value="">-- Zvolte zadavatele --</option>';
  dataCache.zamestnanci.forEach(zam => {
    const opt = document.createElement('option');
    opt.value = zam.id;
    opt.textContent = zam.value;
    zadavatelSelect.appendChild(opt);
  });
}

function populateSpoluautory(searchTerm = '') {
  const container = document.getElementById('spoluautoriContainer');
  
  if (dataCache.zamestnanci.length === 0) {
    container.innerHTML = '<p style="color:#999;font-style:italic">Načítám zaměstnance...</p>';
    return;
  }
  
  // Filtrování podle vyhledávacího textu
  let filteredZamestnanci = dataCache.zamestnanci;
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredZamestnanci = filteredZamestnanci.filter(zam => 
      zam.value.toLowerCase().includes(lowerSearch)
    );
  }
  
  if (filteredZamestnanci.length === 0) {
    container.innerHTML = '<p style="color:#999;font-style:italic">Žádní zaměstnanci nevyhovují vyhledávání</p>';
    return;
  }
  
  let html = '<div style="display:grid;grid-template-columns:1fr;gap:4px">';
  filteredZamestnanci.forEach(zam => {
    html += `
      <label style="display:flex;align-items:center;padding:6px;cursor:pointer;border-radius:4px;margin:0" class="spoluautor-checkbox-label">
        <input type="checkbox" name="spoluautor" value="${zam.id}" style="width:auto;margin-right:8px;cursor:pointer">
        <span>${zam.value}</span>
      </label>
    `;
  });
  html += '</div>';
  
  container.innerHTML = html;
  
  const style = document.createElement('style');
  style.textContent = `
    .spoluautor-checkbox-label:hover {
      background-color: #e3f2fd;
    }
  `;
  if (!document.getElementById('spoluautor-checkbox-style')) {
    style.id = 'spoluautor-checkbox-style';
    document.head.appendChild(style);
  }
}

// Event listenery pro změnu výběrníků
strediskoSelect.addEventListener('change', () => populateStroje());

// Event listenery pro vyhledávání
const searchStrojInput = document.getElementById('searchStroj');
const searchSpoluautorInput = document.getElementById('searchSpoluautor');

if (searchStrojInput) {
  searchStrojInput.addEventListener('input', (e) => {
    populateStroje(e.target.value);
  });
}

if (searchSpoluautorInput) {
  searchSpoluautorInput.addEventListener('input', (e) => {
    populateSpoluautory(e.target.value);
  });
}

// Konfigurace endpointů
const SUBMIT_ENDPOINT = 'https://defaulta577f43ff7b842c9ba9927708e35b6.2b.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6f95790471b943b79590a8b0b24d6b43/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rC18d30tVlmxmcSeGxWCaZLM8ShF_S4sRAcSOJY08Uw';
const FILES_ENDPOINT = 'https://defaulta577f43ff7b842c9ba9927708e35b6.2b.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/092f0182157f40a59df7fa67cfa70a0c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KelRdhyKorDieU-3rhFFSseLFnf5Vq88_I68v_m2UlE';

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  show('Odesílám...');

  const fd = new FormData(form);

  // Vytvoříme objekt pro JSON data (s IDčky)
  const jsonData = {};
  
  // Objekt pro zobrazení (s názvy)
  const displayData = {};

  // === ZPRACOVÁNÍ STROJŮ ===
  // Najdeme všechny zaškrtnuté checkboxy se jménem "stroj" v DOM
  const strojCheckboxes = document.querySelectorAll('input[name="stroj"]:checked');
  
  // Převedeme NodeList na klasické pole a vytáhneme z každého checkboxu hodnotu (IDčko stroje)
  // parseInt() převede string hodnotu na číslo
  const selectedStrojeIds = Array.from(strojCheckboxes).map(cb => parseInt(cb.value));
  
  // Pro každé IDčko stroje najdeme odpovídající objekt v cache
  // a vytáhneme z něj textový název stroje (pro zobrazení uživateli)
  const selectedStrojeNames = selectedStrojeIds.map(id => {
    // Hledáme stroj v dataCache, jehož ID odpovídá aktuálnímu ID
    const strojObj = dataCache.stroje.find(s => s.id == id);
    // Pokud najdeme stroj, vrátíme jeho název, jinak vrátíme samotné ID jako fallback
    return strojObj ? strojObj.value : id;
  });

  // === ZPRACOVÁNÍ SPOLUAUTORŮ ===
  // Totožný proces jako u strojů, jen pro zaměstnance označené jako spoluautoři
  const spoluautorCheckboxes = document.querySelectorAll('input[name="spoluautor"]:checked');
  
  // Extrahujeme IDčka zaškrtnutých spoluautorů a převedeme je na čísla
  const selectedSpoluautoriIds = Array.from(spoluautorCheckboxes).map(cb => parseInt(cb.value));
  
  // Pro každé IDčko zaměstnance najdeme jeho jméno v cache zaměstnanců
  const selectedSpoluautoriNames = selectedSpoluautoriIds.map(id => {
    // Hledáme zaměstnance podle ID v poli všech zaměstnanců
    const zamObj = dataCache.zamestnanci.find(z => z.id == id);
    // Vrátíme jméno zaměstnance, nebo ID pokud se nepodaří najít
    return zamObj ? zamObj.value : id;
  });

  // Projdeme všechny fieldy
  for (let [key, value] of fd.entries()) {
    if (key === 'stroj' || key === 'spoluautor') {
      // Stroje a spoluautory už máme zpracované výše, přeskočíme
      continue;
    } else if (key === 'oblast' && value) {
      const areaObj = dataCache.oblasti.find(a => a.id == value);
      jsonData[key] = value; // IDčko
      displayData[key] = areaObj ? areaObj.value : value; // Název
    } else if (key === 'stredisko' && value) {
      const srediskoObj = dataCache.strediska.find(s => s.id == value);
      jsonData[key] = value; // IDčko
      displayData[key] = srediskoObj ? srediskoObj.value : value; // Název
    } else if (key === 'zadavatel' && value) {
      const zamObj = dataCache.zamestnanci.find(z => z.id == value);
      jsonData[key] = value; // IDčko
      displayData[key] = zamObj ? zamObj.value : value; // Název
    } else {
      jsonData[key] = value;
      displayData[key] = value;
    }
  }

  // Přidáme pole strojů a spoluautorů
  jsonData.stroj = selectedStrojeIds; // IDčka
  jsonData.spoluautor = selectedSpoluautoriIds; // IDčka
  displayData.stroj = selectedStrojeNames; // Názvy pro zobrazení
  displayData.spoluautor = selectedSpoluautoriNames; // Názvy pro zobrazení

  try {
    // === KROK 1: Odeslání JSON dat ===
    const resp = await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData),
    });

    if (!resp.ok) {
      const text = await resp.text();
      show(`❌ Chyba při odesílání.\n\nStatus: ${resp.status} ${resp.statusText}\n\nOdpověď:\n${text}`, true);
      return;
    }

    // Získáme ID z odpovědi
    const responseData = await resp.json();
    const recordId = responseData.id || responseData.ID || responseData;
    
    console.log('✅ Návrh odeslán, ID:', recordId);

    // === KROK 2: Odeslání souborů (pokud jsou) ===
    const fileInput = document.querySelector('input[name="prilohy"]');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      show('📤 Nahrávám soubory...');
      
      // Převedeme soubory na base64
      const filesData = [];
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const base64 = await fileToBase64(file);
        filesData.push({
          name: file.name,
          contentType: file.type,
          content: base64
        });
      }
      
      // Odešleme soubory s ID
      const filesResp = await fetch(FILES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: recordId,
          files: filesData
        }),
      });
      
      if (!filesResp.ok) {
        console.error('⚠️ Chyba při nahrávání souborů');
      } else {
        console.log('✅ Soubory nahrány');
      }
    }

    // === KROK 3: Zobrazení souhrnu ===
    let summary = '✅ Děkujeme za odeslání!\n\n📋 Souhrn odeslaných údajů:\n\n';
    summary += `• ID návrhu: ${recordId}\n`;
    summary += `• Název ZN: ${displayData.nazevZN}\n`;
    summary += `• Typ návrhu: ${displayData.typNavrhu}\n`;
    summary += `• Zadavatel: ${displayData.zadavatel}\n`;
    if (displayData.spoluautor && displayData.spoluautor.length > 0) {
      summary += `• Spoluautoři: ${displayData.spoluautor.join(', ')}\n`;
    }
    summary += `• Oblast: ${displayData.oblast}\n`;
    summary += `• Středisko: ${displayData.stredisko}\n`;
    if (displayData.stroj && displayData.stroj.length > 0) {
      summary += `• Stroje: ${displayData.stroj.join(', ')}\n`;
    }
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      summary += `• Nahráno souborů: ${fileInput.files.length}\n`;
    }
    
    show(summary, false);
    
    // Vyčistíme formulář
    form.reset();
    document.getElementById('strojeContainer').innerHTML = '<p style="color:#999;font-style:italic">Nejprve vyberte středisko</p>';
    document.getElementById('spoluautoriContainer').innerHTML = '<p style="color:#999;font-style:italic">Načítám zaměstnance...</p>';
    
    // Po chvíli obnovíme seznamy
    setTimeout(() => {
      populateSpoluautory();
    }, 100);
    
  } catch (err) {
    console.error(err);
    show('❌ Chyba při odesílání.\n\n' + err.message, true);
  }
});

// Pomocná funkce pro převod souboru na base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Odstraníme "data:..." prefix a necháme jen base64
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Při načtení stránky si stáhni data
document.addEventListener('DOMContentLoaded', loadData);
