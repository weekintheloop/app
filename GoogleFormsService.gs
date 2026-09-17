/**
 * @file GoogleFormsService.gs
 * @description Funções para interagir com o Google Forms, permitindo a criação programática de formulários para coleta de dados ou a leitura de respostas.
 *              Pode ser útil para criar formulários de pesquisa ou de entrada de dados para o estudo.
 * @integration
 *   - Google Forms API: Interage diretamente com o Google Forms.
 *   - `DataService.gs`: Pode ser usado para processar respostas de formulários.
 */

function createDataEntryForm(title, description, questions) {
  // Cria um novo Google Form com o título, descrição e perguntas fornecidas.
  // questions = [{ title: "Nome", type: FormApp.ItemType.TEXT }, { title: "Idade", type: FormApp.ItemType.TEXT }]
  try {
    var form = FormApp.create(title);
    form.setDescription(description);
    questions.forEach(function(q) {
      if (q.type === FormApp.ItemType.TEXT) {
        form.addTextItem().setTitle(q.title);
      } else if (q.type === FormApp.ItemType.PARAGRAPH_TEXT) {
        form.addParagraphTextItem().setTitle(q.title);
      } // Adicionar outros tipos de perguntas conforme necessário
    });
    logInfo("Formulário ", title, " criado com sucesso. URL: ", form.getPublishedUrl());
    return { success: true, formId: form.getId(), formUrl: form.getPublishedUrl() };
  } catch (e) {
    logError("Falha ao criar formulário ", title, ": ", e.message);
    return { success: false, message: "Falha ao criar formulário." };
  }
}

function getFormResponses(formId) {
  try {
    // Obtém todas as respostas de um Google Form específico.
    try {
      var form = FormApp.openById(formId);
      var responses = form.getResponses();
      var formattedResponses = [];
      responses.forEach(function(response) {
        var itemResponses = response.getItemResponses();
        var responseObj = { timestamp: response.getTimestamp() };
        itemResponses.forEach(function(itemResponse) {
          responseObj[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
        });
        formattedResponses.push(responseObj);
      });
      return { success: true, responses: formattedResponses };
    } catch (e) {
      logError("Falha ao obter respostas do formulário ", formId, ": ", e.message);
      return { success: false, message: "Falha ao obter respostas do formulário." };
    }
  } catch (error) {
    Logger.log("Erro em getFormResponses: " + error.message);
    throw error;
  }
}
