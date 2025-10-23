/* # 25 - Exercício Final - Consumindo uma API
### Finanças Pessoais

Desenvolva uma aplicação web de página única utilizando html, css e javascript para controle de finanças pessoais que atenda aos seguintes 
requisitos:

- sua aplicação deverá utilizar a biblioteca json-server para simular um backend que armazena transações financeiras.
- transações devem possuir, pelo menos, as propriedades id (gerenciado pelo json-server), nome e valor.
- a aplicação deverá mostrar na página todas as transações salvas no backend.
- a aplicação deverá ter um formulário para criar uma nova transação no backend (sem atualizar a página) através de uma requisição POST.
- novas transações criadas devem aparecer na lista de todas as transações assim que são criadas, tudo isso sem atualizar a página.
- a aplicação deverá permitir editar os dados de uma transação através de uma requisição PUT (o PUT funciona da mesma forma que o POST, 
enviando dados a serem atualizados no body e com o id do recurso a ser editado na url).
- a aplicação deverá permitir excluir uma transação através de uma requisição DELETE (as requisições DELETE não precisam de um body, 
apenas do id do recurso a ser excluído na url).
- a aplicação também deverá mostrar na página o saldo total, que é calculado somando todos os valores das transações (que podem ser 
positivos ou negativos).
- o valor do saldo total deve estar sempre atualizado na tela, ou seja, ao criar, editar ou excluir uma transação o saldo deverá 
refletir o novo valor. */

/* ===== PERSONALIZAÇÃO DO SELECT ===== */

document.addEventListener("DOMContentLoaded", function() {
    const customSelectWrapper = document.querySelector(".custom-select-wrapper");
    const selectSelected = customSelectWrapper.querySelector(".select-selected");
    const selectItems = customSelectWrapper.querySelector(".select-items");
    const nativeSelect = customSelectWrapper.querySelector("#boxSelection");
    
    // Função para fechar todos os custom selects abertos
    function closeAllSelect(elmnt) {
        const x = document.querySelectorAll(".select-items");
        const y = document.querySelectorAll(".select-selected");
        for (let i = 0; i < y.length; i++) {
            if (elmnt === y[i]) {
                // Não fechar o select que foi clicado
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (let i = 0; i < x.length; i++) {
            if (elmnt !== y[i]) { // Se o clique não foi no 'select-selected' que abre este 'select-items'
                x[i].classList.add("select-hide");
            }
        }
    }

    // Inicializa o texto visível com a opção selecionada ou o placeholder
    if (nativeSelect.value === "" && nativeSelect.querySelector('option[disabled][selected]')) {
        selectSelected.innerHTML = nativeSelect.querySelector('option[disabled][selected]').textContent;
    } else {
        selectSelected.innerHTML = nativeSelect.options[nativeSelect.selectedIndex].textContent;
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
        e.stopPropagation(); // Evita que o clique se propague para o document e feche imediatamente
        closeAllSelect(this); // Fecha outros selects abertos

        this.classList.toggle("select-arrow-active"); // Gira a seta
        selectItems.classList.toggle("select-hide"); // Mostra/esconde o dropdown
    });

    // Para cada item no dropdown (as novas 'divs' das opções)
    for (let i = 0; i < selectItems.children.length; i++) {
        selectItems.children[i].addEventListener("click", function(e) {
            const selectedText = this.textContent;
            const selectedValue = this.dataset.value;

            selectSelected.innerHTML = selectedText; // Atualiza o texto visível
            nativeSelect.value = selectedValue; // Atualiza o valor do select nativo (importante para formulários)

            // Remove a classe 'same-as-selected' de todas as opções
            for (let j = 0; j < selectItems.children.length; j++) {
                selectItems.children[j].classList.remove("same-as-selected");
            }
            // Adiciona a classe 'same-as-selected' à opção clicada
            this.classList.add("same-as-selected");

            selectSelected.classList.remove("select-arrow-active"); // Volta a seta ao normal
            selectItems.classList.add("select-hide"); // Esconde o dropdown
        });
    }

    // Fecha o custom select quando o usuário clica em qualquer lugar fora dele
    document.addEventListener("click", function(e) {
        closeAllSelect(e.target);
    });
});

/* ===== DEFININDO A FUNÇÃO E ESTILIZAÇÃO DA CAIXA DE MENSAGEM ===== */

// Obtém referências aos elementos do alerta personalizado
const customAlertOverlay = document.getElementById('customAlertOverlay');
const customAlert = document.getElementById('customAlert');
const customAlertMessage = document.getElementById('customAlertMessage');
const customAlertOkButton = document.getElementById('customAlertOkButton');

// Função para exibir o alerta personalizado
function showCustomAlert(message) {
    customAlertMessage.textContent = message; // Define a mensagem
    customAlertOverlay.classList.add('visible'); // Mostra o overlay
    customAlert.classList.add('visible');       // Mostra a caixa de alerta
}

// Função para ocultar o alerta personalizado
function hideCustomAlert() {
    customAlertOverlay.classList.remove('visible'); // Oculta o overlay
    customAlert.classList.remove('visible');       // Oculta a caixa de alerta
}

// Adiciona um listener de evento ao botão "OK" para fechar o alerta
customAlertOkButton.addEventListener('click', hideCustomAlert);

export { showCustomAlert }

/* ===== CHAMANDO A FUNÇÃO DE TRANSFERENCIA ===== */

import { trasnferArea } from "./entities/DOMtransfers.js";
import { userArea } from "./entities/DOMusers.js";
import { depositArea } from "./entities/DOMdeposits.js";
import { loansArea } from "./entities/DOMloans.js";

import { display } from "./controller/displays.js";
