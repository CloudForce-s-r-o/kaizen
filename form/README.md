# Kaizen – Formulář návrhu zlepšení

Webový formulář pro sbírání návrhů na zlepšení (Kaizen) a jejich odeslání na zadaný backend endpoint.

## Obsah formuláře

**Nastavení odesílání:**
- Endpoint URL (zadejte cílový server)
- Formát odeslání (JSON nebo form-urlencoded)

**Základní informace:**
- Název návrhu (Název ZN)
- Typ návrhu (Prevence, Korekce, Zlepšení, Jiné)
- Zadavatel
- Spoluauto(ři)

**Popis situace:**
- Popis stávající situace (AS-IS) – více řádků textu
- Popis navrhované situace (TO-BE) – více řádků textu

**Technické parametry:**
- Středisko
- Stroj / Zařízení
- Oblast

**Přílohy:**
- Soubory (fotografie, schéma apod.) – podpora více souborů

## Jak spustit lokálně

1. Otevřít adresář `form` v terminálu:
```bash
cd /Users/janstrnad/Kaizen/form
```

2. Spustit jednoduchý statický server (např. Python):
```bash
python3 -m http.server 8000
```

3. Otevřít v prohlížeči: `http://localhost:8000`

## Poznámky k CORS a souborům

- **CORS**: Pokud endpoint není na stejné doméně, prohlížeč zkontroluje CORS. Server musí vracet hlavičku `Access-Control-Allow-Origin: *` nebo konkrétní origin.
- **Soubory**: V základní verzi jsou soubory jen ukazovány v UI. Pro skutečné nahrávání souborů byste měli:
  - Změnit backend na přijetí `multipart/form-data`
  - Aktualizovat frontend JS pro odesílání souborů

## Příklady curl bez souborů

**JSON:**
```bash
curl -v -X POST https://api.example.com/endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "nazevZN":"Zlepšení procesu A",
    "typNavrhu":"zlepseni",
    "zadavatel":"Jan Strnad",
    "spoluauto":"",
    "stavajiciSituace":"Běžná situace...",
    "navrhovanaSituace":"Nová situace...",
    "stredisko":"ST1",
    "stroj":"Stroj XYZ",
    "oblast":"Výroba"
  }'
```

**Form URL Encoded:**
```bash
curl -v -X POST https://api.example.com/endpoint \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "nazevZN=Zlepšení+procesu+A&typNavrhu=zlepseni&zadavatel=Jan+Strnad&stavajiciSituace=Situace...&navrhovanaSituace=Nová...&stredisko=ST1&stroj=Stroj+XYZ&oblast=Výroba"
```

## Co dál

- Chcete upravit pole nebo přidat validaci?
- Chcete vytvořit backend pro testování (s CORS)?
- Chcete integrovat s existujícím systémem?
