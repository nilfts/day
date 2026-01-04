/**
 * Простой in-memory кэш с TTL
 */

// Время жизни кэша (по умолчанию 5 минут)
const TTL = parseInt(process.env.CACHE_TTL) || 5 * 60 * 1000;

let cachedData = null;
let cachedAt = null;

/**
 * Проверяет, валиден ли кэш
 */
function isValid() {
  if (!cachedData || !cachedAt) return false;
  return (Date.now() - cachedAt) < TTL;
}

/**
 * Проверяет, есть ли данные в кэше (даже устаревшие)
 */
function hasData() {
  return cachedData !== null;
}

/**
 * Получает данные из кэша
 */
function get() {
  return cachedData;
}

/**
 * Сохраняет данные в кэш
 */
function set(data) {
  cachedData = data;
  cachedAt = Date.now();
}

/**
 * Очищает кэш
 */
function clear() {
  cachedData = null;
  cachedAt = null;
}

/**
 * Возвращает возраст кэша в секундах
 */
function getAge() {
  if (!cachedAt) return null;
  return Math.floor((Date.now() - cachedAt) / 1000);
}

module.exports = {
  TTL,
  isValid,
  hasData,
  get,
  set,
  clear,
  getAge
};
