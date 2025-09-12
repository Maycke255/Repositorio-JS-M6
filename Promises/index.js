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
function execute() {
    return new Promise((resolve, reject) => {
        console.log('A promise está sendo executada.')
        setTimeout(() => {
            console.log('Resolvendo a promise...')
            resolve('Resultado')
        }, 3 * 1000) // espera 3 segundos
    })
}

const p = execute()

console.log(p) // aqui a promise ainda está "pendente"

setTimeout(() => {
    console.log(p) // aqui já está "resolvida"
}, 5 * 1000)

// 👉 O que acontece aqui:
// Você chama execute().
// Isso retorna uma Promise pendente (pending).
// Depois de 3 segundos, o setTimeout chama resolve("Resultado").
// Agora a promessa vira resolvida (fulfilled).