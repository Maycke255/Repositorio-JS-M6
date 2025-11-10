// controller/Transfer.js

export class Transfer {
    constructor(senderId, recipientId, value) {
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.value = value;
        this.date = new Date().toISOString().split('T')[0];
    }

    async makeTransfer() {
        const transferData = {
            senderId: this.senderId,
            recipientId: this.recipientId,
            value: this.value,
            date: this.date
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