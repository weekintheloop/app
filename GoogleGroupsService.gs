/**
 * @file GoogleGroupsService.gs
 * @description Funções para interagir com o Google Groups, permitindo o gerenciamento de grupos de usuários e suas permissões.
 *              Pode ser útil para organizar usuários em grupos (ex: pesquisadores, participantes, administradores) e gerenciar acesso a recursos.
 * @integration
 *   - Google Groups Settings API: Interage com as configurações de grupos.
 *   - `UserService.gs`: Pode ser usado para associar usuários a grupos.
 */

function addMemberToGroup(groupEmail, memberEmail, role = 'MEMBER') {
  // Adiciona um membro a um grupo do Google Groups.
  // Requer a ativação da Admin SDK Directory API no projeto GCP associado ao Apps Script e permissões de administrador de domínio.
  try {
    var member = {
      email: memberEmail,
      role: role // OWNER, MANAGER, MEMBER
    };
    AdminDirectory.Members.insert(member, groupEmail);
    logInfo(`Membro ${memberEmail} adicionado ao grupo ${groupEmail} com a função ${role}.`);
    return { success: true, message: `Membro ${memberEmail} adicionado ao grupo ${groupEmail}.` };
  } catch (e) {
    logError(`Falha ao adicionar membro ${memberEmail} ao grupo ${groupEmail}: ${e.message}`);
    return { success: false, message: `Falha ao adicionar membro ao grupo: ${e.message}` };
  }
}

function removeMemberFromGroup(groupEmail, memberEmail) {
  // Remove um membro de um grupo do Google Groups.
  try {
    AdminDirectory.Members.remove(groupEmail, memberEmail);
    logInfo(`Membro ${memberEmail} removido do grupo ${groupEmail}.`);
    return { success: true, message: `Membro ${memberEmail} removido do grupo ${groupEmail}.` };
  } catch (e) {
    logError(`Falha ao remover membro ${memberEmail} do grupo ${groupEmail}: ${e.message}`);
    return { success: false, message: `Falha ao remover membro do grupo: ${e.message}` };
  }
}

function listGroupMembers(groupEmail) {
  try {
    // Lista todos os membros de um grupo do Google Groups.
    try {
      var members = AdminDirectory.Members.list(groupEmail).members;
      logInfo(`Membros do grupo ${groupEmail}: ${JSON.stringify(members)}`);
      return { success: true, members: members };
    } catch (e) {
      logError(`Falha ao listar membros do grupo ${groupEmail}: ${e.message}`);
      return { success: false, message: `Falha ao listar membros do grupo: ${e.message}` };
    }
  } catch (error) {
    Logger.log("Erro em listGroupMembers: " + error.message);
    throw error;
  }
}
