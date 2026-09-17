/**
 * @file WebHookService.gs
 * @description Gerencia o envio e recebimento de webhooks, permitindo a integração com sistemas externos em tempo real.
 *              Pode ser usado para notificar outros serviços sobre eventos na aplicação.
 * @integration
 *   - `UrlFetchService.gs`: Utiliza para fazer requisições HTTP para enviar webhooks.
 *   - `TriggerService.gs`: Pode ser usado para acionar webhooks em eventos específicos.
 */

function sendWebhook(url, payload) {
  try {
    // Envia um webhook (requisição POST) para uma URL externa com um payload JSON
    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      'payload' : JSON.stringify(payload)
    };
    try {
      UrlFetchApp.fetch(url, options);
      logInfo("Webhook enviado para %s com sucesso.", url);
      return { success: true, message: "Webhook enviado." };
    } catch (e) {
      logError("Falha ao enviar webhook para %s: %s", url, e.message);
      return { success: false, message: "Falha ao enviar webhook." };
    }
  } catch (error) {
    Logger.log("Erro em sendWebhook: " + error.message);
    throw error;
  }
}

function processIncomingWebhook(e) {
  // Lógica para processar um webhook recebido (se a aplicação for um endpoint de webhook)
  // O objeto 'e' conteria os dados do webhook
  logInfo("Webhook recebido: %s", JSON.stringify(e));
  return ContentService.createTextOutput("Webhook recebido com sucesso.").setMimeType(ContentService.MimeType.TEXT);
}
