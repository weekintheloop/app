/**
 * @file GoogleDocsService.gs
 * @description Funções para interagir com o Google Docs, permitindo a criação e manipulação programática de documentos.
 *              Pode ser útil para gerar relatórios formatados ou documentos de estudo.
 * @integration
 *   - Google Docs API: Interage diretamente com o Google Docs.
 *   - `ReportService.gs`: Pode ser usado para exportar relatórios para o Google Docs.
 */

function createDocument(title, content) {
  // Cria um novo Google Doc com o título e conteúdo fornecidos.
  try {
    var doc = DocumentApp.create(title);
    doc.getBody().setText(content);
    doc.saveAndClose();
    logInfo("Documento ", title, " criado com sucesso. URL: ", doc.getUrl());
    return { success: true, docId: doc.getId(), docUrl: doc.getUrl() };
  } catch (e) {
    logError("Falha ao criar documento ", title, ": ", e.message);
    return { success: false, message: "Falha ao criar documento." };
  }
}

function appendTextToDocument(docId, text) {
  // Adiciona texto a um documento existente.
  try {
    var doc = DocumentApp.openById(docId);
    doc.getBody().appendParagraph(text);
    doc.saveAndClose();
    logInfo("Texto adicionado ao documento ", docId);
    return { success: true, message: "Texto adicionado." };
  } catch (e) {
    logError("Falha ao adicionar texto ao documento ", docId, ": ", e.message);
    return { success: false, message: "Falha ao adicionar texto." };
  }
}
