export class Deposit {
    constructor(nameAccount, emailAccount, valueDeposit) {
        this.name = nameAccount;
        this.email = emailAccount;
        this.value = valueDeposit;
    }

    async makeDeposit() {
        const depositData = {
            name: this.name,
            email: this.email,
            value: this.value
        }

        try {
            const response = await fetch('http://localhost:3000/deposits', {
                method: 'POST',
                headers: {
                    'Content-type': "application/json"
                },
                    body: JSON.stringify(depositData)
            })

            if (!response.ok) {
                const errorData = await response.json(); // Tenta ler o corpo do erro para mais detalhes
                throw new Error(`Erro ao realizar o deposito: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            console.log('Deposito realizado com sucesso:', result);
        } catch (error) {
            console.error('Falha ao realizar o deposito:', error);
        }
    }
}