/* _____Método ALL_____ */
/* O método all, e usado para executar várias promises em paralelo, ela recebe uma array de promises, e devolve esse resultado somente se todas
derem sucesso, se alguma falhar, todas elas falham. Ex: */

function tasks (name, time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (typeof time !== "number") {
                reject('Erro na operação, valor invalido.');
            } else {
                resolve(`Tarefa ${name} resolvida com sucesso, tempo de execução: ${time/1000}s.`);
            }
        }, time);
    });
}

//Chamamos o método atravez da palavra reservada "Promise", ela irá retornar um conjunto de promises, por mais que umas levem mais tempo que as outras
//ambas estão sendo executadas ao mesmo tempo
Promise.all([
    //Por mais que ambas tenham tempo diferentes, elas entregam o resultado ao mesmo tempo, mas como estão agindo em paralelo, a que tiver um tempo
    //menor vai ficar pronta e esperar a outra com tempo maior ficar pronta para serem entregues todas juntas
    tasks('Número 1', 2000),
    tasks('Número 2', 1000),
    tasks('Número 3', null), //Caso tenha uma errada, todas dão erro
    tasks('Número 4', 3000)
]).then((results) => {
    console.log('Tarefas terminadas...');
    console.log(results);
}).catch((rejects) => {
    console.log(`Deu ruim: ${rejects}`);
})

//OUTRO CASO DE USO:
const numbers = [4, 9, 5, 13, 77]

function asyncSquare(x) {
    return new Promise((resolve, reject) => {
        resolve(x * x)
    })
}

Promise.all(numbers.map(number => asyncSquare(number))).then(squares => {
    console.log(squares)
})