// DOMdeposit.js

import { showCustomAlert } from "../app.js";
import { Deposit } from "../controller/Deposit.js";
import { depositSct, displayDepositArea } from "../entities/elements.js";

// Importa funções do utils.js
import { findUserByEmail, hideTransactionSection, loadAndCacheAllUsers, loadAndCacheAllDeposits } from "../../services/utils/utils.js"; // Usar o findUserByEmail e hideTransactionSection centralizados


// ========================= FUNÇÕES AUXILIARES ========================= //

// Renomeado para hideDepositSection para usar a função centralizada
// Função para esconder e remover a seção de transferência (MANTIDA EXATAMENTE COMO VOCÊ TEM)
function hideDepositSectionWrapper(wrapperElement) {
    if (!wrapperElement || !wrapperElement.classList.contains('deposit-section-active')) {
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

    // Se já estiver visível, ou se o conteúdo não estiver vazio, apenas retorna (melhora UX para evitar recarregar form)
    if (depositContentWrapper && depositContentWrapper.classList.contains('deposit-section-active')) {
        console.log('Seção de depósito já está visível.');
        return;
    }

    if (!depositContentWrapper) {
        depositContentWrapper = document.createElement('form');
        depositContentWrapper.id = 'depositContentWrapper';
        depositContentWrapper.method = 'POST';
        depositContentWrapper.action = 'http://localhost:3000/deposits'; // Ação do formulário, mas o JS vai interceptar
        depositSct.append(depositContentWrapper);
    }

    depositContentWrapper.innerHTML = '';
    depositContentWrapper.classList.remove('deposit-section-active'); // Garante que a classe de ativação é removida antes de adicionar novamente

    // --- CRIAÇÃO DOS ELEMENTOS --- //
    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-deposit', 'animated-element');
    subtitle.textContent = 'Insira as informações para realização do depósito.';

    // --- CAMPO NOME DA CONTA (será preenchido automaticamente e readonly) ---
    const nameAccountGroup = document.createElement('div');
    nameAccountGroup.className = 'name-account-group';
    nameAccountGroup.classList.add('animated-element');

    const labelAccount = document.createElement('label');
    labelAccount.htmlFor = 'nameAccount';
    labelAccount.classList.add('name-account');
    labelAccount.textContent = 'Nome da conta receberá o depósito (preenchimento automático):';

    const accountNameInput = document.createElement('input');
    accountNameInput.type = 'text';
    accountNameInput.id = 'nameAccount';
    accountNameInput.required = true;
    accountNameInput.name = 'accountName';
    accountNameInput.readOnly = true; // Torna o campo de nome somente leitura
    accountNameInput.placeholder = 'Preenchido automaticamente ao inserir o e-mail';

    nameAccountGroup.append(labelAccount, accountNameInput);

    // --- CAMPO E-MAIL DA CONTA ---
    const emailAccountGroup = document.createElement('div');
    emailAccountGroup.className = 'email-account-group';
    emailAccountGroup.classList.add('animated-element');

    const labelEmailAccount = document.createElement('label');
    labelEmailAccount.htmlFor = 'emailAccount';
    labelEmailAccount.classList.add('email-deposit-label');
    labelEmailAccount.textContent = 'Informe o e-mail da conta que irá receber o depósito:';

    const emailAccountInput = document.createElement('input');
    emailAccountInput.type = 'email';
    emailAccountInput.id = 'emailAccount';
    emailAccountInput.required = true;
    emailAccountInput.name = 'emailAccount';

    emailAccountGroup.append(labelEmailAccount, emailAccountInput);

    // Adiciona listener para preencher o nome automaticamente ao sair do campo de e-mail
    emailAccountInput.addEventListener('blur', async () => {
        const emailValue = emailAccountInput.value.trim();
        if (emailValue) {
            const user = findUserByEmail(emailValue); // Usa a função de utils.js
            if (user) {
                accountNameInput.value = user.name;
                accountNameInput.classList.remove('error'); // Remove erro se já foi validado
            } else {
                accountNameInput.value = '';
                showCustomAlert(`O e-mail "${emailValue}" não está cadastrado.`);
                emailAccountInput.classList.add('error');
                emailAccountInput.focus();
                setTimeout(() => emailAccountInput.classList.remove('error'), 2200);
            }
        } else {
            accountNameInput.value = '';
        }
    });

    // --- CAMPO VALOR DO DEPÓSITO ---
    const valueDepositGroup = document.createElement('div');
    valueDepositGroup.className = 'value-account-group';
    valueDepositGroup.classList.add('animated-element');

    const labelValueDeposit = document.createElement('label');
    labelValueDeposit.htmlFor = 'valueDeposit';
    labelValueDeposit.classList.add('value-deposit-label'); // Corrigido para add
    labelValueDeposit.textContent = 'Informe o valor a ser depositado na conta.';

    const valueDepositInput = document.createElement('input');
    valueDepositInput.type = 'number';
    valueDepositInput.id = 'valueDeposit';
    valueDepositInput.required = true;
    valueDepositInput.name = 'value';
    valueDepositInput.min = '0.01';
    valueDepositInput.step = 'any';

    valueDepositGroup.append(labelValueDeposit, valueDepositInput);

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

    // --- Lógica do botão "Realizar Depósito" ---
    excuteDepositButton.addEventListener('click', async (ev) => {
        ev.preventDefault();

        const emailValue = emailAccountInput.value.trim();
        const valueDeposit = parseFloat(valueDepositInput.value.trim());

        let firstErrorInput = null;

        // Validação de campos (email e valor)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;

        if (!emailValue) {
            showCustomAlert('Por favor, informe o e-mail da conta que receberá o depósito.');
            firstErrorInput = emailAccountInput;
        } else if (!emailRegex.test(emailValue)) {
            showCustomAlert('O e-mail informado não tem um formato válido.');
            firstErrorInput = emailAccountInput;
        } else if (isNaN(valueDeposit) || valueDeposit <= 0) {
            showCustomAlert('Por favor, insira um valor válido para o depósito (apenas números e maior que zero).');
            firstErrorInput = valueDepositInput;
        }

        if (firstErrorInput) {
            firstErrorInput.classList.add('error');
            firstErrorInput.focus();
            setTimeout(() => firstErrorInput.classList.remove('error'), 2200);
            return;
        }

        try {
            const recipientUser = findUserByEmail(emailValue); // Usa a função de utils.js

            if (!recipientUser) {
                showCustomAlert(`Conta com e-mail "${emailValue}" não encontrada. Por favor, verifique.`);
                emailAccountInput.classList.add('error');
                emailAccountInput.focus();
                setTimeout(() => emailAccountInput.classList.remove('error'), 2200);
                return;
            }

            // 1. Atualiza o capital do usuário
            const newCapital = (recipientUser.capital || 0) + valueDeposit;
            await fetch(`http://localhost:3000/users/${recipientUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ capital: newCapital })
            });

            // 2. Cria o novo depósito com o userId
            const newDeposit = new Deposit(
                recipientUser.id, // Agora passamos o userId
                valueDeposit
            );

            await newDeposit.makeDeposit();
            showCustomAlert('Depósito realizado com sucesso! 🎉');

            // 3. Limpa os campos do formulário
            accountNameInput.value = '';
            emailAccountInput.value = '';
            valueDepositInput.value = '';

            // 4. ATUALIZA OS CACHES após a criação de um novo depósito e a atualização de capital
            await loadAndCacheAllUsers();
            await loadAndCacheAllDeposits();

        } catch (error) {
            showCustomAlert('Ocorreu um erro durante a verificação ou processamento do depósito. Verifique o console.');
            console.error(`Erro detalhado durante a verificação/processamento:`, error);
        }
    });

    // --- Lógica do botão "Recolher Seção" ---
    collectSectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        hideDepositSectionWrapper(depositContentWrapper); // Usa a função wrapper
    });
});