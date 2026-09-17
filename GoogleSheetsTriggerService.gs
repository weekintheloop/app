/**
 * @file GoogleSheetsTriggerService.gs
 * @description Funções para gerenciar gatilhos específicos de eventos do Google Sheets, como edições, envios de formulários ou alterações na planilha.
 *              Permite automatizar ações em resposta a interações diretas com a planilha.
 * @integration
 *   - `TriggerService.gs`: Complementa o gerenciamento de gatilhos gerais.
 *   - `DataService.gs`: Pode ser acionado para processar dados quando uma nova linha é adicionada.
 */

function createOnEditTrigger(functionName) {
  try {
    // Cria um gatilho que executa uma função quando a planilha é editada.
    ScriptApp.newTrigger(functionName)
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onEdit()
        .create();
    logInfo("Gatilho onEdit criado para a função: ", functionName);
  } catch (error) {
    Logger.log("Erro em createOnEditTrigger: " + error.message);
    throw error;
  }
}

function createOnFormSubmitTrigger(functionName) {
  try {
    // Cria um gatilho que executa uma função quando um formulário associado à planilha é enviado.
    ScriptApp.newTrigger(functionName)
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onFormSubmit()
        .create();
    logInfo("Gatilho onFormSubmit criado para a função: ", functionName);
  } catch (error) {
    Logger.log("Erro em createOnFormSubmitTrigger: " + error.message);
    throw error;
  }
}

function handleOnEdit(e) {
  try {
    // Função de exemplo para lidar com eventos onEdit.
    // O objeto de evento `e` contém informações sobre a edição (range, valor, usuário).
    logInfo("Evento onEdit disparado. Range: %s, Valor: %s", e.range.getA1Notation(), e.value);
    // Exemplo: Se a edição for na aba de dados fisiológicos, processar a alteração.
    if (e.range.getSheet().getName() === Config.getPhysiologicalDataSheetName()) {
      // DataService.processEditedData(e.range);
    }
  } catch (error) {
    Logger.log("Erro em handleOnEdit: " + error.message);
    throw error;
  }
}
