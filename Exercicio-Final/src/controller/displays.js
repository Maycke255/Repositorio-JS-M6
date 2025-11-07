// src/controller/displays.js

// =========================================================================
// IMPORTS
// =========================================================================

// Importa showCustomAlert do seu app.js (sem alterá-lo!)
import { showCustomAlert } from "../app.js";

// Importa elementos DOM do seu entities/elements.js
import { boxSelection, displayTransactions, trasactions,
         customEditOverlay, customEditInputs, containerInputs } from '../entities/elements.js';

// Funções utilitárias do DOM e as novas de busca/cache
import { hideTransactionSection, createDiv, createP, createH, createButton,
         loadAndCacheAllUsers, loadAndCacheAllDeposits,
         findUserById, findDepositById, findUserByEmail, generateUniqueId } from '../../services/utils/utils.js';

// Funções de interação com a API
import { fetchData, deleteResource, updateResource } from '../../services/api.js';

// Componentes de Cards
import { createUserCardElement } from '../../services/components/cards/userCard.js';
import { createDepositCardElement } from '../../services/components/cards/depositCard.js';

// Componentes de Formulários de Edição
import { setupUserEditForm } from '../../services/components/forms/userEditForm.js';
import { setupDepositEditForm } from '../../services/components/forms/depositEditForm.js';


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

            // Se o e-mail do usuário mudou, precisamos propagar para os depósitos
            const oldEmail = user.email;
            const newEmail = updatedFields.email;
            const newName = updatedFields.name || user.name; // Novo nome, ou o nome atual se não foi atualizado

            const updatedUser = await updateResource('users', userId, updatedFields);
            showCustomAlert(`Usuário ${updatedUser.name} atualizado com sucesso!`);

            // --- PROPAGAR ALTERAÇÕES DO USUÁRIO PARA OS DEPÓSITOS ---
            if (newEmail && newEmail !== oldEmail) {
                const depositsToUpdate = allDepositsCache.filter(dep => dep.userId === userId);
                await Promise.all(depositsToUpdate.map(async (dep) => {
                    // Aqui estamos atualizando o depósito com o novo e-mail e nome do usuário
                    // Mesmo que o depósito não armazene email/name, a API pode aceitar
                    // E é uma forma de manter a consistência caso você mude de ideia
                    // Ou se os cards de depósito ainda usam essas propriedades.
                    await updateResource('deposits', dep.id, { email: newEmail, name: newName });
                }));
            } else if (newName && newName !== user.name) {
                // Se apenas o nome mudou, atualiza o nome nos depósitos também
                 const depositsToUpdate = allDepositsCache.filter(dep => dep.userId === userId);
                 await Promise.all(depositsToUpdate.map(async (dep) => {
                     await updateResource('deposits', dep.id, { name: newName });
                 }));
            }
            // --- FIM DA PROPAGAÇÃO ---

            await loadAndCacheAllUsers(); // Recarrega o cache de usuários
            await loadAndCacheAllDeposits(); // Recarrega o cache de depósitos
            await renderUsersSection(); // Re-renderiza a seção de usuários para mostrar a alteração
            // Opcional: se a seção de depósitos estiver visível, re-renderize-a também
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'deposits') {
                await renderDepositsSection();
            }

        } catch (error) {
            showCustomAlert(`Erro ao atualizar usuário: ${error.message}`);
            console.error('Erro ao atualizar usuário:', error);
        }
    });
}

