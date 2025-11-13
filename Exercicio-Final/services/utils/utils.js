// services/utils/utils.js

import { fetchData } from '../api.js';
import { customEditOverlay, customEditInputs, containerInputs,
         customAEditOkButton, customEditCancelButton } from '../../src/entities/elements.js';


export let allUsersCache = [];
export let allDepositsCache = [];
export let allTransfersCache = [];
export let allLoansCache = []; // <--- NOVO: Cache para empréstimos

// --- Funções de carregamento e atualização do cache ---
export async function loadAndCacheAllUsers() {
    try {
        allUsersCache = await fetchData('users');
        console.log('Users cache loaded:', allUsersCache);
    } catch (error) {
        console.error('Erro ao carregar usuários para cache:', error);
        allUsersCache = [];
    }
}

export async function loadAndCacheAllDeposits() {
    try {
        allDepositsCache = await fetchData('deposits');
        console.log('Deposits cache loaded:', allDepositsCache);
    } catch (error) {
        console.error('Erro ao carregar depósitos para cache:', error);
        allDepositsCache = [];
    }
}

export async function loadAndCacheAllTransfers() {
    try {
        allTransfersCache = await fetchData('transfers');
        console.log('Transfers cache loaded:', allTransfersCache);
    } catch (error) {
        console.error('Erro ao carregar transferências para cache:', error);
        allTransfersCache = [];
    }
}

// <--- NOVO: Função para carregar e cachear empréstimos
export async function loadAndCacheAllLoans() {
    try {
        allLoansCache = await fetchData('loans');
        console.log('Loans cache loaded:', allLoansCache);
    } catch (error) {
        console.error('Erro ao carregar empréstimos para cache:', error);
        allLoansCache = [];
    }
}

// --- Funções de busca no cache ---
export function findUserById(id) {
    return allUsersCache.find(user => user.id === id);
}

export function findDepositById(id) {
    return allDepositsCache.find(deposit => deposit.id === id);
}

export function findTransferById(id) {
    return allTransfersCache.find(transfer => transfer.id === id);
}

// <--- NOVO: Busca por ID de empréstimo
export function findLoanById(id) {
    return allLoansCache.find(loan => loan.id === id);
}

export function findUserByEmail(email) {
    return allUsersCache.find(user => user.email === email);
}

// --- Funções de criação de elementos DOM --- (Inalteradas)
export function createDiv(className, id = null) {
    const div = document.createElement('div');
    div.className = className;
    if (id) {
        div.id = id;
    }
    return div;
}

export function createP(textContent, className = null, id = null) {
    const p = document.createElement('p');
    p.textContent = textContent;
    if (className) p.className = className;
    if (id) p.id = id;
    return p;
}

export function createH(level, textContent, className = null, id = null) {
    const h = document.createElement(`h${level}`);
    h.textContent = textContent;
    if (className) h.className = className;
    if (id) h.id = id;
    return h;
}

export function createButton(textContent, id = null, classNames = [], dataset = {}) {
    const button = document.createElement('button');
    button.textContent = textContent;
    if (id) button.id = id;
    if (Array.isArray(classNames) && classNames.length > 0) {
        button.classList.add(...classNames);
    } else if (typeof classNames === 'string' && classNames.length > 0) {
        button.classList.add(classNames);
    }

    for (const key in dataset) {
        if (Object.hasOwnProperty.call(dataset, key)) {
            button.dataset[key] = dataset[key];
        }
    }
    return button;
}

export function hideTransactionSection(sectionElement) {
    sectionElement.classList.remove('transactions-section-active');
    setTimeout(() => {
        sectionElement.innerHTML = '';
        sectionElement.dataset.activeSection = '';
    }, 300);
}

export function generateUniqueId() {
    return Math.random().toString(36).substring(2, 6);
}

export function closeEditForm() {
    containerInputs.innerHTML = '';
    customEditOverlay.classList.remove('visible');
    customEditInputs.classList.remove('visible');

    customAEditOkButton.classList.remove('botao-salvar-form');
    customEditCancelButton.classList.remove('botao-cancelar-form', 'btn-danger');
}