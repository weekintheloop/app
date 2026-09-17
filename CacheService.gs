/**
 * @file CacheService.gs
 * @description Fornece funcionalidades de cache para armazenar dados temporariamente e melhorar o desempenho da aplicação.
 *              Utiliza o serviço `CacheService` do Google Apps Script.
 * @integration
 *   - Diversos serviços (.gs) que podem se beneficiar do cache de dados (ex: `SheetService.gs` para resultados de consultas frequentes).
 */

function getFromCache(key) {
  try {
    var cache = CacheService.getScriptCache();
    return cache.get(key);
  } catch (error) {
    Logger.log("Erro em getFromCache: " + error.message);
    throw error;
  }
}

function putInCache(key, value, expirationInSeconds = 300) {
  try {
    var cache = CacheService.getScriptCache();
    cache.put(key, value, expirationInSeconds);
  } catch (error) {
    Logger.log("Erro em putInCache: " + error.message);
    throw error;
  }
}

function removeFromCache(key) {
  try {
    var cache = CacheService.getScriptCache();
    cache.remove(key);
  } catch (error) {
    Logger.log("Erro em removeFromCache: " + error.message);
    throw error;
  }
}
