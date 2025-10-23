// ARQUIVO: DOMtransactions.js

import { showCustomAlert } from "../app.js";
import { boxSelection, displayTransactions, trasactions } from '../entities/elements.js';

import { customEditOverlay, customEditInputs, customEditContent, containerInputs, 
btnsController, customAEditOkButton, customEditCancelButton } from '../entities/elements.js'

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
    editUser.addEventListener('click', (ev) => {
        ev.preventDefault()
        // TODO: Implementar lógica de edição

        customEditOverlay.classList.add('visible'); 
        customEditInputs.classList.add('visible');

        const subtitle = document.createElement('h3');
        subtitle.textContent = 'Insira as informações que deseja alterar, e depois clique em "Salvar informações"'
        subtitle.classList.add('subtitle-users');
        containerInputs.append(subtitle);

        const groupNewName = document.createElement('div');
        groupNewName.classList = 'group-name';
        groupNewName.classList.add('new-users');

        const labelName = document.createElement('label');
        labelName.htmlFor = 'nameUser';
        labelName.classList = 'name-label';
        labelName.textContent = 'Alterar nome do usuario:';

        const nameUserInput = document.createElement('input'); // Variável local do input
        nameUserInput.type = 'text';
        nameUserInput.id = 'newNameUser';
        nameUserInput.name = 'userName';

        groupNewName.append(labelName, nameUserInput);

        const groupNewEmail = document.createElement('div');
        groupNewEmail.classList = 'group-email';
        groupNewEmail.classList.add('new-users'); 

        const labelEmail = document.createElement('label');
        labelEmail.htmlFor = 'emailUser';
        labelEmail.classList = 'email-label';
        labelEmail.textContent = 'Alterar e-mail do usuario (precisa conter @, gmail e .com):';

        const emailUserInput = document.createElement('input'); // Variável local do input
        emailUserInput.type = 'email';
        emailUserInput.id = 'newEmailUser';
        emailUserInput.name = 'email';

        groupNewEmail.append(labelEmail, emailUserInput);

        const groupNewPassword = document.createElement('div');
        groupNewPassword.classList = 'group-password';
        groupNewPassword.classList.add('new-users'); 

        const labelPassword = document.createElement('label');
        labelPassword.htmlFor = 'passwordUser';
        labelPassword.classList = 'password-label';
        labelPassword.textContent = 'Alterar senha do usuario (deve conter numeros e letras):';

        const passwordUserInput = document.createElement('input'); // Variável local do input
        passwordUserInput.type = 'password';
        passwordUserInput.id = 'newOasswordUser';
        passwordUserInput.name = 'password';

        const togglePassword = document.createElement('img');
        togglePassword.classList.add('password-toggle-icon');
        togglePassword.id = 'togglePassword';
        togglePassword.src = '../imgs/icons8-eye-50.png'; 
        togglePassword.alt = 'Mostrar senha'; 

        //=================== BOTÃO DE MOSTRAR SENHA ===================//
        togglePassword.addEventListener('click', function () {
            const type = passwordUserInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordUserInput.setAttribute('type', type);

            // Altera a imagem src e o texto alt com base no tipo do input
            if (type === 'text') {
                this.src = '../imgs/icons8-eye-closed.png'; 
                this.alt = 'Esconder senha';
            } else {
                this.src = '../imgs/icons8-eye-50.png'; 
                this.alt = 'Mostrar senha';
            }
        });

        // ---- NOVO ----
        const inputAndIconWrapper = document.createElement('div');
        inputAndIconWrapper.classList.add('input-and-icon-wrapper'); // Adicione uma nova classe para estilização

        // Adicione o input e o ícone ao novo wrapper
        inputAndIconWrapper.append(passwordUserInput, togglePassword);

        // Agora, adicione o label e o novo wrapper ao groupNewPassword
        groupNewPassword.append(labelPassword, inputAndIconWrapper);

        containerInputs.append(groupNewName, groupNewEmail, groupNewPassword);

        customAEditOkButton.addEventListener('click', (ev) => {
            ev.preventDefault();

        })

        // Função para ocultar o alerta personalizado
        customEditCancelButton.addEventListener('click', (ev) => {
            ev.preventDefault();

            containerInputs.innerHTML = '';
            customEditOverlay.classList.remove('visible'); // Oculta o overlay
            customEditInputs.classList.remove('visible');       // Oculta a caixa de alerta
        })
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
    transfersNameSender.textContent = `Remetente: ${transfers.senderName}`;
    transfersNameSender.classList.add('transfers-card-name');

    // E-mail do remetente
    const transfersEmailSender = document.createElement('p');
    transfersEmailSender.textContent = `E-mail: ${transfers.emailSender}`;
    transfersEmailSender.classList.add('transfers-card-detail');
    
    // Valor da transferencia
    const transfersValue = document.createElement('p');
    transfersValue.textContent = `Valor da transferencia: R$ ${transfers.valueTransfer.toFixed(2)}`; // Formata para 2 casas decimais
    transfersValue.classList.add('transfers-card-value');

    // Título do cartão (nome do Remetente)
    const transfersNameRecipient = document.createElement('p');
    transfersNameRecipient.textContent = `Destinatario: ${transfers.recipientName}`;
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
        showCustomAlert(`Editar o registro de transferencia com ID: ${transfers.id}`);
        // TODO: Implementar lógica de edição
    });

    deletetransfers.addEventListener('click', async () => {
        if (confirm(`Tem certeza que deseja deletar o registro ${transfers.senderName}?`)) {
            try {
                const response = await fetch(`http://localhost:3000/transfers/${transfers.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Erro ao deletar registro: ${response.status} - ${response.statusText}`);
                }

                showCustomAlert(`Transferencia de ${transfers.senderName} para ${transfers.recipientName} deletada com sucesso!`);
                // Remove o cartão do DOM após deletar
                transfersCard.remove();
                // Opcional: recarregar a lista de usuários se necessário, ou recalcular valores
            } catch (error) {
                showCustomAlert('Erro ao deletar registro. Verifique o console.');
                console.error('Erro ao deletar registro:', error);
            }
        }
    });

    transfersActions.append(edittransfers, deletetransfers);
    transfersCard.append(transfersDate, 
        transfersNameSender, 
        transfersEmailSender, 
        transfersValue, 
        transfersNameRecipient, 
        transfersEmailRecipient, 
        transfersActions);

    return transfersCard;
}


