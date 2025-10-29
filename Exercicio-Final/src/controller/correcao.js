// =========================================================================
// LISTENER PRINCIPAL DO BOTÃO "EXIBIR TRANSAÇÕES"
// (este é o "display" que você exporta para o app.js)
// =========================================================================

export const displayUser = displayTransactions.addEventListener('click', async (ev) => {
    ev.preventDefault();

    let transactionsContentWrapper = trasactions.querySelector('#transactionsContentWrapper');
    if (!transactionsContentWrapper) {
        transactionsContentWrapper = document.createElement('section');
        transactionsContentWrapper.id = 'transactionsContentWrapper';
        transactionsContentWrapper.classList.add('transactions-content-section');
        trasactions.append(transactionsContentWrapper);
    }

    const currentSelection = boxSelection.value;
    
    // Se a MESMA opção já está ativa, o clique serve para esconder (toggle)
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

    if (currentSelection === 'users') {
        await renderUsersSection();
    } 
    // AGORA VOCÊ FARIA O MESMO PARA AS OUTRAS OPÇÕES:
    // else if (currentSelection === 'transfers') {
    //     await renderTransfersSection();
    // } 
    // else if (currentSelection === 'deposits') {
    //     await renderDepositsSection();
    // } 
    // else if (currentSelection === 'loans') {
    //     await renderLoansSection();
    // } 
    else {
        showCustomAlert('Por favor, selecione uma opção válida para exibir.');
        // Garante que a seção seja escondida se a opção não for válida
        if (transactionsContentWrapper) hideTransactionSection(transactionsContentWrapper);
    }
});

// A função hideTransactionSection que estava aqui, foi movida para domUtils.js
// As funções createCardtransfers, createCarddeposits, createCardloans
// também precisarão ser movidas para seus próprios arquivos em components/cards/


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

if (boxSelection.value === 'transfers') { // DISPLAY TRANSFERS
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