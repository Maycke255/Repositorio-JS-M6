// services/components/forms/depositEditForm.js

// Importa elementos DOM do seu entities/elements.js
import { customEditOverlay, customEditInputs, containerInputs,
         customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js';

// Importa a função showCustomAlert do seu app.js (sem alterá-lo!)
import { showCustomAlert } from '../../../src/app.js';

// Importa funções utilitárias do DOM
import { createDiv, createH, closeEditForm } from '../../utils/utils.js'; // Assegure-se que 'utils' é o nome correto da pasta, e 'utils.js' do arquivo.

// Importa a nova função de validação de e-mail
import { checkUserEmailExists } from '../../utils/validationUtils.js';

// Esta função agora recebe o depósito a ser editado e um callback para quando salvar
export function setupDepositEditForm(depositToEdit, onSaveCallback) {

    containerInputs.innerHTML = ''; // Limpa qualquer conteúdo anterior do formulário

    // Subtítulo do formulário
    const subtitle = createH(3, 'Insira as informações que deseja alterar, e depois clique em "Salvar informações"', 'subtitle-deposit');
    containerInputs.append(subtitle);

    // Campo Nome
    const groupNewName = createDiv('group-name', 'new-deposit');
    const labelName = document.createElement('label');
    labelName.htmlFor = 'newNameDeposit'; // ID único para este input
    labelName.classList.add('name-label');
    labelName.textContent = 'Alterar nome de quem recebeu o deposito:';
    const nameDepositInput = document.createElement('input');
    nameDepositInput.type = 'text';
    nameDepositInput.id = 'newNameDeposit'; // ID único
    nameDepositInput.name = 'depositName';
    nameDepositInput.value = depositToEdit.name || ''; // Preenche com o nome atual do depósito
    groupNewName.append(labelName, nameDepositInput);

    // Campo E-mail
    const groupNewEmail = createDiv('group-email', 'new-deposit');
    const labelEmail = document.createElement('label');
    labelEmail.htmlFor = 'newEmailDeposit';
    labelEmail.classList.add('email-label');
    labelEmail.textContent = 'Alterar e-mail do usuário que recebeu o deposito:'; // Corrigi o texto para clareza
    const emailDepositInput = document.createElement('input');
    emailDepositInput.type = 'email';
    emailDepositInput.id = 'newEmailDeposit';
    emailDepositInput.name = 'email';
    emailDepositInput.value = depositToEdit.email || ''; // Preenche com o e-mail atual do depósito
    groupNewEmail.append(labelEmail, emailDepositInput);

    // Campo valor
    const groupNewValueDeposit = createDiv('group-value', 'new-deposit');
    const labelNewValueDeposit = document.createElement('label');
    labelNewValueDeposit.htmlFor = 'newValueDeposit';
    labelNewValueDeposit.classList.add('value-deposit-label');
    labelNewValueDeposit.textContent = 'Informe o NOVO valor do depósito:'; // Texto mais direto
    const newValueDepositInput = document.createElement('input');
    newValueDepositInput.type = 'number';
    newValueDepositInput.id = 'newValueDeposit';
    newValueDepositInput.name = 'value';
    newValueDepositInput.min = '0.01';
    newValueDepositInput.step = 'any';
    newValueDepositInput.value = depositToEdit.value || ''; // Preenche com o valor atual
    groupNewValueDeposit.append(labelNewValueDeposit, newValueDepositInput);

    // ADICIONA TODOS OS GRUPOS DE CAMPOS AO CONTAINER (REMOVIDO groupNewPassword)
    containerInputs.append(groupNewName, groupNewEmail, groupNewValueDeposit);

    // Mostra o overlay e a caixa de edição
    customEditOverlay.classList.add('visible');
    customEditInputs.classList.add('visible');

    // Funções para lidar com o clique nos botões Salvar e Cancelar
    const handleSave = async (ev) => {
        ev.preventDefault();
        const updatedData = {};

        // 1. VERIFICAÇÃO DO E-MAIL (NOVA FUNCIONALIDADE)
        const newEmail = emailDepositInput.value.trim();
        if (newEmail !== depositToEdit.email) { // Só verifica se o e-mail foi alterado
            const emailExists = await checkUserEmailExists(newEmail);
            if (!emailExists) {
                showCustomAlert(`O e-mail "${newEmail}" não está cadastrado. Por favor, insira um e-mail de usuário existente.`);
                return; // Impede a continuação do salvamento
            }
        }

        // Verifica e atualiza o nome
        if (nameDepositInput.value.trim() !== '' && nameDepositInput.value !== depositToEdit.name) {
            updatedData.name = nameDepositInput.value.trim();
        }
        // Verifica e atualiza o e-mail
        if (newEmail !== '' && newEmail !== depositToEdit.email) {
            updatedData.email = newEmail;
        }

        // Verifica e atualiza o valor
        const newValue = parseFloat(newValueDepositInput.value);
        if (!isNaN(newValue) && newValue >= 0.01 && newValue !== depositToEdit.value) {
            updatedData.value = newValue;
        } else if (newValueDepositInput.value.trim() !== '' && (isNaN(newValue) || newValue < 0.01)) {
            showCustomAlert('Por favor, insira um valor de depósito válido (maior ou igual a 0.01).');
            return;
        }

        // Se nenhum campo foi de fato alterado, avisa o usuário
        if (Object.keys(updatedData).length === 0) {
            showCustomAlert('Nenhuma alteração foi feita.');
            closeEditForm();
            return;
        }

        await onSaveCallback(depositToEdit.id, updatedData); // Chama o callback principal para salvar
        closeEditForm(); // Fecha o formulário após salvar
    };

    //Cancelar
    const handleCancel = (ev) => {
        ev.preventDefault();
        closeEditForm(); // Fecha o formulário ao cancelar
    };

    // É importante remover os listeners antigos antes de adicionar novos para evitar
    // que a função seja chamada múltiplas vezes se o formulário for aberto e fechado.
    customAEditOkButton.removeEventListener('click', handleSave);
    customEditCancelButton.removeEventListener('click', handleCancel);

    customAEditOkButton.addEventListener('click', handleSave);
    customEditCancelButton.addEventListener('click', handleCancel);
}

