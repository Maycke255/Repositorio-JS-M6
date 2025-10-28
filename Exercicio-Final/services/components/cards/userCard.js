// Importa as funções utilitárias que criamos para construir o DOM
import { createDiv, createP, createH, createButton } from '../../utils/utils.js';

// Esta função agora recebe o usuário e duas funções (callbacks)
// para quando os botões de editar e deletar forem clicados.
export function createUserCardElement(user, onEditCallback, onDeleteCallback) {
    const userCard = createDiv('user-card', 'animated-element');
    userCard.dataset.userId = user.id; // Adiciona o ID para facilitar a referência no DOM

    // O "h3" de nome do usuário
    userCard.append(createH(3, user.name, 'user-card-name'));

    // O "p" de e-mail do usuário
    userCard.append(createP(`E-mail: ${user.email}`, 'user-card-detail'));

    // O "p" de capital do usuário
    userCard.append(createP(`Capital: R\$ ${user.capital.toFixed(2)}`, 'user-card-detail'));

    // Contêiner para os botões de ação
    const userActions = createDiv('user-actions');

    const editUserBtn = createButton('Editar', `editUser-${user.id}`, 'action-button', 'edit-button', { userId: user.id });
    const deleteUserBtn = createButton('Deletar', `deleteUser-${user.id}`, 'action-button', 'delete-button', { userId: user.id });

    // Adiciona event listeners que chamam os callbacks (funções passadas de fora)
    editUserBtn.addEventListener('click', () => onEditCallback(user)); // Passa o objeto user completo
    deleteUserBtn.addEventListener('click', () => onDeleteCallback(user)); // Passa o objeto user completo

    userActions.append(editUserBtn, deleteUserBtn);
    userCard.append(userActions);

    return userCard;
}