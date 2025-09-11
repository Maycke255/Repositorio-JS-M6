console.log('Iniciando o programa...');

/* setTimeOut e setInterval são nada mais que funções de alta ordem que agem como um temporizador, podemos usa-las para definir quando um bloco de
código irá ser executado ou parar de ser executado, podemos inserir qualquer bloco de código nelas. Ex: */

const timeoutId = setTimeout(() => {
    console.log('Programa carregado após 4 segundos.') //Aqui definimos o bloco
}, 1000 * 4); //Após isso, ainda dentro da função, definimos o tempo em que esse bloco será executado, definimos o tempo em milisegundos, mas 
//uma boa pratica quebrar esse tempo para que fique mais facil de ler, poderiamos fazer 5000 milisegundos, que seriam no caso 5 segundos, 
//ou podemos multiplcar

//As funções set retornam um ID, podemos armazenar esse ID em uma variavel e usar no clearInterval, assim ele irá excluir essa ocorrencia de
//tempo, ou seja a função nem o bloco de código são executados
clearTimeout(timeoutId);

//O setInterval não e muito diferente, porém ele funciona melhor como um crônometro, ele e como um loop for, ou seja fica executando
//infinitamente ate que o programa o pare ou o usuario saia do programa, mas para isso existe o clearTimeout, podemos definri uma variavel antes
//e após isso ir acrescentando tempo a ela
let time = 0;

const intervalId = setInterval(() => {
    time += 2;
    console.log(`Tempo definido para ${time}...`);
    //Para usar o clearTimeout, podemos usar no proprio escopo da função usando a propria função como parametro, podemos criar uma verificação
    // apenas fazemos como antes, definimos como uma variavel e usamos ela como parametro:
    if (time > 10) {
        clearInterval(intervalId);
        console.log('Programa encerrado, tempo esgotado.');
    }
}, 1000 * 2);