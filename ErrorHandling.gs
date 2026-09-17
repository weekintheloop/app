/**
 * @file ErrorHandling.gs
 * @description Centraliza o tratamento de exceções e erros na aplicação Google Apps Script.
 *              Fornece funções para capturar, registrar e responder a erros de forma consistente.
 * @integration
 *   - `Logger.gs`: Utiliza para registrar os erros.
 *   - `ApiEndpoints.gs`: Pode ser usado para formatar respostas de erro para o frontend.
 */

function handleError(error, functionName) {
  var errorMessage = "Erro na função " + functionName + ": " + error.message;
  logError(errorMessage, error);
  // Dependendo do contexto, pode-se enviar um e-mail de notificação, etc.
  return { success: false, message: errorMessage };
}

function tryCatch(callback, functionName) {
  try {
    return callback();
  } catch (e) {
    return handleError(e, functionName);
  }
}
