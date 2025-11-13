// controller/Loan.js

export class Loan {
    // Agora o construtor recebe userId
    constructor (date, userId, totalValue, installments, rate, totalAmountToPay, installmentAmount) {
        this.date = date;
        this.userId = userId; // <--- NOVO: Referencia o usuário pelo ID
        this.totalValue = totalValue;
        this.installments = installments;
        this.rate = rate;
        this.totalAmountToPay = totalAmountToPay;
        this.installmentAmount = installmentAmount;
    }

    async makeLoan () {
        const loanData = {
            date: this.date,
            userId: this.userId, // <--- NOVO: Usa userId para salvar
            totalValue: this.totalValue,
            installments: this.installments,
            rate: this.rate,
            totalAmountToPay: this.totalAmountToPay,
            installmentAmount: this.installmentAmount
        }

        try {
            const response = await fetch('http://localhost:3000/loans', {
                method: "POST",
                headers: {
                    'Content-type': "application/json"
                },
                    body: JSON.stringify(loanData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao realizar o emprestimo: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            
            console.log('Emprestimo realizado com sucesso:', result);
            return result; // Retorna o loan criado
        } catch (error) {
            console.error('Falha ao realizar o emprestimo:', error);
            throw error;
        }
    }
}