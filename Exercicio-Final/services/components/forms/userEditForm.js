// Importa elementos DOM do seu entities/elements.js
import { customEditOverlay, customEditInputs, containerInputs, 
         customAEditOkButton, customEditCancelButton } from '../../../src/entities/elements.js';

// Importa a função showCustomAlert do seu app.js (sem alterá-lo!)
import { showCustomAlert } from '../../../src/app.js';

// Importa funções utilitárias do DOM
import { createDiv, createH, closeEditForm } from '../../utils/utils.js';



// Esta função agora recebe o usuário a ser editado e um callback para quando salvar
export function setupUserEditForm(userToEdit, onSaveCallback) {

    containerInputs.innerHTML = ''; // Limpa qualquer conteúdo anterior do formulário

    // Subtítulo do formulário
    const subtitle = createH(3, 'Insira as informações que deseja alterar, e depois clique em "Salvar informações"', 'subtitle-users');
    containerInputs.append(subtitle);

    // Campo Nome
    const groupNewName = createDiv('group-name', 'new-users');
    const labelName = document.createElement('label');
    labelName.htmlFor = 'newNameUser';
    labelName.classList.add('name-label');
    labelName.textContent = 'Alterar nome do usuário:';
    const nameUserInput = document.createElement('input');
    nameUserInput.type = 'text';
    nameUserInput.id = 'newNameUser';
    nameUserInput.name = 'userName';
    nameUserInput.value = userToEdit.name || ''; // Preenche com o nome atual do usuário
    groupNewName.append(labelName, nameUserInput);

    // Campo E-mail
    const groupNewEmail = createDiv('group-email', 'new-users'); 
    const labelEmail = document.createElement('label');
    labelEmail.htmlFor = 'newEmailUser';
    labelEmail.classList.add('email-label');
    labelEmail.textContent = 'Alterar e-mail do usuário (precisa conter @ e .com):';
    const emailUserInput = document.createElement('input');
    emailUserInput.type = 'email';
    emailUserInput.id = 'newEmailUser';
    emailUserInput.name = 'email';
    emailUserInput.value = userToEdit.email || ''; // Preenche com o e-mail atual do usuário
    groupNewEmail.append(labelEmail, emailUserInput);

    // Campo Senha (com o toggle de visibilidade)
    const groupNewPassword = createDiv('group-password', 'new-users'); 
    const labelPassword = document.createElement('label');
    labelPassword.htmlFor = 'newPasswordUser';
    labelPassword.classList.add('password-label');
    labelPassword.textContent = 'Alterar senha do usuário (deve conter números e letras):';
    const passwordUserInput = document.createElement('input');
    passwordUserInput.type = 'password';
    passwordUserInput.id = 'newPasswordUser';
    passwordUserInput.name = 'password';

    const togglePassword = document.createElement('img');
    togglePassword.classList.add('password-toggle-icon');
    togglePassword.src = '../../../../imgs/icons8-eye-closed.png'; 
    togglePassword.alt = 'Mostrar senha'; 

    togglePassword.addEventListener('click', function () {
        const type = passwordUserInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordUserInput.setAttribute('type', type);
        this.src = (type === 'text') ? '../../../../imgs/icons8-eye-50.png' : '../../../../imgs/icons8-eye-closed.png'; 
        this.alt = (type === 'text') ? 'Esconder senha' : 'Mostrar senha';
    });

    const inputAndIconWrapper = createDiv('input-and-icon-wrapper');
    inputAndIconWrapper.append(passwordUserInput, togglePassword);
    groupNewPassword.append(labelPassword, inputAndIconWrapper);

    // Adiciona todos os grupos de campos ao container
    containerInputs.append(groupNewName, groupNewEmail, groupNewPassword);

    // Mostra o overlay e a caixa de edição
    customEditOverlay.classList.add('visible'); 
    customEditInputs.classList.add('visible');

    // Funções para lidar com o clique nos botões Salvar e Cancelar
    const handleSave = async (ev) => {
        ev.preventDefault();
        const updatedData = {};
        // Verifica se o nome foi alterado e não está vazio
        if (nameUserInput.value !== userToEdit.name && nameUserInput.value.trim() !== '') {
            updatedData.name = nameUserInput.value;
        }
        // Verifica se o e-mail foi alterado e não está vazio
        if (emailUserInput.value !== userToEdit.email && emailUserInput.value.trim() !== '') {
            updatedData.email = emailUserInput.value;
        }
        // Se o campo de senha não estiver vazio, significa que o usuário quer alterar
        if (passwordUserInput.value !== '') { 
            updatedData.password = passwordUserInput.value;
        }

        // Se nenhum campo foi de fato alterado, avisa o usuário
        if (Object.keys(updatedData).length === 0) {
            showCustomAlert('Nenhuma alteração foi feita.');
            closeEditForm();
            return;
        }
        
        await onSaveCallback(userToEdit.id, updatedData); // Chama o callback principal para salvar
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