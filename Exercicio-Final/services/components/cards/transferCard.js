// services/components/cards/transferCard.js

import { createDiv, createP, createH, createButton } from '../../utils/utils.js';

export function createTransferCardElement(transfer, senderUser, recipientUser, onEditCallback, onDeleteCallback) {
    const transferCard = createDiv('transfer-card', 'animated-element');
    transferCard.dataset.transferId = transfer.id;

    transferCard.append(createH(3, 'Transferência', 'transfer-card-title'));
    
    transferCard.append(createP(`De: ${senderUser?.name || 'Remetente Desconhecido'} (${senderUser?.email || 'N/A'})`, 'transfer-card-detail'));
    transferCard.append(createP(`Para: ${recipientUser?.name || 'Destinatário Desconhecido'} (${recipientUser?.email || 'N/A'})`, 'transfer-card-detail'));
    transferCard.append(createP(`Valor: R$ ${transfer.value.toFixed(2)}`, 'transfer-card-detail'));
    transferCard.append(createP(`Data: ${transfer.date}`, 'transfer-card-detail'));

    const transferActions = createDiv('transfer-actions');

    const editTransferBtn = createButton('Editar', `editTransfer-${transfer.id}`, ['action-button', 'edit-button'], { transferId: transfer.id });
    const deleteTransferBtn = createButton('Deletar', `deleteTransfer-${transfer.id}`, ['action-button', 'delete-button'], { transferId: transfer.id });

    editTransferBtn.addEventListener('click', () => onEditCallback(transfer));
    deleteTransferBtn.addEventListener('click', () => onDeleteCallback(transfer));

    transferActions.append(editTransferBtn, deleteTransferBtn);
    transferCard.append(transferActions);

    return transferCard;
}