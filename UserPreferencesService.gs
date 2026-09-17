/**
 * @file UserPreferencesService.gs
 * @description Gerencia as preferências personalizadas de cada usuário, como idioma, tema da interface, configurações de notificação, etc.
 *              Utiliza o `PropertiesService` para armazenar as preferências de forma persistente para cada usuário.
 * @integration
 *   - `PropertiesService.gs`: Utiliza para armazenar e recuperar as propriedades do usuário.
 *   - `I18nService.gs`: Pode usar para definir o idioma preferencial.
 *   - `NotificationService.gs`: Pode usar para configurar preferências de notificação.
 */

function getUserPreference(userId, key) {
  try {
    // Retorna uma preferência específica para um usuário.
    return PropertiesService.getUserProperties().getProperty(key + "_" + userId);
  } catch (error) {
    Logger.log("Erro em getUserPreference: " + error.message);
    throw error;
  }
}

function setUserPreference(userId, key, value) {
  try {
    // Define uma preferência específica para um usuário.
    PropertiesService.getUserProperties().setProperty(key + "_" + userId, value);
  } catch (error) {
    Logger.log("Erro em setUserPreference: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function getAllUserPreferences(userId) {
  // Retorna todas as preferências para um usuário.
  var userProperties = PropertiesService.getUserProperties().getProperties();
  var preferences = {};
  for (var key in userProperties) {
    if (key.endsWith("_") && key.startsWith(userId + "_")) { // Ajustar lógica se o prefixo for diferente
      preferences[key.substring(userId.length + 1)] = userProperties[key];
    }
  }
  return preferences;
}
