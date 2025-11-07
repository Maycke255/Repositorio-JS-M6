// services/components/forms/depositEditForm.js

// Importa elementos DOM do seu entities/elements.js (AGORA SEM customEditOverlay, customEditInputs, containerInputs, customAEditOkButton, customEditCancelButton, pois eles são importados em utils para closeEditForm)
import { containerInputs,
         customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js'; // <--- Ajuste aqui, apenas os que são manipulados diretamente neste arquivo

// Importa a função showCustomAlert do seu app.js (sem alterá-lo!)
import { showCustomAlert } from '../../../src/app.js';

// Importa funções utilitárias do DOM E as novas de busca/cache, incluindo closeEditForm
import { createDiv, createH, findUserByEmail, closeEditForm } from '../../utils/utils.js'; // <--- closeEditForm agora vem daqui!


export function setupDepositEditForm(depositToEdit, onSaveCallback) {

    containerInputs.innerHTML = ''; // Limpa qualquer conteúdo anterior do formulário

    const subtitle = createH(3, 'Insira as informações que deseja alterar, e depois clique em "Salvar informações"', 'subtitle-deposit');
    containerInputs.append(subtitle);

    // --- CAMPO NOME (readonly, derivado do email) ---
    const groupNewName = createDiv('group-name', 'new-deposit');
    const labelName = document.createElement('label');
    labelName.htmlFor = 'newNameDeposit';
    labelName.classList.add('name-label');
    labelName.textContent = 'Nome do recebedor do depósito:';
    const nameDepositInput = document.createElement('input');
    nameDepositInput.type = 'text';
    nameDepositInput.id = 'newNameDeposit';
    nameDepositInput.name = 'depositName';
    nameDepositInput.value = depositToEdit.name || '';
    nameDepositInput.readOnly = true;
    groupNewName.append(labelName, nameDepositInput);

    // --- CAMPO E-MAIL ---
    const groupNewEmail = createDiv('group-email', 'new-deposit');
    const labelEmail = document.createElement('label');
    labelEmail.htmlFor = 'newEmailDeposit';
    labelEmail.classList.add('email-label');
    labelEmail.textContent = 'E-mail do usuário que recebeu o depósito:';
    const emailDepositInput = document.createElement('input');
    emailDepositInput.type = 'email';
    emailDepositInput.id = 'newEmailDeposit';
    emailDepositInput.name = 'email';
    emailDepositInput.value = depositToEdit.email || '';
    groupNewEmail.append(labelEmail, emailDepositInput);

    emailDepositInput.addEventListener('blur', () => {
        const newEmail = emailDepositInput.value.trim();
        if (newEmail) {
            const user = findUserByEmail(newEmail);
            if (user) {
                nameDepositInput.value = user.name;
            } else {
                nameDepositInput.value = '';
                showCustomAlert(`O e-mail "${newEmail}" não está cadastrado. Por favor, insira um e-mail de usuário existente.`);
            }
        } else {
            nameDepositInput.value = '';
        }
    });

    // --- CAMPO VALOR ---
    const groupNewValueDeposit = createDiv('group-value', 'new-deposit');
    const labelNewValueDeposit = document.createElement('label');
    labelNewValueDeposit.htmlFor = 'newValueDeposit';
    labelNewValueDeposit.classList.add('value-deposit-label');
    labelNewValueDeposit.textContent = 'Informe o NOVO valor do depósito:';
    const newValueDepositInput = document.createElement('input');
    newValueDepositInput.type = 'number';
    newValueDepositInput.id = 'newValueDeposit';
    newValueDepositInput.name = 'value';
    newValueDepositInput.min = '0.01';
    newValueDepositInput.step = 'any';
    newValueDepositInput.value = depositToEdit.value || '';
    groupNewValueDeposit.append(labelNewValueDeposit, newValueDepositInput);

    containerInputs.append(groupNewName, groupNewEmail, groupNewValueDeposit);

    // customEditOverlay.classList.add('visible'); // Estes estão agora na closeEditForm em utils
    // customEditInputs.classList.add('visible'); // E precisarão ser explicitamente mostrados aqui

    // Para MOSTRAR o overlay e a caixa de edição (não faziam parte da closeEditForm, faziam parte do setup do form)
    // Então, precisamos deles aqui
    // Reimportar customEditOverlay e customEditInputs aqui
    // import { customEditOverlay, customEditInputs } from '../../../src/entities/elements.js';
    // Ou passar como parâmetro se você preferir não importar diretamente
    // Por simplicidade, vamos reimportá-los aqui
    // Adicione no topo do arquivo junto com containerInputs
    // import { customEditOverlay, customEditInputs, containerInputs,
    //          customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js';

    // Se você já tem essa linha no topo, ignore este comentário.
    // Ela já está lá no início do arquivo que te passei anteriormente.

    // A linha de importação no topo do arquivo DEVE ser:
    // import { customEditOverlay, customEditInputs, containerInputs,
    //          customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js';
    // Minha sugestão anterior de remover foi incorreta.
    // Ela é necessária aqui para *adicionar* a classe 'visible'

    customEditOverlay.classList.add('visible');
    customEditInputs.classList.add('visible');


    const handleSave = async (ev) => {
        ev.preventDefault();
        const updatedData = {};

        const newEmail = emailDepositInput.value.trim();
        const newName = nameDepositInput.value.trim();
        const newValue = parseFloat(newValueDepositInput.value);

        if (!newEmail) {
            showCustomAlert('O e-mail não pode estar vazio.');
            return;
        }
        const userFound = findUserByEmail(newEmail);
        if (!userFound) {
            showCustomAlert(`O e-mail "${newEmail}" não está cadastrado. Por favor, insira um e-mail de usuário existente.`);
            return;
        }

        if (isNaN(newValue) || newValue < 0.01) {
            showCustomAlert('Por favor, insira um valor de depósito válido (maior ou igual a 0.01).');
            return;
        }

        if (newEmail !== depositToEdit.email || newName !== depositToEdit.name) {
            updatedData.email = newEmail;
            updatedData.name = userFound.name;
            updatedData.userId = userFound.id;
        }

        if (newValue !== depositToEdit.value) {
            updatedData.value = newValue;
        }

        if (Object.keys(updatedData).length === 0) {
            showCustomAlert('Nenhuma alteração foi feita.');
            closeEditForm();
            return;
        }

        await onSaveCallback(depositToEdit.id, updatedData, depositToEdit);
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