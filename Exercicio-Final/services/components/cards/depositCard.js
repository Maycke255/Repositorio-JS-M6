// services/components/cards/depositCard.js

// Importa as funções utilitárias que criamos para construir o DOM
import { createDiv, createP, createH, createButton } from '../../utils/utils.js';

// Esta função agora recebe o deposito, O USUÁRIO associado, e duas funções (callbacks)
export function createDepositCardElement(deposit, user, onEditCallback, onDeleteCallback) { // <--- Adicionado 'user'
    const depositCard = createDiv('deposit-card', 'animated-element');
    depositCard.dataset.depositId = deposit.id; // Adiciona o ID para facilitar a referência no DOM

    // Usamos os dados do usuário para exibir nome e e-mail
    depositCard.append(createH(3, user.name || 'Usuário Desconhecido', 'deposit-card-name'));
    depositCard.append(createP(`E-mail: ${user.email || 'N/A'}`, 'deposit-card-detail'));

    depositCard.append(createP(`Valor do deposito: R\$ ${deposit.value.toFixed(2)}`, 'deposit-card-detail'));

    const depositActions = createDiv('deposit-actions');

    const editdepositBtn = createButton('Editar', `editdeposit-${deposit.id}`, 'action-button', 'edit-button', { depositId: deposit.id });
    const deletedepositBtn = createButton('Deletar', `deletedeposit-${deposit.id}`, 'action-button', 'delete-button', { depositId: deposit.id });

    // Adiciona event listeners que chamam os callbacks (funções passadas de fora)
    // Passamos o depósito ORIGINAL para o callback de edição
    editdepositBtn.addEventListener('click', () => onEditCallback(deposit));
    deletedepositBtn.addEventListener('click', () => onDeleteCallback(deposit));

    depositActions.append(editdepositBtn, deletedepositBtn);
    depositCard.append(depositActions);

    return depositCard;
}