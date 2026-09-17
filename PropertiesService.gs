/**
 * @file PropertiesService.gs
 * @description Encapsula o uso do serviço `PropertiesService` do Google Apps Script para gerenciar propriedades do script, do usuário e do documento.
 *              Útil para armazenar configurações persistentes e seguras.
 * @integration
 *   - `Config.gs`: Pode ser usado para armazenar o SPREADSHEETS_ID.
 *   - `SessionManager.gs`: Utiliza para gerenciar o ID do usuário na sessão.
 *   - `SettingsService.gs`: Pode ser usado para armazenar configurações da aplicação e do usuário.
 */

function getScriptProperty(key) {
  try {
    return PropertiesService.getScriptProperties().getProperty(key);
  } catch (error) {
    Logger.log("Erro em getScriptProperty: " + error.message);
    throw error;
  }
}

function setScriptProperty(key, value) {
  try {
    PropertiesService.getScriptProperties().setProperty(key, value);
  } catch (error) {
    Logger.log("Erro em setScriptProperty: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function getUserProperty(key) {
  return PropertiesService.getUserProperties().getProperty(key);
}

function setUserProperty(key, value) {
  try {
    PropertiesService.getUserProperties().setProperty(key, value);
  } catch (error) {
    Logger.log("Erro em setUserProperty: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function getDocumentProperty(key) {
  try {
    return PropertiesService.getDocumentProperties().getProperty(key);
  } catch (error) {
    Logger.log("Erro em getDocumentProperty: " + error.message);
    throw error;
  }
}

function setDocumentProperty(key, value) {
  try {
    PropertiesService.getDocumentProperties().setProperty(key, value);
  } catch (error) {
    Logger.log("Erro em setDocumentProperty: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}
