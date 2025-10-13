import { displayTransfersArea, transfersSct } from "./elements.js";

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
        transferContentWrapper = document.createElement('div');
        transferContentWrapper.id = 'transferContentWrapper';
        transfersSct.append(transferContentWrapper);
    }

    // Limpa qualquer conteúdo anterior e remove a classe ativa (garante o estado inicial)
    transferContentWrapper.innerHTML = '';
    transferContentWrapper.classList.remove('transfer-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS (MANTENDO SEU CÓDIGO) ---
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

    const dateTransfer = document.createElement('input');
    dateTransfer.type = 'date';
    dateTransfer.required = true;
    dateTransfer.id = 'dateTransfer';

    const todayDate = document.createElement('button');
    todayDate.id = 'btnTransferToday';
    todayDate.textContent = 'Transferir Hoje';

    groupDateBtns.append(dateTransfer, todayDate);
    dateGroup.append(labelDate, groupDateBtns);

    const senderGroup = document.createElement('div');
    senderGroup.className = 'sender-group';
    senderGroup.classList.add('animated-element'); // Adicionado 'animated-element'

    const labelNameSender = document.createElement('label');
    labelNameSender.htmlFor = 'nameSender';
    labelNameSender.classList = 'name-sender';
    labelNameSender.textContent = 'Nome da conta que ENVIARÁ o dinheiro, o remetente (nome do úsuario).'

    const nameSender = document.createElement('input');
    nameSender.type = 'text';
    nameSender.id = 'nameSender';

    const labelValueTransfer = document.createElement('label');
    labelValueTransfer.htmlFor = 'valueTransfer';
    labelValueTransfer.classList = 'value-transfer-label';
    labelValueTransfer.textContent = 'Informe o valor a ser transferido.';

    const valueTransfer = document.createElement('input');
    valueTransfer.type = 'text';
    valueTransfer.id = 'valueTransfer';

    senderGroup.append(labelNameSender, nameSender, labelValueTransfer, valueTransfer);

    const recipientGroup = document.createElement('div');
    recipientGroup.className = 'recipient-group';
    recipientGroup.classList.add('animated-element'); // Adicionado 'animated-element'

    const labelNameRecipient = document.createElement('label');
    labelNameRecipient.htmlFor = 'nameRecipient';
    labelNameRecipient.classList = 'name-recipient';
    labelNameRecipient.textContent = 'Nome da conta que RECEBERÁ o dinheiro, o destinatário (nome do úsuario).';

    const nameRecipient = document.createElement('input');
    nameRecipient.type = 'text';
    nameRecipient.id = 'nameRecipient'

    recipientGroup.append(labelNameRecipient, nameRecipient);

    const buttonsTransfer = document.createElement('div');
    buttonsTransfer.className = 'btns-transfer-group';
    buttonsTransfer.classList.add('animated-element'); // Adicionado 'animated-element'

    const executeTransfer = document.createElement('button');
    executeTransfer.id = 'executeTransfer';
    executeTransfer.textContent = 'Realizar Transferência';

    const collectSection = document.createElement('button');
    collectSection.id = 'collectSection';
    collectSection.textContent = 'Recolher Seção';

    buttonsTransfer.append(executeTransfer, collectSection);

    // Adiciona todos os elementos ao wrapper
    transferContentWrapper.append(subtitle, dateGroup, senderGroup, recipientGroup, buttonsTransfer);

    // --- LÓGICA DA ANIMAÇÃO DE APARECER ---
    // Usamos requestAnimationFrame ou setTimeout para garantir que o navegador
    // tenha tempo de renderizar o estado inicial (opacity:0, max-height:0)
    // ANTES de adicionar a classe que aciona a transição.
    requestAnimationFrame(() => {
        transferContentWrapper.classList.add('transfer-section-active');
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
