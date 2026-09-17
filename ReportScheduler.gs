/**
 * @file ReportScheduler.gs
 * @description Gerencia o agendamento e a execução de relatórios periódicos.
 *              Permite configurar relatórios para serem gerados e enviados automaticamente em intervalos definidos.
 * @integration
 *   - `ReportService.gs`: Utiliza para gerar os relatórios.
 *   - `EmailService.gs`: Utiliza para enviar os relatórios por e-mail.
 *   - `TriggerService.gs`: Utiliza para criar e gerenciar gatilhos de tempo.
 *   - `Config.gs`: Pode usar configurações para definir destinatários e frequência.
 */

function scheduleDailyReport(userId, recipientEmail) {
  try {
    // Agenda um relatório diário para um usuário e o envia por e-mail.
    var functionName = "_generateAndSendDailyReport";
    TriggerService.createTimeDrivenTrigger(functionName, 1440); // A cada 24 horas (1440 minutos)
    // Armazenar userId e recipientEmail em PropertiesService para a função _generateAndSendDailyReport
    PropertiesService.getScriptProperties().setProperty("dailyReport_" + userId + "_recipient", recipientEmail);
    PropertiesService.getScriptProperties().setProperty("dailyReport_" + userId + "_userId", userId);
    logInfo("Relatório diário agendado para o usuário %s e e-mail %s.", userId, recipientEmail);
  } catch (error) {
    Logger.log("Erro em scheduleDailyReport: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function _generateAndSendDailyReport() {
  // Função interna que é executada pelo gatilho para gerar e enviar o relatório.
  // Esta função deve iterar sobre os usuários que têm relatórios agendados.
  var scriptProperties = PropertiesService.getScriptProperties().getProperties();
  for (var key in scriptProperties) {
    if (key.startsWith("dailyReport_") && key.endsWith("_userId")) {
      var userId = scriptProperties[key];
      var recipientEmail = scriptProperties["dailyReport_" + userId + "_recipient"];
      if (userId && recipientEmail) {
        var report = ReportService.generatePhysiologicalReport(userId, new Date(new Date().setDate(new Date().getDate() - 1)), new Date());
        if (report.success) {
          EmailService.sendEmail(recipientEmail, "Seu Relatório Diário PICS", report.content);
          logInfo("Relatório diário enviado para %s.", recipientEmail);
        }
      }
    }
  }
}

function cancelScheduledReport(userId) {
  try {
    try {
      // Cancela o agendamento de um relatório para um usuário.
      // Necessita de uma forma de identificar o gatilho específico ou remover todos os gatilhos relacionados.
      // TriggerService.deleteAllTriggers(); // Isso removeria TODOS os gatilhos, não ideal.
      PropertiesService.getScriptProperties().deleteProperty("dailyReport_" + userId + "_recipient");
      PropertiesService.getScriptProperties().deleteProperty("dailyReport_" + userId + "_userId");
      logInfo("Agendamento de relatório cancelado para o usuário %s.", userId);
    } catch (error) {
      Logger.log("Erro em cancelScheduledReport: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em cancelScheduledReport: " + error.message);
    throw error;
  }
}
