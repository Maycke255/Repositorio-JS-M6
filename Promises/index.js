/* Promises funcionam como uma API rodando em segundo plano, ela serve para não travar a aplicação enquanto roda uma aplicação muito pesada,
como buscar dados no servidor e trazer para o usuario e equanto faz isso o usuario pode rodar o resto da aplicação sem travar, e no final ter
seu resultado de volta, ex:

Imagine que seu programa precise:
Buscar dados em um banco de dados 🗄️
Chamar uma API (clima, CEP, produtos, etc.) 🌐
Ler/escrever arquivos no HD 💾
Esperar o usuário clicar em algo ou terminar uma ação ⏳
Essas operações podem demorar milissegundos, segundos ou até minutos.
Se o JavaScript fosse síncrono, ele congelaria a tela enquanto espera a resposta.
Com Promises (ou async/await), o JS diz:

“Beleza, eu pedi a informação. Enquanto não vem, vou continuar rodando o resto do código. Quando estiver pronto, eu resolvo essa promessa.” */
// function execute() {
//     return new Promise((resolve, reject) => {
//         console.log('A promise está sendo executada.')
//         setTimeout(() => {
//             console.log('Resolvendo a promise...')
//             resolve('Resultado')
//         }, 3 * 1000) // espera 3 segundos
//     })
// }

// console.log(p) // aqui a promise ainda está "pendente"

// setTimeout(() => {
//     console.log(p) // aqui já está "resolvida"
// }, 5 * 1000)

// 👉 O que acontece aqui:
// Você chama execute().
// Isso retorna uma Promise pendente (pending).
// Depois de 3 segundos, o setTimeout chama resolve("Resultado").
// Agora a promessa vira resolvida (fulfilled).

/* Um cenário muito comum é que precisemos executar um código assim que a promise for resolvida, e para isso usamos o método .then(). 
Ele nos permite definir justamente a função “resolve” da promise, ou seja, a função que recebe o resultado como parâmetro e é chamada quando a 
promise é bem sucedida: */

//São como se fossem tratamentos de erros assim como try, catch e finally

function division (a, b){
    return new Promise((result, reject) => {
        console.log('A promise esta sendo executada...')
        setTimeout(()=> {
            if (isNaN(a) || isNaN(b)) {
                console.log('Erro na execução da promise...');
                reject('Ambas entradas precisam ser números.');
            } if (b === 0) {
                console.log('Erro na execução da promise...');
                reject('Divisão por 0 não e permitida!')
            } else {
                console.log(`Resolvendo a divisão...`);
                result(a / b);
            }
        }, 4 * 1000);
    })
}

/* Podemos ir encadeando uma função na outra, afinal os métodos retornam a propria promise, o then serve para ser executado quando a promise da certo sem
nenhum erro, o catch para os erros e o finally apenas para finalizar */

division(10, 0).then((result) => {
    console.log(`Divisão concluida, resultado: ${result}.`);
}).catch((reject) => {
    console.log(`Erro na divisão, motivo: ${reject}`);
}).finally(() => {
    console.log('Todas as divisões foram encerradas.')
})