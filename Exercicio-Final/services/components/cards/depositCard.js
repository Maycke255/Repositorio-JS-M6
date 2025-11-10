// services/components/cards/depositCard.js

import { createDiv, createP, createH, createButton } from '../../utils/utils.js';

export function createDepositCardElement(deposit, user, onEditCallback, onDeleteCallback) {
    const depositCard = createDiv('deposit-card', 'animated-element');
    depositCard.dataset.depositId = deposit.id;

    depositCard.append(createH(3, user.name || 'Usuário Desconhecido', 'deposit-card-name'));
    depositCard.append(createP(`E-mail: ${user.email || 'N/A'}`, 'deposit-card-detail'));
    depositCard.append(createP(`Valor do deposito: R\$ ${deposit.value.toFixed(2)}`, 'deposit-card-detail'));

    const depositActions = createDiv('deposit-actions');

    // === CHAMADA DO createButton AJUSTADA AQUI ===
    const editdepositBtn = createButton('Editar', `editdeposit-${deposit.id}`, ['action-button', 'edit-button'], { depositId: deposit.id });
    const deletedepositBtn = createButton('Deletar', `deletedeposit-${deposit.id}`, ['action-button', 'delete-button'], { depositId: deposit.id }); // Mudei 'delete-button' para 'action-button', 'delete-button' para ficar consistente com a edição

    editdepositBtn.addEventListener('click', () => onEditCallback(deposit));
    deletedepositBtn.addEventListener('click', () => onDeleteCallback(deposit));

    depositActions.append(editdepositBtn, deletedepositBtn);
    depositCard.append(depositActions);

    return depositCard;
}