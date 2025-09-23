/* Escreva uma função assíncrona que têm como parâmetros o peso e a altura de uma pessoa e retorna uma promise do IMC dessa pessoa. Além disso, caso algum dos 
parâmetros não seja do tipo “number” a promise deverá ser rejeitada.

Você deverá criar também uma outra função que recebe os mesmos parâmetros de peso e altura, chama a função que calcula o IMC e então exibe no terminal o 
resultado das promises em texto. Caso a promise seja resolvida você também deverá mostrar no terminal a situação do IMC da pessoa de acordo com a seguinte tabela:

- Abaixo de 18,5: **magreza**
- Entre 18,5 e 24,9: **normal**
- Entre 25 e 29,9: **sobrepeso**
- Entre 30 e 39,9: **obesidade**
- Acima de 40: **obesidade grave**

Dentro da segunda função, após chamar a função que calcula o IMC, chame a função log do console com uma mensagem qualquer para evidenciar o funcionamento 
assíncrono do código.

Formula: IMC = kg/m2 -> peso / (altura x altura).*/

//===== EXERCICIO 3 - Refatorar o Exercicio 2 com os novos aprendizados sobre async e await ===== //
class Imc {
    constructor(h, w){
        this.height = h;
        this.weight = w;
    }

    #calculationImc () {
        return new Promise((resolve, reject) => {
            console.log('Calculando seu IMC...');

            setTimeout(() => {
                if (isNaN(this.weight) || isNaN(this.height)) {
                    console.log('Erro no calculo...');
                    reject('Ambos parametros precisam ser números');
                } if (this.height <= 0 || this.weight <= 0) {
                    console.log('Erro no calculo...');
                    reject('Sua altura ou peso não podem ser zero...');
                } else {
                    const myImc = this.weight / (this.height * this.height)
                    resolve(myImc);
                }
            }, 2 * 1000);
        })
    }

    displayImc () {
        this.#calculationImc().then((result) => {
            console.log(`Seu imc: ${result.toFixed(2)}.`);

            if (result < 18.5) {
                console.log("Situação: Magreza");
            } else if (result >= 18.5 && result < 24.9) {
                console.log("Situação: Normal");
            } else if (result >= 25 && result < 29.9) {
                console.log("Situação: Sobrepeso");
            } else if (result >= 30 && result < 39.9) {
                console.log("Situação: Obesidade");
            } else if (result >= 40) {
                console.log("Situação: Obesidade grave");
            }
        }).catch((reject) => {
            console.log(`Motivo: ${reject}.`);
        }).finally(() => {
            console.log('Calculo finalizado');
        });
    }
}

const imc = new Imc(1.50, 63.00).displayImc();