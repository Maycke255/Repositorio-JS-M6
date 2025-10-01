/* Função para renderizar o artigo na tela, ela apenas cria os articles na pagina e adiciona a section  */
function renderArticle(articleData) {
  const article = document.createElement('article')
  article.classList.add('article')
  article.id = `article-${articleData.id}`

  const title = document.createElement('h3')
  title.classList.add('article-title')
  title.textContent = articleData.title

  const content = document.createElement('div')
  content.classList.add('article-content')
  content.innerHTML = articleData.content

  const author = document.createElement('div')
  author.classList.add('article-author')
  author.textContent = articleData.author

  article.append(title, author, content)
  document.querySelector('#articles').appendChild(article)
}

/* Função async que faz apenas o get dos elementos da API */
async function getArticles () {
    try {
        const response = await fetch("http://localhost:3000/articles");

        //Se não encontrar ou dar algum erro de resposta como 404, 500 ve o status
        if (!response.ok){
            throw new Error(`Erro de HTTP: ${response.status}.`);
        }

        //Ela tenta parsear (analisar) essa string de texto como JSON. Se o parsing for bem-sucedido, ela retorna uma Promise 
        // que se resolve com um OBJETO (ou array de objetos) JavaScript nativo.
        /* "Estamos dizendo: para cada resposta (que foi convertida de uma string JSON para um array de objetos JavaScript), faça 
        um forEach usando a função renderArticle que pega cada propriedade contida em cada objeto JavaScript e as coloque na tela."*/
        const article = await response.json();
        article.forEach(renderArticle)
    } catch (error) {
        console.error(`Erro ao buscar artigos, erro: ${error}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    //Aqui dentro já chamamos direto a função getArticles para atualizar a pagina assim que a pagina for gerada
    getArticles();

    //Pegamos o form e adicionamos o evento de criação do post
    const form = document.querySelector('form');
    form.addEventListener('submit', createPost);
});

const form = document.querySelector('form')

async function createPost (ev) {
    ev.preventDefault()

    const articleData = {
        title: document.querySelector('#title').value,
        author: document.querySelector('#author').value,
        content: document.querySelector('#content').value
    }

    try {
        /* Aqui salvamos as informações na API usando o fetch, mas por padrão, o fetch usa o método GET, então nos parametros da requisição
        precisamos mudar o metodo, usamos a palavra "method", adicionamos também um cabeçalho, é um cabeçalho (header) HTTP. Ele atua 
        como essa "etiqueta" na sua requisição (ou na resposta do servidor). Em seguida usamos JSON.stringify para transformar um objeto 
        JavaScript em uma string JSON */
        const conection = await fetch("http://localhost:3000/articles", {
            method: "POST",
            headers: {
                'Content-type': "application/json"
            },
            body: JSON.stringify(articleData)
        });

        if (!conection.ok) {
            const errorData = await conection.json(); // Tenta ler o corpo do erro para mais detalhes
            throw new Error(`Erro ao criar artigo: ${conection.status} - ${errorData.message || conection.statusText}`); // Exibe um dos 
            // dois caso de erro
        }

        const savedArticle = await conection.json();
        //Resetamos todo o formulario
        form.reset();
        renderArticle(savedArticle);
        
        console.log(savedArticle);
    } catch (error) {
        console.error(`Erro na conexão: ${error}`)
    }
}