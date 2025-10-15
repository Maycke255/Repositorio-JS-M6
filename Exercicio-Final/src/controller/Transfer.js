import { bankValue } from '../entities/elements.js';
import { showCustomAlert } from '../app.js';

export class Transfer {
    constructor(date, senderName, value, recipientName){
        this.date = date;
        this.senderName = senderName;
        this.value = value;
        this.recipientName = recipientName;
    }

    async makeTransfer(){
        const transferData = {
            date: this.date,
            senderName: this.senderName,
            valueTransfer: this.value,
            recipientName: this.recipientName
        }

        try {
            const response = await fetch('http://localhost:3000/transfers', {
                method: "POST",
                headers: {
                    'Content-type': "application/json"
                },
                    body: JSON.stringify(transferData)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Tenta ler o corpo do erro para mais detalhes
                throw new Error(`Erro ao criar artigo: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            console.log('Transferência realizada com sucesso:', result);
            showCustomAlert('Transferência realizada com sucesso! 🎉'); // Feedback para o usuário
        } catch (error) {
            console.error('Falha ao realizar a transferência:', error);
            showCustomAlert(`Falha na transferência: ${error.message}`);
            throw error;
        }
    }
}