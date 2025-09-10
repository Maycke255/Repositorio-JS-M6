/* ### Validador de Email e Senha

Construa uma página HTML contendo um formulário de registro com os campos nome, email e senha onde, ao submeter o formulário, deverá ser feita uma 
validação para verificar se o email é um email válido e se a senha atende as regras mínimas de seguraça.
Para que um email seja válido ele deve possuir:

- Um caractere @
- Texto antes do @ com pelo menos 2 caracteres, números ou _ (underscore).
- Texto após o @ com pelo menos 2 caracteres
- Um . seguido de mais texto com pelo menos 2 caracteres após o texto após o @
- Estrutura de um email válido: **xx@xx.xx**

Para que uma senha seja válida ela deve possuir:
- Pelo menos uma letra minúscula.
- Pelo menos uma letra maiúscula.
- Pelo menos um número
- Pelo menos um caractere especial.
- Pelo menos 8 caracteres.

As validação devem ser escritas em funções separadas que lançam um novo erro em caso de falha com uma mensagem apropriada. 
Esse erro deverá ser tratado através de um bloco trycatch, evitando que um erro seja emitido no console do navegador e mostrando para o usuário 
o erro ocorrido. */

let users = [];

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*_+.-]).{8,}$/;

const formLogin = document.getElementById('fLogin');
const emailInput = document.getElementById('iEmail');
const passwordInput = document.getElementById('iPassword');

class Account { 
    #password;

    constructor(email, password){
        this.email = email;
        this.#password = password;
    }

    verificationAccount(){
        if (!emailRegex.test(this.email)) {
            throw new Error('Email inválido, verifique se atende aos requisitos.');
        }

        if (!passwordRegex.test(this.#password)) {
            throw new Error('Senha inválida, verifique se atende aos requisitos.');
        }

        users.push(this);
        console.log(users);
        console.log('Cadastro realizado com sucesso.');
    }
}

formLogin.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const login = new Account(emailInput.value, passwordInput.value);

    try {
        login.verificationAccount();
    } catch (err) {
        alert(err.message);
        console.log(err.message);
    } finally {
        console.log('Operação concluída');
    }

    emailInput.value = '';
    passwordInput.value = '';
});
