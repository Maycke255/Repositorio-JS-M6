// src/controller/displays.js

// =========================================================================
// IMPORTS
// =========================================================================

// Importa showCustomAlert do seu app.js (sem alterá-lo!)
import { showCustomAlert } from "../app.js";

// Importa elementos DOM do seu entities/elements.js
import { boxSelection, displayTransactions, trasactions,
         customEditOverlay, customEditInputs, containerInputs } from '../entities/elements.js';

// Funções utilitárias do DOM
import { hideTransactionSection, createDiv, createP, createH, createButton } from '../../services/utils/utils.js';

// Funções de interação com a API
import { fetchData, deleteResource, updateResource } from '../../services/api.js';

// Componentes de Cards
import { createUserCardElement } from '../../services/components/cards/userCard.js';
import { createDepositCardElement } from '../../services/components/cards/depositCard.js';

// Componentes de Formulários de Edição
import { setupUserEditForm } from '../../services/components/forms/userEditForm.js';
import { setupDepositEditForm } from '../../services/components/forms/depositEditForm.js';

// Importa a nova função para buscar usuário por e-mail
import { findUserByEmail } from '../../services/utils/validationUtils.js';


// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- USUÁRIOS
// =========================================================================

async function handleEditUser(user) {
    setupUserEditForm(user, async (userId, updatedFields) => {
        try {
            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }
            await updateResource('users', userId, updatedFields);
            showCustomAlert(`Usuário ${user.name} atualizado com sucesso!`);
            await renderUsersSection();
        } catch (error) {
            showCustomAlert(`Erro ao atualizar usuário: ${error.message}`);
            console.error('Erro ao atualizar usuário:', error);
        }
    });
}

