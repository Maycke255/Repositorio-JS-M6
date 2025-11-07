// services/utils/utils.js

import { fetchData } from '../api.js'; // Precisamos de fetchData para popular os caches
// Importa elementos DOM de entities/elements.js para closeEditForm
import { customEditOverlay, customEditInputs, containerInputs,
         customAEditOkButton, customEditCancelButton } from '../../src/entities/elements.js';


// --- Cache para dados ---
let allUsersCache = [];
let allDepositsCache = [];

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

// --- Funções de busca no cache ---
export function findUserById(id) {
    return allUsersCache.find(user => user.id === id);
}

export function findDepositById(id) {
    return allDepositsCache.find(deposit => deposit.id === id);
}

export function findUserByEmail(email) {
    return allUsersCache.find(user => user.email === email);
}

// --- Funções de criação de elementos DOM ---
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

export function createButton(textContent, id = null, ...classNames) {
    const button = document.createElement('button');
    button.textContent = textContent;
    if (id) button.id = id;
    if (classNames.length > 0) button.classList.add(...classNames);
    return button;
}

// --- Função para esconder a seção de transações ---
export function hideTransactionSection(sectionElement) {
    sectionElement.classList.remove('transactions-section-active');
    // Adiciona um timeout para remover o conteúdo APÓS a animação de esconder
    setTimeout(() => {
        sectionElement.innerHTML = '';
        sectionElement.dataset.activeSection = ''; // Limpa a seção ativa
    }, 300); // O tempo deve corresponder à duração da sua transição CSS
}

// --- Função para gerar ID único ---
export function generateUniqueId() {
    return Math.random().toString(36).substring(2, 6);
}

// --- FUNÇÃO closeEditForm (AGORA CENTRALIZADA AQUI) ---
export function closeEditForm() {
    containerInputs.innerHTML = '';
    customEditOverlay.classList.remove('visible');
    customEditInputs.classList.remove('visible');

    // REMOVA AS CLASSES se elas foram adicionadas dinamicamente e não são permanentes
    // (Ajustei para o exemplo que tínhamos antes, você pode remover se não usa)
    customAEditOkButton.classList.remove('botao-salvar-form');
    customEditCancelButton.classList.remove('botao-cancelar-form', 'btn-danger');
}