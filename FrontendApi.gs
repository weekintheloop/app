/**
 * @file FrontendApi.gs
 * @description Single integration layer (facade) between the HTML frontend and the GAS backend.
 *              Every function here is a name the frontend calls via `google.script.run`, but that
 *              had no backend implementation. Each one now resolves to a consistent
 *              `{ success, data, error }` envelope, delegating to the existing service layer
 *              (see ServiceRegistry.gs) where a real equivalent exists, and returning a graceful
 *              stub otherwise — so the UI degrades cleanly instead of hanging on a missing call.
 *
 *              Pair with `ApiClient.html` on the frontend, which promisifies `google.script.run`,
 *              always attaches a failure handler, and unwraps this envelope.
 *
 * @integration
 *   - `ServiceRegistry.gs`: provides GLOBAL_SCOPE_ and the service objects this facade delegates to.
 *   - `AuthService.gs`, `UserService.gs`, `DataService.gs`, `SettingsService.gs`, etc.: real targets.
 *   - `ApiClient.html`: frontend counterpart that consumes the `{ success, data, error }` contract.
 */

// ---------------------------------------------------------------------------
// Envelope + delegation helpers
// ---------------------------------------------------------------------------

/**
 * Standard success envelope. Plain-object payloads are ALSO spread to the top level so legacy
 * pages that read `response.<field>` directly keep working alongside the { success, data }
 * contract used by ApiClient's `api()`. Arrays/primitives stay under `data`.
 */
function apiOk_(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    var env = { success: true, data: data };
    for (var k in data) {
      if (Object.prototype.hasOwnProperty.call(data, k) && !(k in env)) env[k] = data[k];
    }
    return env;
  }
  return { success: true, data: (data === undefined ? null : data) };
}

/** Standard failure envelope. */
function apiFail_(message, code) {
  return { success: false, error: message || 'Erro inesperado.', code: code || 'ERROR' };
}

/** Graceful "feature not wired yet" envelope (keeps the UI responsive). */
function apiNotImplemented_(feature) {
  return apiFail_('Recurso ainda não implementado: ' + (feature || 'desconhecido'), 'NOT_IMPLEMENTED');
}

/** Best-effort error log that never throws back to the client. */
function apiLog_(context, err) {
  try { if (typeof logError === 'function') logError(context, err); } catch (e) { /* noop */ }
}

/**
 * Delegate to an existing global backend function, forwarding arguments and wrapping the result
 * in a uniform envelope. If the target already returns an envelope ({success:...}) it is passed
 * through unchanged, so existing contracts (e.g. DataService) are preserved.
 */
function apiDelegate_(fnName, args) {
  try {
    var fn = GLOBAL_SCOPE_[fnName];
    if (typeof fn !== 'function') return apiFail_('Função de backend ausente: ' + fnName, 'MISSING_TARGET');
    var result = fn.apply(GLOBAL_SCOPE_, args || []);
    if (result && typeof result === 'object' && 'success' in result) return result;
    return apiOk_(result);
  } catch (err) {
    apiLog_('FrontendApi:' + fnName, err);
    return apiFail_(String(err && err.message ? err.message : err), 'EXCEPTION');
  }
}

/**
 * Snapshot of the logged-in user for synchronous injection into a page at render time
 * (consumed by the per-page bootstrap as `window.__CURRENT_USER__`). Never throws, so a
 * missing session degrades to {} instead of breaking template evaluation.
 */
function getCurrentUserForClient_() {
  try { return getCurrentUser() || {}; } catch (e) { return {}; }
}

/** Resolve the current user's id, falling back to the demo user so flows stay functional. */
function apiCurrentUserId_() {
  try {
    var u = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (u && u.id) return u.id;
  } catch (e) { /* noop */ }
  return 'demo-user';
}

