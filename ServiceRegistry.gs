/**
 * @file ServiceRegistry.gs
 * @description Exposes file-level GAS functions through service-style objects used across the project.
 */

var GLOBAL_SCOPE_ = typeof globalThis !== 'undefined' ? globalThis : this;

function createServiceRegistry_(methodNames) {
  try {
    var registry = {};
    methodNames.forEach(function(methodName) {
      registry[methodName] = function() {
        if (typeof GLOBAL_SCOPE_[methodName] !== 'function') {
          throw new Error('Service method not found: ' + methodName);
        }
        return GLOBAL_SCOPE_[methodName].apply(GLOBAL_SCOPE_, arguments);
      };
    });
    return registry;
  } catch (error) {
    Logger.log("Erro em createServiceRegistry_: " + error.message);
    throw error;
  }
}

var AuthService = createServiceRegistry_([
  "registerUser",
  "loginUser",
  "logoutUser",
  "isAuthenticated",
  "getCurrentUser"
]);

var Config = createServiceRegistry_([
  "getSpreadsheetId",
  "isSpreadsheetConfigured",
  "getUsersSheetName",
  "getPhysiologicalDataSheetName",
  "getSettingsSheetName"
]);

var DataService = createServiceRegistry_([
  "addPhysiologicalData",
  "getPhysiologicalDataByUserId",
  "getPhysiologicalDataByTimestamp",
  "updatePhysiologicalData",
  "deletePhysiologicalData"
]);

var UserService = createServiceRegistry_([
  "createUserProfile",
  "getUserProfileById",
  "getUserProfileByUsername",
  "updateUserProfile",
  "deleteUserProfile",
  "getAllUsers",
  "getUsersByRole"
]);

var SheetService = createServiceRegistry_([
  "getSheetById",
  "tryGetSheetById",
  "getAllRows",
  "appendRow",
  "updateRow",
  "deleteRow",
  "findRowByColumnValue",
  "findRowsByColumnValue"
]);

var Validation = createServiceRegistry_([
  "validateUsername",
  "validatePassword",
  "validatePhysiologicalData"
]);

var Utils = createServiceRegistry_([
  "isValidEmail",
  "formatTimestamp",
  "generateUniqueId"
]);

var DataAggregatorService = createServiceRegistry_([
  "aggregateDataByDay",
  "getOverallAverages"
]);

var DataAnalysisService = createServiceRegistry_([
  "calculateMean",
  "calculateStandardDeviation",
  "getStatisticalSummary",
  "compareGroups"
]);

var ChartDataService = createServiceRegistry_([
  "getChartDataForEEG",
  "getChartDataForRMSSD",
  "getChartDataForPupilometry"
]);

var DashboardDataService = createServiceRegistry_([
  "getDashboardOverview",
  "getDashboardChartConfigs"
]);

var SettingsService = createServiceRegistry_([
  "getAppSetting",
  "setAppSetting",
  "getUserSetting",
  "setUserSetting"
]);

var SessionManager = createServiceRegistry_([
  "setSessionUser",
  "getSessionUser",
  "clearSession"
]);

var Permissions = createServiceRegistry_([
  "hasPermission",
  "isAdmin",
  "isUser"
]);

var TriggerService = createServiceRegistry_([
  "createTimeDrivenTrigger",
  "createSpreadsheetEditTrigger",
  "listAllTriggers",
  "deleteAllTriggers"
]);

var EmailService = createServiceRegistry_([
  "sendEmail"
]);

var NotificationService = createServiceRegistry_([
  "sendUserNotification",
  "sendAdminNotification"
]);

var ReportService = createServiceRegistry_([
  "generatePhysiologicalReport",
  "exportReportToCsv"
]);

var ReportGenerator = createServiceRegistry_([
  "generateComprehensiveReport",
  "generatePdfReport"
]);

var FileService = createServiceRegistry_([
  "uploadFileToDrive",
  "getFileUrl",
  "listFilesInFolder"
]);

var ImportService = createServiceRegistry_([
  "importCsvToSheet",
  "importPhysiologicalDataFromCsv"
]);

var HtmlSanitizer = createServiceRegistry_([
  "sanitizeHtml",
  "escapeHtml"
]);

var HtmlOutputService = createServiceRegistry_([
  "createSafeHtmlOutput",
  "createTemplateHtmlOutput",
  "createHtmlOutputFromFile"
]);

var SpreadsheetUtils = createServiceRegistry_([
  "createSheetIfNotExist",
  "tryCreateSheetIfNotExist",
  "renameSheet",
  "deleteSheetByName"
]);
