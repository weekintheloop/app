/**
 * @file GoogleCloudVisionService.gs
 * @description Funções para integrar com a API Google Cloud Vision, permitindo a análise de imagens (ex: detecção de texto, objetos, faces).
 *              Pode ser útil para processar imagens relacionadas ao estudo, como fotos de pupilas ou documentação.
 * @integration
 *   - Google Cloud Vision API: Interage diretamente com o serviço de visão computacional.
 *   - `FileService.gs`: Pode ser usado para obter imagens do Google Drive.
 */

function detectTextInImage(fileId) {
  // Detecta texto em uma imagem armazenada no Google Drive.
  // Requer a ativação da Google Cloud Vision API no projeto GCP associado ao Apps Script.
  if (!fileId) return { success: false, message: "fileId é obrigatório." };
  try {
    var imageBlob = DriveApp.getFileById(fileId).getBlob();
    var base64EncodedImage = Utilities.base64Encode(imageBlob.getBytes());

    var requestBody = {
      requests: [{
        image: { content: base64EncodedImage },
        features: [{ type: "TEXT_DETECTION" }]
      }]
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(requestBody),
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch("https://vision.googleapis.com/v1/images:annotate", options);
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300 || result.error) {
      return { success: false, status: status, message: (result.error && result.error.message) || "A API Vision rejeitou a solicitação." };
    }
    logInfo("Detecção de texto na imagem %s: %s", fileId, JSON.stringify(result));
    return { success: true, result: result };
  } catch (e) {
    logError("Falha ao detectar texto na imagem %s: %s", fileId, e.message);
    return { success: false, message: "Falha ao detectar texto na imagem." };
  }
}

function detectFacesInImage(fileId) {
  if (!fileId) return { success: false, message: "fileId é obrigatório." };
  try {
    var blob = DriveApp.getFileById(fileId).getBlob();
    var response = UrlFetchApp.fetch("https://vision.googleapis.com/v1/images:annotate", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ requests: [{
        image: { content: Utilities.base64Encode(blob.getBytes()) },
        features: [{ type: "FACE_DETECTION" }]
      }] }),
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300 || result.error) {
      return { success: false, status: status, message: (result.error && result.error.message) || "A API Vision rejeitou a solicitação." };
    }
    logInfo("Detecção de faces na imagem %s concluída.", fileId);
    return { success: true, result: result };
  } catch (e) {
    logError("Falha ao detectar faces na imagem %s: %s", fileId, e.message);
    return { success: false, message: "Falha ao detectar faces na imagem." };
  }
}
