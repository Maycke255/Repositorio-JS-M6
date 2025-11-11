// controller/Transfer.js

export class Transfer {
    constructor(dateString, senderId, recipientId, value) {
        this.date = dateString;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.value = value;
    }

    async makeTransfer() {
        const transferData = {
            date: this.date,
            senderId: this.senderId,
            recipientId: this.recipientId,
            value: this.value
        }

        try {
            const response = await fetch('http://localhost:3000/transfers', {
                method: 'POST',
                headers: {
                    'Content-type': "application/json"
                },
                body: JSON.stringify(transferData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao realizar a transferência: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            console.log('Transferência realizada com sucesso:', result);
            return result;

        } catch (error) {
            console.error('Falha ao realizar a transferência:', error);
            throw error;
        }
    }
}