/**
 * Dados sintéticos — Week In The Loop
 * Gerado em 2026-06-21 01:10:44 por generate_synthetic_data_all_projects.py
 *
 * Execute populateSyntheticData() PELO EDITOR do Apps Script para popular
 * as abas de domínio com ~30 registros cada (valida os gráficos do notebook).
 * Idempotente: limpa as linhas de dados antes de reinserir.
 *
 * NÃO define onOpen() — para não colidir com o menu real do projeto.
 */

function populateSyntheticData() {
  try {
    try {
      try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var results = [];

        // Registry
        try {
          var sheet_REGISTRY = ss.getSheetByName('Registry') || ss.insertSheet('Registry');
          if (sheet_REGISTRY.getLastRow() > 1) {
            sheet_REGISTRY.deleteRows(2, sheet_REGISTRY.getLastRow() - 1);
          }
          var h_sheet_REGISTRY = ["ID", "Name", "Description", "Status", "CreatedAt", "UpdatedAt"];
          sheet_REGISTRY.getRange(1, 1, 1, h_sheet_REGISTRY.length).setValues([h_sheet_REGISTRY]);
          var d_sheet_REGISTRY = [
            ["REG-0001", "Carla Oliveira", "Acompanhamento de evolução", "inativo", "2026-05-01 01:10:44", "2026-06-12 01:10:44"],
            ["REG-0002", "Eduarda Lima", "Acompanhamento de evolução", "inativo", "2026-04-30 01:10:44", "2026-06-12 01:10:44"],
            ["REG-0003", "Henrique Alves", "Acompanhamento de evolução", "ativo", "2026-06-09 01:10:44", "2026-06-08 01:10:44"],
            ["REG-0004", "Diego Souza", "Acompanhamento de evolução", "ativo", "2026-04-27 01:10:44", "2026-05-30 01:10:44"],
            ["REG-0005", "Ana Silva", "Registro de sessão experimental", "ativo", "2026-06-16 01:10:44", "2026-06-21 01:10:44"],
            ["REG-0006", "Gabriela Rocha", "Dados coletados durante atividade", "ativo", "2026-05-11 01:10:44", "2026-05-30 01:10:44"],
            ["REG-0007", "Diego Souza", "Acompanhamento de evolução", "ativo", "2026-06-16 01:10:44", "2026-06-03 01:10:44"],
            ["REG-0008", "Gabriela Rocha", "Registro de sessão experimental", "inativo", "2026-04-03 01:10:44", "2026-06-16 01:10:44"],
            ["REG-0009", "Henrique Alves", "Acompanhamento de evolução", "ativo", "2026-06-06 01:10:44", "2026-05-24 01:10:44"],
            ["REG-0010", "Felipe Costa", "Dados coletados durante atividade", "inativo", "2026-05-23 01:10:44", "2026-06-11 01:10:44"],
            ["REG-0011", "Diego Souza", "Observação inicial do processo", "ativo", "2026-04-06 01:10:44", "2026-06-07 01:10:44"],
            ["REG-0012", "Ana Silva", "Dados coletados durante atividade", "ativo", "2026-05-07 01:10:44", "2026-06-18 01:10:44"],
            ["REG-0013", "Carla Oliveira", "Dados coletados durante atividade", "inativo", "2026-04-29 01:10:44", "2026-05-31 01:10:44"],
            ["REG-0014", "Diego Souza", "Acompanhamento de evolução", "ativo", "2026-05-21 01:10:44", "2026-06-19 01:10:44"],
            ["REG-0015", "Felipe Costa", "Registro de sessão experimental", "ativo", "2026-04-03 01:10:44", "2026-06-09 01:10:44"],
            ["REG-0016", "Felipe Costa", "Registro de sessão experimental", "inativo", "2026-03-28 01:10:44", "2026-06-08 01:10:44"],
            ["REG-0017", "Diego Souza", "Registro de sessão experimental", "ativo", "2026-05-18 01:10:44", "2026-05-25 01:10:44"],
            ["REG-0018", "Eduarda Lima", "Dados coletados durante atividade", "ativo", "2026-05-19 01:10:44", "2026-05-27 01:10:44"],
            ["REG-0019", "Bruno Santos", "Registro de sessão experimental", "ativo", "2026-05-01 01:10:44", "2026-06-03 01:10:44"],
            ["REG-0020", "Diego Souza", "Dados coletados durante atividade", "ativo", "2026-05-16 01:10:44", "2026-06-03 01:10:44"],
            ["REG-0021", "Henrique Alves", "Registro de sessão experimental", "ativo", "2026-04-08 01:10:44", "2026-05-24 01:10:44"],
            ["REG-0022", "Eduarda Lima", "Acompanhamento de evolução", "ativo", "2026-06-18 01:10:44", "2026-06-05 01:10:44"],
            ["REG-0023", "Carla Oliveira", "Dados coletados durante atividade", "ativo", "2026-06-14 01:10:44", "2026-06-03 01:10:44"],
            ["REG-0024", "Felipe Costa", "Acompanhamento de evolução", "ativo", "2026-04-04 01:10:44", "2026-05-29 01:10:44"],
            ["REG-0025", "Henrique Alves", "Dados coletados durante atividade", "ativo", "2026-06-08 01:10:44", "2026-06-14 01:10:44"],
            ["REG-0026", "Carla Oliveira", "Observação inicial do processo", "ativo", "2026-04-08 01:10:44", "2026-06-07 01:10:44"],
            ["REG-0027", "Carla Oliveira", "Observação inicial do processo", "ativo", "2026-06-06 01:10:44", "2026-05-25 01:10:44"],
            ["REG-0028", "Henrique Alves", "Observação inicial do processo", "inativo", "2026-05-10 01:10:44", "2026-06-12 01:10:44"],
            ["REG-0029", "Felipe Costa", "Dados coletados durante atividade", "ativo", "2026-04-01 01:10:44", "2026-05-30 01:10:44"],
            ["REG-0030", "Gabriela Rocha", "Registro de sessão experimental", "ativo", "2026-04-21 01:10:44", "2026-05-27 01:10:44"]
          ];
          sheet_REGISTRY.getRange(2, 1, d_sheet_REGISTRY.length, h_sheet_REGISTRY.length).setValues(d_sheet_REGISTRY);
          results.push('OK Registry: ' + d_sheet_REGISTRY.length + ' registros');
        } catch (e) {
          results.push('ERRO Registry: ' + e.message);
        }

        // Audit_Logs
        try {
          var sheet_AUDIT_LOGS = ss.getSheetByName('Audit_Logs') || ss.insertSheet('Audit_Logs');
          if (sheet_AUDIT_LOGS.getLastRow() > 1) {
            sheet_AUDIT_LOGS.deleteRows(2, sheet_AUDIT_LOGS.getLastRow() - 1);
          }
          var h_sheet_AUDIT_LOGS = ["ID", "Timestamp", "Level", "Action", "Entity", "RecordID", "UserID", "Message", "Details", "CreatedAt"];
          sheet_AUDIT_LOGS.getRange(1, 1, 1, h_sheet_AUDIT_LOGS.length).setValues([h_sheet_AUDIT_LOGS]);
          var d_sheet_AUDIT_LOGS = [
            ["AUD-0001", "2026-05-15 01:10:44", "baixo", "editar", "A", "AUD-0001", "USR-350", "Processo executado com sucesso", "Processo executado com sucesso", "2026-05-13 01:10:44"],
            ["AUD-0002", "2026-06-04 01:10:44", "alto", "remover", "C", "AUD-0002", "USR-490", "Processo executado com sucesso", "Observações durante a coleta", "2026-04-03 01:10:44"],
            ["AUD-0003", "2026-06-07 01:10:44", "alto", "criar", "A", "AUD-0003", "USR-244", "Comportamento dentro do esperado", "Processo executado com sucesso", "2026-06-03 01:10:44"],
            ["AUD-0004", "2026-05-03 01:10:44", "baixo", "editar", "D", "AUD-0004", "USR-441", "Necessita acompanhamento adicional", "Comportamento dentro do esperado", "2026-04-14 01:10:44"],
            ["AUD-0005", "2026-05-07 01:10:44", "alto", "remover", "B", "AUD-0005", "USR-438", "Comportamento dentro do esperado", "Necessita acompanhamento adicional", "2026-06-20 01:10:44"],
            ["AUD-0006", "2026-05-17 01:10:44", "medio", "criar", "B", "AUD-0006", "USR-170", "Comportamento dentro do esperado", "Comportamento dentro do esperado", "2026-04-11 01:10:44"],
            ["AUD-0007", "2026-06-02 01:10:44", "baixo", "visualizar", "C", "AUD-0007", "USR-506", "Necessita acompanhamento adicional", "Observações durante a coleta", "2026-06-10 01:10:44"],
            ["AUD-0008", "2026-06-17 01:10:44", "baixo", "visualizar", "A", "AUD-0008", "USR-309", "Comportamento dentro do esperado", "Observações durante a coleta", "2026-05-27 01:10:44"],
            ["AUD-0009", "2026-04-29 01:10:44", "medio", "editar", "B", "AUD-0009", "USR-134", "Observações durante a coleta", "Observações durante a coleta", "2026-05-12 01:10:44"],
            ["AUD-0010", "2026-05-23 01:10:44", "medio", "editar", "C", "AUD-0010", "USR-516", "Observações durante a coleta", "Processo executado com sucesso", "2026-06-18 01:10:44"],
            ["AUD-0011", "2026-06-02 01:10:44", "baixo", "remover", "D", "AUD-0011", "USR-616", "Necessita acompanhamento adicional", "Processo executado com sucesso", "2026-06-16 01:10:44"],
            ["AUD-0012", "2026-05-17 01:10:44", "alto", "visualizar", "B", "AUD-0012", "USR-682", "Comportamento dentro do esperado", "Necessita acompanhamento adicional", "2026-04-07 01:10:44"],
            ["AUD-0013", "2026-06-18 01:10:44", "baixo", "criar", "D", "AUD-0013", "USR-548", "Comportamento dentro do esperado", "Processo executado com sucesso", "2026-04-22 01:10:44"],
            ["AUD-0014", "2026-06-05 01:10:44", "baixo", "criar", "C", "AUD-0014", "USR-312", "Comportamento dentro do esperado", "Processo executado com sucesso", "2026-06-01 01:10:44"],
            ["AUD-0015", "2026-06-07 01:10:44", "alto", "visualizar", "A", "AUD-0015", "USR-267", "Observações durante a coleta", "Comportamento dentro do esperado", "2026-04-27 01:10:44"],
            ["AUD-0016", "2026-05-27 01:10:44", "medio", "editar", "D", "AUD-0016", "USR-869", "Comportamento dentro do esperado", "Observações durante a coleta", "2026-05-26 01:10:44"],
            ["AUD-0017", "2026-06-09 01:10:44", "baixo", "editar", "B", "AUD-0017", "USR-109", "Observações durante a coleta", "Processo executado com sucesso", "2026-06-03 01:10:44"],
            ["AUD-0018", "2026-05-31 01:10:44", "medio", "criar", "B", "AUD-0018", "USR-309", "Processo executado com sucesso", "Observações durante a coleta", "2026-06-18 01:10:44"],
            ["AUD-0019", "2026-06-07 01:10:44", "baixo", "visualizar", "D", "AUD-0019", "USR-579", "Necessita acompanhamento adicional", "Processo executado com sucesso", "2026-03-24 01:10:44"],
            ["AUD-0020", "2026-06-14 01:10:44", "alto", "remover", "D", "AUD-0020", "USR-473", "Processo executado com sucesso", "Necessita acompanhamento adicional", "2026-04-27 01:10:44"],
            ["AUD-0021", "2026-06-12 01:10:44", "medio", "visualizar", "C", "AUD-0021", "USR-355", "Processo executado com sucesso", "Observações durante a coleta", "2026-05-16 01:10:44"],
            ["AUD-0022", "2026-05-11 01:10:44", "medio", "editar", "A", "AUD-0022", "USR-180", "Observações durante a coleta", "Observações durante a coleta", "2026-04-07 01:10:44"],
            ["AUD-0023", "2026-05-17 01:10:44", "medio", "remover", "B", "AUD-0023", "USR-340", "Processo executado com sucesso", "Observações durante a coleta", "2026-05-17 01:10:44"],
            ["AUD-0024", "2026-05-07 01:10:44", "baixo", "criar", "B", "AUD-0024", "USR-653", "Comportamento dentro do esperado", "Necessita acompanhamento adicional", "2026-06-12 01:10:44"],
            ["AUD-0025", "2026-04-22 01:10:44", "alto", "criar", "A", "AUD-0025", "USR-565", "Observações durante a coleta", "Observações durante a coleta", "2026-03-28 01:10:44"],
            ["AUD-0026", "2026-05-01 01:10:44", "baixo", "visualizar", "A", "AUD-0026", "USR-482", "Processo executado com sucesso", "Necessita acompanhamento adicional", "2026-04-29 01:10:44"],
            ["AUD-0027", "2026-04-24 01:10:44", "medio", "remover", "A", "AUD-0027", "USR-951", "Necessita acompanhamento adicional", "Necessita acompanhamento adicional", "2026-05-10 01:10:44"],
            ["AUD-0028", "2026-04-30 01:10:44", "medio", "remover", "A", "AUD-0028", "USR-737", "Observações durante a coleta", "Comportamento dentro do esperado", "2026-06-14 01:10:44"],
            ["AUD-0029", "2026-05-28 01:10:44", "medio", "editar", "D", "AUD-0029", "USR-257", "Necessita acompanhamento adicional", "Observações durante a coleta", "2026-05-08 01:10:44"],
            ["AUD-0030", "2026-05-20 01:10:44", "baixo", "editar", "B", "AUD-0030", "USR-424", "Processo executado com sucesso", "Comportamento dentro do esperado", "2026-05-02 01:10:44"]
          ];
          sheet_AUDIT_LOGS.getRange(2, 1, d_sheet_AUDIT_LOGS.length, h_sheet_AUDIT_LOGS.length).setValues(d_sheet_AUDIT_LOGS);
          results.push('OK Audit_Logs: ' + d_sheet_AUDIT_LOGS.length + ' registros');
        } catch (e) {
          results.push('ERRO Audit_Logs: ' + e.message);
        }

        // Settings
        try {
          var sheet_SETTINGS = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
          if (sheet_SETTINGS.getLastRow() > 1) {
            sheet_SETTINGS.deleteRows(2, sheet_SETTINGS.getLastRow() - 1);
          }
          var h_sheet_SETTINGS = ["Key", "Value", "Description", "Scope", "UpdatedAt", "UpdatedBy"];
          sheet_SETTINGS.getRange(1, 1, 1, h_sheet_SETTINGS.length).setValues([h_sheet_SETTINGS]);
          var d_sheet_SETTINGS = [
            ["D", "C", "Registro de sessão experimental", "B", "2026-05-22 01:10:44", "2026-06-06 01:10:44"],
            ["D", "B", "Dados coletados durante atividade", "D", "2026-06-03 01:10:44", "2026-05-03 01:10:44"],
            ["A", "B", "Observação inicial do processo", "B", "2026-06-19 01:10:44", "2026-06-16 01:10:44"],
            ["A", "A", "Acompanhamento de evolução", "A", "2026-06-14 01:10:44", "2026-05-08 01:10:44"],
            ["C", "D", "Observação inicial do processo", "A", "2026-06-07 01:10:44", "2026-04-28 01:10:44"],
            ["A", "D", "Registro de sessão experimental", "A", "2026-05-27 01:10:44", "2026-05-12 01:10:44"],
            ["B", "B", "Registro de sessão experimental", "A", "2026-06-03 01:10:44", "2026-05-13 01:10:44"],
            ["C", "C", "Dados coletados durante atividade", "C", "2026-05-29 01:10:44", "2026-04-26 01:10:44"],
            ["A", "D", "Observação inicial do processo", "B", "2026-06-16 01:10:44", "2026-06-12 01:10:44"],
            ["D", "D", "Registro de sessão experimental", "B", "2026-06-14 01:10:44", "2026-05-17 01:10:44"],
            ["D", "B", "Dados coletados durante atividade", "A", "2026-06-10 01:10:44", "2026-04-28 01:10:44"],
            ["C", "B", "Dados coletados durante atividade", "A", "2026-06-09 01:10:44", "2026-06-10 01:10:44"],
            ["D", "C", "Registro de sessão experimental", "D", "2026-05-25 01:10:44", "2026-06-09 01:10:44"],
            ["B", "A", "Dados coletados durante atividade", "B", "2026-06-12 01:10:44", "2026-06-03 01:10:44"],
            ["C", "D", "Observação inicial do processo", "C", "2026-06-05 01:10:44", "2026-04-29 01:10:44"],
            ["D", "C", "Observação inicial do processo", "C", "2026-06-07 01:10:44", "2026-06-20 01:10:44"],
            ["B", "A", "Registro de sessão experimental", "D", "2026-05-28 01:10:44", "2026-05-20 01:10:44"],
            ["C", "A", "Registro de sessão experimental", "B", "2026-05-27 01:10:44", "2026-05-09 01:10:44"],
            ["D", "D", "Registro de sessão experimental", "B", "2026-06-09 01:10:44", "2026-05-25 01:10:44"],
            ["B", "B", "Registro de sessão experimental", "D", "2026-06-14 01:10:44", "2026-06-04 01:10:44"],
            ["B", "D", "Acompanhamento de evolução", "D", "2026-06-11 01:10:44", "2026-05-02 01:10:44"],
            ["B", "B", "Registro de sessão experimental", "B", "2026-06-21 01:10:44", "2026-05-26 01:10:44"],
            ["A", "D", "Registro de sessão experimental", "A", "2026-06-17 01:10:44", "2026-05-01 01:10:44"],
            ["B", "A", "Registro de sessão experimental", "B", "2026-06-17 01:10:44", "2026-05-15 01:10:44"],
            ["C", "A", "Observação inicial do processo", "C", "2026-05-23 01:10:44", "2026-04-27 01:10:44"],
            ["D", "B", "Observação inicial do processo", "B", "2026-06-03 01:10:44", "2026-06-01 01:10:44"],
            ["C", "D", "Dados coletados durante atividade", "D", "2026-06-14 01:10:44", "2026-05-23 01:10:44"],
            ["B", "D", "Dados coletados durante atividade", "C", "2026-05-31 01:10:44", "2026-05-04 01:10:44"],
            ["B", "A", "Acompanhamento de evolução", "D", "2026-06-19 01:10:44", "2026-05-31 01:10:44"],
            ["C", "A", "Registro de sessão experimental", "A", "2026-06-15 01:10:44", "2026-06-08 01:10:44"]
          ];
          sheet_SETTINGS.getRange(2, 1, d_sheet_SETTINGS.length, h_sheet_SETTINGS.length).setValues(d_sheet_SETTINGS);
          results.push('OK Settings: ' + d_sheet_SETTINGS.length + ' registros');
        } catch (e) {
          results.push('ERRO Settings: ' + e.message);
        }

        Logger.log(results.join('\n'));
        return results;
      } catch (error) {
        Logger.log("Erro em populateSyntheticData: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em populateSyntheticData: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em populateSyntheticData: " + error.message);
    throw error;
  }
}
