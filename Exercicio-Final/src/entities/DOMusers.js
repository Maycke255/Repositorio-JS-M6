import { showCustomAlert } from "../app.js";
import { User } from "../controller/User.js";
import { userssSct, displayUsersArea } from "./elements.js";


async function checkEmailExist (email) {
    try {
        const response = await fetch('http://localhost:3000/users');

        if (!response.ok) {
            const errorData = await response.json(); // Tenta ler o corpo do erro para mais detalhes
            throw new Error(`Erro ao acessar o banco de dados: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const users = response.json();

        const userFound = users.find(u => u.email === email);
        return !!userFound // Retorna true se encontrar, false caso contrário
    } catch (error) {
        showCustomAlert('Erro na verificação de usuario, verifique se o usuario já esta cadastrado.');
        console.error('Erro na verificação de usuario, verifique se o usuario já esta cadastrado.', error);
        return true;
    }
}

const userArea = displayUsersArea.addEventListener('click', (ev) => {
    ev.preventDefault();

    let userContentWrapper = transfersSct.querySelector('#userContentWrapper');

    // Se já existe e tem conteúdo, não recriar, ou podemos adicionar uma lógica para ocultar e depois mostrar.
    // Para simplificar, vamos verificar se já está ativo/com conteúdo.
    if (userContentWrapper && userContentWrapper.innerHTML !== '') {
        console.log('Seção de criação de usuarios já está visível ou sendo animada.');
        // Opcional: Se quiser que o botão atue como toggle, chame hideTransferSection aqui.
        // hideTransferSection(transferContentWrapper);
        return;
    }

    if (!userContentWrapper) {
        userContentWrapper = document.createElement('form');
        userContentWrapper.id = 'userContentWrapper';
        userContentWrapper.method = 'POST';
        userContentWrapper.action = 'http://localhost:3000/users'
        transfersSct.append(userContentWrapper);
    }

    // Limpa qualquer conteúdo anterior e remove a classe ativa (garante o estado inicial)
    userContentWrapper.innerHTML = '';
    userContentWrapper.classList.remove('users-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS --- //
    // Adicione a classe 'animated-element' a CADA um desses grupos que você quer animar.

    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-users', 'animated-element'); // Adicionado 'animated-element'
    subtitle.textContent = 'Insira as informações para a criação de um úsuario.';

    const groupName = document.createElement('div');
    groupName.classList = 'group-name';
    groupName.classList.add('name-users', 'animated-element'); // Adicionado 'animated-element'

    const labelName = document.createElement('label');
    labelName.htmlFor = 'nameUser';
    labelName.classList = 'name-label';
    labelName.textContent = 'Insira o nome do usuario a ser cadastrado.';

    const nameUserInput = document.createElement('input'); // Variável local do input
    nameUserInput.type = 'text';
    nameUserInput.id = 'nameUser';
    nameUserInput.name = 'userName';

    groupName.append(labelName, nameUserInput);

    const groupEmail = document.createElement('div');
    groupEmail.classList = 'group-email';
    groupEmail.classList.add('email-users', 'animated-element'); // Adicionado 'animated-element'

    const labelEmail = document.createElement('label');
    labelEmail.htmlFor = 'emailUser';
    labelEmail.classList = 'email-label';
    labelEmail.textContent = 'Insira o email do usuario a ser cadastrado (precisa conter @, gmail e .com).';

    const emailUserInput = document.createElement('input'); // Variável local do input
    emailUserInput.type = 'text';
    emailUserInput.id = 'emailUser';
    emailUserInput.name = 'userEmail';

    groupEmail.append(labelEmail, labelCapital);

    const groupPassword = document.createElement('div');
    groupPassword.classList = 'group-password';
    groupPassword.classList.add('password-users', 'animated-element'); // Adicionado 'animated-element'

    const labelPassword = document.createElement('label');
    labelPassword.htmlFor = 'passwordUser';
    labelPassword.classList = 'password-label';
    labelPassword.textContent = 'Crie uma senha para o usuario (deve conter numeros e letras).';

    const passwordUserInput = document.createElement('input'); // Variável local do input
    passwordUserInput.type = 'password';
    passwordUserInput.id = 'passwordUser';
    passwordUserInput.name = 'userPassword';

    groupPassword.append(labelPassword, passwordUserInput);
    
    const groupaCapital = document.createElement('div');
    groupaCapital.classList = 'group-capital';
    groupaCapital.classList.add('capital-users', 'animated-element'); // Adicionado 'animated-element'

    const labelCapital = document.createElement('label');
    labelCapital.htmlFor = 'capitalUser';
    labelCapital.classList = 'capital-label';
    labelCapital.textContent = 'Qual capital o usuario terá em sua conta? Não e permitido usar "." e "," ou qualquer outro caractere especial.';

    const capitalUserInput = document.createElement('input'); // Variável local do input
    capitalUserInput.type = 'number';
    capitalUserInput.id = 'capitalUser';
    capitalUserInput.name = 'userCapital';
    capitalUserInput.min = '0'
    capitalUserInput.step = '100'; 

    groupaCapital.append(labelCapital, capitalUserInput);

    const buttonsCreateUser = document.createElement('div');
    buttonsCreateUser.className = 'btns-user-group';
    buttonsCreateUser.classList.add('animated-element'); // Adicionado 'animated-element'

    const createUserButton = document.createElement('button'); // Variável local do botão
    createUserButton.id = 'createUser';
    createUserButton.textContent = 'Criar Usuario';
    createUserButton.type = 'submit'; // <<-- Importante: Definir como 'submit' para acionar o evento submit do form

    const collectSectionButton = document.createElement('button'); // Variável local do botão
    collectSectionButton.id = 'collectSection';
    collectSectionButton.textContent = 'Recolher Seção';
    collectSectionButton.type = 'button';

    buttonsCreateUser.append(createUserButton, collectSectionButton);
    userContentWrapper.append(groupName, groupEmail, groupPassword, groupaCapital, buttonsCreateUser);

    // --- LÓGICA DA ANIMAÇÃO DE APARECER ---
    // Usamos requestAnimationFrame ou setTimeout para garantir que o navegador
    // tenha tempo de renderizar o estado inicial (opacity:0, max-height:0)
    // ANTES de adicionar a classe que aciona a transição.
    requestAnimationFrame(() => {
        userContentWrapper.classList.add('users-section-active');
    });

    createUserButton.addEventListener('click', async (ev) => {
        ev.preventDefault();

        const nameV = nameUserInput.value;
        const emailV = emailUserInput.value;
        const passwordV = passwordUserInput.value;
        const capitalV = parseFloat(capitalUserInput.value);

        if (!nameV || !emailV || !passwordV || !capitalV || capitalV < 0) {
            showCustomAlert('Por favor, preencha todos os campos e o valor do capital inicial não pode ser nulo.');

            nameUserInput.classList.add('error');
            nameUserInput.focus();
            emailUserInput.classList.add('error');
            emailUserInput.focus();
            passwordUserInput.classList.add('error');
            passwordUserInput.focus();
            capitalUserInput.classList.add('error');
            capitalUserInput.focus();

            setTimeout(() => {
                nameUserInput.classList.remove('error');
                emailUserInput.classList.remove('error');
                passwordUserInput.classList.remove('error');
                capitalUserInput.classList.remove('error');
            }, 2200);
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;
        if (!emailRegex.test(emailV)) {
            showCustomAlert('O e-mail inserido não tem um formato válido. Ex: nome@exemplo.com');

            emailUserInput.classList.add('error');

            setTimeout(() => {
                emailUserInput.classList.remove('error');
            }, 2200);
            return;
        }

        const capitalRegex = /^\d+$/;
        if (!capitalRegex.test(capitalV)) {
            showCustomAlert('O valor do capital deve ser um número inteiro, sem pontos, vírgulas ou outros caracteres especiais.');

            capitalUserInput.classList.add('error');
            setTimeout(() => {

            }, 2200)
                capitalUserInput.classList.remove('error');
            return;
        }

        const emailExist = await checkEmailExist(emailV);
        if (emailExist) {
            showCustomAlert('Ops! Já existe um usuário cadastrado com este e-mail. Por favor, use outro.');

            emailUserInput.classList.add('error');

            setTimeout(() => {
                emailUserInput.classList.remove('error');
            }, 2200);
            return; 
        }

        const newUser = {
            name: nameV,
            email: emailV,
            password: passwordV,
            capital: capitalV
        }

        try {
            
        } catch (error) {
            
        }
    })
})