// ========== Função para criação do card do deposito ========== //
function createCarddeposits(deposits) {
    const depositsCard = document.createElement('div');
    depositsCard.classList.add('deposits-card', 'animated-element');

    // Título do cartão (nome da conta que recebeu o deposito)
    const depositsName = document.createElement('p');
    depositsName.textContent = `Nome de quem recebeu o deposito: ${deposits.name}`;
    depositsName.classList.add('deposits-card-name');

    // E-mail de quem recebeu
    const depositsEmail = document.createElement('p');
    depositsEmail.textContent = `E-mail: ${deposits.email}`;
    depositsEmail.classList.add('deposits-card-detail');
    
    // Valor do deposito
    const depositsValue = document.createElement('p');
    depositsValue.textContent = `Valor do deposito: R$ ${deposits.value.toFixed(2)}`; // Formata para 2 casas decimais
    depositsValue.classList.add('deposits-card-value');

    // Contêiner para os botões de ação
    const depositsActions = document.createElement('div');
    depositsActions.classList.add('deposits-actions');

    const editdeposits = document.createElement('button');
    editdeposits.type = 'button';
    editdeposits.id = `editdeposits-${deposits.id}`; // ID único por usuário
    editdeposits.classList.add('action-button', 'edit-button');
    editdeposits.textContent = 'Editar';
    editdeposits.dataset.depositsId = deposits.id;

    const deletedeposits = document.createElement('button');
    deletedeposits.type = 'button';
    deletedeposits.id = `deletedeposits-${deposits.id}`; // ID único por usuário
    deletedeposits.classList.add('action-button', 'delete-button');
    deletedeposits.textContent = 'Deletar';
    deletedeposits.dataset.depositsId = deposits.id;

    // Adiciona event listeners para os botões (implementação básica por enquanto)
    editdeposits.addEventListener('click', () => {
        showCustomAlert(`Editar o registro do deposito com ID: ${deposits.id}`);
        // TODO: Implementar lógica de edição
    });

    deletedeposits.addEventListener('click', async () => {
        if (confirm(`Tem certeza que deseja deletar o registro ${deposits.name}?`)) {
            try {
                const response = await fetch(`http://localhost:3000/deposits/${deposits.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Erro ao deletar registro: ${response.status} - ${response.statusText}`);
                }

                showCustomAlert(`Deposito de ${deposits.name} deletada com sucesso!`);
                // Remove o cartão do DOM após deletar
                depositsCard.remove();
                // Opcional: recarregar a lista de usuários se necessário, ou recalcular valores
            } catch (error) {
                showCustomAlert('Erro ao deletar registro. Verifique o console.');
                console.error('Erro ao deletar registro:', error);
            }
        }
    });

    depositsActions.append(editdeposits, deletedeposits);
    depositsCard.append(depositsName, depositsEmail, depositsValue, depositsActions);

    return depositsCard;
}


