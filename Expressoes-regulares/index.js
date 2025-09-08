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
    let fixedString = number.replace(/(?=\+)/)
}