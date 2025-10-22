// ARQUIVO: DOMtransactions.js

import { showCustomAlert } from "../app.js";
import { boxSelection, displayTransactions, trasactions } from '../entities/elements.js';

// Função para esconder e remover a seção de transações (exibição de usuários)
function hideTransactionSection(wrapperElement) {

    if (!wrapperElement || !wrapperElement.classList.contains('transactions-section-active')) {
        return;
    }
    // CORRIGIDO 1: Remover a classe correta
    wrapperElement.classList.remove('transactions-section-active');
    // CORRIGIDO 2: Usar o seletor correto para o último elemento animado
    const lastAnimatedElement = wrapperElement.querySelector('.btns-transactions-group');

    if (!lastAnimatedElement) {
        setTimeout(() => { wrapperElement.innerHTML = ''; }, 600);
        return;
    }

    lastAnimatedElement.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'max-height' || e.propertyName === 'opacity') {
            wrapperElement.innerHTML = '';
            lastAnimatedElement.removeEventListener('transitionend', handler);
        }
    },
    { once: true });
}

// ========== Função para criação do card do usuario ========== //
function createCardUser(user) {
    const userCard = document.createElement('div');
    userCard.classList.add('user-card', 'animated-element');

    // Título do cartão (nome do usuário)
    const userName = document.createElement('h3');
    userName.textContent = user.name;
    userName.classList.add('user-card-name');

    // E-mail do usuário
    const userEmail = document.createElement('p');
    userEmail.textContent = `E-mail: ${user.email}`;
    userEmail.classList.add('user-card-detail');

    // Capital do usuário
    const userCapital = document.createElement('p');
    userCapital.textContent = `Capital: R$ ${user.capital.toFixed(2)}`; // Formata para 2 casas decimais
    userCapital.classList.add('user-card-detail');

    // Contêiner para os botões de ação
    const userActions = document.createElement('div');
    userActions.classList.add('user-actions');

    const editUser = document.createElement('button');
    editUser.type = 'button';
    editUser.id = `editUser-${user.id}`; // ID único por usuário
    editUser.classList.add('action-button', 'edit-button');
    editUser.textContent = 'Editar';
    editUser.dataset.userId = user.id;

    const deleteUser = document.createElement('button');
    deleteUser.type = 'button';
    deleteUser.id = `deleteUser-${user.id}`; // ID único por usuário
    deleteUser.classList.add('action-button', 'delete-button');
    deleteUser.textContent = 'Deletar';
    deleteUser.dataset.userId = user.id;

    // Adiciona event listeners para os botões (implementação básica por enquanto)
    editUser.addEventListener('click', () => {
        showCustomAlert(`Editar usuário com ID: ${user.id}`);
        // TODO: Implementar lógica de edição
    });

    deleteUser.addEventListener('click', async () => {
        if (confirm(`Tem certeza que deseja deletar o usuário ${user.name}?`)) {
            try {
                const response = await fetch(`http://localhost:3000/users/${user.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Erro ao deletar usuário: ${response.status} - ${response.statusText}`);
                }

                showCustomAlert(`Usuário ${user.name} deletado com sucesso!`);
                // Remove o cartão do DOM após deletar
                userCard.remove();
                // Opcional: recarregar a lista de usuários se necessário, ou recalcular valores
            } catch (error) {
                showCustomAlert('Erro ao deletar usuário. Verifique o console.');
                console.error('Erro ao deletar usuário:', error);
            }
        }
    });

    userActions.append(editUser, deleteUser);
    userCard.append(userName, userEmail, userCapital, userActions);

    return userCard;
}


