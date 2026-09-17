/**
 * @file GoogleNaturalLanguageService.gs
 * @description Funções para integrar com a API Google Cloud Natural Language, permitindo a análise de texto (ex: análise de sentimento, entidade, sintaxe).
 *              Pode ser útil para analisar feedback de usuários ou anotações textuais do estudo.
 * @integration
 *   - Google Cloud Natural Language API: Interage diretamente com o serviço de processamento de linguagem natural.
 */

function analyzeSentiment(text) {
  // Analisa o sentimento de um texto.
  // Requer a ativação da Google Cloud Natural Language API no projeto GCP associado ao Apps Script.
  if (!String(text || '').trim()) return { success: false, message: "text é obrigatório." };
  try {
    var requestBody = {
      document: { type: "PLAIN_TEXT", content: text },
      encodingType: "UTF8"
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(requestBody),
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch("https://language.googleapis.com/v1/documents:analyzeSentiment", options);
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300 || result.error) {
      return { success: false, status: status, message: (result.error && result.error.message) || "A API Natural Language rejeitou a solicitação." };
    }
    logInfo("Análise de sentimento para \"%s\": %s", text, JSON.stringify(result.documentSentiment));
    return { success: true, sentiment: result.documentSentiment };
  } catch (e) {
    logError("Falha ao analisar sentimento: %s", e.message);
    return { success: false, message: "Falha ao analisar sentimento." };
  }
}

function analyzeEntities(text) {
  if (!String(text || '').trim()) return { success: false, message: "text é obrigatório." };
  try {
    var response = UrlFetchApp.fetch("https://language.googleapis.com/v1/documents:analyzeEntities", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        document: { type: "PLAIN_TEXT", content: String(text) },
        encodingType: "UTF8"
      }),
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300 || result.error) {
      return { success: false, status: status, message: (result.error && result.error.message) || "A API Natural Language rejeitou a solicitação." };
    }
    logInfo("Análise de entidades concluída.");
    return { success: true, entities: result.entities || [], result: result };
  } catch (e) {
    logError("Falha ao analisar entidades: %s", e.message);
    return { success: false, message: "Falha ao analisar entidades." };
  }
}
