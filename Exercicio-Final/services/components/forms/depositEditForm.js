// services/components/forms/depositEditForm.js

import { customEditOverlay, customEditInputs, containerInputs,
         customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js';

import { showCustomAlert } from '../../../src/app.js';

import { createDiv, createH } from '../../utils/utils.js'; // Garanta que 'closeEditForm' não está vindo daqui

// Importa a nova função para buscar usuário por e-mail
import { findUserByEmail } from '../../utils/validationUtils.js';

// Função para fechar o formulário de edição (Movida para cá ou para um utils geral)
function closeEditForm() {
    containerInputs.innerHTML = '';
    customEditOverlay.classList.remove('visible');
    customEditInputs.classList.remove('visible');
}

export function setupDepositEditForm(depositToEdit, onSaveCallback) {

    containerInputs.innerHTML = '';

    const subtitle = createH(3, 'Insira as informações que deseja alterar, e depois clique em "Salvar informações"', 'subtitle-deposit');
    containerInputs.append(subtitle);

    // Campo Nome (preenchido, mas será atualizado se o e-mail for alterado)
    const groupNewName = createDiv('group-name', 'new-deposit');
    const labelName = document.createElement('label');
    labelName.htmlFor = 'newNameDeposit';
    labelName.classList.add('name-label');
    labelName.textContent = 'Nome do recebedor do depósito:'; // Mudança de texto
    const nameDepositInput = document.createElement('input');
    nameDepositInput.type = 'text';
    nameDepositInput.id = 'newNameDeposit';
    nameDepositInput.name = 'depositName';
    nameDepositInput.value = depositToEdit.name || '';
    nameDepositInput.readOnly = true; // <--- Tornar somente leitura, nome é derivado do email
    groupNewName.append(labelName, nameDepositInput);

    // Campo E-mail
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

    // Adiciona um listener para atualizar o nome automaticamente se o e-mail mudar e for válido
    emailDepositInput.addEventListener('blur', async () => {
        const newEmail = emailDepositInput.value.trim();
        if (newEmail && newEmail !== depositToEdit.email) {
            const user = await findUserByEmail(newEmail);
            if (user) {
                nameDepositInput.value = user.name;
            } else {
                nameDepositInput.value = ''; // Limpa se o e-mail não existir
                showCustomAlert(`O e-mail "${newEmail}" não está cadastrado.`);
            }
        } else if (!newEmail) {
            nameDepositInput.value = ''; // Limpa se o e-mail estiver vazio
        } else if (newEmail === depositToEdit.email) {
            nameDepositInput.value = depositToEdit.name; // Volta ao original se o email for o mesmo
        }
    });

    // Campo valor
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

    customEditOverlay.classList.add('visible');
    customEditInputs.classList.add('visible');

    const handleSave = async (ev) => {
        ev.preventDefault();
        const updatedData = {};

        const newEmail = emailDepositInput.value.trim();
        const newName = nameDepositInput.value.trim(); // Pega o nome atualizado do campo (que pode ter sido preenchido automaticamente)
        const newValue = parseFloat(newValueDepositInput.value);

        // 1. Validação do E-mail
        if (!newEmail) {
            showCustomAlert('O e-mail não pode estar vazio.');
            return;
        }
        const userFound = await findUserByEmail(newEmail);
        if (!userFound) {
            showCustomAlert(`O e-mail "${newEmail}" não está cadastrado. Por favor, insira um e-mail de usuário existente.`);
            return;
        }

        // 2. Validação do Valor
        if (isNaN(newValue) || newValue < 0.01) {
            showCustomAlert('Por favor, insira um valor de depósito válido (maior ou igual a 0.01).');
            return;
        }

        // Preenche updatedData com o que realmente mudou
        if (newEmail !== depositToEdit.email) {
            updatedData.email = newEmail;
            updatedData.name = userFound.name; // Atualiza o nome com o do usuário encontrado
        } else if (newName !== depositToEdit.name && !updatedData.email) { // Se o email não mudou, mas o nome sim (caso manual)
            updatedData.name = newName;
        }
        // Se o email não mudou e o nome também não mudou, não adiciona name/email a updatedData
        // Se o email mudou, name já foi adicionado acima

        if (newValue !== depositToEdit.value) {
            updatedData.value = newValue;
        }

        if (Object.keys(updatedData).length === 0) {
            showCustomAlert('Nenhuma alteração foi feita.');
            closeEditForm();
            return;
        }

        // Chama o callback com os dados atualizados
        await onSaveCallback(depositToEdit.id, updatedData, depositToEdit); // <--- Passa o depositToEdit original
        closeEditForm();
    };

    const handleCancel = (ev) => {
        ev.preventDefault();
        closeEditForm();
    };

    // É importante remover os listeners antigos antes de adicionar novos para evitar
    // que a função seja chamada múltiplas vezes se o formulário for aberto e fechado.
    // Você não precisa importar closeEditForm, pois ela está definida neste próprio arquivo agora.
    customAEditOkButton.removeEventListener('click', handleSave);
    customEditCancelButton.removeEventListener('click', handleCancel);

    customAEditOkButton.addEventListener('click', handleSave);
    customEditCancelButton.addEventListener('click', handleCancel);
}

