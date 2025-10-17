import { showCustomAlert } from "../app.js";
import { Deposit } from "../controller/Deposit.js";
import { depositSct, displayDepositArea } from "./elements.js";

// Regex para validação de email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;

// ========================= FUNÇÃO PARA BUSCAR USUÁRIO POR E-MAIL ========================= //
async function findUserByEmail(email) {
    try {
        const response = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`); // <<--'email' na query
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

// Função para esconder e remover a seção de transferência (mantida)
function hideTransferSection(wrapperElement) {
    if (!wrapperElement || !wrapperElement.classList.contains('transfer-section-active')) {
        return;
    }
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
        console.log('Seção de transferência já está visível ou sendo animada.');
        return;
    }

    if (!depositContentWrapper) {
        depositContentWrapper = document.createElement('form');
        depositContentWrapper.id = 'depositContentWrapper';
        depositContentWrapper.method = 'POST';
        depositContentWrapper.action = 'http://localhost:3000/deposists'
        transfersSct.append(depositContentWrapper);
    }

    depositContentWrapper.innerHTML = '';
    depositContentWrapper.classList.remove('transfer-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS --- //
    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-deposit', 'animated-element');
    subtitle.textContent = 'Insira as informações para realização do deposito.';

    const nameAccountGroup = document.createElement('div');
    nameAccountGroup.className = 'name-account-group';
    nameAccountGroup.classList.add('animated-element');

    const labelAccount = document.createElement('label');
    labelAccount.htmlFor = 'nameAccount';
    labelAccount.classList = 'name-account';
    labelAccount.textContent = 'Nome da conta receberá o deposito (nome do úsuario).';

    const accountNameInput = document.createElement('input');
    accountNameInput.type = 'text';
    accountNameInput.id = 'nameAccount';
    accountNameInput.required = true;
    accountNameInput.name = 'accountName';

    nameAccountGroup.append(labelAccount, accountName);

    const emailAccountGroup = document.createElement('div');
    emailAccountGroup.className = 'email-account-group';
    emailAccountGroup.classList.add('animated-element');

    const labelEmailAccount = document.createElement('label');
    labelEmailAccount.htmlFor = 'emailAccount';
    labelEmailAccount.classList = 'email-deposit-label';
    labelEmailAccount.textContent = 'Informe o e-mail da conta que irá receber o deposito, esse e-mail serve apenas como identificador' + 
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
    labelValueDeposit.textContent = 'Informe o valor a ser depósitado na conta.';

    const valueDepositInput = document.createElement('input');
    valueDepositInput.type = 'number'; // <<-- Sugestão: type="number" para melhor UX
    valueDepositInput.id = 'valueDeposit';
    valueDepositInput.required = true;
    valueDepositInput.name = 'value';
    valueDepositInput.min = '0.01'; // Mínimo para transferência
    valueDepositInput.step = 'any'; // Permite decimais se o tipo for number

    const buttonsDeposit = document.createElement('div');
    buttonsDeposit.className = 'btns-deposit-group';
    buttonsDeposit.classList.add('animated-element');

    const excuteDepositButton = document.createElement('button');
    excuteDepositButton.id = 'executeDeposit';
    excuteDepositButton.textContent = 'Realizar Deposito';
    excuteDepositButton.type = 'submit';

    const collectSectionButton = document.createElement('button');
    collectSectionButton.id = 'collectSection';
    collectSectionButton.textContent = 'Recolher Seção';
    collectSectionButton.type = 'button';

    buttonsDeposit.append(excuteDepositButton, collectSectionButton);

    valueDepositGroup.append(labelValueDeposit, valueDepositInput);
    depositContentWrapper.append(subtitle, nameAccountGroup, emailAccountGroup, valueDepositGroup, buttonsDeposit);

     requestAnimationFrame(() => {
        depositContentWrapper.classList.add('deposit-section-active');
    });

    excuteDepositButton.addEventListener('click', (ev) => {
        ev.preventDefault();
    })
});