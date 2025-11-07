// services/utils/validationUtils.js

import { fetchData } from '../api.js'; // Importe fetchData

// services/utils/validationUtils.js

// Agora importa findUserByEmail de utils.js, que já tem acesso ao cache
import { findUserByEmail } from './utils.js';

/**
 * Verifica se um e-mail está cadastrado na base de usuários.
 * @param {string} email - O e-mail a ser verificado.
 * @returns {Promise<boolean>} - True se o e-mail existir, False caso contrário.
 */
export async function checkUserEmailExists(email) {
    if (!email || email.trim() === '') {
        return false;
    }
    // findUserByEmail já retorna o objeto do usuário ou null, então é fácil verificar a existência
    const user = findUserByEmail(email);
    return user !== null && user !== undefined; // Garante que não é null ou undefined
}