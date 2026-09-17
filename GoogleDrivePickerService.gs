/**
 * @file GoogleDrivePickerService.gs
 * @description Funções para integrar o Google Drive Picker, permitindo que os usuários selecionem arquivos do seu Google Drive diretamente da interface web.
 *              Útil para importar dados, relatórios ou outros documentos para a aplicação.
 * @integration
 *   - Google Drive Picker API: Interage com a interface de seleção de arquivos do Drive.
 *   - `FileService.gs`: Pode ser usado para processar os arquivos selecionados.
 *   - `HtmlService.gs`: Serve a interface HTML que inicia o Picker.
 */

function getDrivePickerScriptUrl() {
  try {
    // Retorna a URL do script que carrega o Google Drive Picker.
    // Esta função é chamada do frontend para iniciar o Picker.
    return ScriptApp.getService().getUrl();
  } catch (error) {
    Logger.log("Erro em getDrivePickerScriptUrl: " + error.message);
    throw error;
  }
}

function getPickerCallbackHtml(oauthToken) {
  try {
    // Gera o HTML necessário para o callback do Picker, que recebe os arquivos selecionados.
    // Requer que a API do Google Drive esteja ativada no projeto GCP associado ao Apps Script.
    return HtmlService.createHtmlOutput(
      `<script>
        function onPickerLoaded() {
          var picker = new google.picker.PickerBuilder()
              .addView(google.picker.ViewId.DOCS)
              .setOAuthToken('${oauthToken}')
              .setCallback(pickerCallback)
              .build();
          picker.setVisible(true);
        }

        function pickerCallback(data) {
          if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            var doc = data[google.picker.Response.DOCUMENTS][0];
            google.script.run.withSuccessHandler(function() { google.script.host.close(); }).processPickedFile(doc.id);
          }
        }

        google.load('picker', '1', { 'callback': onPickerLoaded });
      </script>`
    ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log("Erro em getPickerCallbackHtml: " + error.message);
    throw error;
  }
}

function processPickedFile(fileId) {
  // Processa o ID do arquivo selecionado pelo usuário no Picker.
  logInfo("Arquivo selecionado via Drive Picker: ", fileId);
  // Aqui você pode chamar FileService.getFileMetadata(fileId) ou ImportService.importFile(fileId)
  return { success: true, message: "Arquivo processado." };
}
