import { showCustomAlert } from "../app.js";

class User {
    constructor (name, email, password, capital) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.capital = capital;
    }

    async createUser () {
        const dataUser = {
            name: this.name,
            email: this.email,
            password: this.password,
            capital: this.capital
        }

        try {
            const response = await fetch('http://localhost:3000/users', {
                method: "POST",
                headers: {
                    'Content-type': "application/json"
                },
                    body: JSON.stringify(dataUser)
            });

            if (!response.ok) {
                const errorData = await response.json();
                showCustomAlert('Erro ao fazer comunicação com o banco de dados');
                throw new Error(`Erro ao realizar a trasnferencia: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = response.json();
            console.log('Usuario cadastrado com sucesso:', result);
            showCustomAlert('Usuario cadastrado com sucesso! 🎉'); // Feedback para o usuário
        } catch (error) {
            console.error('Falha ao cadastrar o usuario no banco', error);
            showCustomAlert(`Falha ao cadastrar o usuario no banco: ${error.message}`);
            throw error;
        }
    }
}

export { User }