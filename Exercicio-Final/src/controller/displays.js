// src/controller/displays.js

// =========================================================================
// IMPORTS
// =========================================================================

import { showCustomAlert, updateBankTotalDisplay  } from "../app.js";

import { boxSelection, displayTransactions, trasactions,
         customEditOverlay, customEditInputs, containerInputs } from '../entities/elements.js';

import { hideTransactionSection, createDiv, createP, createH, createButton,
         loadAndCacheAllUsers, loadAndCacheAllDeposits, loadAndCacheAllTransfers, loadAndCacheAllLoans, // <--- NOVO
         findUserById, findDepositById, findTransferById, findLoanById, findUserByEmail, // <--- NOVO
         allUsersCache, allDepositsCache, allTransfersCache, allLoansCache // <--- NOVO
       } from '../../services/utils/utils.js';

import { fetchData, deleteResource, updateResource } from '../../services/api.js';

import { createUserCardElement } from '../../services/components/cards/userCard.js';
import { createDepositCardElement } from '../../services/components/cards/depositCard.js';
import { createTransferCardElement } from '../../services/components/cards/transferCard.js';
import { createLoanCardElement } from '../../services/components/cards/loansCard.js'; // <--- NOVO

import { setupUserEditForm } from '../../services/components/forms/userEditForm.js';
import { setupDepositEditForm } from '../../services/components/forms/depositEditForm.js';
import { setupTransferEditForm } from '../../services/components/forms/transferEditForm.js';
import { setupLoanEditForm } from '../../services/components/forms/loansEditForm.js'; // <--- NOVO


// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- USUÁRIOS
// =========================================================================

async function handleEditUser(user) {
    setupUserEditForm(user, async (userId, updatedFields) => {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }

            const currentUserFromCache = findUserById(userId);
            if (!currentUserFromCache) {
                 showCustomAlert('Erro: Usuário não encontrado no cache. A edição não pode prosseguir.');
                 return;
            }

            const oldEmailFromCache = currentUserFromCache.email;
            const oldNameFromCache = currentUserFromCache.name;
            
            const newEmail = updatedFields.email !== undefined ? updatedFields.email : oldEmailFromCache;
            const newName = updatedFields.name !== undefined ? updatedFields.name : oldNameFromCache;

            const updatedUser = await updateResource('users', userId, updatedFields);
            showCustomAlert(`Usuário ${updatedUser.name} atualizado com sucesso!`);

            if (newEmail !== oldEmailFromCache || newName !== oldNameFromCache) {
                // Atualiza depósitos (se o email/nome for relevante, embora já usem userId, é bom manter se tiver outras dependências)
                const depositsToUpdate = allDepositsCache.filter(dep => dep.userId === userId);
                await Promise.all(depositsToUpdate.map(async (dep) => {
                    const depositUpdateFields = {}; // No nosso modelo atual, deposits só tem userId. Mas se tivesse email/name, seria aqui.
                    if (Object.keys(depositUpdateFields).length > 0) {
                        await updateResource('deposits', dep.id, depositUpdateFields);
                    }
                }));

                // ATUALIZADO: Atualiza empréstimos (mesma lógica que depósitos)
                const loansToUpdate = allLoansCache.filter(loan => loan.userId === userId);
                await Promise.all(loansToUpdate.map(async (loan) => {
                    const loanUpdateFields = {}; // No nosso modelo atual, loans só tem userId. Mas se tivesse email/name, seria aqui.
                    if (Object.keys(loanUpdateFields).length > 0) {
                        await updateResource('loans', loan.id, loanUpdateFields);
                    }
                }));
            }

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO
            await renderUsersSection();
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'deposits') {
                await renderDepositsSection();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'transfers') {
                await renderTransfersSection();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'loans') { // <--- ATUALIZADO
                await renderLoansSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO

        } catch (error) {
            showCustomAlert(`Erro ao atualizar usuário: ${error.message}`);
            console.error('Erro ao atualizar usuário:', error);
        }
    });
}

