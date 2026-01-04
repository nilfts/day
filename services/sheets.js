/**
 * Сервис загрузки данных из Google Sheets
 */

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1CX7pjfDHiMiOE6TRsdTbhYdWF8KGAmGMGtdCx8TEtP0';
const SHEET_LEADS = process.env.SHEET_LEADS || 'Сборка Лиды сайт';
const SHEET_CALLS = process.env.SHEET_CALLS || 'Манго Телефония';

/**
 * Строит URL для экспорта листа в CSV
 */
function buildUrl(sheetName) {
  const encoded = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`;
}

/**
 * Загружает CSV по URL
 */
async function fetchCSV(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; EvgenichDashboard/1.0)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.text();
}

/**
 * Парсит CSV в массив объектов
 */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });
}

/**
 * Парсит одну строку CSV с учётом кавычек
 */
function parseCSVLine(line) {
  const res = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        res.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  res.push(cur.trim());
  return res;
}

/**
 * Загружает данные о лидах
 */
async function fetchLeads() {
  const url = buildUrl(SHEET_LEADS);
  console.log(`📥 Загрузка лидов: ${SHEET_LEADS}`);
  const csv = await fetchCSV(url);
  return parseCSV(csv);
}

/**
 * Загружает данные о звонках
 */
async function fetchCalls() {
  const url = buildUrl(SHEET_CALLS);
  console.log(`📥 Загрузка звонков: ${SHEET_CALLS}`);
  const csv = await fetchCSV(url);
  return parseCSV(csv);
}

module.exports = {
  fetchLeads,
  fetchCalls,
  parseCSV,
  parseCSVLine
};
