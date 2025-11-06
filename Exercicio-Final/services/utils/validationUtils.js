// services/utils/validationUtils.js

import { fetchData } from '../api.js'; // Importe fetchData

/**
 * Encontra um usuário pelo e-mail na base de dados.
 * @param {string} email - O e-mail do usuário a ser buscado.
 * @returns {Promise<object|null>} - Retorna o objeto do usuário se encontrado, ou null caso contrário.
 */
export async function findUserByEmail(email) {
    if (!email || email.trim() === '') {
        return null;
    }
    try {
        // Usa o endpoint de usuários com um filtro por e-mail
        // `fetchData` com filtro retorna um array, então pegamos o primeiro elemento
        const users = await fetchData(`users?email=${encodeURIComponent(email)}`);
        return users.length > 0 ? users[0] : null; // Retorna o primeiro usuário encontrado ou null
    } catch (error) {
        console.error('Erro ao buscar usuário por e-mail:', error);
        return null;
    }
}

// Se você ainda precisar de uma função que retorne apenas booleano em outros lugares:
export async function checkUserEmailExists(email) {
    const user = await findUserByEmail(email);
    return user !== null;
}