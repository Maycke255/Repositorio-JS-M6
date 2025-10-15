import { displayTransfersArea, transfersSct } from "./elements.js";
import { Transfer } from "../controller/Transfer.js";
import { showCustomAlert } from "../app.js";

// ========================= EVENTLISTERNS DA AREA DE TRANSFERENCIA ========================= //
export const trasnferArea = displayTransfersArea.addEventListener('click', (ev) => {
   ev.preventDefault();

    let transferContentWrapper = transfersSct.querySelector('#transferContentWrapper');

    // Se já existe e tem conteúdo, não recriar, ou podemos adicionar uma lógica para ocultar e depois mostrar.
    // Para simplificar, vamos verificar se já está ativo/com conteúdo.
    if (transferContentWrapper && transferContentWrapper.innerHTML !== '') {
        console.log('Seção de transferência já está visível ou sendo animada.');
        // Opcional: Se quiser que o botão atue como toggle, chame hideTransferSection aqui.
        // hideTransferSection(transferContentWrapper);
        return;
    }

    // Garante que o wrapper existe. Se não existir, cria.
    if (!transferContentWrapper) {
        transferContentWrapper = document.createElement('form');
        transferContentWrapper.id = 'transferContentWrapper';
        transferContentWrapper.method = 'POST';
        transferContentWrapper.action = 'http://localhost:3000/transfers'
        transfersSct.append(transferContentWrapper);
    }

    // Limpa qualquer conteúdo anterior e remove a classe ativa (garante o estado inicial)
    transferContentWrapper.innerHTML = '';
    transferContentWrapper.classList.remove('transfer-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS ---
    // Adicione a classe 'animated-element' a CADA um desses grupos que você quer animar.

    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-transfer', 'animated-element'); // Adicionado 'animated-element'
    subtitle.textContent = 'Insira as informações para a transferência.';

    const dateGroup = document.createElement('div');
    dateGroup.className = 'date-group';
    dateGroup.classList.add('animated-element'); // Adicionado 'animated-element'

    const labelDate = document.createElement('label');
    labelDate.htmlFor = 'dateTransfer';
    labelDate.classList = 'date-label';
    labelDate.textContent = 'Escolha uma data para programar a transferência, ou transfira hoje mesmo clicando no botão "transferir hoje".';

    const groupDateBtns = document.createElement('div');
    groupDateBtns.classList = 'group-date-btns';

    const dateTransferInput = document.createElement('input'); // Variável local do input
    dateTransferInput.type = 'date';
    dateTransferInput.required = true;
    dateTransferInput.id = 'dateTransfer';
    dateTransferInput.name = 'date'

    const todayDateButton = document.createElement('button'); // Variável local do botão
    todayDateButton.id = 'btnTransferToday';
    todayDateButton.textContent = 'Transferir Hoje';
    todayDateButton.type = 'button'; // <<-- Importante: Definir como 'button' para não acionar o submit do form

    groupDateBtns.append(dateTransferInput, todayDateButton);
    dateGroup.append(labelDate, groupDateBtns);

    const senderGroup = document.createElement('div');
    senderGroup.className = 'sender-group';
    senderGroup.classList.add('animated-element'); // Adicionado 'animated-element'

    const labelNameSender = document.createElement('label');
    labelNameSender.htmlFor = 'nameSender';
    labelNameSender.classList = 'name-sender';
    labelNameSender.textContent = 'Nome da conta que ENVIARÁ o dinheiro, o remetente (nome do úsuario).'

    const nameSenderInput = document.createElement('input'); // Variável local do input
    nameSenderInput.type = 'text';
    nameSenderInput.id = 'nameSender';
    nameSenderInput.name = 'senderName'

    const labelValueTransfer = document.createElement('label');
    labelValueTransfer.htmlFor = 'valueTransfer';
    labelValueTransfer.classList = 'value-transfer-label';
    labelValueTransfer.textContent = 'Informe o valor a ser transferido.';

    const valueTransferInput = document.createElement('input'); // Variável local do input
    valueTransferInput.type = 'text';
    valueTransferInput.id = 'valueTransfer';
    valueTransferInput.name = 'value';

    senderGroup.append(labelNameSender, nameSenderInput, labelValueTransfer, valueTransferInput);

    const recipientGroup = document.createElement('div');
    recipientGroup.className = 'recipient-group';
    recipientGroup.classList.add('animated-element'); // Adicionado 'animated-element'

    const labelNameRecipient = document.createElement('label');
    labelNameRecipient.htmlFor = 'nameRecipient';
    labelNameRecipient.classList = 'name-recipient';
    labelNameRecipient.textContent = 'Nome da conta que RECEBERÁ o dinheiro, o destinatário (nome do úsuario).';

    const nameRecipientInput = document.createElement('input'); // Variável local do input
    nameRecipientInput.type = 'text';
    nameRecipientInput.id = 'nameRecipient';
    nameRecipientInput.name = 'recipientName';

    recipientGroup.append(labelNameRecipient, nameRecipientInput);

    const buttonsTransfer = document.createElement('div');
    buttonsTransfer.className = 'btns-transfer-group';
    buttonsTransfer.classList.add('animated-element'); // Adicionado 'animated-element'

    const executeTransferButton = document.createElement('button'); // Variável local do botão
    executeTransferButton.id = 'executeTransfer';
    executeTransferButton.textContent = 'Realizar Transferência';
    executeTransferButton.type = 'submit'; // <<-- Importante: Definir como 'submit' para acionar o evento submit do form

    const collectSectionButton = document.createElement('button'); // Variável local do botão
    collectSectionButton.id = 'collectSection';
    collectSectionButton.textContent = 'Recolher Seção';
    collectSectionButton.type = 'button';

    buttonsTransfer.append(executeTransferButton, collectSectionButton);

    // Adiciona todos os elementos ao wrapper
    transferContentWrapper.append(subtitle, dateGroup, senderGroup, recipientGroup, buttonsTransfer);

    // --- LÓGICA DA ANIMAÇÃO DE APARECER ---
    // Usamos requestAnimationFrame ou setTimeout para garantir que o navegador
    // tenha tempo de renderizar o estado inicial (opacity:0, max-height:0)
    // ANTES de adicionar a classe que aciona a transição.
    requestAnimationFrame(() => {
        transferContentWrapper.classList.add('transfer-section-active');
    });

    // --- AGORA, EVENT LISTENERS AQUI, APÓS A CRIAÇÃO DOS ELEMENTOS ---
    // --- BOTÃO DA DATA ---
    todayDateButton.addEventListener('click', (ev) => {
        ev.preventDefault();

        const today = new Date();

        const day = String(today.getDate()).padStart(2, "0");       // dia com 2 dígitos
        const month = String(today.getMonth() + 1).padStart(2, "0"); // meses começam do 0
        const year = today.getFullYear();

        dateTransferInput.value = `${year}-${month}-${day}`;
    });

    // --- REALIZAR A TRANSFERENCIA ---
    executeTransferButton.addEventListener('click', async (ev) => {
        ev.preventDefault();
    
        const date = dateTransferInput.value;
        const nameSender = nameSenderInput.value;
        const valueTransfer = parseFloat(valueTransferInput.value);
        const nameRecipient = nameRecipientInput.value;

        if (!date || !nameSender || valueTransfer <= 0 || !nameRecipient) {
            showCustomAlert('Por favor, preencha todos os campos!');

            dateTransferInput.classList.add('error');
            dateTransferInput.focus();
            nameSenderInput.classList.add('error');
            nameSenderInput.focus();
            nameRecipientInput.classList.add('error');
            nameRecipientInput.focus();
            valueTransferInput.classList.add('error');
            valueTransferInput.focus();

            setTimeout(function () {
                dateTransferInput.classList.remove('error');
                nameSenderInput.classList.remove('error');
                nameRecipientInput.classList.remove('error');
                valueTransferInput.classList.remove('error');
            }, 2200);
                return;
            }

            if (isNaN(valueTransfer)) {
                showCustomAlert('Digite apenas números!');

                valueTransferInput.classList.add('error');
                valueTransferInput.focus();

                setTimeout(() => {
                    valueTransferInput.classList.remove('error');
                }, 2200);
            return;
        }

        const lettersOnlyRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

        if (!lettersOnlyRegex.test(nameSender) || !lettersOnlyRegex.test(nameRecipient)) {
            showCustomAlert('Os campos de remetente e destinatário devem conter apenas letras e espaços!');

            nameSenderInput.classList.add('error');
            nameSenderInput.focus();
            nameRecipientInput.classList.add('error');
            nameRecipientInput.focus();

            setTimeout(() => {
                nameSenderInput.classList.remove('error');
                nameRecipientInput.classList.remove('error');
            }, 2200);
            return;
        }
    
        const newTransfer = new Transfer(date, nameSender, valueTransfer, nameRecipient);
    
        try {
            // Chamamos o método assíncrono makeTransfer da instância
            // Usamos 'await' porque makeTransfer é um método assíncrono
            await newTransfer.makeTransfer()
    
            dateTransferInput.value = '';
            nameSenderInput.value = '';
            valueTransferInput.value = '';
            nameRecipientInput.value = '';
        } catch (message) {
            showCustomAlert('Erro ao processar a transferência no app.js, verifique o console para mais informações.')
            console.error('Erro ao processar a transferência no app.js:', message);
        }
    });


    // --- LÓGICA DO BOTÃO RECOLHER SEÇÃO ---
    collectSection.addEventListener('click', (e) => {
        e.preventDefault();
        hideTransferSection(transferContentWrapper); // Chama a função para esconder e remover
    });
});

// Função para esconder e remover a seção de transferência
function hideTransferSection(wrapperElement) {
    if (!wrapperElement || !wrapperElement.classList.contains('transfer-section-active')) {
        return; // A seção já está escondida ou não é o wrapper correto
    }

    wrapperElement.classList.remove('transfer-section-active'); // Remove a classe para iniciar a animação de esconder

    // Encontra o último elemento animado para saber quando a transição terminou.
    // Baseado nos transition-delays do CSS, .btns-transfer-group tem o maior delay.
    const lastAnimatedElement = wrapperElement.querySelector('.btns-transfer-group');

    // Se não houver elementos animados ou o lastAnimatedElement for null,
    // removemos o conteúdo diretamente após um tempo razoável.
    if (!lastAnimatedElement) {
        setTimeout(() => {
            wrapperElement.innerHTML = '';
        }, 600); // Um pouco mais que a duração da transição mais longa
        return;
    }

    // Adiciona um listener para o evento 'transitionend' no último elemento a animar.
    // 'once: true' garante que o listener seja removido automaticamente após a primeira execução.
    lastAnimatedElement.addEventListener('transitionend', function handler(e) {
        // Assegura que o evento transitionend é para a propriedade que estamos animando (e.g., opacity, max-height)
        // E que é o último elemento a terminar sua animação
        if (e.propertyName === 'max-height' || e.propertyName === 'opacity') {
            wrapperElement.innerHTML = ''; // Limpa o conteúdo após a animação de recolhimento
            // Note: O wrapperElement ainda existirá, mas estará vazio.
            // Se precisar remover o próprio wrapperElement, você pode adicionar wrapperElement.remove();
            // Mas é bom mantê-lo para futura reutilização, apenas com innerHTML=''
            lastAnimatedElement.removeEventListener('transitionend', handler); // Limpa o listener (se 'once' não for suportado ou para clareza)
        }
    }, { once: true });
}