// DOMtransfers.js

import { displayTransfersArea, transfersSct } from "./elements.js";
import { Transfer } from "../controller/Transfer.js";
import { showCustomAlert, updateBankTotalDisplay } from "../app.js";

// Importa funções do utils.js
import { findUserByEmail, loadAndCacheAllUsers, loadAndCacheAllTransfers } from "../../services/utils/utils.js";

// Regex para validação de email (mantida localmente como no seu arquivo)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;

// ========================= FUNÇÃO PARA BUSCAR USUÁRIO POR E-MAIL ========================= //
// ESTA FUNÇÃO FOI REMOVIDA DAQUI, POIS AGORA IMPORTAMOS findUserByEmail do utils.js


// Função para esconder e remover a seção de transferência (MANTIDA EXATAMENTE COMO VOCÊ TEM)
function hideTransferSection(wrapperElement) {
    if (!wrapperElement || !wrapperElement.classList.contains('transfer-section-active')) {
        return;
    }
    wrapperElement.classList.remove('transfer-section-active');
    const lastAnimatedElement = wrapperElement.querySelector('.btns-transfer-group');

    if (!lastAnimatedElement) {
        setTimeout(() => { wrapperElement.innerHTML = ''; }, 600);
        return;
    }

    lastAnimatedElement.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'max-height' || e.propertyName === 'opacity') {
            wrapperElement.innerHTML = '';
            lastAnimatedElement.removeEventListener('transitionend', handler);
        }
    }, { once: true });
}

