export class Loan {
    constructor (date, name, email, totalValue, installments, rate, totalAmountToPay, installmentAmount) {
        this.date = date;
        this.name = name;
        this.email = email;
        this.totalValue = totalValue;
        this.installments = installments;
        this.rate = rate;
        this.totalAmountToPay = totalAmountToPay;
        this.installmentAmount = installmentAmount;
    }
    
    async makeLoan () {
        const loanData = {
            date: this.date,
            name: this.name,
            email: this.email,
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
                const errorData = await response.json(); // Tenta ler o corpo do erro para mais detalhes
                throw new Error(`Erro ao realizar o emprestimo: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            
            console.log('Emprestimo realizado com sucesso:', result);
        } catch (error) {
            console.error('Falha ao realizar o emprestimo:', error);
            throw error;
        }
    }
}