// ========== Função para criação do card dos emprestimos ========== //
function createCardloans(loans) {
    const loansCard = document.createElement('div');
    loansCard.classList.add('loans-card', 'animated-element');

    // Título do cartão (nome da conta que recebeu o deposito)
    const loansDate = document.createElement('p');
    loansDate.textContent = `${loans.date}`;
    loansDate.classList.add('loans-card-date');

    // Título do cartão (nome da conta que recebeu o deposito)
    const loansName = document.createElement('p');
    loansName.textContent = `Nome do usuario que realizou o emprestimo: ${loans.name}`;
    loansName.classList.add('loans-card-name');

    // E-mail de quem recebeu
    const loansEmail = document.createElement('p');
    loansEmail.textContent = `E-mail: ${loans.email}`;
    loansEmail.classList.add('loans-card-detail');
    
    // Valor do deposito
    const loansValue = document.createElement('p');
    loansValue.textContent = `Valor total do emprestimo (sem juros): R$ ${loans.totalValue.toFixed(2)}`; // Formata para 2 casas decimais
    loansValue.classList.add('loans-card-total-value');
    
    // Valor do deposito
    const loansInstallments = document.createElement('p');
    loansInstallments.textContent = `Total de parcelas selecionadas: ${loans.installments}X`; // Formata para 2 casas decimais
    loansInstallments.classList.add('loans-card-installments');
    
    // Valor do deposito
    const loansFeePercentage = document.createElement('p');
    loansFeePercentage.textContent = `Porcentagem de juros e encargos: ${loans.rate}%`; // Formata para 2 casas decimais
    loansFeePercentage.classList.add('loans-card-rate');

    // Valor do deposito
    const loansTotalAmountToPay = document.createElement('p');
    loansTotalAmountToPay.textContent = `Valor total do emprestimo (com juros): R$ ${loans.totalAmountToPay.toFixed(2)}`; // Formata para 2 casas decimais
    loansTotalAmountToPay.classList.add('loans-card-total-value');

    // Valor do deposito
    const loansInstallmentAmount = document.createElement('p');
    loansInstallmentAmount.textContent = `Valor total de cada parcela: R$ ${loans.installmentAmount.toFixed(2)}`; // Formata para 2 casas decimais
    loansInstallmentAmount.classList.add('loans-card-installments');
    
    // Contêiner para os botões de ação
    const loansActions = document.createElement('div');
    loansActions.classList.add('loans-actions');

    const editloans = document.createElement('button');
    editloans.type = 'button';
    editloans.id = `editloans-${loans.id}`; // ID único por usuário
    editloans.classList.add('action-button', 'edit-button');
    editloans.textContent = 'Editar';
    editloans.dataset.loansId = loans.id;

    const deleteloans = document.createElement('button');
    deleteloans.type = 'button';
    deleteloans.id = `deleteloans-${loans.id}`; // ID único por usuário
    deleteloans.classList.add('action-button', 'delete-button');
    deleteloans.textContent = 'Deletar';
    deleteloans.dataset.loansId = loans.id;

    // Adiciona event listeners para os botões (implementação básica por enquanto)
    editloans.addEventListener('click', () => {
        showCustomAlert(`Editar o registro do emprestimo com ID: ${loans.id}`);
        // TODO: Implementar lógica de edição
    });

    deleteloans.addEventListener('click', async () => {
        if (confirm(`Tem certeza que deseja deletar o registro ${loans.name}?`)) {
            try {
                const response = await fetch(`http://localhost:3000/loans/${loans.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Erro ao deletar registro: ${response.status} - ${response.statusText}`);
                }

                showCustomAlert(`Deposito de ${loans.name} deletada com sucesso!`);
                // Remove o cartão do DOM após deletar
                loansCard.remove();
                // Opcional: recarregar a lista de usuários se necessário, ou recalcular valores
            } catch (error) {
                showCustomAlert('Erro ao deletar registro. Verifique o console.');
                console.error('Erro ao deletar registro:', error);
            }
        }
    });

    loansActions.append(editloans, deleteloans);
    loansCard.append(loansDate,
        loansName, 
        loansEmail, 
        loansValue,
        loansInstallments,
        loansFeePercentage,
        loansTotalAmountToPay,
        loansInstallmentAmount,
        loansActions);

    return loansCard;
}



