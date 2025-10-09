import { bankValue, displayTransfersArea, transfersSct } from "./elements.js";

export const trasnferArea = displayTransfersArea.addEventListener('click', (ev) => {
    ev.preventDefault();

    const subtitle = document.createElement('h2');
    subtitle.classList = 'subtitle'
    subtitle.textContent = 'Insira as informações para a transferência.';

    //Input date ---------------------------------------
    const dateGroup = document.createElement('div');
    dateGroup.className = 'date-group';
    
    const labelDate = document.createElement('label');
    labelDate.htmlFor = 'dateTransfer';
    labelDate.classList = 'date-label';
    labelDate.textContent = 'Escolha uma data para programar a transferência, ou transfira hoje mesmo clicando no botão "transferir hoje".';

    const dateTransfer = document.createElement('input');
    dateTransfer.type = 'date';
    dateTransfer.required = true;
    dateTransfer.id = 'dateTransfer';

    const todayDate = document.createElement('button');
    todayDate.id = 'btnExecuteTransfer';
    todayDate.textContent = 'Transferir Hoje';

    dateGroup.append(labelDate, dateTransfer, todayDate);

    //Input nome de quem vai transferir ---------------------------------------
    const senderGroup = document.createElement('div');
    senderGroup.className = 'sender-group';

    const labelNameSender = document.createElement('label');
    labelNameSender.htmlFor = 'nameSender';
    labelNameSender.classList = 'name-sender';
    labelNameSender.textContent = 'Nome da conta que ENVIARÁ o dinheiro, o remetente (nome do úsuario).'

    const nameSender = document.createElement('input');
    nameSender.type = 'text';
    nameSender.id = 'nameSender';

    //Valor a transferir
    const labelValueTransfer = document.createElement('label');
    labelValueTransfer.htmlFor = 'valueTransfer';
    labelValueTransfer.classList = 'value-transfer-label';
    labelValueTransfer.textContent = 'Informe o valor a ser transferido.';

    const valueTransfer = document.createElement('input');
    valueTransfer.type = 'text';
    valueTransfer.id = 'valueTransfer';

    senderGroup.append(labelNameSender, nameSender, labelValueTransfer, valueTransfer);

    //Input nome de quem vai receber a transferencia ---------------------------------------
    const recipientGroup = document.createElement('div');
    recipientGroup.className = 'recipient-group';

    const labelNameRecipient = document.createElement('label');
    labelNameRecipient.htmlFor = 'nameRecipient';
    labelNameRecipient.classList = 'name-recipient';
    labelNameRecipient.textContent = 'Nome da conta que RECEBERÁ o dinheiro, o destinatário (nome do úsuario).';

    const nameRecipient = document.createElement('input');
    nameRecipient.type = 'text';
    nameRecipient.id = 'nameRecipient'

    recipientGroup.append(labelNameRecipient, nameRecipient);

    //BUTTONS --------------------------------------------------------
    const buttonsTransfer = document.createElement('div');
    buttonsTransfer.className = 'btns-transfer-group';

    //Fazer transferencia 
    const executeTransfer = document.createElement('button');
    executeTransfer.id = 'executeTransfer';
    executeTransfer.textContent = 'Realizar Transferência';

    //Recolher seção 
    const collectSection = document.createElement('button');
    collectSection.id = 'collectSection';
    collectSection.textContent = 'Recolher Seção';

    buttonsTransfer.append(executeTransfer, collectSection);

    transfersSct.append(subtitle, dateGroup, senderGroup, buttonsTransfer);
});
