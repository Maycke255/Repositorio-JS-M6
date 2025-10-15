import { bankValue } from '../entities/elements.js';
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

    async checkEmailExist () {
        try {
            const response = await fetch('http://localhost:3000/users');

            if (!response.ok) {
                const errorData = await response.json(); // Tenta ler o corpo do erro para mais detalhes
                throw new Error(`Erro ao realizar a trasnferencia: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const users = response.json();

            const emailFound = users.find(u => u.email && u.email === this.emailSender && this.emailRecipient);
            return !!emailFound // Retorna true se encontrar, false caso contrário
        } catch (error) {
            showCustomAlert('Erro na verificação de usuario, verifique se o usuario já esta cadastrado.');
            console.error('Erro na verificação de usuario, verifique se o usuario já esta cadastrado.', error);
            return true;
        }
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
                throw new Error(`Erro ao realizar a trasnferencia: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();

            //ADICIONAR VERIFICAÇÃO SE EXISTEM OS USUARIOS CADASTRADOS
            this.checkEmailExist()
            
            console.log('Transferência realizada com sucesso:', result);
            showCustomAlert('Transferência realizada com sucesso! 🎉'); // Feedback para o usuário
        } catch (error) {
            console.error('Falha ao realizar a transferência:', error);
            showCustomAlert(`Falha na transferência: ${error.message}`);
            throw error;
        }
    }
}