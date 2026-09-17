/**
 * @file GoogleCloudLoggingService.gs
 * @description Funções para enviar logs para o Google Cloud Logging, permitindo um monitoramento centralizado e análise de logs da aplicação.
 *              Útil para depuração, auditoria e conformidade em ambientes de produção.
 * @integration
 *   - Google Cloud Logging API: Interage diretamente com o serviço de logging.
 *   - `Logger.gs`: Pode ser usado em conjunto para logs locais e remotos.
 */

function logToCloud(logName, message, severity = 'INFO', resourceType = 'global') {
  // Envia uma entrada de log para o Google Cloud Logging.
  // Requer a ativação da Google Cloud Logging API no projeto GCP associado ao Apps Script.
  try {
    var url = `https://logging.googleapis.com/v2/entries:write`;
    var payload = {
      entries: [
        {
          logName: `projects/${ScriptApp.getCloudProjectID()}/logs/${logName}`,
          resource: { type: resourceType },
          severity: severity,
          textPayload: message
        }
      ]
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
    };

    UrlFetchApp.fetch(url, options);
    // logInfo(`Log enviado para Cloud Logging: ${message}`);
    return { success: true, message: 'Log enviado para Cloud Logging.' };
  } catch (e) {
    logError(`Falha ao enviar log para Cloud Logging: ${e.message}`);
    return { success: false, message: `Falha ao enviar log para Cloud Logging: ${e.message}` };
  }
}

function logErrorToCloud(message, error) {
  logToCloud('apps_script_errors', `ERROR: ${message} - ${error ? error.message : 'No error object'}`, 'ERROR');
}

function logInfoToCloud(message) {
  logToCloud('apps_script_info', `INFO: ${message}`, 'INFO');
}
