/* REGEX:
### Flags

- **g**  global
- **i**  case insensitive
- **m**  multiline
- **s**  single line

### Caracteres Especiais

- **^**  início da linha
- **$**  fim da linha
- **|**  ou
- **+**  ocorrências em sequência
- **?**  caractere opcional (antes do sinal)
- *****  ocorrências em sequência de forma opcional
- **.**  caractere qualquer (exceto quebra de linha)
- **\**  escapa um caractere especial   
- **\w**  qualquer caractere alfanumérico
- **\d**  qualquer caractere numérico (0–9)
- **\s**  espaços
- **\W**  qualquer caractere que não é alfanumérico
- **\D**  qualquer caractere que não é numérico
- **\S**  qualquer caractere que não é espaço
- **{}**  encontra uma quantidade de caracteres entre um mínimo e um máximo
- **[ ]**  agrupamento de regras
- **( )**  agrupamento de captura

### Look Ahead e Look Behind

- **(?=)**  positive look ahead: encontra termos que precedem um determinado termo
- **(?!)**  negative look ahead: encontra termos que não precedem um determinado termo
- **(?<=)**  positive look behind: encontra termos que são precedidos por um determinado termo
- **(?<!)**  negative look behind: encontra termos que não são precedidos por um determinado termo */

//Vamos formatar de exemplo um número de telefone:
//Usamos o método replace para substituir ou retirar partes de uma string -> .replace(regex, novoValor) → substitui
//.test(string) → retorna true ou false
//Usamos o método match para para retornar a string formatada -> .match(regex) → retorna os resultados encontrados

/*Caso de uso:
let string = 'Bom dia!'
/(?<=\s)\w/ -> Aqui usamos o look behind, siguinifica olhe para tras e procure (?<=) e procure por um espaço \s que ANTECEDE uma letra (\w), 
ele pegaria o "d" por que vem depois do espaço.
OU
/\w(?=\s)/ -> Look Ahead, pegue a primeira letra que encontrar (\w) e olhe para frente (?=), e procure um espaço (\s) que PRECEDE esse caracter, 
ele pegaria o "m" por que vem antes do espaço. */

function PhoneNumber (number) {
    /* Usamos o replace aqui, primeiro estamos definindo uma regra "[]" após isso excluimos todos os espaços "\s", em seguida excluimos todos
    os caracteres que não sejam decimais no caso letras minusculas de "a-z" e letras maiusculas de "A-Z", e em seguir o valor que substituimos
    e por nada, no caso substituimos esses caracteres por nada "" */
    let fixedString = number.replace(/[\sa-zA-Z]/g, "");

    /*Vamos pegar primeiro o código do pais, nesse caso estamos acessando o look behind "(?<=)" estamos dizendo, olhe para tras do caracter "\+"
    e procure por mais de um digito "\d+" que são no caso os dois numeros que precedem o sinal de + e pegamos na posição "[0]", por que o match
    devolve uma array, com algums elementos, mas somente o primeiro elemento e o caracter formatado */
    this.countryCode = fixedString.match(/(?<=\+)\d+/g)[0];

    /* Agora vamos pegar o ddd, estamos dizendo, encontre qualquer digito ou mais "\d+" que venha depois de um inicio de parenteses "(?<=\())",
    após os números, olhe para frente e encontre o parentese fechado "(?=\))" */
    this.ddd = fixedString.match(/(?<=\()\d+(?=\))/g)[0];

    /* Aqui vamos apenas pegar o restante do número completo, olhe para trás "(?<=\)" do caracter ")" e pegue qualquer caracter em sequencia que
    venha após ele, depois usamos o método replace para retirar o traço da string, usamos o replace, pegamos o "-" e substituimos por nada */
    this.number = fixedString.match(/(?<=\)).+/g)[0].replace(/-/g, "");
}

console.log(new PhoneNumber('+55 (22) 9 9876-5432'));
console.log(new PhoneNumber('+1 (555) a555-999-8888'));