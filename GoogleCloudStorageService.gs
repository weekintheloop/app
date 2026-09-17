/**
 * @file GoogleCloudStorageService.gs
 * @description Funções para integrar com o Google Cloud Storage, permitindo o armazenamento e recuperação de objetos (arquivos) em buckets.
 *              Pode ser útil para armazenar grandes volumes de dados brutos, backups ou arquivos de mídia.
 * @integration
 *   - Google Cloud Storage API: Interage diretamente com o serviço de armazenamento de objetos.
 *   - `FileService.gs`: Pode ser usado para transferir arquivos entre Drive e Cloud Storage.
 */

function uploadFileToGCS(fileBlob, bucketName, destinationFileName) {
  // Faz o upload de um arquivo (blob) para um bucket no Google Cloud Storage.
  // Requer a ativação da Google Cloud Storage API no projeto GCP associado ao Apps Script.
  if (!fileBlob || !bucketName || !destinationFileName) return { success: false, message: "fileBlob, bucketName e destinationFileName são obrigatórios." };
  try {
    var url = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucketName)}/o?uploadType=media&name=${encodeURIComponent(destinationFileName)}`;
    var options = {
      method: "post",
      contentType: fileBlob.getContentType(),
      payload: fileBlob.getBytes(),
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, options);
    var status = Number(response.getResponseCode());
    var result = JSON.parse(response.getContentText() || '{}');
    if (status < 200 || status >= 300 || result.error) {
      return { success: false, status: status, message: (result.error && result.error.message) || `Falha HTTP ${status} no upload.` };
    }
    logInfo("Arquivo %s enviado para GCS bucket %s com sucesso.", destinationFileName, bucketName);
    return { success: true, result: result };
  } catch (e) {
    logError("Falha ao enviar arquivo para GCS: %s", e.message);
    return { success: false, message: "Falha ao enviar arquivo para GCS." };
  }
}

function downloadFileFromGCS(bucketName, fileName) {
  if (!bucketName || !fileName) return { success: false, message: "bucketName e fileName são obrigatórios." };
  try {
    // Faz o download de um arquivo de um bucket no Google Cloud Storage.
    try {
      var url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(fileName)}?alt=media`;
      var options = {
        headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      };
      var response = UrlFetchApp.fetch(url, options);
      var status = Number(response.getResponseCode());
      if (status < 200 || status >= 300) {
        return { success: false, status: status, message: `Falha HTTP ${status} no download.` };
      }
      logInfo("Arquivo %s baixado do GCS bucket %s com sucesso.", fileName, bucketName);
      return { success: true, blob: response.getBlob() };
    } catch (e) {
      logError("Falha ao baixar arquivo do GCS: %s", e.message);
      return { success: false, message: "Falha ao baixar arquivo do GCS." };
    }
  } catch (error) {
    Logger.log("Erro em downloadFileFromGCS: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}