async function handleDeleteUser(user) {
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.name}? Todos os seus depósitos também serão deletados!`)) {
        try {
            // Primeiro, deleta todos os depósitos associados a este usuário
            const userDeposits = allDepositsCache.filter(dep => dep.userId === user.id);
            await Promise.all(userDeposits.map(dep => deleteResource('deposits', dep.id)));

            await deleteResource('users', user.id);
            showCustomAlert(`Usuário ${user.name} e seus depósitos deletados com sucesso!`);

            await loadAndCacheAllUsers(); // Recarrega o cache de usuários
            await loadAndCacheAllDeposits(); // Recarrega o cache de depósitos

            const userCardElement = document.querySelector(`.user-card[data-user-id="${user.id}"]`);
            if (userCardElement) {
                userCardElement.remove();
            }
            // Opcional: se a seção de depósitos estiver visível, re-renderize-a também
            if (trasactions.querySelector('#transactionsContentWrapper').dataset.activeSection === 'deposits') {
                await renderDepositsSection();
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
    // Passamos o depósito original e o callback
    setupDepositEditForm(deposit, async (depositId, updatedFields, originalDeposit) => {
        try {
            if (Object.keys(updatedFields).length === 0) {
                showCustomAlert('Nenhuma alteração foi feita.');
                return;
            }

            // 1. Fetch do usuário ORIGINAL e NOVO (se o e-mail mudou)
            const oldRecipientUser = findUserById(originalDeposit.userId);
            if (!oldRecipientUser) {
                showCustomAlert('Erro: Usuário original do depósito não encontrado.');
                return;
            }

            const oldDepositValue = originalDeposit.value;
            const newDepositValue = updatedFields.value !== undefined ? updatedFields.value : oldDepositValue; // Pega o novo valor ou mantém o antigo

            let updatedDeposit = null;

            // Se o e-mail/userId do depósito mudou (ou seja, o depósito foi para outro usuário)
            if (updatedFields.userId && updatedFields.userId !== originalDeposit.userId) {
                const newRecipientUser = findUserById(updatedFields.userId);
                if (!newRecipientUser) {
                    showCustomAlert('Erro: Novo usuário do depósito não encontrado.');
                    return;
                }

                // --- Ajuste de capital para a mudança de usuário ---
                // Remove o valor antigo do usuário antigo
                oldRecipientUser.capital = (oldRecipientUser.capital || 0) - oldDepositValue;
                await updateResource('users', oldRecipientUser.id, { capital: oldRecipientUser.capital });

                // Adiciona o novo valor ao novo usuário
                newRecipientUser.capital = (newRecipientUser.capital || 0) + newDepositValue;
                await updateResource('users', newRecipientUser.id, { capital: newRecipientUser.capital });

                // Finalmente, atualiza o depósito
                updatedDeposit = await updateResource('deposits', depositId, updatedFields);
                showCustomAlert(`Depósito de ${updatedDeposit.name || updatedDeposit.email} transferido e atualizado com sucesso!`);

            } else {
                // Se o usuário do depósito NÃO MUDOU (apenas valor, nome, etc.)
                // Calcula a diferença de valor para ajustar o capital do MESMO usuário
                const valueDifference = newDepositValue - oldDepositValue;
                if (valueDifference !== 0) {
                    oldRecipientUser.capital = (oldRecipientUser.capital || 0) + valueDifference;
                    await updateResource('users', oldRecipientUser.id, { capital: oldRecipientUser.capital });
                    showCustomAlert(`Capital de ${oldRecipientUser.name} ajustado em R$ ${valueDifference.toFixed(2)}.`);
                }
                // Atualiza o depósito
                updatedDeposit = await updateResource('deposits', depositId, updatedFields);
                showCustomAlert(`Depósito de ${updatedDeposit.name || updatedDeposit.email} atualizado com sucesso!`);
            }

            await loadAndCacheAllUsers(); // Recarrega o cache de usuários
            await loadAndCacheAllDeposits(); // Recarrega o cache de depósitos
            await renderDepositsSection(); // Re-renderiza a seção de depósitos
            // Opcional: se a seção de usuários estiver visível, re-renderize-a também
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
    if (confirm(`Tem certeza que deseja deletar o depósito de ${deposit.name || deposit.email}?`)) {
        try {
            // Encontrar o usuário recebedor antes de deletar o depósito
            const recipientUser = findUserById(deposit.userId);
            if (!recipientUser) {
                showCustomAlert('Erro: Usuário recebedor do depósito não encontrado.');
                return;
            }

            // Diminuir o capital do usuário
            const depositValue = deposit.value || 0;
            recipientUser.capital = (recipientUser.capital || 0) - depositValue;
            await updateResource('users', recipientUser.id, { capital: recipientUser.capital });
            showCustomAlert(`Capital de ${recipientUser.name} diminuído em R$ ${depositValue.toFixed(2)}.`);

            // Deletar o depósito
            await deleteResource('deposits', deposit.id);
            showCustomAlert(`Depósito de ${deposit.name || deposit.email} deletado com sucesso!`);

            await loadAndCacheAllUsers(); // Recarrega o cache de usuários
            await loadAndCacheAllDeposits(); // Recarrega o cache de depósitos

            const depositCardElement = document.querySelector(`.deposit-card[data-deposit-id="${deposit.id}"]`);
            if (depositCardElement) {
                depositCardElement.remove();
            }
            // Opcional: se a seção de usuários estiver visível, re-renderize-a também
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
        // Usa o cache atualizado
        const users = allUsersCache; // Já carregado/atualizado
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
        // Usa o cache atualizado
        const deposits = allDepositsCache; // Já carregado/atualizado
        if (deposits.length === 0) {
            const noDepositsMessage = createP('Nenhum depósito realizado ainda.', 'no-deposit-message', 'animated-element');
            depositsGridContainer.append(noDepositsMessage);
        } else {
            deposits.forEach(deposit => {
                const user = findUserById(deposit.userId); // Encontra o usuário associado ao depósito
                if (user) {
                    // Passa o depósito e o usuário associado para criar o card
                    const depositCard = createDepositCardElement(deposit, user, handleEditDeposit, handleDeleteDeposit);
                    depositsGridContainer.append(depositCard);
                } else {
                    console.warn(`Usuário com ID ${deposit.userId} não encontrado para o depósito ${deposit.id}.`);
                    // Opcional: exibir um card de depósito com mensagem de erro ou ignorá-lo
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


// =========================================================================
// INICIALIZAÇÃO: CARREGA OS DADOS INICIAIS AO INICIAR A APLICAÇÃO
// =========================================================================
(async () => {
    await loadAndCacheAllUsers();
    await loadAndCacheAllDeposits();
    // Você pode chamar outras funções de renderização inicial aqui se necessário
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

    // Garante que o cache esteja atualizado antes de renderizar
    await loadAndCacheAllUsers();
    await loadAndCacheAllDeposits();

    if (currentSelection === 'users') {
        await renderUsersSection();
    } else if (currentSelection === 'deposits') {
        await renderDepositsSection();
    }
    // ADICIONE AQUI AS CONDIÇÕES PARA 'transfers' e 'loans'
    else {
        showCustomAlert('Por favor, selecione uma opção válida para exibir.');
        // Não esconde automaticamente, apenas se estiver visível
        if (transactionsContentWrapper.classList.contains('transactions-section-active')) {
            hideTransactionSection(transactionsContentWrapper);
        }
    }
});