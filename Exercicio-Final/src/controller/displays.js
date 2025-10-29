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


// =========================================================================
// LÓGICA DE MANIPULAÇÃO DE AÇÕES (Editar e Deletar)
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







// ============================================= FUNÇÕES DE CONTROLE ============================================= 

export const display = displayTransactions.addEventListener('click', async (ev) => {
    if (boxSelection.value === 'transfers') {
        // =========================================================================
    // FUNÇÃO PRINCIPAL PARA RENDERIZAR A SEÇÃO DE USUÁRIOS
    // =========================================================================
        let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');

        // Se o wrapper não existe, cria ele (como você já fazia)
        if (!transactionsContentWrapper) {
            transactionsContentWrapper = document.createElement('section');
            transactionsContentWrapper.id = 'transactionsContentWrapper';
            transactionsContentWrapper.classList.add('transactions-content-section');
            trasactions.append(transactionsContentWrapper);
        }

        transactionsContentWrapper.innerHTML = ''; // Limpa o conteúdo anterior
        transactionsContentWrapper.classList.remove('transactions-section-active'); // Remove para adicionar novamente com animação

        // Título da seção (usando a utilitária createH)
        const subtitle = createH(2, 'Gerenciamento dos Usuários', 'subtitle-users-transactions', 'animated-element');
        transactionsContentWrapper.append(subtitle);

        // Contêiner para o grid de usuários (usando a utilitária createDiv)
        const usersGridContainer = createDiv('users-grid-container', 'animated-element');

        try {
            // Busca os usuários usando a função especializada da API
            const users = await fetchData('users');

            if (users.length === 0) {
                const noUsersMessage = createP('Nenhum usuário cadastrado ainda.', 'no-users-message', 'animated-element');
                usersGridContainer.append(noUsersMessage);
            } else {
                users.forEach(user => {
                    // Cria o card de usuário usando a função especializada
                    // e passa as funções de editar e deletar como callbacks
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

        // Contêiner para os botões da seção (usando a utilitária createDiv)
        const buttonsContainer = createDiv('btns-transactions-group', 'animated-element');
        const collectSectionButton = createButton('Recolher Seção', 'collectSectionTransactions', 'animated-element');
        buttonsContainer.append(collectSectionButton);
        transactionsContentWrapper.append(buttonsContainer);

        // LÓGICA DA ANIMAÇÃO DE APARECER
        requestAnimationFrame(() => {
            transactionsContentWrapper.classList.add('transactions-section-active');
        });

        // Listener para o botão de recolher (usando a utilitária hideTransactionSection)
        collectSectionButton.addEventListener('click', (e) => {
            e.preventDefault();
            hideTransactionSection(transactionsContentWrapper);
        });
    }
})