// ========== Função para criação do card do transferencia ========== //
function createCardtransfers(transfers) {
    const transfersCard = document.createElement('div');
    transfersCard.classList.add('transfers-card', 'animated-element');

    // Título do cartão (nome do usuário)
    const transfersDate = document.createElement('p');
    transfersDate.textContent = transfers.date;
    transfersDate.classList.add('transfers-card-date');

    // Título do cartão (nome do Remetente)
    const transfersNameSender = document.createElement('p');
    transfersNameSender.textContent = `Nome do remetente: ${transfers.senderName}`;
    transfersNameSender.classList.add('transfers-card-name');

    // E-mail do remetente
    const transfersEmailSender = document.createElement('p');
    transfersEmailSender.textContent = `E-mail: ${transfers.emailSender}`;
    transfersEmailSender.classList.add('transfers-card-detail');
    
    // Valor da transferencia
    const transfersValue = document.createElement('p');
    transfersValue.textContent = `Capital: R$ ${transfers.valueTransfer.toFixed(2)}`; // Formata para 2 casas decimais
    transfersValue.classList.add('transfers-card-value');

    // Título do cartão (nome do Remetente)
    const transfersNameRecipient = document.createElement('p');
    transfersNameRecipient.textContent = `Nome do destinatario: ${transfers.recipientName}`;
    transfersNameRecipient.classList.add('transfers-card-name');

    // E-mail do remetente
    const transfersEmailRecipient = document.createElement('p');
    transfersEmailRecipient.textContent = `E-mail: ${transfers.emailRecipient}`;
    transfersEmailRecipient.classList.add('transfers-card-detail');

    // Contêiner para os botões de ação
    const transfersActions = document.createElement('div');
    transfersActions.classList.add('transfers-actions');

    const edittransfers = document.createElement('button');
    edittransfers.type = 'button';
    edittransfers.id = `edittransfers-${transfers.id}`; // ID único por usuário
    edittransfers.classList.add('action-button', 'edit-button');
    edittransfers.textContent = 'Editar';
    edittransfers.dataset.transfersId = transfers.id;

    const deletetransfers = document.createElement('button');
    deletetransfers.type = 'button';
    deletetransfers.id = `deletetransfers-${transfers.id}`; // ID único por usuário
    deletetransfers.classList.add('action-button', 'delete-button');
    deletetransfers.textContent = 'Deletar';
    deletetransfers.dataset.transfersId = transfers.id;

    // Adiciona event listeners para os botões (implementação básica por enquanto)
    edittransfers.addEventListener('click', () => {
        showCustomAlert(`Editar usuário com ID: ${transfers.id}`);
        // TODO: Implementar lógica de edição
    });

    deletetransfers.addEventListener('click', async () => {
        if (confirm(`Tem certeza que deseja deletar o usuário ${transfers.name}?`)) {
            try {
                const response = await fetch(`http://localhost:3000/users/${transfers.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Erro ao deletar usuário: ${response.status} - ${response.statusText}`);
                }

                showCustomAlert(`Transferencia de ${transfers.senderName} para ${transfers.recipientName} deletada com sucesso!`);
                // Remove o cartão do DOM após deletar
                transfersCard.remove();
                // Opcional: recarregar a lista de usuários se necessário, ou recalcular valores
            } catch (error) {
                showCustomAlert('Erro ao deletar usuário. Verifique o console.');
                console.error('Erro ao deletar usuário:', error);
            }
        }
    });

    transfersActions.append(editUser, deleteUser);
    transfersCard.append(userName, userEmail, userCapital, userActions);

    return transfersCard;
}

