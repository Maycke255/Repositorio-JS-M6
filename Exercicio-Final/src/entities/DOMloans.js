import { displayLoansArea, loansSct } from "../entities/elements.js";
import { showCustomAlert } from "../app.js";
import { emailRegex } from "./DOMtransfers.js";

// ========================= FUNÇÃO PARA BUSCAR USUÁRIO POR E-MAIL ========================= //
async function findUserByEmail(email) {
    try {
        const response = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`); // <<-- CORRIGIDO: 'email' na query
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

// ========================= LÓGICA PARA O CUSTOM SELECT (REUTILIZADA) ========================= //
// Esta função será chamada para inicializar o custom select dinamicamente
function setupCustomSelect(nativeSelect, customSelectWrapper) {
    const selectSelected = customSelectWrapper.querySelector(".select-selected");
    const selectItems = customSelectWrapper.querySelector(".select-items");

    // Inicializa o texto visível com a opção selecionada ou o placeholder
    if (nativeSelect.value === "" && nativeSelect.querySelector('option[disabled][selected]')) {
        selectSelected.innerHTML = nativeSelect.querySelector('option[disabled][selected]').textContent;
    } else if (nativeSelect.options.length > 0) { // Garante que há opções antes de tentar acessar
        selectSelected.innerHTML = nativeSelect.options[nativeSelect.selectedIndex].textContent;
    } else {
        selectSelected.innerHTML = "Selecione..."; // Fallback se não houver opções
    }

    // Adiciona a classe 'same-as-selected' à opção correspondente ao valor inicial
    const initialSelectedValue = nativeSelect.value;
    if (initialSelectedValue) {
        for (let i = 0; i < selectItems.children.length; i++) {
            if (selectItems.children[i].dataset.value === initialSelectedValue) {
                selectItems.children[i].classList.add("same-as-selected");
                break;
            }
        }
    }

    selectSelected.addEventListener("click", function(e) {
        e.stopPropagation();
        // Não é necessário closeAllSelect aqui, pois só teremos um custom select ativo por vez na seção.
        this.classList.toggle("select-arrow-active");
        selectItems.classList.toggle("select-hide");
    });

    for (let i = 0; i < selectItems.children.length; i++) {
        selectItems.children[i].addEventListener("click", function(e) {
            const selectedText = this.textContent;
            const selectedValue = this.dataset.value;

            selectSelected.innerHTML = selectedText;
            nativeSelect.value = selectedValue;

            for (let j = 0; j < selectItems.children.length; j++) {
                selectItems.children[j].classList.remove("same-as-selected");
            }
            this.classList.add("same-as-selected");

            selectSelected.classList.remove("select-arrow-active");
            selectItems.classList.add("select-hide");

            // Dispara um evento 'change' no select nativo para que outros listeners possam reagir, se necessário
            nativeSelect.dispatchEvent(new Event('change'));
        });
    }

    // Fecha o custom select quando o usuário clica em qualquer lugar fora dele (global)
    document.addEventListener("click", function(e) {
        if (!customSelectWrapper.contains(e.target)) {
            selectSelected.classList.remove("select-arrow-active");
            selectItems.classList.add("select-hide");
        }
    });
}

// Função para esconder e remover a seção de emprestimos
function hideLoansSection(wrapperElement) {
    if (!wrapperElement || !wrapperElement.classList.contains('loans-section-active')) {
        return;
    }
    wrapperElement.classList.remove('transfer-section-active');
    const lastAnimatedElement = wrapperElement.querySelector('.btns-loans-group');

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

// ========================= EVENT LISTENERS DA ÁREA DE EMPRESTIMOS ========================= //
export const loansArea = displayLoansArea.addEventListener('click', (ev) => {
   ev.preventDefault();

    let loansContentWrapper = loansSct.querySelector('#loansContentWrapper');

    if (loansContentWrapper && loansContentWrapper.innerHTML !== '') {
        console.log('Seção de emprestimos já está visível ou sendo animada.');
        return;
    }

    if (!loansContentWrapper) {
        loansContentWrapper = document.createElement('form');
        loansContentWrapper.id = 'loansContentWrapper';
        loansContentWrapper.method = 'POST';
        loansContentWrapper.action = 'http://localhost:3000/loans'
        loansSct.append(loansContentWrapper);
    }

    loansContentWrapper.innerHTML = '';
    loansContentWrapper.classList.remove('loans-section-active');

    // --- CRIAÇÃO DOS ELEMENTOS --- //
    const subtitle = document.createElement('h2');
    subtitle.classList.add('subtitle-loan', 'animated-element');
    subtitle.textContent = 'Insira as informações para realização do do emprestimo.';

    const dateGroup = document.createElement('div');
    dateGroup.className = 'date-group';
    dateGroup.classList.add('animated-element');

    const labelDate = document.createElement('label');
    labelDate.htmlFor = 'dateLoan';
    labelDate.classList = 'date-label';
    labelDate.textContent = 'Escolha uma data para programar que dia o emprestimo sera feito, ou faça o emprestimo hoje mesmo' + 
    'clicando no botão "Emprestimo Hoje".';

    const groupDateBtns = document.createElement('div');
    groupDateBtns.classList = 'group-date-btns';

    const dateLoanInput = document.createElement('input');
    dateLoanInput.type = 'date';
    dateLoanInput.required = true;
    dateLoanInput.id = 'dateLoan';
    dateLoanInput.name = 'date';

    const todayDateButton = document.createElement('button');
    todayDateButton.id = 'btnLoanToday';
    todayDateButton.textContent = 'Emprestimo Hoje';
    todayDateButton.type = 'button';

    groupDateBtns.append(dateLoanInput, todayDateButton);
    dateGroup.append(labelDate, groupDateBtns);

    const loanUserGroup = document.createElement('div');
    loanUserGroup.className = 'loan-user-group';
    loanUserGroup.classList.add('animated-element');

    const labelNameLoan = document.createElement('label');
    labelNameLoan.htmlFor = 'nameLoan';
    labelNameLoan.classList = 'name-loan';
    labelNameLoan.textContent = 'Nome da conta que fara o emprestimo (nome do úsuario que irá receber o emprestimo).';

    const nameLoanInput = document.createElement('input');
    nameLoanInput.type = 'text';
    nameLoanInput.id = 'nameLoan';
    nameLoanInput.required = true;
    nameLoanInput.name = 'loanName';

    const labelEmailLoan = document.createElement('label');
    labelEmailLoan.htmlFor = 'emailLoan';
    labelEmailLoan.classList = 'email-loan-label';
    labelEmailLoan.textContent = 'Informe o e-mail de quem esta pegando o emprestimo, no caso o email do nome do usuario informado acima' +
    ', esse e-mail serve apenas como identificador (precisa conter @, gmail e .com).';

    const emailLoanInput = document.createElement('input');
    emailLoanInput.type = 'email';
    emailLoanInput.id = 'emailLoan';
    emailLoanInput.required = true;
    emailLoanInput.name = 'emailLoan';

    loanUserGroup.append(labelNameLoan, nameLoanInput, labelEmailLoan, emailLoanInput);

    const loanDefinition = document.createElement('div');
    loanDefinition.className = 'loan-definition-group';
    loanDefinition.classList.add('animated-element');
    
    const loanGroupValue = document.createElement('div');
    loanGroupValue.className = 'loan-definition-group';

    const labelValueLoan = document.createElement('label');
    labelValueLoan.htmlFor = 'valueLoan';
    labelValueLoan.classList = 'value-loan-label';
    labelValueLoan.textContent = 'Informe o valor do emprestimo.';

    const valueLoanInput = document.createElement('input');
    valueLoanInput.type = 'number'; // <<-- Sugestão: type="number" para melhor UX
    valueLoanInput.id = 'valueLoan';
    valueLoanInput.required = true;
    valueLoanInput.name = 'value';
    valueLoanInput.min = '0.01'; // Mínimo
    valueLoanInput.step = 'any'; // Permite decimais se o tipo for number

    loanGroupValue.append(labelValueLoan, valueLoanInput);

    const loanInstallmentsGroup = document.createElement('div');
    loanInstallmentsGroup.className = 'loan-installments-group';

    // --- CUSTOM SELECT PARA PARCELAS ---
    const customSelectWrapperInstallments = document.createElement('div');
    customSelectWrapperInstallments.className = 'custom-select-wrapper';

    const labelCustomSelectWrapperInstallments = document.createElement('label');
    labelCustomSelectWrapperInstallments.htmlFor = 'loanInstallments';
    labelCustomSelectWrapperInstallments.classList = 'installments-loan-label';
    labelCustomSelectWrapperInstallments.textContent = 'Informe a quantidade de parcelas que sera dividido o emprestimo.';

    const nativeSelectInstallments = document.createElement('select');
    nativeSelectInstallments.name = 'installments';
    nativeSelectInstallments.id = 'loanInstallments';
    nativeSelectInstallments.style.display = 'none'; // Esconde o select nativo

    // Opções de parcelas
    const installmentOptions = ['2x', '4x', '6x', '8x', '10x', '12x', '24x', '32x', '48x'];
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.hidden = true;
    placeholderOption.textContent = 'Selecione as parcelas...';
    nativeSelectInstallments.append(placeholderOption);

    const selectSelectedInstallments = document.createElement('div');
    selectSelectedInstallments.className = 'select-selected';
    selectSelectedInstallments.innerHTML = placeholderOption.textContent;

    const selectItemsInstallments = document.createElement('div');
    selectItemsInstallments.className = 'select-items select-hide';

    installmentOptions.forEach(opt => {
        const optionNative = document.createElement('option');
        optionNative.value = opt.replace('x', ''); // Valor numérico para o nativo
        optionNative.textContent = opt;
        nativeSelectInstallments.append(optionNative);

        const optionCustom = document.createElement('div');
        optionCustom.dataset.value = opt.replace('x', ''); // Valor numérico para o custom
        optionCustom.textContent = opt;
        selectItemsInstallments.append(optionCustom);
    });

    customSelectWrapperInstallments.append(labelCustomSelectWrapperInstallments, nativeSelectInstallments, selectSelectedInstallments, selectItemsInstallments);

    // --- INPUT PARA TAXA ---
    const loanGroupFee = document.createElement('div');
    loanGroupFee.className = 'loan-fee-group';

    const labelFeeLoan = document.createElement('label');
    labelFeeLoan.htmlFor = 'feeLoan';
    labelFeeLoan.classList = 'fee-loan-label';
    labelFeeLoan.textContent = 'Informe a taxa de juros anual (%)'; // Alterado para %

    const feeLoanInput = document.createElement('input');
    feeLoanInput.type = 'number';
    feeLoanInput.id = 'feeLoan';
    feeLoanInput.required = true;
    feeLoanInput.name = 'feePercentage';
    feeLoanInput.min = '0';
    feeLoanInput.step = '0.01';
    feeLoanInput.value = '5'; // Valor padrão para exemplo

    loanGroupFee.append(labelFeeLoan, feeLoanInput);

    loanDefinition.append(loanGroupValue, customSelectWrapperInstallments, loanGroupFee);

    const buttonsLoans = document.createElement('div');
    buttonsLoans.className = 'btns-loans-group';
    buttonsLoans.classList.add('animated-element');

    const setLoanButton = document.createElement('button');
    setLoanButton.id = 'setLoan';
    setLoanButton.textContent = 'Definir Emprestimo';
    setLoanButton.type = 'submit';

    const collectSectionButton = document.createElement('button');
    collectSectionButton.id = 'collectSection';
    collectSectionButton.textContent = 'Recolher Seção';
    collectSectionButton.type = 'button';

    buttonsLoans.append(setLoanButton, collectSectionButton);
    loansContentWrapper.append(dateGroup, loanUserGroup, loanDefinition, buttonsLoans);

    requestAnimationFrame(() => {
        loansContentWrapper.classList.add('loan-section-active');
    });

    // --- AGORA, EVENT LISTENERS AQUI, APÓS A CRIAÇÃO DOS ELEMENTOS ---
    todayDateButton.addEventListener('click', (ev) => {
        ev.preventDefault();
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        dateLoanInput.value = `${year}-${month}-${day}`;
    });

    setLoanButton.addEventListener('click', async (ev) => {
        ev.preventDefault();

        const dateValue = dateLoanInput.value.trim();
        const nameValue = nameLoanInput.value.trim();
        const emailValue = emailLoanInput.value.trim();
        const loanValue = parseFloat(valueLoanInput.value);
        const installments = parseInt(nativeSelectInstallments.value); // Pega o valor numérico das parcelas
        const feePercentage = parseFloat(feeLoanInput.value); // Taxa em porcentagem

        if (!dateValue) { showCustomAlert('Por favor, selecione a data do empréstimo.'); firstErrorInput = dateLoanInput; }
        else if (!nameValue) { showCustomAlert('Por favor, preencha o nome do usuário que fará o empréstimo.'); firstErrorInput = nameLoanInput; }
        else if (!emailValue) { showCustomAlert('Por favor, preencha o e-mail do usuário.'); firstErrorInput = emailLoanInput; }
        else if (isNaN(loanValue) || loanValue <= 0) { 
            showCustomAlert('Por favor, informe um valor principal de empréstimo válido e positivo.'); firstErrorInput = valueLoanInput; }
        else if (isNaN(installments) || installments <= 0) { showCustomAlert('Por favor, selecione o número de parcelas.'); 
            firstErrorInput = customSelectWrapperInstallments.querySelector('.select-selected'); } // Aponta para o custom select
        else if (isNaN(feePercentage) || feePercentage < 0) { showCustomAlert('Por favor, informe uma taxa de juros válida (não negativa).'); 
            firstErrorInput = feeLoanInput; }

        if (firstErrorInput) {
            firstErrorInput.classList.add('error');
            firstErrorInput.focus();
            setTimeout(() => firstErrorInput.classList.remove('error'), 2200);
            return;
        }

        if (!emailRegex.test(userEmail)) {
            showCustomAlert('O e-mail inserido não tem um formato válido.');
            emailLoanInput.classList.add('error');
            emailLoanInput.focus();
            setTimeout(() => emailLoanInput.classList.remove('error'), 2200);
            return;
        }

        const selectedDate = new Date(dateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
            showCustomAlert('A data inserida não é válida. Por favor, selecione uma data real.');
            dateLoanInput.classList.add('error');
            dateLoanInput.focus();
            setTimeout(() => dateLoanInput.classList.remove('error'), 2200);
            return;
        }
        if (selectedDate.getTime() < today.getTime()) {
            showCustomAlert('A data do empréstimo não pode ser menor que a data de hoje. Por favor, selecione uma data futura ou a data de hoje.');
            dateLoanInput.classList.add('error');
            dateLoanInput.focus();
            setTimeout(() => dateLoanInput.classList.remove('error'), 2200);
            return;
        }

        try {
            // 5. Verificação de existência do usuário
            const loanUser = await findUserByEmail(emailValue);

            if (!loanUser) {
                showCustomAlert(`Usuário com e-mail "${userEmail}" não encontrado. Por favor, verifique.`);
                emailLoanInput.classList.add('error');
                emailLoanInput.focus();
                setTimeout(() => emailLoanInput.classList.remove('error'), 2200);
                return;
            }
        } catch (error) {

        }
    })
});