async function handleDeleteUser(user) {
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.name}? Todos os seus depósitos, transferências e empréstimos também serão deletados!`)) { // <--- ATUALIZADO
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            const userDeposits = allDepositsCache.filter(dep => dep.userId === user.id);
            await Promise.all(userDeposits.map(dep => deleteResource('deposits', dep.id)));

            const userTransfers = allTransfersCache.filter(t => t.senderId === user.id || t.recipientId === user.id);
            await Promise.all(userTransfers.map(t => deleteResource('transfers', t.id)));

            // ATUALIZADO: Deleta todos os empréstimos onde o usuário é o devedor
            const userLoans = allLoansCache.filter(loan => loan.userId === user.id);
            await Promise.all(userLoans.map(loan => deleteResource('loans', loan.id)));

            await deleteResource('users', user.id);
            showCustomAlert(`Usuário ${user.name}, seus depósitos, transferências e empréstimos deletados com sucesso!`); // <--- ATUALIZADO

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            const userCardElement = document.querySelector(`.user-card[data-user-id="${user.id}"]`);
            if (userCardElement) {
                userCardElement.remove();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'deposits') {
                await renderDepositsSection();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'transfers') {
                await renderTransfersSection();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'loans') { // <--- ATUALIZADO
                await renderLoansSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO

        } catch (error) {
            showCustomAlert('Erro ao deletar usuário. Verifique o console.');
            console.error('Erro ao deletar usuário:', error);
        }
    }
}

// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- DEPÓSITOS
// =========================================================================

async function handleEditDeposit(deposit) {
    setupDepositEditForm(deposit, async (depositId, updatedFields, originalDeposit) => {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }

            const oldRecipientUser = findUserById(originalDeposit.userId);
            if (!oldRecipientUser) {
                showCustomAlert('Erro: Usuário original do depósito não encontrado no cache.');
                return;
            }

            const oldDepositValue = originalDeposit.value;
            const newDepositValue = updatedFields.value !== undefined ? updatedFields.value : oldDepositValue;

            if (updatedFields.userId && updatedFields.userId !== originalDeposit.userId) {
                const newRecipientUser = findUserById(updatedFields.userId);
                if (!newRecipientUser) {
                    showCustomAlert('Erro: Novo usuário do depósito não encontrado no cache.');
                    return;
                }

                oldRecipientUser.capital = (oldRecipientUser.capital || 0) - oldDepositValue;
                await updateResource('users', oldRecipientUser.id, { capital: oldRecipientUser.capital });

                newRecipientUser.capital = (newRecipientUser.capital || 0) + newDepositValue;
                await updateResource('users', newRecipientUser.id, { capital: newRecipientUser.capital });

                await updateResource('deposits', depositId, updatedFields);
                showCustomAlert(`Depósito de ${newRecipientUser.name} transferido e atualizado com sucesso!`);

            } else {
                const valueDifference = newDepositValue - oldDepositValue;
                if (valueDifference !== 0) {
                    oldRecipientUser.capital = (oldRecipientUser.capital || 0) + valueDifference;
                    await updateResource('users', oldRecipientUser.id, { capital: oldRecipientUser.capital });
                    showCustomAlert(`Capital de ${oldRecipientUser.name} ajustado em R$ ${valueDifference.toFixed(2)}.`);
                }
                await updateResource('deposits', depositId, updatedFields);
                showCustomAlert(`Depósito de ${oldRecipientUser.name} atualizado com sucesso!`);
            }

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO
            await renderDepositsSection();
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO

        } catch (error) {
            showCustomAlert(`Erro ao atualizar depósito: ${error.message}`);
            console.error('Erro ao atualizar depósito:', error);
        }
    });
}

async function handleDeleteDeposit(deposit) {
    if (confirm(`Tem certeza que deseja deletar o depósito de ${findUserById(deposit.userId)?.name || 'usuário desconhecido'}?`)) {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            const recipientUser = findUserById(deposit.userId);
            if (!recipientUser) {
                showCustomAlert('Erro: Usuário recebedor do depósito não encontrado no cache.');
                console.warn(`Usuário com ID ${deposit.userId} não encontrado, mas depósito será deletado.`);
            }

            const depositValue = deposit.value || 0;
            if (recipientUser) {
                recipientUser.capital = (recipientUser.capital || 0) - depositValue;
                await updateResource('users', recipientUser.id, { capital: recipientUser.capital });
                showCustomAlert(`Capital de ${recipientUser.name} diminuído em R$ ${depositValue.toFixed(2)}.`);
            }

            await deleteResource('deposits', deposit.id);
            showCustomAlert(`Depósito de ${findUserById(deposit.userId)?.name || 'usuário desconhecido'} deletado com sucesso!`);

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            const depositCardElement = document.querySelector(`.deposit-card[data-deposit-id="${deposit.id}"]`);
            if (depositCardElement) {
                depositCardElement.remove();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO

        } catch (error) {
            showCustomAlert(`Erro ao deletar depósito. Verifique o console.`);
            console.error('Erro ao deletar depósito:', error);
        }
    }
}


// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- TRANSFERÊNCIAS
// =========================================================================

async function handleEditTransfer(transfer) {
    await loadAndCacheAllUsers();
    await loadAndCacheAllTransfers();
    await loadAndCacheAllLoans(); // <--- ATUALIZADO

    const senderUser = findUserById(transfer.senderId);
    const recipientUser = findUserById(transfer.recipientId);

    if (!senderUser || !recipientUser) {
        showCustomAlert('Erro: Remetente ou destinatário da transferência não encontrado no cache. Não é possível editar.');
        return;
    }

    const transferForForm = {
        ...transfer,
        emailSender: senderUser.email,
        senderName: senderUser.name,
        emailRecipient: recipientUser.email,
        recipientName: recipientUser.name,
    };

    setupTransferEditForm(transferForForm, async (transferId, updatedFields, originalTransfer) => {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }

            const oldSenderUser = findUserById(originalTransfer.senderId);
            const oldRecipientUser = findUserById(originalTransfer.recipientId);

            if (!oldSenderUser || !oldRecipientUser) {
                showCustomAlert('Erro: Usuário(s) original(is) da transferência não encontrado(s).');
                return;
            }

            const oldTransferValue = originalTransfer.value;
            const newTransferValue = updatedFields.value !== undefined ? updatedFields.value : oldTransferValue;

            let currentSenderUser = oldSenderUser;
            let currentRecipientUser = oldRecipientUser;

            const senderIdChanged = updatedFields.senderId && updatedFields.senderId !== originalTransfer.senderId;
            const recipientIdChanged = updatedFields.recipientId && updatedFields.recipientId !== originalTransfer.recipientId;
            const valueChanged = newTransferValue !== oldTransferValue;

            // Lógica para estornar o valor do remetente original e destinatário original
            if (senderIdChanged || valueChanged) {
                oldSenderUser.capital = (oldSenderUser.capital || 0) + oldTransferValue;
                await updateResource('users', oldSenderUser.id, { capital: oldSenderUser.capital });
            }
            if (recipientIdChanged || valueChanged) {
                oldRecipientUser.capital = (oldRecipientUser.capital || 0) - oldTransferValue;
                await updateResource('users', oldRecipientUser.id, { capital: oldRecipientUser.capital });
            }


            // Agora, aplica os novos valores de capital com base na nova transferência
            if (senderIdChanged) {
                currentSenderUser = findUserById(updatedFields.senderId);
                if (!currentSenderUser) { showCustomAlert('Erro: Novo remetente não encontrado.'); return; }
            }
            if (recipientIdChanged) {
                currentRecipientUser = findUserById(updatedFields.recipientId);
                if (!currentRecipientUser) { showCustomAlert('Erro: Novo destinatário não encontrado.'); return; }
            }
            
            currentSenderUser.capital = (currentSenderUser.capital || 0) - newTransferValue;
            await updateResource('users', currentSenderUser.id, { capital: currentSenderUser.capital });

            currentRecipientUser.capital = (currentRecipientUser.capital || 0) + newTransferValue;
            await updateResource('users', currentRecipientUser.id, { capital: currentRecipientUser.capital });
            
            await updateResource('transfers', transferId, updatedFields);
            showCustomAlert('Transferência atualizada com sucesso!');

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO
            await renderTransfersSection();
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO

        } catch (error) {
            showCustomAlert(`Erro ao atualizar transferência: ${error.message}`);
            console.error('Erro ao atualizar transferência:', error);
        }
    });
}

async function handleDeleteTransfer(transfer) {
    if (confirm(`Tem certeza que deseja deletar a transferência de R$ ${transfer.value.toFixed(2)}? O capital será estornado.`)) {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            const senderUser = findUserById(transfer.senderId);
            const recipientUser = findUserById(transfer.recipientId);

            if (!senderUser || !recipientUser) {
                showCustomAlert('Erro: Remetente ou destinatário da transferência não encontrado no cache. Estorno de capital impossível.');
                return;
            }

            const transferValue = transfer.value || 0;

            senderUser.capital = (senderUser.capital || 0) + transferValue;
            await updateResource('users', senderUser.id, { capital: senderUser.capital });
            showCustomAlert(`Capital de ${senderUser.name} estornado em R$ ${transferValue.toFixed(2)}.`);

            recipientUser.capital = (recipientUser.capital || 0) - transferValue;
            await updateResource('users', recipientUser.id, { capital: recipientUser.capital });
            showCustomAlert(`Capital de ${recipientUser.name} diminuído em R$ ${transferValue.toFixed(2)}.`);

            await deleteResource('transfers', transfer.id);
            showCustomAlert('Transferência deletada com sucesso!');

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await loadAndCacheAllLoans(); // <--- ATUALIZADO

            const transferCardElement = document.querySelector(`.transfer-card[data-transfer-id="${transfer.id}"]`);
            if (transferCardElement) {
                transferCardElement.remove();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO
            
        } catch (error) {
            showCustomAlert(`Erro ao deletar transferência. Verifique o console.`);
            console.error('Erro ao deletar transferência:', error);
        }
    }
}

// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- EMPRÉSTIMOS (NOVO)
// =========================================================================

async function handleEditLoan(loan) {
    await loadAndCacheAllUsers();
    await loadAndCacheAllLoans();

    const user = findUserById(loan.userId);
    if (!user) {
        showCustomAlert('Erro: Usuário do empréstimo não encontrado no cache. Não é possível editar.');
        return;
    }

    const loanForForm = {
        ...loan,
        email: user.email,
        name: user.name,
    };

    setupLoanEditForm(loanForForm, async (loanId, updatedFields, originalLoan) => {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllLoans();

            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }

            const oldUser = findUserById(originalLoan.userId);
            if (!oldUser) {
                showCustomAlert('Erro: Usuário original do empréstimo não encontrado.');
                return;
            }

            const oldTotalValue = originalLoan.totalValue;
            const newTotalValue = updatedFields.totalValue !== undefined ? updatedFields.totalValue : oldTotalValue;

            let currentUser = oldUser;

            const userIdChanged = updatedFields.userId && updatedFields.userId !== originalLoan.userId;
            const totalValueChanged = newTotalValue !== oldTotalValue;

            // 1. Estorna o valor do empréstimo ORIGINAL do usuário ORIGINAL
            if (userIdChanged || totalValueChanged) {
                oldUser.capital = (oldUser.capital || 0) - oldTotalValue;
                await updateResource('users', oldUser.id, { capital: oldUser.capital });
            }

            // 2. Aplica o novo valor ao usuário atual
            if (userIdChanged) {
                currentUser = findUserById(updatedFields.userId);
                if (!currentUser) { showCustomAlert('Erro: Novo usuário do empréstimo não encontrado.'); return; }
            }
            
            currentUser.capital = (currentUser.capital || 0) + newTotalValue;
            await updateResource('users', currentUser.id, { capital: currentUser.capital });
            
            await updateResource('loans', loanId, updatedFields);
            showCustomAlert('Empréstimo atualizado com sucesso!');

            await loadAndCacheAllUsers();
            await loadAndCacheAllLoans();
            await renderLoansSection();
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO

        } catch (error) {
            showCustomAlert(`Erro ao atualizar empréstimo: ${error.message}`);
            console.error('Erro ao atualizar empréstimo:', error);
        }
    });
}

async function handleDeleteLoan(loan) {
    if (confirm(`Tem certeza que deseja deletar o empréstimo de R$ ${loan.totalValue.toFixed(2)}? O capital será ajustado.`)) {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllLoans();

            const user = findUserById(loan.userId);
            if (!user) {
                showCustomAlert('Erro: Usuário do empréstimo não encontrado no cache. Ajuste de capital impossível.');
                return;
            }

            const loanValue = loan.totalValue || 0;

            user.capital = (user.capital || 0) - loanValue; // Remove o valor do empréstimo do capital do usuário
            await updateResource('users', user.id, { capital: user.capital });
            showCustomAlert(`Capital de ${user.name} ajustado em R$ ${loanValue.toFixed(2)} (valor do empréstimo removido).`);

            await deleteResource('loans', loan.id);
            showCustomAlert('Empréstimo deletado com sucesso!');

            await loadAndCacheAllUsers();
            await loadAndCacheAllLoans();

            const loanCardElement = document.querySelector(`.loan-card[data-loan-id="${loan.id}"]`);
            if (loanCardElement) {
                loanCardElement.remove();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }

            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO

        } catch (error) {
            showCustomAlert(`Erro ao deletar empréstimo. Verifique o console.`);
            console.error('Erro ao deletar empréstimo:', error);
        }
    }
}

// =========================================================================
// FUNÇÕES PRINCIPAIS PARA RENDERIZAR SEÇÕES
// =========================================================================

async function renderUsersSection() {
    let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');
    if (!transactionsContentWrapper) {
        transactionsContentWrapper = document.createElement('section');
        transactionsContentWrapper.id = 'transactionsContentWrapper';
        transactionsContentWrapper.classList.add('transactions-content-section');
        trasactions.append(transactionsContentWrapper);
    }

    transactionsContentWrapper.innerHTML = '';
    transactionsContentWrapper.classList.remove('transactions-section-active');

    const subtitle = createH(2, 'Gerenciamento dos Usuários', 'subtitle-users-transactions', 'animated-element');
    transactionsContentWrapper.append(subtitle);

    const usersGridContainer = createDiv('users-grid-container', 'animated-element');

    try {
        const users = allUsersCache;
        if (users.length === 0) {
            const noUsersMessage = createP('Nenhum usuário cadastrado ainda.', 'no-users-message', 'animated-element');
            usersGridContainer.append(noUsersMessage);
        } else {
            users.forEach(user => {
                const userCard = createUserCardElement(user, handleEditUser, handleDeleteUser);
                usersGridContainer.append(userCard);
            });
        }
    } catch (error) {
        showCustomAlert('Erro ao carregar usuários. Verifique o console.');
        console.error('Erro ao carregar usuários:', error);
        const errorMessage = createP('Não foi possível carregar os usuários. Tente novamente mais tarde.', 'error-message', 'animated-element');
        usersGridContainer.append(errorMessage);
    }

    transactionsContentWrapper.append(usersGridContainer);

    const buttonsContainer = createDiv('btns-transactions-group', 'animated-element');
    const collectSectionButton = createButton('Recolher Seção', 'collectSectionTransactions', 'animated-element');
    buttonsContainer.append(collectSectionButton);
    transactionsContentWrapper.append(buttonsContainer);

    requestAnimationFrame(() => {
        transactionsContentWrapper.classList.add('transactions-section-active');
    });

    collectSectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        hideTransactionSection(transactionsContentWrapper);
    });

    updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO
}

async function renderDepositsSection() {
    let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');
    if (!transactionsContentWrapper) {
        transactionsContentWrapper = document.createElement('section');
        transactionsContentWrapper.id = 'transactionsContentWrapper';
        transactionsContentWrapper.classList.add('transactions-content-section');
        trasactions.append(transactionsContentWrapper);
    }

    transactionsContentWrapper.innerHTML = '';
    transactionsContentWrapper.classList.remove('transactions-section-active');

    const subtitle = createH(2, 'Gerenciamento de Depósitos', 'subtitle-deposits-transactions', 'animated-element');
    transactionsContentWrapper.append(subtitle);

    const depositsGridContainer = createDiv('deposits-grid-container', 'animated-element');

    try {
        const deposits = allDepositsCache;
        if (deposits.length === 0) {
            const noDepositsMessage = createP('Nenhum depósito realizado ainda.', 'no-deposit-message', 'animated-element');
            depositsGridContainer.append(noDepositsMessage);
        } else {
            deposits.forEach(deposit => {
                const user = findUserById(deposit.userId);
                if (user) {
                    const depositCard = createDepositCardElement(deposit, user, handleEditDeposit, handleDeleteDeposit);
                    depositsGridContainer.append(depositCard);
                } else {
                    console.warn(`Um ou ambos os usuários (para depósito: ${deposit.id}) não foram encontrados.`);
                }
            });
        }
    } catch (error) {
        showCustomAlert('Erro ao carregar depósitos. Verifique o console.');
        console.error('Erro ao carregar depósitos:', error);
        const errorMessage = createP('Não foi possível carregar os depósitos. Tente novamente mais tarde.', 'error-message', 'animated-element');
        depositsGridContainer.append(errorMessage);
    }

    transactionsContentWrapper.append(depositsGridContainer);

    const buttonsContainer = createDiv('btns-transactions-group', 'animated-element');
    const collectSectionButton = createButton('Recolher Seção', 'collectSectionTransactions', 'animated-element');
    buttonsContainer.append(collectSectionButton);
    transactionsContentWrapper.append(buttonsContainer);

    requestAnimationFrame(() => {
        transactionsContentWrapper.classList.add('transactions-section-active');
    });

    collectSectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        hideTransactionSection(transactionsContentWrapper);
    });

    updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO
}

async function renderTransfersSection() {
    let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');
    if (!transactionsContentWrapper) {
        transactionsContentWrapper = document.createElement('section');
        transactionsContentWrapper.id = 'transactionsContentWrapper';
        transactionsContentWrapper.classList.add('transactions-content-section');
        trasactions.append(transactionsContentWrapper);
    }

    transactionsContentWrapper.innerHTML = '';
    transactionsContentWrapper.classList.remove('transactions-section-active');

    const subtitle = createH(2, 'Gerenciamento de Transferências', 'subtitle-transfers-transactions', 'animated-element');
    transactionsContentWrapper.append(subtitle);

    const transfersGridContainer = createDiv('transfers-grid-container', 'animated-element');

    try {
        const transfers = allTransfersCache;
        if (transfers.length === 0) {
            const noTransfersMessage = createP('Nenhuma transferência realizada ainda.', 'no-transfer-message', 'animated-element');
            transfersGridContainer.append(noTransfersMessage);
        } else {
            transfers.forEach(transfer => {
                const senderUser = findUserById(transfer.senderId);
                const recipientUser = findUserById(transfer.recipientId);

                if (senderUser && recipientUser) {
                    const transferCard = createTransferCardElement(transfer, senderUser, recipientUser, handleEditTransfer, handleDeleteTransfer);
                    transfersGridContainer.append(transferCard);
                } else {
                    console.warn(`Um ou ambos os usuários (remetente: ${transfer.senderId}, destinatário: ${transfer.recipientId}) para a transferência ${transfer.id} não foram encontrados.`);
                }
            });
        }
    } catch (error) {
        showCustomAlert('Erro ao carregar transferências. Verifique o console.');
        console.error('Erro ao carregar transferências:', error);
        const errorMessage = createP('Não foi possível carregar as transferências. Tente novamente mais tarde.', 'error-message', 'animated-element');
        transfersGridContainer.append(errorMessage);
    }

    transactionsContentWrapper.append(transfersGridContainer);

    const buttonsContainer = createDiv('btns-transactions-group', 'animated-element');
    const collectSectionButton = createButton('Recolher Seção', 'collectSectionTransactions', 'animated-element');
    buttonsContainer.append(collectSectionButton);
    transactionsContentWrapper.append(buttonsContainer);

    requestAnimationFrame(() => {
        transactionsContentWrapper.classList.add('transactions-section-active');
    });

    collectSectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        hideTransactionSection(transactionsContentWrapper);
    });

    updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO
}

// <--- NOVO: renderLoansSection
async function renderLoansSection() {
    let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');
    if (!transactionsContentWrapper) {
        transactionsContentWrapper = document.createElement('section');
        transactionsContentWrapper.id = 'transactionsContentWrapper';
        transactionsContentWrapper.classList.add('transactions-content-section');
        trasactions.append(transactionsContentWrapper);
    }

    transactionsContentWrapper.innerHTML = '';
    transactionsContentWrapper.classList.remove('transactions-section-active');

    const subtitle = createH(2, 'Gerenciamento de Empréstimos', 'subtitle-loans-transactions', 'animated-element');
    transactionsContentWrapper.append(subtitle);

    const loansGridContainer = createDiv('loans-grid-container', 'animated-element');

    try {
        const loans = allLoansCache;
        if (loans.length === 0) {
            const noLoansMessage = createP('Nenhum empréstimo realizado ainda.', 'no-loan-message', 'animated-element');
            loansGridContainer.append(noLoansMessage);
        } else {
            loans.forEach(loan => {
                const user = findUserById(loan.userId);
                if (user) {
                    const loanCard = createLoanCardElement(loan, user, handleEditLoan, handleDeleteLoan);
                    loansGridContainer.append(loanCard);
                } else {
                    console.warn(`Usuário com ID ${loan.userId} para o empréstimo ${loan.id} não encontrado.`);
                }
            });
        }
    } catch (error) {
        showCustomAlert('Erro ao carregar empréstimos. Verifique o console.');
        console.error('Erro ao carregar empréstimos:', error);
        const errorMessage = createP('Não foi possível carregar os empréstimos. Tente novamente mais tarde.', 'error-message', 'animated-element');
        loansGridContainer.append(errorMessage);
    }

    transactionsContentWrapper.append(loansGridContainer);

    const buttonsContainer = createDiv('btns-transactions-group', 'animated-element');
    const collectSectionButton = createButton('Recolher Seção', 'collectSectionTransactions', 'animated-element');
    buttonsContainer.append(collectSectionButton);
    transactionsContentWrapper.append(buttonsContainer);

    requestAnimationFrame(() => {
        transactionsContentWrapper.classList.add('transactions-section-active');
    });

    collectSectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        hideTransactionSection(transactionsContentWrapper);
    });

    updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO
}


// =========================================================================
// INICIALIZAÇÃO: CARREGA OS DADOS INICIAIS AO INICIAR A APLICAÇÃO
// =========================================================================
(async () => {
    await loadAndCacheAllUsers();
    await loadAndCacheAllDeposits();
    await loadAndCacheAllTransfers();
    await loadAndCacheAllLoans(); // <--- ATUALIZADO

    updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO
})();


// =========================================================================
// LISTENER PRINCIPAL DO BOTÃO "EXIBIR TRANSAÇÕES"
// =========================================================================

export const display = displayTransactions.addEventListener('click', async (ev) => {
    ev.preventDefault();

    let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');
    if (!transactionsContentWrapper) {
        transactionsContentWrapper = document.createElement('section');
        transactionsContentWrapper.id = 'transactionsContentWrapper';
        transactionsContentWrapper.classList.add('transactions-content-section');
        trasactions.append(transactionsContentWrapper);
    }

    const currentSelection = boxSelection.value;

    if (transactionsContentWrapper.classList.contains('transactions-section-active') &&
        transactionsContentWrapper.dataset.activeSection === currentSelection) {
        hideTransactionSection(transactionsContentWrapper);
        transactionsContentWrapper.dataset.activeSection = '';
        return;
    }

    if (transactionsContentWrapper.classList.contains('transactions-section-active')) {
        await hideTransactionSection(transactionsContentWrapper);
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    transactionsContentWrapper.dataset.activeSection = currentSelection;

    await loadAndCacheAllUsers();
    await loadAndCacheAllDeposits();
    await loadAndCacheAllTransfers();
    await loadAndCacheAllLoans(); // <--- ATUALIZADO

    if (currentSelection === 'users') {
        await renderUsersSection();
    } else if (currentSelection === 'deposits') {
        await renderDepositsSection();
    } else if (currentSelection === 'transfers') {
        await renderTransfersSection();
    } else if (currentSelection === 'loans') { // <--- NOVO
        await renderLoansSection();
    }
    else {
        showCustomAlert('Por favor, selecione uma opção válida para exibir.');
        if (transactionsContentWrapper.classList.contains('transactions-section-active')) {
            hideTransactionSection(transactionsContentWrapper);
        }
    }

    updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO
});