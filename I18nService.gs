/**
 * @file I18nService.gs
 * @description Fornece funcionalidades para internacionalização (i18n) da aplicação, permitindo que o texto da interface seja exibido em diferentes idiomas.
 *              Carrega e gerencia strings de tradução.
 * @integration
 *   - Componentes `.html`: Utiliza para exibir textos traduzidos na interface.
 *   - `SettingsService.gs`: Pode usar para obter o idioma preferencial do usuário.
 */

var translations = {
  "en": {
    "welcome": "Welcome",
    "login": "Login",
    "username": "Username",
    "password": "Password"
  },
  "pt": {
    "welcome": "Bem-vindo",
    "login": "Entrar",
    "username": "Nome de Usuário",
    "password": "Senha"
  }
};

function getTranslation(key, lang) {
  lang = lang || "pt"; // Idioma padrão
  return translations[lang] && translations[lang][key] ? translations[lang][key] : key;
}


function getBrowserLanguage() {
  try {
    // Tenta detectar o idioma do navegador do usuário
    return Session.getActiveUserLocale().split("_")[0];
  } catch (error) {
    Logger.log("Erro em getBrowserLanguage: " + error.message);
    throw error;
  }
}
