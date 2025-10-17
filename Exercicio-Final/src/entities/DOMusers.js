import { showCustomAlert } from "../app.js";
import { User } from "../controller/User.js";
import { userssSct, displayUsersArea } from "./elements.js";

function hideUserSection(wrapperElement) {
    if (!wrapperElement || !wrapperElement.classList.contains('users-section-active')) {
        return;
    }
    wrapperElement.classList.remove('users-section-active');
    const lastAnimatedElement = wrapperElement.querySelector('.btns-user-group');

    if (!lastAnimatedElement) {
        setTimeout(() => { wrapperElement.innerHTML = ''; }, 600);
        return;
    }

    lastAnimatedElement.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'max-height' || e.propertyName === 'opacity') {
            wrapperElement.innerHTML = '';
            lastAnimatedElement.removeEventListener('transitionend', handler);
        }
    },
    { once: true });
}

async function checkEmailExist (email) {
    try {
        const response = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);

        if (!response.ok) {
            throw new Error(`Erro ao acessar o banco de dados: ${response.status} - ${response.statusText}`);
        }

        const users = await response.json();

        const userFound = users.find(u => u.email === email);
        return !!userFound // Retorna true se encontrar, false caso contrário
    } catch (error) {
        showCustomAlert('Erro na verificação de usuario, verifique se o usuario já esta cadastrado.');
        console.error('Erro na verificação de usuario, verifique se o usuario já esta cadastrado.', error);
        return true;
    }
}

export const userArea = displayUsersArea.addEventListener('click', (ev) => {
    ev.preventDefault();

    let userContentWrapper = userssSct.querySelector('#userContentWrapper');

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
        userssSct.append(userContentWrapper);
    }

    // Limpa qualquer conteúdo anterior e remove a classe ativa (garante o estado inicial)
    userContentWrapper.innerHTML = '';
    userContentWrapper.classList.remove('users-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS --- //
    // Adicione a classe 'animated-element' a CADA um desses grupos que você quer animar.

    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-users', 'animated-element'); // Adicionado 'animated-element'
    subtitle.textContent = 'Insira as informações para a criação de um úsuario.';
    userContentWrapper.append(subtitle);

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
    nameUserInput.required = true;
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
    emailUserInput.type = 'email';
    emailUserInput.id = 'emailUser';
    emailUserInput.required = true;
    emailUserInput.name = 'email';

    groupEmail.append(labelEmail, emailUserInput);

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
    passwordUserInput.required = true;
    passwordUserInput.name = 'password';

    const togglePassword = document.createElement('img');
    togglePassword.classList.add('password-toggle-icon');
    togglePassword.id = 'togglePassword';
    togglePassword.src = '../imgs/icons8-eye-50.png'; 
    togglePassword.alt = 'Mostrar senha'; 

    //=================== BOTÃO DE MOSTRAR SENHA ===================//
    togglePassword.addEventListener('click', function () {
        const type = passwordUserInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordUserInput.setAttribute('type', type);

        // Altera a imagem src e o texto alt com base no tipo do input
        if (type === 'text') {
            this.src = '../imgs/icons8-eye-closed.png'; 
            this.alt = 'Esconder senha';
        } else {
            this.src = '../imgs/icons8-eye-50.png'; 
            this.alt = 'Mostrar senha';
        }
    });

    // ---- NOVO ----
    const inputAndIconWrapper = document.createElement('div');
    inputAndIconWrapper.classList.add('input-and-icon-wrapper'); // Adicione uma nova classe para estilização

    // Adicione o input e o ícone ao novo wrapper
    inputAndIconWrapper.append(passwordUserInput, togglePassword);

    // Agora, adicione o label e o novo wrapper ao groupPassword
    groupPassword.append(labelPassword, inputAndIconWrapper);
    
    const groupCapital = document.createElement('div');
    groupCapital.classList = 'group-capital';
    groupCapital.classList.add('capital-users', 'animated-element'); // Adicionado 'animated-element'

    const labelCapital = document.createElement('label');
    labelCapital.htmlFor = 'capitalUser';
    labelCapital.classList = 'capital-label';
    labelCapital.textContent = 'Qual capital o usuario terá em sua conta? Não e permitido usar "." e "," ou qualquer outro caractere especial.';

    const capitalUserInput = document.createElement('input'); // Variável local do input
    capitalUserInput.type = 'number';
    capitalUserInput.id = 'capitalUser';
    capitalUserInput.name = 'capital';
    capitalUserInput.required = true;
    capitalUserInput.min = '0'
    capitalUserInput.step = '1'; 

    groupCapital.append(labelCapital, capitalUserInput);

    const buttonsCreateUser = document.createElement('div');
    buttonsCreateUser.className = 'btns-user-group';
    buttonsCreateUser.classList.add('animated-element'); // Adicionado 'animated-element'

    const createUserButton = document.createElement('button'); // Variável local do botão
    createUserButton.type = 'submit'; // <<-- Importante: Definir como 'submit' para acionar o evento submit do form
    createUserButton.id = 'createUser';
    createUserButton.textContent = 'Criar Usuario';

    const collectSectionButton = document.createElement('button'); // Variável local do botão
    collectSectionButton.type = 'button';
    collectSectionButton.id = 'collectSection';
    collectSectionButton.textContent = 'Recolher Seção';

    buttonsCreateUser.append(createUserButton, collectSectionButton);
    userContentWrapper.append(groupName, groupEmail, groupPassword, groupCapital, buttonsCreateUser);

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
        const capitalV = parseFloat(capitalUserInput.value.trim());

        let fistErrorInput = null;

        if (!nameV) {showCustomAlert('Por favor, preencha o nome do usuario'); fistErrorInput = nameUserInput}
        else if (!emailV) { showCustomAlert('Por favor, preencha o e-mail do usuário.'); fistErrorInput = emailUserInput; }
        else if (!passwordV) { showCustomAlert('Por favor, preencha a senha do usuário.'); fistErrorInput = passwordUserInput; }
        else if (!capitalUserInput) { showCustomAlert('Por favor, preencha o capital inicial do usuário.'); fistErrorInput = capitalUserInput; }

        if (fistErrorInput) {
            fistErrorInput.classList.add('error');
            fistErrorInput.focus();
            setTimeout(() => fistErrorInput.classList.remove('error'), 2200);
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

        try {
            const emailExist = await checkEmailExist(emailV);
            if (emailExist) {
                showCustomAlert('Ops! Já existe um usuário cadastrado com este e-mail. Por favor, use outro.');

                emailUserInput.classList.add('error');
                emailUserInput.focus()

                setTimeout(() => {
                    emailUserInput.classList.remove('error');
                }, 2200);
                return; 
            }

            const newUser = new User(nameV, emailV, passwordV, capitalV);
            newUser.createUser();

            nameUserInput.value = '';
            emailUserInput.value = '';
            passwordUserInput.value = '';
            capitalUserInput.value = '';
        } catch (error) {
            showCustomAlert('Erro ao cadastrar usuario, verifique o console!', error)
            console.log(`Erro no cadastro: ${error.message}`);
        }
    })
    collectSection.addEventListener('click', (e) => { // Mantido como 'click' no botão
            e.preventDefault();
            hideUserSection(userContentWrapper);
    });
})
