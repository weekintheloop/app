/**
 * @file GoogleCloudPubSubService.gs
 * @description Funções para integrar com o Google Cloud Pub/Sub, permitindo a publicação e subscrição de mensagens.
 *              Pode ser útil para arquiteturas assíncronas, comunicação entre serviços ou processamento de eventos em larga escala.
 * @integration
 *   - Google Cloud Pub/Sub API: Interage diretamente com o serviço de mensagens.
 *   - `GoogleCloudFunctionsService.gs`: Pode ser usado para acionar Cloud Functions via Pub/Sub.
 */

function publishMessage(projectId, topicName, messageData) {
  // Publica uma mensagem em um tópico do Cloud Pub/Sub.
  // Requer a ativação da Google Cloud Pub/Sub API no projeto GCP associado ao Apps Script.
  if (!projectId || !topicName) return { success: false, message: "projectId e topicName são obrigatórios." };
  try {
    var url = `https://pubsub.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/topics/${encodeURIComponent(topicName)}:publish`;
    var payload = {
      messages: [
        {
          data: Utilities.base64Encode(JSON.stringify(messageData))
        }
      ]
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300 || result.error) {
      return { success: false, status: status, message: (result.error && result.error.message) || `Falha HTTP ${status} ao publicar mensagem.` };
    }
    logInfo(`Mensagem publicada no tópico ${topicName}: ${JSON.stringify(result)}`);
    return { success: true, result: result };
  } catch (e) {
    logError(`Falha ao publicar mensagem no tópico ${topicName}: ${e.message}`);
    return { success: false, message: `Falha ao publicar mensagem: ${e.message}` };
  }
}

function pullMessages(projectId, subscriptionName, maxMessages = 1) {
  if (!projectId || !subscriptionName) return { success: false, message: "projectId e subscriptionName são obrigatórios." };
  maxMessages = Math.max(1, Math.min(1000, Number(maxMessages) || 1));
  try {
    var url = `https://pubsub.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/subscriptions/${encodeURIComponent(subscriptionName)}:pull`;
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ maxMessages: maxMessages, returnImmediately: false }),
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300 || result.error) {
      return { success: false, status: status, message: (result.error && result.error.message) || `Falha HTTP ${status} ao ler a subscrição.` };
    }
    return { success: true, messages: result.receivedMessages || [], result: result };
  } catch (e) {
    logError(`Falha ao ler a subscrição ${subscriptionName}: ${e.message}`);
    return { success: false, message: `Falha ao ler mensagens: ${e.message}` };
  }
}
