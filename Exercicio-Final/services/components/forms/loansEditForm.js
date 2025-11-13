// services/components/forms/loanEditForm.js

import { containerInputs,
         customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js';

import { showCustomAlert } from '../../../src/app.js';

import { createDiv, createH, findUserByEmail, closeEditForm, loadAndCacheAllUsers } from '../../utils/utils.js';


export function setupLoanEditForm(loanToEdit, onSaveCallback) {

    containerInputs.innerHTML = '';

    const subtitle = createH(3, 'Insira as informações que deseja alterar no empréstimo, e depois clique em "Salvar informações"', 'subtitle-loan');
    containerInputs.append(subtitle);

    // --- CAMPO E-MAIL DO USUÁRIO ---
    const userEmailGroup = createDiv('user-email-group', 'edit-loan');
    const labelUserEmail = document.createElement('label');
    labelUserEmail.htmlFor = 'editUserEmail';
    labelUserEmail.classList = 'user-email-label';
    labelUserEmail.textContent = 'E-mail do usuário:';
    const userEmailInput = document.createElement('input');
    userEmailInput.type = 'email';
    userEmailInput.id = 'editUserEmail';
    userEmailInput.name = 'userEmail';
    // loanToEdit.emailSender e senderName não existem mais. Precisamos do user.email e user.name
    // Para isso, o displays.js deve passar a informação correta ou a gente busca aqui
    // Vamos fazer o displays.js passar o email e name já resolvidos para o loanToEdit
    userEmailInput.value = loanToEdit.email || '';
    userEmailGroup.append(labelUserEmail, userEmailInput);

    // --- CAMPO NOME DO USUÁRIO (readonly) ---
    const userNameGroup = createDiv('user-name-group', 'edit-loan');
    const labelUserName = document.createElement('label');
    labelUserName.htmlFor = 'editUserName';
    labelUserName.classList = 'user-name-label';
    labelUserName.textContent = 'Nome do usuário:';
    const userNameInput = document.createElement('input');
    userNameInput.type = 'text';
    userNameInput.id = 'editUserName';
    userNameInput.name = 'userName';
    userNameInput.value = loanToEdit.name || '';
    userNameInput.readOnly = true;
    userNameGroup.append(labelUserName, userNameInput);

    // Listeners para atualizar o nome automaticamente
    userEmailInput.addEventListener('blur', async () => {
        await loadAndCacheAllUsers(); // Garante cache atualizado
        const email = userEmailInput.value.trim();
        if (email) {
            const user = findUserByEmail(email);
            if (user) { userNameInput.value = user.name; } else { userNameInput.value = ''; showCustomAlert(`E-mail do usuário "${email}" não cadastrado.`); }
        } else { userNameInput.value = ''; }
    });

    // --- CAMPO VALOR PRINCIPAL ---
    const totalValueGroup = createDiv('total-value-group', 'edit-loan');
    const labelTotalValue = document.createElement('label');
    labelTotalValue.htmlFor = 'editTotalValue';
    labelTotalValue.classList = 'total-value-label';
    labelTotalValue.textContent = 'Novo Valor Principal do Empréstimo:';
    const totalValueInput = document.createElement('input');
    totalValueInput.type = 'number';
    totalValueInput.id = 'editTotalValue';
    totalValueInput.name = 'totalValue';
    totalValueInput.min = '0.01';
    totalValueInput.step = 'any';
    totalValueInput.value = loanToEdit.totalValue || '';
    totalValueGroup.append(labelTotalValue, totalValueInput);

    // --- CAMPO PARCELAS ---
    const installmentsGroup = createDiv('installments-group', 'edit-loan');
    const labelInstallments = document.createElement('label');
    labelInstallments.htmlFor = 'editInstallments';
    labelInstallments.classList = 'installments-label';
    labelInstallments.textContent = 'Novas Parcelas:';
    const installmentsInput = document.createElement('input');
    installmentsInput.type = 'number';
    installmentsInput.id = 'editInstallments';
    installmentsInput.name = 'installments';
    installmentsInput.min = '1';
    installmentsInput.step = '1';
    installmentsInput.value = loanToEdit.installments || '';
    installmentsGroup.append(labelInstallments, installmentsInput);

    // --- CAMPO TAXA ---
    const rateGroup = createDiv('rate-group', 'edit-loan');
    const labelRate = document.createElement('label');
    labelRate.htmlFor = 'editRate';
    labelRate.classList = 'rate-label';
    labelRate.textContent = 'Nova Taxa de Juros (%):';
    const rateInput = document.createElement('input');
    rateInput.type = 'number';
    rateInput.id = 'editRate';
    rateInput.name = 'rate';
    rateInput.min = '0';
    rateInput.step = '0.01';
    rateInput.value = loanToEdit.rate || '';
    rateGroup.append(labelRate, rateInput);

    // --- CAMPO DATA (somente leitura) ---
    const dateGroup = createDiv('date-group', 'edit-loan');
    const labelDate = document.createElement('label');
    labelDate.htmlFor = 'editLoanDate';
    labelDate.classList = 'date-label';
    labelDate.textContent = 'Data do Empréstimo:';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'editLoanDate';
    dateInput.name = 'date';
    dateInput.value = loanToEdit.date || '';
    dateInput.readOnly = true;
    dateGroup.append(labelDate, dateInput);


    containerInputs.append(userEmailGroup, userNameGroup, totalValueGroup, installmentsGroup, rateGroup, dateGroup);

    customEditOverlay.classList.add('visible');
    customEditInputs.classList.add('visible');

    const handleSave = async (ev) => {
        ev.preventDefault();
        const updatedData = {};

        const newUserEmail = userEmailInput.value.trim();
        const newTotalValue = parseFloat(totalValueInput.value);
        const newInstallments = parseInt(installmentsInput.value);
        const newRate = parseFloat(rateInput.value);

        if (!newUserEmail) { showCustomAlert('O e-mail do usuário não pode estar vazio.'); return; }
        await loadAndCacheAllUsers();
        const userFound = findUserByEmail(newUserEmail);
        if (!userFound) { showCustomAlert(`O e-mail do usuário "${newUserEmail}" não está cadastrado.`); return; }

        if (isNaN(newTotalValue) || newTotalValue < 0.01) { showCustomAlert('Por favor, insira um valor principal válido (maior ou igual a 0.01).'); return; }
        if (isNaN(newInstallments) || newInstallments < 1) { showCustomAlert('Por favor, insira um número de parcelas válido (maior ou igual a 1).'); return; }
        if (isNaN(newRate) || newRate < 0) { showCustomAlert('Por favor, insira uma taxa de juros válida (não negativa).'); return; }

        // Recalcular totalAmountToPay e installmentAmount
        const newTotalAmountToPay = newTotalValue * (1 + (newRate / 100));
        const newInstallmentAmount = newTotalAmountToPay / newInstallments;

        // Preenche updatedData com as alterações
        if (userFound.id !== loanToEdit.userId) { updatedData.userId = userFound.id; }
        if (newTotalValue !== loanToEdit.totalValue) { updatedData.totalValue = newTotalValue; }
        if (newInstallments !== loanToEdit.installments) { updatedData.installments = newInstallments; }
        if (newRate !== loanToEdit.rate) { updatedData.rate = newRate; }

        // Sempre atualiza os valores calculados se qualquer um dos inputs base mudou
        if (updatedData.totalValue !== undefined || updatedData.installments !== undefined || updatedData.rate !== undefined) {
            updatedData.totalAmountToPay = newTotalAmountToPay;
            updatedData.installmentAmount = newInstallmentAmount;
        }

        if (Object.keys(updatedData).length === 0) {
            showCustomAlert('Nenhuma alteração foi feita.');
            closeEditForm();
            return;
        }

        await onSaveCallback(loanToEdit.id, updatedData, loanToEdit); // Passa o loanToEdit original
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