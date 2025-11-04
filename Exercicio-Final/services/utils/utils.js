//Arquivo para criar funções pequenas para gerenciar a criação de elementos como div, p, button

import { containerInputs, customEditOverlay, customEditInputs } from "../../src/entities/elements.js";

// Função para esconder e remover a seção de transações (exibição de usuários)
export function hideTransactionSection(wrapperElement) {

    if (!wrapperElement || !wrapperElement.classList.contains('transactions-section-active')) {
        return;
    }
    // CORRIGIDO 1: Remover a classe correta
    wrapperElement.classList.remove('transactions-section-active');
    // CORRIGIDO 2: Usar o seletor correto para o último elemento animado
    const lastAnimatedElement = wrapperElement.querySelector('.btns-transactions-group');

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

// Funções utilitárias para criar elementos DOM de forma mais limpa
export function createDiv(className, ...additionalClasses) {
    const div = document.createElement('div');
    if (className) div.classList.add(className);
    if (additionalClasses.length > 0) div.classList.add(...additionalClasses);
    return div;
}

export function createP(textContent, className, ...additionalClasses) {
    const p = document.createElement('p');
    p.textContent = textContent;
    if (className) p.classList.add(className);
    if (additionalClasses.length > 0) p.classList.add(...additionalClasses);
    return p;
}

export function createH(level, textContent, className, ...additionalClasses) {
    const h = document.createElement(`h${level}`); // level pode ser 1, 2, 3...
    h.textContent = textContent;
    if (className) h.classList.add(className);
    if (additionalClasses.length > 0) h.classList.add(...additionalClasses);
    return h;
}

export function createButton(textContent, id, className, dataset = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = textContent;
    button.id = id;
    if (className) button.classList.add(className);
    for (const key in dataset) {
        button.dataset[key] = dataset[key];
    }
    return button;
}

// Função para fechar o formulário de edição
export function closeEditForm() {
    containerInputs.innerHTML = '';
    customEditOverlay.classList.remove('visible');
    customEditInputs.classList.remove('visible');
    // Você pode adicionar a remoção de classes de botões aqui se elas forem dinâmicas
}