// ============================================= FUNÇÕES DE CONTROLE ============================================= 

export const display = displayTransactions.addEventListener('click', async (ev) => {
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
        subtitle.classList.add('subtitle-transfers-transactions', 'animated-element');
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
                notransfersMessage.textContent = 'Nenhuma transferencia realizada ainda.';
                notransfersMessage.classList.add('no-transfers-message', 'animated-element');
                transfersGridContainer.append(notransfersMessage);
            } else {
                transfers.forEach(transfers => {
                    const transfersCard = createCardtransfers(transfers);
                    transfersGridContainer.append(transfersCard);
                });
            }
        } catch (error) {
            showCustomAlert('Erro ao carregar transferencias. Verifique o console.');
            console.error('Erro ao carregar transferencias:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Não foi possível carregar as transferencias. Tente novamente mais tarde.';
            errorMessage.classList.add('error-message', 'animated-element');
            transfersGridContainer.append(errorMessage);
        }

        //Adicionando o grid
        transactionsContentWrapper.append(transfersGridContainer);

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
    } else if (boxSelection.value === 'deposits') { // DISPLAY DEPOSITS
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
        subtitle.classList.add('subtitle-deposits-transactions', 'animated-element');
        subtitle.textContent = 'Gerenciamento dos Depositos'; // Pequeno ajuste no texto para clareza
        transactionsContentWrapper.append(subtitle);

        //==== grid ====//
        const depositsGridContainer = document.createElement('div');
        depositsGridContainer.classList.add('deposits-grid-container', 'animated-element'); // Contêiner para o grid

        try {
            // CORREÇÃO PRINCIPAL: URL correta para o fetch
            const response = await fetch(`http://localhost:3000/deposits`);

            if (!response.ok) {
                throw new Error(`Erro ao buscar depositos: ${response.status} - ${response.statusText}`);
            }

            const deposits = await response.json();

            if (deposits.length === 0) {
                const nodepositsMessage = document.createElement('p');
                nodepositsMessage.textContent = 'Nenhum deposito realizado ainda.';
                nodepositsMessage.classList.add('no-deposits-message', 'animated-element');
                depositsGridContainer.append(nodepositsMessage);
            } else {
                deposits.forEach(deposits => {
                    const depositsCard = createCarddeposits(deposits);
                    depositsGridContainer.append(depositsCard);
                });
            }
        } catch (error) {
            showCustomAlert('Erro ao carregar depositos. Verifique o console.');
            console.error('Erro ao carregar depositos:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Não foi possível carregar os depositos. Tente novamente mais tarde.';
            errorMessage.classList.add('error-message', 'animated-element');
            depositsGridContainer.append(errorMessage);
        }

        //Adicionando o grid
        transactionsContentWrapper.append(depositsGridContainer);

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
    } else if (boxSelection.value === 'loans') { // DISPLAY TRANSFERS
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
        subtitle.classList.add('subtitle-loans-transactions', 'animated-element');
        subtitle.textContent = 'Gerenciamento dos Depositos'; // Pequeno ajuste no texto para clareza
        transactionsContentWrapper.append(subtitle);

        //==== grid ====//
        const loansGridContainer = document.createElement('div');
        loansGridContainer.classList.add('loans-grid-container', 'animated-element'); // Contêiner para o grid

        try {
            // CORREÇÃO PRINCIPAL: URL correta para o fetch
            const response = await fetch(`http://localhost:3000/loans`);

            if (!response.ok) {
                throw new Error(`Erro ao buscar emprestimos: ${response.status} - ${response.statusText}`);
            }

            const loans = await response.json();

            if (loans.length === 0) {
                const noloansMessage = document.createElement('p');
                noloansMessage.textContent = 'Nenhum emprestimo realizado ainda.';
                noloansMessage.classList.add('no-loans-message', 'animated-element');
                loansGridContainer.append(noloansMessage);
            } else {
                loans.forEach(loans => {
                    const loansCard = createCardloans(loans);
                    loansGridContainer.append(loansCard);
                });
            }
        } catch (error) {
            showCustomAlert('Erro ao carregar emprestimos. Verifique o console.');
            console.error('Erro ao carregar emprestimos:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Não foi possível carregar os emprestimos. Tente novamente mais tarde.';
            errorMessage.classList.add('error-message', 'animated-element');
            loansGridContainer.append(errorMessage);
        }

        //Adicionando o grid
        transactionsContentWrapper.append(loansGridContainer);

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