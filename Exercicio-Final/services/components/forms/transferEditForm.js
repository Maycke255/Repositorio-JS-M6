// services/components/forms/transferEditForm.js

import { containerInputs,
         customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js';

import { showCustomAlert } from '../../../src/app.js';

import { createDiv, createH, findUserByEmail, closeEditForm, loadAndCacheAllUsers } from '../../utils/utils.js';


export function setupTransferEditForm(transferToEdit, onSaveCallback) {

    containerInputs.innerHTML = '';

    const subtitle = createH(3, 'Insira as informações que deseja alterar na transferência, e depois clique em "Salvar informações"', 'subtitle-transfer');
    containerInputs.append(subtitle);

    // --- CAMPO E-MAIL DO REMETENTE ---
    const senderEmailGroup = createDiv('sender-email-group', 'edit-transfer');
    const labelSenderEmail = document.createElement('label');
    labelSenderEmail.htmlFor = 'editSenderEmail';
    labelSenderEmail.classList = 'sender-email-label'; // Revertido para sua sintaxe original
    labelSenderEmail.textContent = 'E-mail do remetente:';
    const senderEmailInput = document.createElement('input');
    senderEmailInput.type = 'email';
    senderEmailInput.id = 'editSenderEmail';
    senderEmailInput.name = 'senderEmail';
    senderEmailInput.value = transferToEdit.emailSender || '';
    senderEmailGroup.append(labelSenderEmail, senderEmailInput);

    // --- CAMPO NOME DO REMETENTE (readonly) ---
    const senderNameGroup = createDiv('sender-name-group', 'edit-transfer');
    const labelSenderName = document.createElement('label');
    labelSenderName.htmlFor = 'editSenderName';
    labelSenderName.classList = 'sender-name-label'; // Revertido
    labelSenderName.textContent = 'Nome do remetente:';
    const senderNameInput = document.createElement('input');
    senderNameInput.type = 'text';
    senderNameInput.id = 'editSenderName';
    senderNameInput.name = 'senderName';
    senderNameInput.value = transferToEdit.senderName || '';
    senderNameInput.readOnly = true;
    senderNameGroup.append(labelSenderName, senderNameInput);

    // --- CAMPO E-MAIL DO DESTINATÁRIO ---
    const recipientEmailGroup = createDiv('recipient-email-group', 'edit-transfer');
    const labelRecipientEmail = document.createElement('label');
    labelRecipientEmail.htmlFor = 'editRecipientEmail';
    labelRecipientEmail.classList = 'recipient-email-label'; // Revertido
    labelRecipientEmail.textContent = 'E-mail do destinatário:';
    const recipientEmailInput = document.createElement('input');
    recipientEmailInput.type = 'email';
    recipientEmailInput.id = 'editRecipientEmail';
    recipientEmailInput.name = 'recipientEmail';
    recipientEmailInput.value = transferToEdit.emailRecipient || '';
    recipientEmailGroup.append(labelRecipientEmail, recipientEmailInput);

    // --- CAMPO NOME DO DESTINATÁRIO (readonly) ---
    const recipientNameGroup = createDiv('recipient-name-group', 'edit-transfer');
    const labelRecipientName = document.createElement('label');
    labelRecipientName.htmlFor = 'editRecipientName';
    labelRecipientName.classList = 'recipient-name-label'; // Revertido
    labelRecipientName.textContent = 'Nome do destinatário:';
    const recipientNameInput = document.createElement('input');
    recipientNameInput.type = 'text';
    recipientNameInput.id = 'editRecipientName';
    recipientNameInput.name = 'recipientName';
    recipientNameInput.value = transferToEdit.recipientName || '';
    recipientNameInput.readOnly = true;
    recipientNameGroup.append(labelRecipientName, recipientNameInput);

    // Listeners para atualizar os nomes automaticamente
    senderEmailInput.addEventListener('blur', async () => {
        await loadAndCacheAllUsers(); // <--- ADICIONADO AQUI
        const email = senderEmailInput.value.trim();

        if (email) {
            const user = findUserByEmail(email);
            if (user) { senderNameInput.value = user.name; } else { senderNameInput.value = ''; showCustomAlert(`E-mail do remetente "${email}" não cadastrado.`); }
        } else { senderNameInput.value = ''; }
    });

    recipientEmailInput.addEventListener('blur', async () => {
        await loadAndCacheAllUsers(); // <--- ADICIONADO AQUI
        const email = recipientEmailInput.value.trim();

        if (email) {
            const user = findUserByEmail(email);
            if (user) { recipientNameInput.value = user.name; } else { recipientNameInput.value = ''; showCustomAlert(`E-mail do destinatário "${email}" não cadastrado.`); }
        } else { recipientNameInput.value = ''; }
    });


    // --- CAMPO VALOR DA TRANSFERÊNCIA ---
    const valueTransferGroup = createDiv('value-transfer-group', 'edit-transfer');
    const labelValueTransfer = document.createElement('label');
    labelValueTransfer.htmlFor = 'editValueTransfer';
    labelValueTransfer.classList = 'value-transfer-label'; // Revertido para sua sintaxe original
    labelValueTransfer.textContent = 'Informe o NOVO valor da transferência:';
    const valueTransferInput = document.createElement('input');
    valueTransferInput.type = 'number';
    valueTransferInput.id = 'editValueTransfer';
    valueTransferInput.name = 'value';
    valueTransferInput.min = '0.01';
    valueTransferInput.step = 'any';
    valueTransferInput.value = transferToEdit.value || '';
    valueTransferGroup.append(labelValueTransfer, valueTransferInput);

    // --- CAMPO DATA (somente leitura) ---
    const dateGroup = createDiv('date-group', 'edit-transfer');
    const labelDate = document.createElement('label');
    labelDate.htmlFor = 'editTransferDate';
    labelDate.classList = 'date-label'; // Revertido para sua sintaxe original
    labelDate.textContent = 'Data da Transferência:';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'editTransferDate';
    dateInput.name = 'date';
    dateInput.value = transferToEdit.date || '';
    dateInput.readOnly = true;
    dateGroup.append(labelDate, dateInput);


    containerInputs.append(senderEmailGroup, senderNameGroup, recipientEmailGroup, recipientNameGroup, valueTransferGroup, dateGroup);

    customEditOverlay.classList.add('visible');
    customEditInputs.classList.add('visible');

    const handleSave = async (ev) => {
        ev.preventDefault();
        const updatedData = {};

        const newSenderEmail = senderEmailInput.value.trim();
        const newRecipientEmail = recipientEmailInput.value.trim();
        const newValue = parseFloat(valueTransferInput.value);
        

        if (!newSenderEmail) { showCustomAlert('O e-mail do remetente não pode estar vazio.'); return; }
        await loadAndCacheAllUsers(); // <--- ADICIONADO AQUI (antes de chamar findUserByEmail)
        const senderFound = findUserByEmail(newSenderEmail);
        if (!senderFound) { showCustomAlert(`O e-mail do remetente "${newSenderEmail}" não está cadastrado.`); return; }

        if (!newRecipientEmail) { showCustomAlert('O e-mail do destinatário não pode estar vazio.'); return; }
        await loadAndCacheAllUsers(); // <--- ADICIONADO AQUI (antes de chamar findUserByEmail)
        const recipientFound = findUserByEmail(newRecipientEmail);
        if (!recipientFound) { showCustomAlert(`O e-mail do destinatário "${newRecipientEmail}" não está cadastrado.`); return; }

        if (newSenderEmail === newRecipientEmail) { showCustomAlert('Remetente e destinatário não podem ser o mesmo.'); return; }

        if (isNaN(newValue) || newValue < 0.01) { showCustomAlert('Por favor, insira um valor de transferência válido (maior ou igual a 0.01).'); return; }

        if (senderFound.id !== transferToEdit.senderId) {
            updatedData.senderId = senderFound.id; // <--- MODIFICADO
        }
        if (recipientFound.id !== transferToEdit.recipientId) {
            updatedData.recipientId = recipientFound.id; // <--- MODIFICADO
        }
        if (newValue !== transferToEdit.value) {
            updatedData.value = newValue;
        }

        if (Object.keys(updatedData).length === 0) {
            showCustomAlert('Nenhuma alteração foi feita.');
            closeEditForm();
            return;
        }

        await onSaveCallback(transferToEdit.id, updatedData, transferToEdit); // <--- ADICIONADO transferToEdit
        closeEditForm();
    };

    const handleCancel = (ev) => {
        ev.preventDefault();
        closeEditForm();
    };

    customAEditOkButton.removeEventListener('click', handleSave);
    customEditCancelButton.removeEventListener('click', handleCancel);

    customAEditOkButton.addEventListener('click', handleSave);
    customEditCancelButton.addEventListener('click', handleCancel);
}