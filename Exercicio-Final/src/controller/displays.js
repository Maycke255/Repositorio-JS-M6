// ARQUIVO: DOMtransactions.js
// import { customEditOverlay, customEditInputs, customEditContent, containerInputs, 
// btnsController, customAEditOkButton, customEditCancelButton } from '../entities/elements.js'

// src/controller/displays.js (Seu arquivo "grande", agora mais limpo para usuários!)

// =========================================================================
// IMPORTS (agora você importa as funções especializadas de outros arquivos)
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

// Componente para criar o card de usuário
import { createUserCardElement } from '../../services/components/cards/userCard.js';

// Componente para o formulário de edição de usuário
import { setupUserEditForm } from '../../services/components/forms/userEditForm.js';

//Componente para o formulario de edição de deposito
import { setupDepositEditForm } from '../../services/components/forms/depositEditForm.js'
import { createDepositCardElement } from "../../services/components/cards/depositCard.js";


// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- USUARIOS
// =========================================================================

// Função que será chamada quando o botão "Editar" de um usuário for clicado
async function handleEditUser(user) {
    setupUserEditForm(user, async (userId, updatedFields) => {
        try {
            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }
            await updateResource('users', userId, updatedFields);
            showCustomAlert(`Usuário ${user.name} atualizado com sucesso!`);
            // Re-renderiza a seção de usuários para mostrar a alteração
            await renderUsersSection(); 
        } catch (error) {
            showCustomAlert(`Erro ao atualizar usuário: ${error.message}`);
            console.error('Erro ao atualizar usuário:', error);
        }
    });
}

// Função que será chamada quando o botão "Deletar" de um usuário for clicado
async function handleDeleteUser(user) {
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.name}?`)) {
        try {
            await deleteResource('users', user.id);
            showCustomAlert(`Usuário ${user.name} deletado com sucesso!`);
            // Remove o card do DOM diretamente para uma atualização mais rápida
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
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar) ----- DEPOSITOS
// =========================================================================

// Função que será chamada quando o botão "Editar" de um usuário for clicado
async function handleEditDeposit(deposit) {
    setupDepositEditForm(deposit, async (depositId, updatedFields) => {
        try {
            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }
            await updateResource('deposits', depositId, updatedFields);
            showCustomAlert(`Deposito de ${deposit.name} atualizado com sucesso!`);
            // Re-renderiza a seção de usuários para mostrar a alteração
            await renderdepositsSection(); 
        } catch (error) {
            showCustomAlert(`Erro ao atualizar deposito: ${error.message}`);
            console.error('Erro ao atualizar deposito:', error);
        }
    });
}

// Função que será chamada quando o botão "Deletar" de um usuário for clicado
async function handleDeleteDeposit(deposit) {
    if (confirm(`Tem certeza que deseja deletar o deposito ${deposit.name}?`)) {
        try {
            await deleteResource('deposits', deposit.id);
            showCustomAlert(`Deposito ${deposit.name} deletado com sucesso!`);
            // Remove o card do DOM diretamente para uma atualização mais rápida
            const depositCardElement = document.querySelector(`.deposit-card[data-deposit-id="${deposit.id}"]`);
            if (depositCardElement) {
                depositCardElement.remove();
            }
        } catch (error) {
            showCustomAlert('Erro ao deletar deposito. Verifique o console.');
            console.error('Erro ao deletar deposito:', error);
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

// NOVO: Função para renderizar a seção de depósitos
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

    // CORRIGIDO: Subtítulo para Depósitos
    const subtitle = createH(2, 'Gerenciamento de Depósitos', 'subtitle-deposits-transactions', 'animated-element');
    transactionsContentWrapper.append(subtitle);

    const depositsGridContainer = createDiv('deposits-grid-container', 'animated-element');

    try {
        const deposits = await fetchData('deposits');
        if (deposits.length === 0) {
            const noDepositsMessage = createP('Nenhum depósito realizado ainda.', 'no-deposit-message', 'animated-element');
            depositsGridContainer.append(noDepositsMessage);
        } else {
            deposits.forEach(deposit => {
                // CORRIGIDO: Nome da função createDepositCardElement
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







// ============================================= FUNÇÕES DE CONTROLE ============================================= 

export const display = displayTransactions.addEventListener('click', async (ev) => {
    ev.preventDefault();

    let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');
    if (!transactionsContentWrapper) {
        transactionsContentWrapper = document.createElement('section');
        transactionsContentWrapper.id = 'transactionsContentWrapper';
        transactionsContentWrapper.classList.add('transactions-content-section');
        trasactions.append(transactionsContentWrapper);
    }

    //Pega o value da opção
    const currentSelection = boxSelection.value;

    // Lógica de toggle: se a mesma opção for clicada novamente, esconde
    if (transactionsContentWrapper.classList.contains('transactions-section-active') &&
        transactionsContentWrapper.dataset.activeSection === currentSelection) {
        hideTransactionSection(transactionsContentWrapper);
        transactionsContentWrapper.dataset.activeSection = ''; // Limpa a seção ativa
        return;
    }

    // Se OUTRA seção estava ativa, esconde ela primeiro antes de carregar a nova
    if (transactionsContentWrapper.classList.contains('transactions-section-active')) {
        await hideTransactionSection(transactionsContentWrapper);
        // Pequeno atraso para a animação de esconder terminar, se necessário
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    transactionsContentWrapper.dataset.activeSection = currentSelection; // Guarda qual seção está ativa

    // CORRIGIDO: Operador de comparação '===' ao invés de '='
    if (currentSelection === 'users') {
        await renderUsersSection();
    } else if (currentSelection === 'deposits') { // CORRIGIDO: Operador de comparação e chamada da nova função
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