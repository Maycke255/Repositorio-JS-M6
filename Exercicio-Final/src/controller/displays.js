// src/controller/displays.js

// =========================================================================
// IMPORTS
// =========================================================================

import { showCustomAlert } from "../app.js";

import { boxSelection, displayTransactions, trasactions,
         customEditOverlay, customEditInputs, containerInputs } from '../entities/elements.js';

import { hideTransactionSection, createDiv, createP, createH, createButton,
         loadAndCacheAllUsers, loadAndCacheAllDeposits, loadAndCacheAllTransfers,
         findUserById, findDepositById, findTransferById, findUserByEmail,
         allUsersCache, allDepositsCache, allTransfersCache
       } from '../../services/utils/utils.js';

import { fetchData, deleteResource, updateResource } from '../../services/api.js';

import { createUserCardElement } from '../../services/components/cards/userCard.js';
import { createDepositCardElement } from '../../services/components/cards/depositCard.js';
import { createTransferCardElement } from '../../services/components/cards/transferCard.js';

import { setupUserEditForm } from '../../services/components/forms/userEditForm.js';
import { setupDepositEditForm } from '../../services/components/forms/depositEditForm.js';
import { setupTransferEditForm } from '../../services/components/forms/transferEditForm.js';


// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- USUÁRIOS
// =========================================================================

async function handleEditUser(user) {
    setupUserEditForm(user, async (userId, updatedFields) => {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();

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
                const depositsToUpdate = allDepositsCache.filter(dep => dep.userId === userId);
                await Promise.all(depositsToUpdate.map(async (dep) => {
                    const depositUpdateFields = {};
                    if (newEmail !== oldEmailFromCache) {
                        depositUpdateFields.email = newEmail;
                    }
                    if (newName !== oldNameFromCache) {
                        depositUpdateFields.name = newName;
                    }
                    if (Object.keys(depositUpdateFields).length > 0) {
                        await updateResource('deposits', dep.id, depositUpdateFields);
                    }
                }));
                // Remeti a parte de propagação para transferências para o DELETE de usuário,
                // pois transferências não armazenam name/email do remetente/destinatário.
                // A única mudança relevante para transfers aqui seria se o userId mudasse,
                // o que não faz sentido para a edição de um usuário.
            }

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await renderUsersSection();
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'deposits') {
                await renderDepositsSection();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'transfers') {
                await renderTransfersSection();
            }

        } catch (error) {
            showCustomAlert(`Erro ao atualizar usuário: ${error.message}`);
            console.error('Erro ao atualizar usuário:', error);
        }
    });
}

async function handleDeleteUser(user) {
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.name}? Todos os seus depósitos e transferências também serão deletados!`)) {
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();

            const userDeposits = allDepositsCache.filter(dep => dep.userId === user.id);
            await Promise.all(userDeposits.map(dep => deleteResource('deposits', dep.id)));

            // Deleta todas as transferências onde o usuário é remetente OU destinatário
            const userTransfers = allTransfersCache.filter(t => t.senderId === user.id || t.recipientId === user.id);
            await Promise.all(userTransfers.map(t => deleteResource('transfers', t.id)));

            await deleteResource('users', user.id);
            showCustomAlert(`Usuário ${user.name}, seus depósitos e transferências deletados com sucesso!`);

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();

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

            let updatedDeposit = null;

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

                updatedDeposit = await updateResource('deposits', depositId, updatedFields);
                showCustomAlert(`Depósito de ${newRecipientUser.name} transferido e atualizado com sucesso!`);

            } else {
                const valueDifference = newDepositValue - oldDepositValue;
                if (valueDifference !== 0) {
                    oldRecipientUser.capital = (oldRecipientUser.capital || 0) + valueDifference;
                    await updateResource('users', oldRecipientUser.id, { capital: oldRecipientUser.capital });
                    showCustomAlert(`Capital de ${oldRecipientUser.name} ajustado em R$ ${valueDifference.toFixed(2)}.`);
                }
                updatedDeposit = await updateResource('deposits', depositId, updatedFields);
                showCustomAlert(`Depósito de ${oldRecipientUser.name} atualizado com sucesso!`);
            }

            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();
            await loadAndCacheAllTransfers();
            await renderDepositsSection();
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }

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
            const depositCardElement = document.querySelector(`.deposit-card[data-deposit-id="${deposit.id}"]`);
            if (depositCardElement) {
                depositCardElement.remove();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }
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

            // Se o remetente ou destinatário forem alterados na edição,
            // ou se o valor da transferência for alterado, o capital precisa ser ajustado.
            const senderIdChanged = updatedFields.senderId && updatedFields.senderId !== originalTransfer.senderId;
            const recipientIdChanged = updatedFields.recipientId && updatedFields.recipientId !== originalTransfer.recipientId;
            const valueChanged = newTransferValue !== oldTransferValue;

            // Lógica para estornar o valor do remetente original e destinatário original
            if (senderIdChanged || valueChanged) {
                // Remove o valor da transferência original do remetente original
                oldSenderUser.capital = (oldSenderUser.capital || 0) + oldTransferValue;
                await updateResource('users', oldSenderUser.id, { capital: oldSenderUser.capital });
            }
            if (recipientIdChanged || valueChanged) {
                // Estorna o valor da transferência original para o destinatário original
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
            
            // Aplica o novo valor ao remetente atual
            currentSenderUser.capital = (currentSenderUser.capital || 0) - newTransferValue;
            await updateResource('users', currentSenderUser.id, { capital: currentSenderUser.capital });

            // Aplica o novo valor ao destinatário atual
            currentRecipientUser.capital = (currentRecipientUser.capital || 0) + newTransferValue;
            await updateResource('users', currentRecipientUser.id, { capital: currentRecipientUser.capital });
            
            await updateResource('transfers', transferId, updatedFields);
            showCustomAlert('Transferência atualizada com sucesso!');

            await loadAndCacheAllUsers();
            await loadAndCacheAllTransfers();
            await renderTransfersSection();
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }
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
            await loadAndCacheAllTransfers();

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
            await loadAndCacheAllTransfers();

            const transferCardElement = document.querySelector(`.transfer-card[data-transfer-id="${transfer.id}"]`);
            if (transferCardElement) {
                transferCardElement.remove();
            }
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'users') {
                await renderUsersSection();
            }
        } catch (error) {
            showCustomAlert(`Erro ao deletar transferência. Verifique o console.`);
            console.error('Erro ao deletar transferência:', error);
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
}


// =========================================================================
// INICIALIZAÇÃO: CARREGA OS DADOS INICIAIS AO INICIAR A APLICAÇÃO
// =========================================================================
(async () => {
    await loadAndCacheAllUsers();
    await loadAndCacheAllDeposits();
    await loadAndCacheAllTransfers();
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

    if (currentSelection === 'users') {
        await renderUsersSection();
    } else if (currentSelection === 'deposits') {
        await renderDepositsSection();
    } else if (currentSelection === 'transfers') {
        await renderTransfersSection();
    }
    else {
        showCustomAlert('Por favor, selecione uma opção válida para exibir.');
        if (transactionsContentWrapper.classList.contains('transactions-section-active')) {
            hideTransactionSection(transactionsContentWrapper);
        }
    }
});