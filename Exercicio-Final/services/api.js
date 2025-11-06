// services/api.js

const API_BASE_URL = 'http://localhost:3000';

export async function fetchData(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar dados de ${endpoint}:`, error);
        throw error; // Propagar o erro para quem chamou
    }
}

export async function deleteResource(type, id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${type}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Erro ao deletar ${type} (ID: ${id}): ${response.status} - ${response.statusText}`);
        }
        return true; // Sucesso
    } catch (error) {
        console.error(`Erro ao deletar item de ${type}:`, error);
        throw error;
    }
}

// MUDANÇA AQUI: de 'PUT' para 'PATCH'
export async function updateResource(type, id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/${type}/${id}`, {
            method: 'PATCH', // <--- ALTERADO: Use PATCH para atualizações parciais
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Erro ao atualizar ${type} (ID: ${id}): ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao atualizar item de ${type}:`, error);
        throw error;
    }
}