async function handleDeleteUser(user) {
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.name}?`)) {
        try {
            await deleteResource('users', user.id);
            showCustomAlert(`Usuário ${user.name} deletado com sucesso!`);
            const userCardElement = document.querySelector(`.user-card[data-user-id="${user.id}"]`);
            if (userCardElement) {
                userCardElement.remove();
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

// Função que será chamada quando o botão "Editar" de um depósito for clicado
async function handleEditDeposit(deposit) {
    // Passamos o depósito original e o callback
    setupDepositEditForm(deposit, async (depositId, updatedFields, originalDeposit) => { // <--- Adicionado originalDeposit
        try {
            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }

            // 1. Fetch do usuário ORIGINAL antes de qualquer alteração no depósito
            const oldRecipientEmail = originalDeposit.email;
            const oldDepositValue = originalDeposit.value;
            let oldUser = await findUserByEmail(oldRecipientEmail);
            if (!oldUser) {
                showCustomAlert('Erro: Usuário original do depósito não encontrado.');
                return;
            }

            // 2. Atualiza o depósito
            const updatedDeposit = await updateResource('deposits', depositId, updatedFields);
            showCustomAlert(`Depósito de ${updatedDeposit.name || updatedDeposit.email} atualizado com sucesso!`);

            // 3. Lógica de ajuste de capital
            const newDepositValue = updatedDeposit.value; // O valor após a atualização do depósito
            const newRecipientEmail = updatedDeposit.email || oldRecipientEmail; // O email após a atualização do depósito

            if (oldRecipientEmail === newRecipientEmail) {
                // Se o e-mail do recebedor não mudou, apenas ajusta o capital do mesmo usuário
                const valueDifference = newDepositValue - oldDepositValue;
                oldUser.capital = (oldUser.capital || 0) + valueDifference;
                await updateResource('users', oldUser.id, { capital: oldUser.capital });
                showCustomAlert(`Capital de ${oldUser.name} ajustado em R$ ${valueDifference.toFixed(2)}.`);

            } else {
                // Se o e-mail do recebedor MUDOU
                // Remove o valor do capital do usuário ANTIGO
                oldUser.capital = (oldUser.capital || 0) - oldDepositValue;
                await updateResource('users', oldUser.id, { capital: oldUser.capital });
                showCustomAlert(`Capital de ${oldUser.name} diminuído em R$ ${oldDepositValue.toFixed(2)}.`);

                // Adiciona o valor do capital ao NOVO usuário
                let newUser = await findUserByEmail(newRecipientEmail);
                if (!newUser) {
                    showCustomAlert('Erro: Novo usuário do depósito não encontrado após edição.');
                    // Isso é um problema, pois o depósito foi atualizado mas o capital do novo usuário não.
                    // Em um sistema real, você reverteria a transação ou teria um sistema de compensação.
                    return;
                }
                newUser.capital = (newUser.capital || 0) + newDepositValue;
                await updateResource('users', newUser.id, { capital: newUser.capital });
                showCustomAlert(`Capital de ${newUser.name} aumentado em R$ ${newDepositValue.toFixed(2)}.`);
            }

            // Re-renderiza as seções para mostrar as alterações
            await renderDepositsSection();
            // Se você estiver exibindo usuários ao mesmo tempo, pode ser bom re-renderizar também
            // await renderUsersSection();

        } catch (error) {
            showCustomAlert(`Erro ao atualizar depósito: ${error.message}`);
            console.error('Erro ao atualizar depósito:', error);
        }
    });
}

// Função que será chamada quando o botão "Deletar" de um depósito for clicado
async function handleDeleteDeposit(deposit) {
    if (confirm(`Tem certeza que deseja deletar o depósito de ${deposit.name || deposit.email}?`)) {
        try {
            // 1. Encontrar o usuário recebedor antes de deletar o depósito
            const recipientEmail = deposit.email;
            if (!recipientEmail) {
                showCustomAlert('Erro: E-mail do recebedor do depósito não encontrado.');
                return;
            }
            let recipientUser = await findUserByEmail(recipientEmail);
            if (!recipientUser) {
                showCustomAlert('Erro: Usuário recebedor do depósito não encontrado.');
                return;
            }

            // 2. Diminuir o capital do usuário
            const depositValue = deposit.value || 0;
            recipientUser.capital = (recipientUser.capital || 0) - depositValue;
            await updateResource('users', recipientUser.id, { capital: recipientUser.capital });
            showCustomAlert(`Capital de ${recipientUser.name} diminuído em R$ ${depositValue.toFixed(2)}.`);

            // 3. Deletar o depósito
            await deleteResource('deposits', deposit.id);
            showCustomAlert(`Depósito de ${deposit.name || deposit.email} deletado com sucesso!`);

            // Remove o card do DOM diretamente para uma atualização mais rápida
            const depositCardElement = document.querySelector(`.deposit-card[data-deposit-id="${deposit.id}"]`);
            if (depositCardElement) {
                depositCardElement.remove();
            }
            // Re-renderiza a seção de usuários (se visível) para mostrar a alteração no capital
            // await renderUsersSection();

        } catch (error) {
            showCustomAlert(`Erro ao deletar depósito. Verifique o console.`);
            console.error('Erro ao deletar depósito:', error);
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
        const users = await fetchData('users');
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

// Função para renderizar a seção de depósitos
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
        const deposits = await fetchData('deposits');
        if (deposits.length === 0) {
            const noDepositsMessage = createP('Nenhum depósito realizado ainda.', 'no-deposit-message', 'animated-element');
            depositsGridContainer.append(noDepositsMessage);
        } else {
            // Mapeia os depósitos para adicionar os nomes dos usuários se eles não estiverem no objeto de depósito
            // Isso é um fallback caso seu db.json não tenha "name" e "email" no depósito,
            // ou se a API retornar sem essas propriedades por algum motivo.
            const depositsWithNames = await Promise.all(deposits.map(async (deposit) => {
                if (!deposit.name && deposit.email) { // Se não tem nome mas tem email
                    const user = await findUserByEmail(deposit.email);
                    if (user) {
                        return { ...deposit, name: user.name };
                    }
                }
                return deposit; // Retorna o depósito como está se já tem nome ou não tem email
            }));

            depositsWithNames.forEach(deposit => {
                const depositCard = createDepositCardElement(deposit, handleEditDeposit, handleDeleteDeposit);
                depositsGridContainer.append(depositCard);
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

    if (currentSelection === 'users') {
        await renderUsersSection();
    } else if (currentSelection === 'deposits') {
        await renderDepositsSection();
    }
    // ADICIONE AQUI AS CONDIÇÕES PARA 'transfers' e 'loans'
    // else if (currentSelection === 'transfers') {
    //     await renderTransfersSection();
    // }
    // else if (currentSelection === 'loans') {
    //     await renderLoansSection();
    // }
    else {
        showCustomAlert('Por favor, selecione uma opção válida para exibir.');
        if (transactionsContentWrapper) hideTransactionSection(transactionsContentWrapper);
    }
});