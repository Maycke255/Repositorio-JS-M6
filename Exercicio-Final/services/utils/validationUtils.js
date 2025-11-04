import { fetchData } from '../api.js'; // Precisamos da função fetchData para consultar a API

/**
 * Verifica se um e-mail está cadastrado na base de usuários.
 * @param {string} email - O e-mail a ser verificado.
 * @returns {Promise<boolean>} - True se o e-mail existir, False caso contrário.
 */
export async function checkUserEmailExists(email) {
    if (!email || email.trim() === '') {
        return false; // Um e-mail vazio ou em branco não "existe"
    }
    try {
        // Usa o endpoint de usuários com um filtro por e-mail
        const users = await fetchData(`users?email=${encodeURIComponent(email)}`);
        return users.length > 0; // Se encontrar pelo menos um usuário com o e-mail, ele existe
    } catch (error) {
        console.error('Erro ao verificar e-mail do usuário:', error);
        // Em caso de erro na API, por segurança, podemos considerar que não existe ou lançar o erro
        return false;
    }
}