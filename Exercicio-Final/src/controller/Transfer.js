import { showCustomAlert } from '../app.js';

export class Transfer {
    constructor(date, senderName, emailSender, value, recipientName, emailRecipient){
        this.date = date;
        this.senderName = senderName;
        this.emailSender = emailSender;
        this.value = value;
        this.recipientName = recipientName;
        this.emailRecipient = emailRecipient;
    }

    async makeTransfer(){
        const transferData = {
            date: this.date,
            senderName: this.senderName,
            emailSender: this.emailSender,
            valueTransfer: this.value,
            recipientName: this.recipientName,
            emailRecipient: this.emailRecipient
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
                throw new Error(`Erro ao realizar a trasnferencia: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            
            console.log('Transferência realizada com sucesso:', result);
        } catch (error) {
            console.error('Falha ao realizar a transferência:', error);
            throw error;
        }
    }
}