//PAREI AQUI ---------------------------------------------------------
export const usersArea = displayTransactions.addEventListener('click', async (ev) => {
    if (boxSelection.value === 'users') { //DISPLAY USERS
        ev.preventDefault();

        let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');

        // Se já existe e está ativo, o botão funciona como um toggle para esconder
        if (transactionsContentWrapper && transactionsContentWrapper.classList.contains('transactions-section-active')) {
            hideTransactionSection(transactionsContentWrapper);
            return;
        }

        if (!transactionsContentWrapper) {
            transactionsContentWrapper = document.createElement('section');
            transactionsContentWrapper.id = 'transactionsContentWrapper';
            transactionsContentWrapper.classList.add('transactions-content-section'); // Usar add para não sobrescrever
            trasactions.append(transactionsContentWrapper);
        }

        transactionsContentWrapper.innerHTML = '';
        transactionsContentWrapper.classList.remove('transactions-section-active');

        // ===== CRIAÇÃO DOS ELEMENTOS ===== //
        const subtitle = document.createElement('h2');
        subtitle.classList.add('subtitle-users-transactions', 'animated-element');
        subtitle.textContent = 'Gerenciamento dos Usuários'; // Pequeno ajuste no texto para clareza
        transactionsContentWrapper.append(subtitle);

        //==== grid ====//
        const usersGridContainer = document.createElement('div');
        usersGridContainer.classList.add('users-grid-container', 'animated-element'); // Contêiner para o grid

        try {
            // CORREÇÃO PRINCIPAL: URL correta para o fetch
            const response = await fetch(`http://localhost:3000/users`);

            if (!response.ok) {
                throw new Error(`Erro ao buscar usuários: ${response.status} - ${response.statusText}`);
            }

            const users = await response.json();

            if (users.length === 0) {
                const noUsersMessage = document.createElement('p');
                noUsersMessage.textContent = 'Nenhum usuário cadastrado ainda.';
                noUsersMessage.classList.add('no-users-message', 'animated-element');
                usersGridContainer.append(noUsersMessage);
            } else {
                users.forEach(user => {
                    const userCard = createCardUser(user);
                    usersGridContainer.append(userCard);
                });
            }
        } catch (error) {
            showCustomAlert('Erro ao carregar usuários. Verifique o console.');
            console.error('Erro ao carregar usuários:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Não foi possível carregar os usuários. Tente novamente mais tarde.';
            errorMessage.classList.add('error-message', 'animated-element');
            usersGridContainer.append(errorMessage);
        }

        //Adicionando o grid
        transactionsContentWrapper.append(usersGridContainer);

        //Contêiner para os botões desta seção (para manter a animação)
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('btns-transactions-group', 'animated-element');

        //Botão para recolher a seção
        const collectSectionButton = document.createElement('button');
        collectSectionButton.type = 'button';
        // CORRIGIDO 4: ID único para este botão de recolher
        collectSectionButton.id = 'collectSectionTransactions';
        collectSectionButton.textContent = 'Recolher Seção';
        collectSectionButton.classList.add('animated-element');

        buttonsContainer.append(collectSectionButton);
        transactionsContentWrapper.append(buttonsContainer);


        // --- LÓGICA DA ANIMAÇÃO DE APARECER ---
        requestAnimationFrame(() => {
            // CORRIGIDO 3: Usar a variável correta para o wrapper
            transactionsContentWrapper.classList.add('transactions-section-active');
        });

        // Listener para o botão de recolher
        collectSectionButton.addEventListener('click', (e) => {
            e.preventDefault();
            hideTransactionSection(transactionsContentWrapper);
        });
    } else if (boxSelection.value === 'transfers') { // DISPLAY TRANSFERS
        ev.preventDefault();

        let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');

        // Se já existe e está ativo, o botão funciona como um toggle para esconder
        if (transactionsContentWrapper && transactionsContentWrapper.classList.contains('transactions-section-active')) {
            hideTransactionSection(transactionsContentWrapper);
            return;
        }

        if (!transactionsContentWrapper) {
            transactionsContentWrapper = document.createElement('section');
            transactionsContentWrapper.id = 'transactionsContentWrapper';
            transactionsContentWrapper.classList.add('transactions-content-section'); // Usar add para não sobrescrever
            trasactions.append(transactionsContentWrapper);
        }

        transactionsContentWrapper.innerHTML = '';
        transactionsContentWrapper.classList.remove('transactions-section-active');

        // ===== CRIAÇÃO DOS ELEMENTOS ===== //
        const subtitle = document.createElement('h2');
        subtitle.classList.add('subtitle-users-transactions', 'animated-element');
        subtitle.textContent = 'Gerenciamento dos Transferencias'; // Pequeno ajuste no texto para clareza
        transactionsContentWrapper.append(subtitle);

        //==== grid ====//
        const transfersGridContainer = document.createElement('div');
        transfersGridContainer.classList.add('trasnfer-grid-container', 'animated-element'); // Contêiner para o grid

        try {
            // CORREÇÃO PRINCIPAL: URL correta para o fetch
            const response = await fetch(`http://localhost:3000/transfers`);

            if (!response.ok) {
                throw new Error(`Erro ao buscar transferencias: ${response.status} - ${response.statusText}`);
            }

            const transfers = await response.json();

            if (transfers.length === 0) {
                const notransfersMessage = document.createElement('p');
                notransfersMessage.textContent = 'Nenhum usuário cadastrado ainda.';
                notransfersMessage.classList.add('no-transfers-message', 'animated-element');
                transfersGridContainer.append(notransfersMessage);
            } else {
                users.forEach(transfers => {
                    const transfersCard = createCardtransfers(transfers);
                    transfersGridContainer.append(transfersCard);
                });
            }
        } catch (error) {
            showCustomAlert('Erro ao carregar usuários. Verifique o console.');
            console.error('Erro ao carregar usuários:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Não foi possível carregar os usuários. Tente novamente mais tarde.';
            errorMessage.classList.add('error-message', 'animated-element');
            usersGridContainer.append(errorMessage);
        }

        //Adicionando o grid
        transactionsContentWrapper.append(usersGridContainer);

        //Contêiner para os botões desta seção (para manter a animação)
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('btns-transactions-group', 'animated-element');

        //Botão para recolher a seção
        const collectSectionButton = document.createElement('button');
        collectSectionButton.type = 'button';
        // CORRIGIDO 4: ID único para este botão de recolher
        collectSectionButton.id = 'collectSectionTransactions';
        collectSectionButton.textContent = 'Recolher Seção';
        collectSectionButton.classList.add('animated-element');

        buttonsContainer.append(collectSectionButton);
        transactionsContentWrapper.append(buttonsContainer);


        // --- LÓGICA DA ANIMAÇÃO DE APARECER ---
        requestAnimationFrame(() => {
            // CORRIGIDO 3: Usar a variável correta para o wrapper
            transactionsContentWrapper.classList.add('transactions-section-active');
        });

        // Listener para o botão de recolher
        collectSectionButton.addEventListener('click', (e) => {
            e.preventDefault();
            hideTransactionSection(transactionsContentWrapper);
        });
    }
});