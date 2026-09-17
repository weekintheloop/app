/**
 * @file GoogleTasksService.gs
 * @description Funções para interagir com o Google Tasks, permitindo a criação e gerenciamento de listas de tarefas e tarefas individuais.
 *              Pode ser útil para gerenciar tarefas de pesquisa, acompanhamento de pacientes ou lembretes.
 * @integration
 *   - Google Tasks API: Interage diretamente com o serviço de tarefas.
 *   - `UserService.gs`: Pode ser usado para atribuir tarefas a usuários.
 */

function createTask(title, notes = null, due = null, taskListId = null) {
  // Cria uma nova tarefa em uma lista de tarefas específica ou na lista padrão.
  try {
    var task = Tasks.newTask();
    task.setTitle(title);
    if (notes) task.setNotes(notes);
    if (due) task.setDue(due.toISOString()); // Formato ISO 8601

    var result;
    if (taskListId) {
      result = Tasks.Tasks.insert(task, taskListId);
    } else {
      // Inserir na lista de tarefas padrão do usuário
      var defaultTaskList = Tasks.Tasklists.list().items[0]; // Pega a primeira lista como padrão
      if (defaultTaskList) {
        result = Tasks.Tasks.insert(task, defaultTaskList.getId());
      } else {
        throw new Error("Nenhuma lista de tarefas padrão encontrada.");
      }
    }
    logInfo("Tarefa ", title, " criada com sucesso. ID: ", result.id);
    return { success: true, taskId: result.id, taskUrl: result.selfLink };
  } catch (e) {
    logError("Falha ao criar tarefa ", title, ": ", e.message);
    return { success: false, message: "Falha ao criar tarefa." };
  }
}

function listTasks(taskListId = null) {
  // Lista as tarefas de uma lista específica ou da lista padrão.
  try {
    var tasks;
    if (taskListId) {
      tasks = Tasks.Tasks.list(taskListId).items;
    } else {
      var defaultTaskList = Tasks.Tasklists.list().items[0];
      if (defaultTaskList) {
        tasks = Tasks.Tasks.list(defaultTaskList.getId()).items;
      } else {
        throw new Error("Nenhuma lista de tarefas padrão encontrada.");
      }
    }
    logInfo("Tarefas listadas: ", tasks.length);
    return { success: true, tasks: tasks };
  } catch (e) {
    logError("Falha ao listar tarefas: ", e.message);
    return { success: false, message: "Falha ao listar tarefas." };
  }
}
