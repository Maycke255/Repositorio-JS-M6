class CreateUser {
    constructor(name, email, password){
        this.name = name;
        this.email = email;
        this.password = password;
    }

    verification(){
        if (typeof this.name !== "string" || typeof this.password !== "number") {
            throw new Error('Argumentos invalidos!');
        } else {
            console.log(`Usuario: ${this.name} cadastrado com sucesso.`);
        }
    }

}

/* 3. Tratamento de erro com try, catch e finally
try → bloco onde você coloca o código que pode dar erro.

catch → se um erro acontecer, ele é capturado aqui.

finally → sempre executa, independente se deu erro ou não.
Ou seja try/catch/finally → garante que você capture e trate erros sem quebrar o programa. */

try {
    const newUser1 = new CreateUser('Maycke', 'may@gmail.com', 123456);
    newUser1.verification();
    /* Como o erro ocorre aqui, ele não executa os blocos restantes, apenas exibe o primeiro, os outros não acontecem, mas o catch e o finally
    são executados normalmente */
    const newUser2 = new CreateUser(123, 'may@gmail.com', 123456); //Errado
    newUser2.verification();
    const newUser3 = new CreateUser('Zé', 'may@gmail.com', 123456);
    newUser3.verification();
    const newUser = new CreateUser('Kaio', 'may@gmail.com', 'aaa'); //Errado
    newUser.verification();
} catch (error) {
    // console.log('um erro ocorreu');//Podemos definir uma mensagem também
    console.log(error.message); //Exibimos o proprio erro prescrito na verificação
} finally {
    console.log('Aplicação concluida!'); //Feedback que sempre ocorre quando a aplicação e concluida, mesmoo se existir erros ou acertos, 
    // ela aparece
}

/* Resumindo:
Executa o primeiro correto ✅
Encontra o primeiro errado ❌ → interrompe
Ignora os seguintes (certos ou errados, não importa)
Vai pro catch → mostra o erro
Sempre roda o finally → feedback final */

//____Outro exemplo de uso:____//

class Division {
    constructor(a, b){
        this.a = a;
        this.b = b;
    }

    verification(){
        if (isNaN(this.a) || isNaN(this.b)) {
            throw new Error('Ambos entradas precisam ser números.');
        }

        if (this.b === 0){
            throw new Error('Divisão por zero não e permitida.');
        }

        return this.a / this.b;
    }
}

const division = new Division(10, 2);
const division2 = new Division(12, 0);

try {
    division.verification();
    console.log(division);

    division2.verification();
    console.log(division2);
} catch (error) {
    console.log(`Um erro ocorreu: ${error.message}`);
} finally {
    console.log('Operações concluidas.');
}