// ========================= EVENT LISTENERS DA ÁREA DE LOANS ========================= //
export const trasnferArea = displayTransfersArea.addEventListener('click', (ev) => {
   ev.preventDefault();

    let transferContentWrapper = transfersSct.querySelector('#transferContentWrapper');

    // MANTIDO: Sua lógica de verificação para toggle
    if (transferContentWrapper && transferContentWrapper.classList.contains('transfer-section-active')) {
        console.log('Seção de transferência já está visível ou sendo animada.');
        hideTransferSection(transferContentWrapper); // Recolhe se já estiver ativa
        return;
    }
    // MANTIDO: Sua verificação de innerHTML para o caso de estar vazia mas ainda ativa (com a classe)
    if (transferContentWrapper && transferContentWrapper.innerHTML !== '') {
        console.log('Seção de transferência já está visível ou sendo animada.');
        return;
    }


    if (!transferContentWrapper) {
        transferContentWrapper = document.createElement('form');
        transferContentWrapper.id = 'transferContentWrapper';
        transferContentWrapper.method = 'POST';
        transferContentWrapper.action = 'http://localhost:3000/transfers'
        transfersSct.append(transferContentWrapper);
    }

    transferContentWrapper.innerHTML = '';
    transferContentWrapper.classList.remove('transfer-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS --- //

    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-transfer', 'animated-element');
    subtitle.textContent = 'Insira as informações para a transferência.';

    const dateGroup = document.createElement('div');
    dateGroup.className = 'date-group';
    dateGroup.classList.add('animated-element');

    const labelDate = document.createElement('label');
    labelDate.htmlFor = 'dateTransfer';
    labelDate.classList = 'date-label'; // MANTIDO
    labelDate.textContent = 'Escolha uma data para programar a transferência, ou transfira hoje mesmo clicando no botão "transferir hoje".';

    const groupDateBtns = document.createElement('div');
    groupDateBtns.classList = 'group-date-btns'; // MANTIDO

    const dateTransferInput = document.createElement('input');
    dateTransferInput.type = 'date';
    dateTransferInput.required = true;
    dateTransferInput.id = 'dateTransfer';
    dateTransferInput.name = 'date';

    const todayDateButton = document.createElement('button');
    todayDateButton.id = 'btnTransferToday';
    todayDateButton.textContent = 'Transferir Hoje';
    todayDateButton.type = 'button';

    groupDateBtns.append(dateTransferInput, todayDateButton);
    dateGroup.append(labelDate, groupDateBtns);

    const senderGroup = document.createElement('div');
    senderGroup.className = 'sender-group';
    senderGroup.classList.add('animated-element');

    const labelNameSender = document.createElement('label');
    labelNameSender.htmlFor = 'nameSender';
    labelNameSender.classList = 'name-sender'; // MANTIDO
    labelNameSender.textContent = 'Nome da conta que ENVIARÁ o dinheiro, o remetente (nome do úsuario).';

    const nameSenderInput = document.createElement('input');
    nameSenderInput.type = 'text';
    nameSenderInput.id = 'nameSender';
    nameSenderInput.required = true;
    nameSenderInput.name = 'senderName';
    nameSenderInput.readOnly = true; // ADICIONADO: Preenchimento automático
    nameSenderInput.placeholder = 'Preenchido automaticamente ao inserir o e-mail';


    const labelEmailSender = document.createElement('label');
    labelEmailSender.htmlFor = 'emailSender';
    labelEmailSender.classList = 'email-transfer-label'; // MANTIDO
    labelEmailSender.textContent = 'Informe o e-mail de quem esta enviando, esse e-mail serve apenas como identificador (precisa conter @, gmail e .com).';

    const emailSenderInput = document.createElement('input');
    emailSenderInput.type = 'email';
    emailSenderInput.id = 'emailSender';
    emailSenderInput.required = true;
    emailSenderInput.name = 'emailSender';

    const labelValueTransfer = document.createElement('label');
    labelValueTransfer.htmlFor = 'valueTransfer';
    labelValueTransfer.classList = 'value-transfer-label'; // MANTIDO
    labelValueTransfer.textContent = 'Informe o valor a ser transferido.';

    const valueTransferInput = document.createElement('input');
    valueTransferInput.type = 'number';
    valueTransferInput.id = 'valueTransfer';
    valueTransferInput.required = true;
    valueTransferInput.name = 'value'; // Mudado para 'value' para consistência com Transfer.js
    valueTransferInput.min = '0.01';
    valueTransferInput.step = 'any';

    senderGroup.append(labelNameSender, nameSenderInput, labelEmailSender, emailSenderInput, labelValueTransfer, valueTransferInput);

    const recipientGroup = document.createElement('div');
    recipientGroup.className = 'recipient-group';
    recipientGroup.classList.add('animated-element');

    const labelNameRecipient = document.createElement('label');
    labelNameRecipient.htmlFor = 'nameRecipient';
    labelNameRecipient.classList = 'name-recipient'; // MANTIDO
    labelNameRecipient.textContent = 'Nome da conta que RECEBERÁ o dinheiro, o destinatário (nome do úsuario).';

    const nameRecipientInput = document.createElement('input');
    nameRecipientInput.type = 'text';
    nameRecipientInput.id = 'nameRecipient';
    nameRecipientInput.required = true;
    nameRecipientInput.name = 'recipientName';
    nameRecipientInput.readOnly = true; // ADICIONADO: Preenchimento automático
    nameRecipientInput.placeholder = 'Preenchido automaticamente ao inserir o e-mail';


    const labelEmailRecipient = document.createElement('label');
    labelEmailRecipient.htmlFor = 'emailRecipient';
    labelEmailRecipient.classList = 'email-transfer-label'; // MANTIDO
    labelEmailRecipient.textContent = 'Informe o e-mail de quem esta recebendo, esse e-mail serve apenas como identificador (precisa conter @, gmail e .com).';

    const emailRecipientInput = document.createElement('input');
    emailRecipientInput.type = 'email';
    emailRecipientInput.id = 'emailRecipient';
    emailRecipientInput.required = true;
    emailRecipientInput.name = 'emailRecipient';

    recipientGroup.append(labelNameRecipient, nameRecipientInput, labelEmailRecipient, emailRecipientInput);

    const buttonsTransfer = document.createElement('div');
    buttonsTransfer.className = 'btns-transfer-group';
    buttonsTransfer.classList.add('animated-element');

    const executeTransferButton = document.createElement('button');
    executeTransferButton.id = 'executeTransfer';
    executeTransferButton.textContent = 'Realizar Transferência';
    executeTransferButton.type = 'submit';

    const collectSectionButton = document.createElement('button');
    collectSectionButton.id = 'collectSection';
    collectSectionButton.textContent = 'Recolher Seção';
    collectSectionButton.type = 'button';

    buttonsTransfer.append(executeTransferButton, collectSectionButton);

    transferContentWrapper.append(subtitle, dateGroup, senderGroup, recipientGroup, buttonsTransfer);

    requestAnimationFrame(() => {
        transferContentWrapper.classList.add('transfer-section-active'); // MANTIDO
    });

    // --- AGORA, EVENT LISTENERS AQUI, APÓS A CRIAÇÃO DOS ELEMENTOS ---

    // Listener para preencher o nome do remetente automaticamente
    emailSenderInput.addEventListener('blur', async () => {
        const emailValue = emailSenderInput.value.trim();
        if (emailValue) {
            await loadAndCacheAllUsers(); // Garante que o cache de usuários está atualizado
            const user = findUserByEmail(emailValue);
            if (user) {
                nameSenderInput.value = user.name;
                nameSenderInput.classList.remove('error');
            } else {
                nameSenderInput.value = '';
                showCustomAlert(`O e-mail "${emailValue}" do remetente não está cadastrado.`);
                emailSenderInput.classList.add('error');
                emailSenderInput.focus();
                setTimeout(() => emailSenderInput.classList.remove('error'), 2200);
            }
        } else {
            nameSenderInput.value = '';
        }
    });

    // Listener para preencher o nome do destinatário automaticamente
    emailRecipientInput.addEventListener('blur', async () => {
        const emailValue = emailRecipientInput.value.trim();
        if (emailValue) {
            await loadAndCacheAllUsers(); // Garante que o cache de usuários está atualizado
            const user = findUserByEmail(emailValue);
            if (user) {
                nameRecipientInput.value = user.name;
                nameRecipientInput.classList.remove('error');
            } else {
                nameRecipientInput.value = '';
                showCustomAlert(`O e-mail "${emailValue}" do destinatário não está cadastrado.`);
                emailRecipientInput.classList.add('error');
                emailRecipientInput.focus();
                setTimeout(() => emailRecipientInput.classList.remove('error'), 2200);
            }
        } else {
            nameRecipientInput.value = '';
        }
    });


    todayDateButton.addEventListener('click', (ev) => {
        ev.preventDefault();
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        dateTransferInput.value = `${year}-${month}-${day}`;
    });

    executeTransferButton.addEventListener('click', async (ev) => {
        ev.preventDefault();

        const dateString = dateTransferInput.value.trim();
        const emailSender = emailSenderInput.value.trim();
        const valueTransfer = parseFloat(valueTransferInput.value);
        const emailRecipient = emailRecipientInput.value.trim();

        let firstErrorInput = null;

        // 2. Validação de campos vazios (já usando 'required' nos inputs, mas é bom ter uma camada JS)
        if (!dateString) { showCustomAlert('Por favor, selecione a data da transferência.'); firstErrorInput = dateTransferInput; }
        else if (!emailSender) { showCustomAlert('Por favor, informe o e-mail do remetente.'); firstErrorInput = emailSenderInput; }
        else if (isNaN(valueTransfer) || valueTransfer <= 0) { 
            showCustomAlert('Por favor, informe um valor de transferência válido e positivo.'); 
            firstErrorInput = valueTransferInput; 
        }
        else if (!emailRecipient) { showCustomAlert('Por favor, informe o e-mail do destinatário.'); firstErrorInput = emailRecipientInput; }

        if (firstErrorInput) {
            firstErrorInput.classList.add('error');
            firstErrorInput.focus();
            setTimeout(() => firstErrorInput.classList.remove('error'), 2200);
            return;
        }

        // 3. Validação de formato de e-mail (usando Regex)
        if (!emailRegex.test(emailSender)) { showCustomAlert('O e-mail do remetente não tem um formato válido.'); firstErrorInput = emailSenderInput; }
        else if (!emailRegex.test(emailRecipient)) { showCustomAlert('O e-mail do destinatário não tem um formato válido.'); firstErrorInput = emailRecipientInput; }

        if (firstErrorInput) {
            firstErrorInput.classList.add('error');
            firstErrorInput.focus();
            setTimeout(() => firstErrorInput.classList.remove('error'), 2200);
            return;
        }

        // 4. Validação da data (Data válida e não menor que hoje)
        const selectedDate = new Date(dateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
            showCustomAlert('A data inserida não é válida. Por favor, selecione uma data real.');
            dateTransferInput.classList.add('error');
            dateTransferInput.focus();
            setTimeout(() => dateTransferInput.classList.remove('error'), 2200);
            return;
        }
        if (selectedDate.getTime() < today.getTime()) {
            showCustomAlert('A data da transferência não pode ser menor que a data de hoje. Por favor, selecione uma data futura ou a data de hoje.');
            dateTransferInput.classList.add('error');
            dateTransferInput.focus();
            setTimeout(() => dateTransferInput.classList.remove('error'), 2200);
            return;
        }

        // 5. Validação de que remetente e destinatário não são a mesma pessoa
        if (emailSender === emailRecipient) {
            showCustomAlert('O remetente e o destinatário não podem ser o mesmo usuário.');
            emailSenderInput.classList.add('error');
            emailSenderInput.focus();
            emailRecipientInput.classList.add('error');
            setTimeout(() => { emailSenderInput.classList.remove('error'); emailRecipientInput.classList.remove('error'); }, 2200);
            return;
        }
        
        // 6. Verificação de existência dos usuários e saldo (operação assíncrona)
        try {
            await loadAndCacheAllUsers();
            await loadAndCacheAllUsers(); // Garante que o cache de usuários está atualizado

            const senderUser = findUserByEmail(emailSender);
            const recipientUser = findUserByEmail(emailRecipient);

            if (!senderUser) {
                showCustomAlert(`Remetente com e-mail "${emailSender}" não encontrado. Por favor, verifique.`);
                emailSenderInput.classList.add('error');
                emailSenderInput.focus();
                setTimeout(() => emailSenderInput.classList.remove('error'), 2200);
                return;
            }

            if (!recipientUser) {
                showCustomAlert(`Destinatário com e-mail "${emailRecipient}" não encontrado. Por favor, verifique.`);
                emailRecipientInput.classList.add('error');
                emailRecipientInput.focus();
                setTimeout(() => emailRecipientInput.classList.remove('error'), 2200);
                return;
            }

            if (senderUser.capital < valueTransfer) {
                showCustomAlert(`Saldo insuficiente para ${senderUser.name}. Capital atual: R$ ${senderUser.capital.toFixed(2)}.`);
                valueTransferInput.classList.add('error');
                valueTransferInput.focus();
                setTimeout(() => valueTransferInput.classList.remove('error'), 2200);
                return;
            }

            // =========================================================================
            // Se chegamos aqui, todas as validações básicas e de existência/saldo passaram!
            // Agora, vamos realizar a transação:
            // 1. Atualizar o capital do remetente.
            // 2. Atualizar o capital do destinatário.
            // 3. Registrar a transferência.

            const newSenderCapital = senderUser.capital - valueTransfer;
            const newRecipientCapital = (recipientUser.capital || 0) + valueTransfer;

            // Atualiza o capital do remetente
            await fetch(`http://localhost:3000/users/${senderUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ capital: newSenderCapital })
            });

            // Atualiza o capital do destinatário
            await fetch(`http://localhost:3000/users/${recipientUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ capital: newRecipientCapital })
            });

            // Cria a transferência (somente após as atualizações de saldo)
            // Passa a data string, e os IDs dos usuários
            const newTransfer = new Transfer(
                dateString,
                senderUser.id,
                recipientUser.id,
                valueTransfer
            );

            await newTransfer.makeTransfer(); // Este método agora só faz o POST da transferência
            showCustomAlert('Transferência realizada com sucesso! 🎉'); // Feedback de sucesso final

            // Limpa os campos após a transferência bem-sucedida e atualizações
            dateTransferInput.value = '';
            nameSenderInput.value = ''; // Nome é readonly, mas esvaziar é bom
            emailSenderInput.value = '';
            valueTransferInput.value = '';
            nameRecipientInput.value = ''; // Nome é readonly, mas esvaziar é bom
            emailRecipientInput.value = '';

            // ATUALIZA OS CACHES após a criação de uma nova transferência e a atualização de capital
            await loadAndCacheAllUsers();
            await loadAndCacheAllTransfers();
            updateBankTotalDisplay(); // <--- ATUALIZA O VALOR TOTAL DO BANCO após um depósito

        } catch (error) {
            showCustomAlert('Ocorreu um erro durante a verificação ou processamento da transferência. Verifique o console.');
            console.error(`Erro detalhado durante a verificação/processamento:`, error);
        }
    });

    collectSectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        hideTransferSection(transferContentWrapper);
    });
});