/**
 * @file Config.gs
 * @description Contém variáveis de configuração globais para a aplicação, como o ID da planilha Google Sheets e nomes das abas.
 *              Estas configurações são essenciais para a integração entre o Google Apps Script e o Google Sheets.
 * @integration
 *   - Todos os serviços que interagem com o Google Sheets (`SheetService.gs`, `AuthService.gs`, `UserService.gs`, `DataService.gs`, etc.)
 * @note
 *   - A `SPREADSHEETS_ID` deve ser configurada como uma propriedade de script (via `PropertiesService`) ou diretamente aqui.
 */

const SPREADSHEETS_ID = ""; // Configure SPREADSHEETS_ID ou SPREADSHEET_ID em Script Properties.
const USERS_SHEET_NAME = "Users";
const PHYSIOLOGICAL_DATA_SHEET_NAME = "PhysiologicalData";
const SETTINGS_SHEET_NAME = "Settings";

// Exemplo de como obter o SPREADSHEETS_ID de PropertiesService (recomendado para produção)
function getSpreadsheetId() {
  try {
    var props = PropertiesService.getScriptProperties();
    var configuredId = props.getProperty('SPREADSHEET_ID');
    if (configuredId) return configuredId;
    if (SPREADSHEETS_ID) return SPREADSHEETS_ID;
    // Auto-provisiona uma planilha de dados na primeira execucao (web app standalone,
    // sem planilha vinculada) e persiste o ID para as proximas chamadas. Idempotente.
    var created = SpreadsheetApp.create('Week In The Loop - Database');
    props.setProperty('SPREADSHEET_ID', created.getId());
    return created.getId();
  } catch (error) {
    Logger.log("Erro em getSpreadsheetId: " + error.message);
    throw error;
  }
}

function isSpreadsheetConfigured() {
  return Boolean(getSpreadsheetId());
}

function getUsersSheetName() {
  return USERS_SHEET_NAME;
}

function getPhysiologicalDataSheetName() {
  return PHYSIOLOGICAL_DATA_SHEET_NAME;
}

function getSettingsSheetName() {
  return SETTINGS_SHEET_NAME;
}
