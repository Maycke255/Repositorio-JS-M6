// services/components/cards/loanCard.js

import { createDiv, createP, createH, createButton } from '../../utils/utils.js';

export function createLoanCardElement(loan, user, onEditCallback, onDeleteCallback) {
    const loanCard = createDiv('loan-card', 'animated-element');
    loanCard.dataset.loanId = loan.id;

    loanCard.append(createH(3, 'Empréstimo', 'loan-card-title'));
    
    // Busca informações do usuário através do objeto 'user' recebido
    loanCard.append(createP(`Para: ${user?.name || 'Usuário Desconhecido'} (${user?.email || 'N/A'})`, 'loan-card-detail'));
    loanCard.append(createP(`Valor Solicitado: R$ ${loan.totalValue.toFixed(2)}`, 'loan-card-detail'));
    loanCard.append(createP(`Parcelas: ${loan.installments}x`, 'loan-card-detail'));
    loanCard.append(createP(`Taxa: ${loan.rate}%`, 'loan-card-detail'));
    loanCard.append(createP(`Total a Pagar: R$ ${loan.totalAmountToPay.toFixed(2)}`, 'loan-card-detail'));
    loanCard.append(createP(`Valor da Parcela: R$ ${loan.installmentAmount.toFixed(2)}`, 'loan-card-detail'));
    loanCard.append(createP(`Data: ${loan.date}`, 'loan-card-detail'));

    const loanActions = createDiv('loan-actions');

    const editLoanBtn = createButton('Editar', `editLoan-${loan.id}`, ['action-button', 'edit-button'], { loanId: loan.id });
    const deleteLoanBtn = createButton('Deletar', `deleteLoan-${loan.id}`, ['action-button', 'delete-button'], { loanId: loan.id });

    editLoanBtn.addEventListener('click', () => onEditCallback(loan));
    deleteLoanBtn.addEventListener('click', () => onDeleteCallback(loan));

    loanActions.append(editLoanBtn, deleteLoanBtn);
    loanCard.append(loanActions);

    return loanCard;
}