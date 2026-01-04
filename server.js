const express = require('express');
const cors = require('cors');
const path = require('path');
const { fetchLeads, fetchCalls } = require('./services/sheets');
const cache = require('./services/cache');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS для локальной разработки
app.use(cors());

// Статика — отдаём dashboard.html и другие файлы
app.use(express.static(path.join(__dirname, 'public')));

// API: получить все данные (с кэшем)
app.get('/api/data', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    
    // Проверяем кэш
    if (!forceRefresh && cache.isValid()) {
      console.log('📦 Отдаём из кэша');
      return res.json(cache.get());
    }

    console.log('🔄 Загружаем данные из Google Sheets...');
    
    // Загружаем параллельно
    const [leads, calls] = await Promise.all([
      fetchLeads(),
      fetchCalls()
    ]);

    const data = {
      leads,
      calls,
      updatedAt: new Date().toISOString(),
      leadsCount: leads.length,
      callsCount: calls.length
    };

    // Сохраняем в кэш
    cache.set(data);

    console.log(`✅ Загружено: ${leads.length} лидов, ${calls.length} звонков`);
    res.json(data);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    
    // Если есть старый кэш — отдаём его
    if (cache.hasData()) {
      console.log('⚠️ Отдаём устаревший кэш');
      return res.json({
        ...cache.get(),
        stale: true,
        error: error.message
      });
    }

    res.status(500).json({ error: error.message });
  }
});

// API: только лиды
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await fetchLeads();
    res.json({ leads, count: leads.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: только звонки
app.get('/api/calls', async (req, res) => {
  try {
    const calls = await fetchCalls();
    res.json({ calls, count: calls.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: статус сервера
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    cacheValid: cache.isValid(),
    cacheAge: cache.getAge(),
    cacheTTL: cache.TTL,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API: очистить кэш
app.post('/api/cache/clear', (req, res) => {
  cache.clear();
  console.log('🗑️ Кэш очищен');
  res.json({ success: true, message: 'Кэш очищен' });
});

// Главная страница — dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check для Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('═'.repeat(50));
  console.log(`🚀 Евгенич Dashboard запущен!`);
  console.log(`📊 Дашборд: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api/data`);
  console.log(`💾 Кэш TTL: ${cache.TTL / 1000 / 60} минут`);
  console.log('═'.repeat(50));
});
