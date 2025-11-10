// controller/Deposit.js

// Importa generateUniqueId para a classe Deposit (se for usada para criar o ID na construção,
// mas para o POST, o json-server geralmente gera se não fornecido.
// No entanto, é bom ter em mente se você planeja gerar IDs do lado do cliente para novos depósitos)
// Por agora, vamos assumir que o ID será gerado pelo json-server na criação,
// então a classe não precisa de generateUniqueId para si mesma, mas é bom mencionar.

export class Deposit {
    // O construtor agora recebe userId e valueDeposit
    constructor(userId, valueDeposit) {
        this.userId = userId;
        this.value = valueDeposit;
        // Não armazenamos mais name e email aqui
    }

    async makeDeposit() {
        // O objeto depositData agora contém userId e value, sem name e email
        const depositData = {
            userId: this.userId,
            value: this.value
            // name e email não são mais enviados com o depósito
        }

        try {
            const response = await fetch('http://localhost:3000/deposits', {
                method: 'POST',
                headers: {
                    'Content-type': "application/json"
                },
                body: JSON.stringify(depositData)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Tenta ler o corpo do erro para mais detalhes
                throw new Error(`Erro ao realizar o depósito: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            console.log('Depósito realizado com sucesso:', result);
            return result; // Retorna o depósito criado (com o ID gerado pelo servidor, se for o caso)

        } catch (error) {
            console.error('Falha ao realizar o depósito:', error);
            throw error;
        }
    }
}