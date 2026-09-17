/**
 * @file GoogleTranslateService.gs
 * @description Funções para integrar com o Google Translate, permitindo a tradução de textos dentro da aplicação.
 *              Pode ser útil para internacionalização dinâmica de conteúdo ou para traduzir entradas de usuário.
 * @integration
 *   - Google Translate API: Interage diretamente com o serviço de tradução.
 *   - `I18nService.gs`: Pode complementar a funcionalidade de internacionalização.
 */

function translateText(text, targetLanguage, sourceLanguage = null) {
  // Traduz um texto para o idioma alvo.
  try {
    var translatedText = LanguageApp.translate(text, sourceLanguage, targetLanguage);
    logInfo("Texto traduzido de ", sourceLanguage || "auto", " para ", targetLanguage, ": ", text, " -> ", translatedText);
    return { success: true, translatedText: translatedText };
  } catch (e) {
    logError("Falha ao traduzir texto: ", e.message);
    return { success: false, message: "Falha ao traduzir texto." };
  }
}

function detectLanguage(text) {
  // Detecta o idioma de um texto.
  try {
    var detectedLanguage = LanguageApp.detectLanguage(text);
    logInfo("Idioma detectado para ", text, ": ", detectedLanguage);
    return { success: true, language: detectedLanguage };
  } catch (e) {
    logError("Falha ao detectar idioma: ", e.message);
    return { success: false, message: "Falha ao detectar idioma." };
  }
}
