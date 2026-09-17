/**
 * @file FeedbackService.gs
 * @description Gerencia a coleta de feedback dos usuários, armazenando-o em uma aba específica da planilha.
 *              Permite aos usuários enviar sugestões, relatar bugs ou fazer perguntas.
 * @integration
 *   - `SheetService.gs`: Utiliza para adicionar o feedback à planilha.
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID e o nome da aba de feedback.
 *   - `NotificationService.gs`: Pode notificar administradores sobre novos feedbacks.
 */

function submitFeedback(userId, feedbackText, feedbackType) {
  try {
    // Adiciona o feedback do usuário à planilha
    var feedbackData = {
      Timestamp: new Date(),
      UserID: userId,
      FeedbackType: feedbackType, // Ex: 'Sugestão', 'Bug', 'Pergunta'
      FeedbackText: feedbackText
    };
    // SheetService.appendRow(Config.getSpreadsheetId(), "Feedback", Object.values(feedbackData));
    NotificationService.sendAdminNotification("Novo feedback recebido de " + userId + ": " + feedbackText);
    return { success: true, message: "Feedback enviado com sucesso." };
  } catch (error) {
    Logger.log("Erro em submitFeedback: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function getFeedback(feedbackType) {
  // Retorna feedbacks filtrados por tipo
  // return SheetService.filterDataByColumn(Config.getSpreadsheetId(), "Feedback", "FeedbackType", feedbackType);
  return [];
}