/** Read a JSON-encoded app setting as an object ({} when absent/invalid). */
function apiGetJsonSetting_(key) {
  try {
    if (typeof getAppSetting !== 'function') return {};
    var raw = getAppSetting(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

/** Persist an object as a JSON-encoded app setting. */
function apiSetJsonSetting_(key, value) {
  try {
    if (typeof setAppSetting !== 'function') return apiFail_('SettingsService indisponível.', 'MISSING_TARGET');
    setAppSetting(key, JSON.stringify(value || {}));
    return apiOk_({ saved: true, key: key });
  } catch (err) {
    apiLog_('FrontendApi:setting:' + key, err);
    return apiFail_(String(err && err.message ? err.message : err), 'EXCEPTION');
  }
}

/** Read a per-user JSON setting as an object. */
function apiGetUserJson_(name) {
  try {
    try {
      if (typeof getUserSetting !== 'function') return {};
      var raw = getUserSetting(apiCurrentUserId_(), name);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  } catch (error) {
    Logger.log("Erro em apiGetUserJson_: " + error.message);
    throw error;
  }
}

/** Persist a per-user JSON setting. */
function apiSetUserJson_(name, value) {
  try {
    try {
      if (typeof setUserSetting !== 'function') return apiFail_('SettingsService indisponível.', 'MISSING_TARGET');
      setUserSetting(apiCurrentUserId_(), name, JSON.stringify(value || {}));
      return apiOk_({ saved: true });
    } catch (err) {
      apiLog_('FrontendApi:userSetting:' + name, err);
      return apiFail_(String(err && err.message ? err.message : err), 'EXCEPTION');
    }
  } catch (error) {
    Logger.log("Erro em apiSetUserJson_: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Users & roles  (delegate to UserService / UserManagementService)
// ---------------------------------------------------------------------------

function listAllUsers()            { return apiDelegate_('getAllUsers', arguments); }
function getUserById()             { return apiDelegate_('getUserProfileById', arguments); }
function updateUserRole()          { return apiDelegate_('changeUserRole', arguments); }

// ---------------------------------------------------------------------------
// Physiological data records  (delegate to DataService / SearchService / Sort / Filter)
// ---------------------------------------------------------------------------

function updateDataRecord()        { return apiDelegate_('updatePhysiologicalData', arguments); }
function deleteDataRecord()        { return apiDelegate_('deletePhysiologicalData', arguments); }
function searchData()              { return apiDelegate_('searchPhysiologicalData', arguments); }
function applyDataSort()           { return apiDelegate_('sortDataByColumn', arguments); }
function applyDataFilter()         { return apiDelegate_('filterDataByColumn', arguments); }
function exportData()              { return apiDelegate_('exportPhysiologicalDataToCsv', arguments); }
function importDataFromFile()      { return apiDelegate_('importPhysiologicalDataFromCsv', arguments); }
function getDataForVisualization() { return apiDelegate_('getStatisticalSummary', arguments); }

/** Look up a single record by RecordID using the existing data store. */
function getRecordById(recordId) {
  try {
    var all = (typeof getAllPhysiologicalRecords_ === 'function') ? getAllPhysiologicalRecords_() : [];
    var rec = all.filter(function (r) { return String(r.RecordID) === String(recordId); })[0];
    return rec ? apiOk_(rec) : apiFail_('Registro não encontrado.', 'NOT_FOUND');
  } catch (err) {
    apiLog_('FrontendApi:getRecordById', err);
    return apiFail_(String(err && err.message ? err.message : err), 'EXCEPTION');
  }
}

// ---------------------------------------------------------------------------
// Charts  (delegate to ChartDataService; also expose the config as `chartData`)
// ---------------------------------------------------------------------------

/** Delegate a chart call and surface the Chart.js config as `chartData` (pages read response.chartData). */
function apiChartDelegate_(target, args) {
  var r = apiDelegate_(target, args);
  if (r && r.success && r.data && r.chartData === undefined) r.chartData = r.data;
  return r;
}

function getChartDataForEEGMetric()      { return apiChartDelegate_('getChartDataForEEG', arguments); }
function getChartDataForHRVMetric()      { return apiChartDelegate_('getChartDataForRMSSD', arguments); }
function getChartDataForEDA()            { return apiNotImplemented_('Gráfico de EDA'); }
function getChartDataForCombinedMetrics(){ return apiNotImplemented_('Gráfico combinado'); }

// ---------------------------------------------------------------------------
// Reports  (delegate to ReportService / ReportGenerator where possible)
// ---------------------------------------------------------------------------

function getSummaryReport()    { return apiDelegate_('getStatisticalSummary', arguments); }
function getDetailedReport()   { return apiDelegate_('generatePhysiologicalReport', arguments); }
function listUserReports()     { return apiOk_([]); }
function getReportContent()    { return apiNotImplemented_('Conteúdo de relatório'); }
function getReportDownloadUrl(){ return apiNotImplemented_('Download de relatório'); }
function getUserReportStatus() { return apiNotImplemented_('Status de relatório'); }
function deleteReport()        { return apiNotImplemented_('Exclusão de relatório'); }

// ---------------------------------------------------------------------------
// System / logs / health  (delegate to Logger; compute a small health snapshot)
// ---------------------------------------------------------------------------

function getAdminDashboardData() { return apiDelegate_('getDashboardOverview', arguments); }
function getAuditLogs()          { return apiDelegate_('getLogs', arguments); }
function getSystemLogs()         { return apiDelegate_('getLogs', arguments); }
function getUserActivityLogs()   { return apiDelegate_('getLogs', arguments); }

function getSystemHealthData() {
  try {
    return apiOk_({
      status: 'ok',
      spreadsheetConfigured: (typeof isSpreadsheetConfigured === 'function') ? isSpreadsheetConfigured() : false,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return apiFail_(String(err && err.message ? err.message : err), 'EXCEPTION');
  }
}

function getSystemInfo() {
  try {
    return apiOk_({
      app: (typeof getAppInfo === 'function') ? getAppInfo() : null,
      scriptUrl: (typeof getScriptUrl === 'function') ? getScriptUrl() : null,
      spreadsheetConfigured: (typeof isSpreadsheetConfigured === 'function') ? isSpreadsheetConfigured() : false
    });
  } catch (err) {
    return apiFail_(String(err && err.message ? err.message : err), 'EXCEPTION');
  }
}

// ---------------------------------------------------------------------------
// Notifications  (graceful: list is empty, ack is a no-op until a store exists)
// ---------------------------------------------------------------------------

function getUserNotifications()      { return apiOk_([]); }
function markNotificationAsRead()    { return apiOk_({ acknowledged: true }); }
function saveNotificationPreferences(prefs) { return apiSetUserJson_('notificationPreferences', prefs); }

// ---------------------------------------------------------------------------
// User preferences & per-user chart settings  (persist via SettingsService)
// ---------------------------------------------------------------------------

function saveUserPreferences(prefs)        { return apiSetUserJson_('preferences', prefs); }
function getUserChartSettings()            { return apiOk_(apiGetUserJson_('chartSettings')); }
function saveUserChartSettings(settings)   { return apiSetUserJson_('chartSettings', settings); }

// ---------------------------------------------------------------------------
// Feedback & help
// ---------------------------------------------------------------------------

function getUserFeedbackHistory() { return apiDelegate_('getFeedback', arguments); }
function getFAQs()                { return apiDelegate_('getHelpContent', arguments); }

// ---------------------------------------------------------------------------
// Email templates  (persist as app settings)
// ---------------------------------------------------------------------------

function getEmailTemplate(templateId)        { return apiOk_(apiGetJsonSetting_('emailTemplate:' + (templateId || 'default'))); }
function saveEmailTemplate(templateId, data) {
  if (data === undefined && templateId && typeof templateId === 'object') { data = templateId; templateId = 'default'; }
  return apiSetJsonSetting_('emailTemplate:' + (templateId || 'default'), data);
}

// ---------------------------------------------------------------------------
// Admin settings  (real persistence via SettingsService app settings, JSON-encoded)
// ---------------------------------------------------------------------------

function getAdminSettings()                  { return apiOk_(apiGetJsonSetting_('admin:general')); }
function saveAdminSettings(s)                 { return apiSetJsonSetting_('admin:general', s); }
function getAdminEmailSettings()             { return apiOk_(apiGetJsonSetting_('admin:email')); }
function saveAdminEmailSettings(s)            { return apiSetJsonSetting_('admin:email', s); }
function getAdminSecuritySettings()          { return apiOk_(apiGetJsonSetting_('admin:security')); }
function saveAdminSecuritySettings(s)         { return apiSetJsonSetting_('admin:security', s); }
function getAdminLanguageSettings()          { return apiOk_(apiGetJsonSetting_('admin:language')); }
function saveAdminLanguageSettings(s)         { return apiSetJsonSetting_('admin:language', s); }
function getAdminThemeSettings()             { return apiOk_(apiGetJsonSetting_('admin:theme')); }
function saveAdminThemeSettings(s)            { return apiSetJsonSetting_('admin:theme', s); }
function getAdminIntegrationsSettings()      { return apiOk_(apiGetJsonSetting_('admin:integrations')); }
function saveAdminIntegrationsSettings(s)     { return apiSetJsonSetting_('admin:integrations', s); }
function getAdminGoogleCalendarSettings()    { return apiOk_(apiGetJsonSetting_('admin:googleCalendar')); }
function saveAdminGoogleCalendarSettings(s)   { return apiSetJsonSetting_('admin:googleCalendar', s); }
function getAdminGoogleDocsSettings()        { return apiOk_(apiGetJsonSetting_('admin:googleDocs')); }
function saveAdminGoogleDocsSettings(s)       { return apiSetJsonSetting_('admin:googleDocs', s); }
function getAdminGoogleDriveSettings()       { return apiOk_(apiGetJsonSetting_('admin:googleDrive')); }
function saveAdminGoogleDriveSettings(s)      { return apiSetJsonSetting_('admin:googleDrive', s); }
function getAdminGoogleFormsSettings()       { return apiOk_(apiGetJsonSetting_('admin:googleForms')); }
function saveAdminGoogleFormsSettings(s)      { return apiSetJsonSetting_('admin:googleForms', s); }
function getAdminGoogleGroupsSettings()      { return apiOk_(apiGetJsonSetting_('admin:googleGroups')); }
function saveAdminGoogleGroupsSettings(s)     { return apiSetJsonSetting_('admin:googleGroups', s); }
function getAdminGoogleSheetsSettings()      { return apiOk_(apiGetJsonSetting_('admin:googleSheets')); }
function saveAdminGoogleSheetsSettings(s)     { return apiSetJsonSetting_('admin:googleSheets', s); }
function getAdminGoogleTasksSettings()       { return apiOk_(apiGetJsonSetting_('admin:googleTasks')); }
function saveAdminGoogleTasksSettings(s)      { return apiSetJsonSetting_('admin:googleTasks', s); }

// ---------------------------------------------------------------------------
// Backups, triggers, scheduled tasks  (delegate where safe, stub the rest)
// ---------------------------------------------------------------------------

function createBackup(token) {
  var auth = requireAdminToken_(token);
  if (!auth.success) return auth;
  return apiDelegate_('createFullSpreadsheetBackup_', []);
}
function listBackups(token) {
  var auth = requireAdminToken_(token);
  if (!auth.success) return auth;
  try {
    return apiOk_(listConfiguredBackups_());
  } catch (err) {
    apiLog_('FrontendApi:listBackups', err);
    return apiFail_(String(err && err.message ? err.message : err), 'EXCEPTION');
  }
}
function deleteBackup(token) {
  var auth = requireAdminToken_(token);
  if (!auth.success) return auth;
  return apiNotImplemented_('Exclusão de backup (ação destrutiva)');
}
function restoreBackup(token) {
  var auth = requireAdminToken_(token);
  if (!auth.success) return auth;
  return apiNotImplemented_('Restauração de backup (ação destrutiva)');
}

function createTrigger()       { return apiDelegate_('createTimeDrivenTrigger', arguments); }
function deleteTrigger()       { return apiNotImplemented_('Exclusão de trigger individual'); }

function createScheduledTask() { return apiDelegate_('createTask', arguments); }
function listScheduledTasks()  { return apiDelegate_('listTasks', arguments); }
function deleteScheduledTask() { return apiNotImplemented_('Exclusão de tarefa agendada'); }

// ---------------------------------------------------------------------------
// API keys & password reset  (no secure store yet — graceful stubs)
// ---------------------------------------------------------------------------

function generateNewApiKey()    { return apiNotImplemented_('Geração de API key'); }
function listApiKeys()          { return apiOk_([]); }
function revokeApiKey()         { return apiNotImplemented_('Revogação de API key'); }
function requestPasswordReset() { return apiNotImplemented_('Recuperação de senha'); }
