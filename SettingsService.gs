/**
 * @file SettingsService.gs
 * @description Gerencia as configurações da aplicação, permitindo que administradores ou usuários personalizem certos aspectos.
 *              As configurações podem ser armazenadas em uma aba específica da planilha ou em `PropertiesService`.
 * @integration
 *   - `SheetService.gs`: Pode ser usado para persistir configurações na planilha.
 *   - `Config.gs`: Pode definir configurações padrão ou variáveis de ambiente.
 */

function getAppSetting(settingName) {
  try {
    // Busca o valor de uma configuração específica
    // Ex: return SheetService.findRowByColumnValue(Config.getSpreadsheetId(), Config.getSettingsSheetName(), "Name", settingName);
    return PropertiesService.getScriptProperties().getProperty(settingName);
  } catch (error) {
    Logger.log("Erro em getAppSetting: " + error.message);
    throw error;
  }
}

function setAppSetting(settingName, settingValue) {
  try {
    // Define o valor de uma configuração específica
    PropertiesService.getScriptProperties().setProperty(settingName, settingValue);
    // Ou SheetService.updateRow(...)
  } catch (error) {
    Logger.log("Erro em setAppSetting: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function getUserSetting(userId, settingName) {
  // Busca uma configuração específica para um usuário
  return PropertiesService.getUserProperties().getProperty(settingName + "_" + userId);
}

function setUserSetting(userId, settingName, settingValue) {
  try {
    try {
      // Define uma configuração específica para um usuário
      PropertiesService.getUserProperties().setProperty(settingName + "_" + userId, settingValue);
    } catch (error) {
      Logger.log("Erro em setUserSetting: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em setUserSetting: " + error.message);
    throw error;
  }
}
