import { showCustomAlert } from "../app.js";
import { Deposit } from "../controller/Deposit.js";
import { emailRegex } from "./DOMtransfers.js";
import { depositSct, displayDepositArea } from "./elements.js";

// ========================= FUNÇÃO PARA BUSCAR USUÁRIO POR E-MAIL ========================= //
async function findUserByEmail(email) {
    try {
        const response = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar usuário por e-mail: ${response.status} - ${response.statusText}`);
        }
        const users = await response.json();
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        throw error;
    }
}

// Renomeado para consistência
function hideDepositSection(wrapperElement) {
    if (!wrapperElement || !wrapperElement.classList.contains('deposit-section-active')) {
        return;
    }
    // CORRIGIDO: Removendo a classe correta
    wrapperElement.classList.remove('deposit-section-active');
    const lastAnimatedElement = wrapperElement.querySelector('.btns-deposit-group');

    if (!lastAnimatedElement) {
        setTimeout(() => { wrapperElement.innerHTML = ''; }, 600);
        return;
    }

    lastAnimatedElement.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'max-height' || e.propertyName === 'opacity') {
            wrapperElement.innerHTML = '';
            lastAnimatedElement.removeEventListener('transitionend', handler);
        }
    }, { once: true });
}

export const depositArea = displayDepositArea.addEventListener('click', (ev) => {
   ev.preventDefault();

    let depositContentWrapper = depositSct.querySelector('#depositContentWrapper');

    if (depositContentWrapper && depositContentWrapper.innerHTML !== '') {
        console.log('Seção de depósito já está visível ou sendo animada.');
        return;
    }

    if (!depositContentWrapper) {
        depositContentWrapper = document.createElement('form');
        depositContentWrapper.id = 'depositContentWrapper';
        depositContentWrapper.method = 'POST';
        depositContentWrapper.action = 'http://localhost:3000/deposits'
        // CORRIGIDO: Anexando ao depositSct
        depositSct.append(depositContentWrapper);
    }

    depositContentWrapper.innerHTML = '';
    // CORRIGIDO: Removendo a classe correta
    depositContentWrapper.classList.remove('deposit-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS --- //
    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-deposit', 'animated-element');
    subtitle.textContent = 'Insira as informações para realização do depósito.';

    const nameAccountGroup = document.createElement('div');
    nameAccountGroup.className = 'name-account-group';
    nameAccountGroup.classList.add('animated-element');

    const labelAccount = document.createElement('label');
    labelAccount.htmlFor = 'nameAccount';
    // CORRIGIDO: Usando classList.add
    labelAccount.classList.add('name-account');
    labelAccount.textContent = 'Nome da conta receberá o depósito (nome do usuário).';

    const accountNameInput = document.createElement('input');
    accountNameInput.type = 'text';
    accountNameInput.id = 'nameAccount';
    accountNameInput.required = true;
    accountNameInput.name = 'accountName';

    nameAccountGroup.append(labelAccount, accountNameInput);

    const emailAccountGroup = document.createElement('div');
    emailAccountGroup.className = 'email-account-group';
    emailAccountGroup.classList.add('animated-element');

    const labelEmailAccount = document.createElement('label');
    labelEmailAccount.htmlFor = 'emailAccount';
    // CORRIGIDO: Usando classList.add
    labelEmailAccount.classList.add('email-deposit-label');
    labelEmailAccount.textContent = 'Informe o e-mail da conta que irá receber o depósito, esse e-mail serve apenas como identificador' +
    '(precisa conter @, gmail e .com).';

    const emailAccountInput = document.createElement('input');
    emailAccountInput.type = 'email';
    emailAccountInput.id = 'emailAccount';
    emailAccountInput.required = true;
    emailAccountInput.name = 'emailAccount';

    emailAccountGroup.append(labelEmailAccount, emailAccountInput);

    const valueDepositGroup = document.createElement('div');
    valueDepositGroup.className = 'value-account-group';
    valueDepositGroup.classList.add('animated-element');

    const labelValueDeposit = document.createElement('label');
    labelValueDeposit.htmlFor = 'valueDeposit';
    labelValueDeposit.classList = 'value-deposit-label';
    labelValueDeposit.textContent = 'Informe o valor a ser depositado na conta.';

    const valueDepositInput = document.createElement('input');
    valueDepositInput.type = 'number';
    valueDepositInput.id = 'valueDeposit';
    valueDepositInput.required = true;
    valueDepositInput.name = 'value';
    valueDepositInput.min = '0.01';
    valueDepositInput.step = 'any';

    valueDepositGroup.append(labelValueDeposit, valueDepositInput); // Manter apenas esta linha

    const buttonsDeposit = document.createElement('div');
    buttonsDeposit.className = 'btns-deposit-group';
    buttonsDeposit.classList.add('animated-element');

    const excuteDepositButton = document.createElement('button');
    excuteDepositButton.id = 'executeDeposit';
    excuteDepositButton.textContent = 'Realizar Depósito';
    excuteDepositButton.type = 'submit';

    const collectSectionButton = document.createElement('button');
    collectSectionButton.id = 'collectSection';
    collectSectionButton.textContent = 'Recolher Seção';
    collectSectionButton.type = 'button';

    buttonsDeposit.append(excuteDepositButton, collectSectionButton);

    depositContentWrapper.append(subtitle, nameAccountGroup, emailAccountGroup, valueDepositGroup, buttonsDeposit);

     requestAnimationFrame(() => {
        depositContentWrapper.classList.add('deposit-section-active');
    });

    excuteDepositButton.addEventListener('click', async (ev) => {
        ev.preventDefault();

        const nameValue = accountNameInput.value.trim();
        const emailValue = emailAccountInput.value.trim();
        const valueDeposit = parseFloat(valueDepositInput.value.trim());

        let firstErrorInput = null;

        if (!nameValue) { showCustomAlert('Por favor, insira o nome da conta que receberá o depósito.'); firstErrorInput = accountNameInput; }
        else if (!emailValue) {
            showCustomAlert('Por favor, informe o email da conta que receberá o depósito para fins de identificação');
            firstErrorInput = emailAccountInput;
        }
        // Validação de número - se o input é tipo "number", o navegador já ajuda,
        // mas é bom ter uma checagem customizada se quiser mensagens específicas.
        else if (isNaN(valueDeposit) || valueDeposit <= 0) { // Adicionado verificação se é maior que zero
            showCustomAlert('Por favor, insira um valor válido para o depósito (apenas números e maior que zero).');
            firstErrorInput = valueDepositInput;
        }

        if (firstErrorInput) {
            firstErrorInput.classList.add('error');
            firstErrorInput.focus();
            setTimeout(() => firstErrorInput.classList.remove('error'), 2200);
            return;
        }

        if (!emailRegex.test(emailValue)) {
            showCustomAlert('O e-mail informado não tem um formato válido.'); // Mensagem mais genérica
            firstErrorInput = emailAccountInput;
        }

        if (firstErrorInput) { // Re-verifica se o erro do email setou firstErrorInput
            firstErrorInput.classList.add('error');
            firstErrorInput.focus();
            setTimeout(() => firstErrorInput.classList.remove('error'), 2200);
            return;
        }

        try {
            const accountExist = await findUserByEmail(emailValue);

            if (!accountExist) {
                // CORRIGIDO: Usando emailValue na mensagem
                showCustomAlert(`Conta com email "${emailValue}" não encontrada. Por favor, verifique.`);
                emailAccountInput.classList.add('error');
                emailAccountInput.focus();
                setTimeout(() => emailAccountInput.classList.remove('error'), 2200);
                return;
            }

            const addNewDepositAccount = accountExist.capital + valueDeposit;

            await fetch(`http://localhost:3000/users/${accountExist.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ capital: addNewDepositAccount })
            });

            const newDeposit = new Deposit(
                nameValue,
                emailValue,
                valueDeposit
            );

            await newDeposit.makeDeposit();
            showCustomAlert('Depósito realizado com sucesso! 🎉');

            accountNameInput.value = '';
            emailAccountInput.value = '';
            valueDepositInput.value = '';
        } catch (error) {
            showCustomAlert('Ocorreu um erro durante a verificação ou processamento do depósito. Verifique o console.');
            console.error(`Erro detalhado durante a verificação/processamento:`, error);
        }
    });
    collectSectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        hideDepositSection(depositContentWrapper); // Renomeado
    });
});