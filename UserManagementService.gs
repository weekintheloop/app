/**
 * @file UserManagementService.gs
 * @description Serviço de alto nível para gerenciar usuários, incluindo listagem, criação, edição e exclusão.
 *              Destinado a ser usado por administradores para controle de acesso e manutenção de contas.
 * @integration
 *   - `UserService.gs`: Utiliza as funções CRUD de usuário.
 *   - `Permissions.gs`: Verifica as permissões do usuário que executa as ações.
 *   - `AuthService.gs`: Pode ser usado para forçar logout de usuários.
 */

function listAllUsersForAdmin() {
  return getAllUsers();
}

function createUserByAdmin(username, password, email, role) {
  var newUser = createUserProfile({
    username: username,
    password: password,
    email: email,
    role: role || "user"
  });
  return { success: true, user: newUser };
}

function updateUserByAdmin(userId, newUserData) {
  return updateUserProfile(userId, newUserData);
}

function deleteUserByAdmin(userId) {
  var ok = deleteUserProfile(userId);
  return { success: !!ok };
}

