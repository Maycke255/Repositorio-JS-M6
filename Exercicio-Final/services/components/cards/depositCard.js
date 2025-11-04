// Importa as funções utilitárias que criamos para construir o DOM
import { createDiv, createP, createH, createButton } from '../../utils/utils.js';

// Esta função agora recebe o deposito e duas funções (callbacks)
// para quando os botões de editar e deletar forem clicados.
export function createDepositCardElement(deposit, onEditCallback, onDeleteCallback) {
    const depositCard = createDiv('deposit-card', 'animated-element');
    depositCard.dataset.depositId = deposit.id; // Adiciona o ID para facilitar a referência no DOM

    // O "h3" de nome do usuário
    depositCard.append(createH(3, deposit.name, 'deposit-card-name'));

    // O "p" de e-mail do usuário
    depositCard.append(createP(`E-mail: ${deposit.email}`, 'deposit-card-detail'));

    // O "p" de capital do usuário
    depositCard.append(createP(`Valor do deposito: R\$ ${deposit.value.toFixed(2)}`, 'deposit-card-detail'));

    // Contêiner para os botões de ação
    const depositActions = createDiv('deposit-actions');

    const editdepositBtn = createButton('Editar', `editdeposit-${deposit.id}`, 'action-button', 'edit-button', { depositId: deposit.id });
    const deletedepositBtn = createButton('Deletar', `deletedeposit-${deposit.id}`, 'delete-button', { depositId: deposit.id });

    // Adiciona event listeners que chamam os callbacks (funções passadas de fora)
    editdepositBtn.addEventListener('click', () => onEditCallback(deposit)); // Passa o objeto deposit completo
    deletedepositBtn.addEventListener('click', () => onDeleteCallback(deposit)); // Passa o objeto deposit completo

    depositActions.append(editdepositBtn, deletedepositBtn);
    depositCard.append(depositActions);

    return depositCard;
}