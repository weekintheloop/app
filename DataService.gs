/**
 * @file DataService.gs
 * @description Gerencia as operações CRUD para os dados fisiológicos (EEG, pupilometria, VFC, EDA) na planilha Google Sheets.
 *              Este serviço é específico para a manipulação dos dados do estudo de mensuração fisiológica multimodal.
 * @integration
 *   - `SheetService.gs`: Utiliza para realizar operações CRUD na aba de dados fisiológicos da planilha.
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID e o nome da aba de dados fisiológicos.
 *   - `Validation.gs`: Pode ser usado para validar os dados antes de serem persistidos.
 */

function addPhysiologicalData(data) {
  // FROTA-09: consentimento obrigatório antes de persistir dados fisiológicos
  var _uid09 = (data && (data.UserID || data.userId)) || '';
  try { ConsentService.check(_uid09, 'collect'); } catch (e) {
    if (e.isConsentError) return { success: false, status: e.status, error: 'Consentimento ausente ou inválido para coleta: ' + e.status };
    throw e;
  }
  var record = normalizePhysiologicalRecord_(data);

  if (isSpreadsheetConfigured()) {
    appendRow(getSpreadsheetId(), getPhysiologicalDataSheetName(), record);
    return { success: true, data: record };
  }

  var records = getAllPhysiologicalRecords_();
  records.push(record);
  saveFallbackPhysiologicalRecords_(records);
  return { success: true, data: record };
}

function getPhysiologicalDataByUserId(userId) {
  return getAllPhysiologicalRecords_().filter(function(record) {
    return String(record.UserID || record.userId) === String(userId);
  });
}

function getPhysiologicalDataByTimestamp(timestamp) {
  return getAllPhysiologicalRecords_().filter(function(record) {
    return String(record.Timestamp || record.timestamp) === String(timestamp);
  });
}

function updatePhysiologicalData(recordId, newData) {
  try {
    if (isSpreadsheetConfigured()) {
      var row = findRowByColumnValue(getSpreadsheetId(), getPhysiologicalDataSheetName(), 'RecordID', recordId);
      if (!row) return { success: false, message: 'Registro não encontrado.' };
      updateRow(getSpreadsheetId(), getPhysiologicalDataSheetName(), row.rowIndex, normalizePhysiologicalRecord_(Object.assign({}, row, newData)));
      return { success: true };
    }

    var updatedRecord = null;
    var records = getAllPhysiologicalRecords_().map(function(record) {
      if (String(record.RecordID) !== String(recordId)) return record;
      updatedRecord = normalizePhysiologicalRecord_(Object.assign({}, record, newData, { RecordID: record.RecordID }));
      return updatedRecord;
    });
    saveFallbackPhysiologicalRecords_(records);
    return updatedRecord ? { success: true, data: updatedRecord } : { success: false, message: 'Registro não encontrado.' };
  } catch (error) {
    Logger.log("Erro em updatePhysiologicalData: " + error.message);
    throw error;
  }
}

function deletePhysiologicalData(recordId) {
  try {
    if (isSpreadsheetConfigured()) {
      var row = findRowByColumnValue(getSpreadsheetId(), getPhysiologicalDataSheetName(), 'RecordID', recordId);
      return row ? { success: deleteRow(getSpreadsheetId(), getPhysiologicalDataSheetName(), row.rowIndex) } : { success: false, message: 'Registro não encontrado.' };
    }

    var records = getAllPhysiologicalRecords_().filter(function(record) {
      return String(record.RecordID) !== String(recordId);
    });
    saveFallbackPhysiologicalRecords_(records);
    return { success: true };
  } catch (error) {
    Logger.log("Erro em deletePhysiologicalData: " + error.message);
    throw error;
  }
}

function getAllPhysiologicalRecords_() {
  try {
    if (isSpreadsheetConfigured()) {
      var sheetRows = getAllRows(getSpreadsheetId(), getPhysiologicalDataSheetName());
      if (sheetRows.length > 0) return sheetRows.map(normalizePhysiologicalRecord_);
    }

    var properties = PropertiesService.getScriptProperties();
    var rawRecords = properties.getProperty('PICS_PHYSIOLOGICAL_DATA_JSON');
    var records = rawRecords ? JSON.parse(rawRecords) : [];

    if (records.length === 0) {
      records = getDemoPhysiologicalRecords_();
      saveFallbackPhysiologicalRecords_(records);
    }

    return records.map(normalizePhysiologicalRecord_);
  } catch (error) {
    Logger.log("Erro em getAllPhysiologicalRecords_: " + error.message);
    throw error;
  }
}

function saveFallbackPhysiologicalRecords_(records) {
  try {
    PropertiesService.getScriptProperties().setProperty('PICS_PHYSIOLOGICAL_DATA_JSON', JSON.stringify(records));
  } catch (error) {
    Logger.log("Erro em saveFallbackPhysiologicalRecords_: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function getDemoPhysiologicalRecords_() {
  return [
    { RecordID: 'demo-1', UserID: 'demo-user', Timestamp: '2026-06-01 09:00:00', EEG_Alpha: 8.2, EEG_Theta: 5.1, PupilDiameter: 3.1, RMSSD: 42, EDA_Conductance: 0.35, InterventionType: 'Relaxamento guiado' },
    { RecordID: 'demo-2', UserID: 'demo-user', Timestamp: '2026-06-02 09:00:00', EEG_Alpha: 8.9, EEG_Theta: 5.4, PupilDiameter: 3.2, RMSSD: 44, EDA_Conductance: 0.38, InterventionType: 'Som binaural' },
    { RecordID: 'demo-3', UserID: 'demo-user', Timestamp: '2026-06-03 09:00:00', EEG_Alpha: 9.7, EEG_Theta: 5.9, PupilDiameter: 3.3, RMSSD: 47, EDA_Conductance: 0.41, InterventionType: 'Relaxamento guiado' },
    { RecordID: 'demo-4', UserID: 'demo-user', Timestamp: '2026-06-04 09:00:00', EEG_Alpha: 10.4, EEG_Theta: 6.1, PupilDiameter: 3.4, RMSSD: 49, EDA_Conductance: 0.44, InterventionType: 'Som binaural' },
    { RecordID: 'demo-5', UserID: 'demo-user', Timestamp: '2026-06-05 09:00:00', EEG_Alpha: 11.1, EEG_Theta: 6.5, PupilDiameter: 3.5, RMSSD: 52, EDA_Conductance: 0.46, InterventionType: 'Relaxamento guiado' }
  ];
}

function normalizePhysiologicalRecord_(data) {
  try {
    var record = data || {};
    return {
      RecordID: record.RecordID || record.recordId || generateUniqueId(),
      UserID: record.UserID || record.userId || 'demo-user',
      Timestamp: record.Timestamp || record.timestamp || formatTimestamp(new Date()),
      EEG_Alpha: Number(record.EEG_Alpha || record.eegAlpha || 0),
      EEG_Theta: Number(record.EEG_Theta || record.eegTheta || 0),
      PupilDiameter: Number(record.PupilDiameter || record.pupilDiameter || 0),
      RMSSD: Number(record.RMSSD || record.rmssd || 0),
      EDA_Conductance: Number(record.EDA_Conductance || record.edaConductance || 0),
      InterventionType: record.InterventionType || record.interventionType || ''
    };
  } catch (error) {
    Logger.log("Erro em normalizePhysiologicalRecord_: " + error.message);
    throw error;
  }
}
