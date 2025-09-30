/* API (Application Programming Interface) é um conjunto de regras, protocolos e ferramentas para a construção de software e aplicações. 
Ela define como diferentes partes do software devem interagir.
Em termos mais simples, é um contrato que permite que um sistema (sua aplicação, por exemplo) converse e troque informações com outro sistema 
(como o sistema de um banco, uma rede social, um serviço de mapas, etc.) de forma padronizada.
Exemplo prático: Quando você usa um aplicativo de previsão do tempo no seu celular, ele não tem um satélite próprio para coletar dados. 
Ele usa uma API de um serviço meteorológico (como o OpenWeatherMap, por exemplo) para solicitar a temperatura e as condições atuais, 
e o serviço retorna esses dados para o seu aplicativo exibir. */

async function getPokemon () {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/arceus`);
    console.log(response);

    const pokemon = await response.json();
    console.log(pokemon)
}

getPokemon()