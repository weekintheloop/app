/**
 * @file TriggerService.gs
 * @description Gerencia a criação, listagem e exclusão de gatilhos programáticos no Google Apps Script.
 *              Permite automatizar tarefas com base em tempo, eventos de planilha ou outros eventos do Google Workspace.
 * @integration
 *   - `Config.gs`: Pode usar configurações para definir parâmetros de gatilho.
 *   - Outros serviços (.gs): Funções de outros serviços podem ser executadas por gatilhos.
 */

function createTimeDrivenTrigger(functionName, intervalMinutes) {
  try {
    // Cria um gatilho baseado em tempo para executar uma função a cada 'intervalMinutes'
    ScriptApp.newTrigger(functionName)
        .timeBased()
        .everyMinutes(intervalMinutes)
        .create();
  } catch (error) {
    Logger.log("Erro em createTimeDrivenTrigger: " + error.message);
    throw error;
  }
}

function createSpreadsheetEditTrigger(functionName) {
  try {
    // Cria um gatilho para executar uma função quando a planilha é editada
    ScriptApp.newTrigger(functionName)
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onEdit()
        .create();
  } catch (error) {
    Logger.log("Erro em createSpreadsheetEditTrigger: " + error.message);
    throw error;
  }
}

function listAllTriggers() {
  try {
    // Lista todos os gatilhos existentes no projeto
    return ScriptApp.getProjectTriggers();
  } catch (error) {
    Logger.log("Erro em listAllTriggers: " + error.message);
    throw error;
  }
}

function deleteAllTriggers() {
  try {
    // Exclui todos os gatilhos do projeto
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  } catch (error) {
    Logger.log("Erro em deleteAllTriggers: " + error.message);
    throw error;
  }
}
