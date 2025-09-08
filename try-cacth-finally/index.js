class CreateUser {
    constructor(name, email, password){
        this.name = name;
        this.email = email;
        this.password = password;
    }

    verification(){
        if (typeof this.name !== "string" || typeof this.password !== "number") {
            console.log('Argumentos invalidos!')
        }
    }
}

const newUser = new CreateUser('Maycke', 'may@9261.com', 'aaa');

console.log(newUser.verification())