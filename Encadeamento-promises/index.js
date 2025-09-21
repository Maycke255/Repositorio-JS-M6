

/* Nesse caso usamos Promise.resolve(5) só como atalho porque não havia lógica assíncrona dentro, era só pra demonstrar encadeamento.
Se fosse algo realmente assíncrono (tipo API ou setTimeout), aí sim seria new Promise((resolve, reject) => {...}). 

Então, quando usar cada um?

-> new Promise(...)
→ quando você precisa de um processo assíncrono real, tipo setTimeout, requisição HTTP, acesso a banco, etc.
Exemplo:

function getNumberAsync() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(5), 1000)
  })
}

-> Promise.resolve(valor)
→ quando você já tem o valor (síncrono) mas quer devolvê-lo no formato de uma Promise, para manter consistência em um fluxo assíncrono.
Exemplo:

function getCachedNumber() {
  const cached = 5
  return Promise.resolve(cached) // embrulha o valor em uma Promise
}*/

function getNumber() {
    const n = 5;
    return Promise.resolve(n);
}

getNumber()
    .then(num => num * 2)   // 10
    .then(num => num + 3)   // 13
    .then(num => num / 2)   // 6.5
    .then(final => console.log("Resultado final:", final))
    .catch(err => console.error(err));

//Ou

function checkAge(age) {
    return new Promise((resolve, reject) => {
        if (age) {
            resolve(age > 18)
        } else {
            reject(new Error('age is required'))
        }
    })
}

function getAge(birthday) {
    return new Promise((resolve, reject) => {
        if (birthday) {
            const birthYear = new Date(birthday).getFullYear()
            const currentYear = new Date().getFullYear()
            resolve(currentYear - birthYear)
        } else {
            reject(new Error('birthday is required'))
        }
    })
}

// No entanto, trabalhar com várias promises dessa forma é confuso e inviável, para isso o javascript nos permite encadear as promises. 
// Isso é possível porque o retorno padrão do .then() também é uma promise, o que significa que nós podemos retornar explicitamente a 
// nossa própria promise qualquer e então encadear esse retorno com outro método .then():
getAge('2009-09-02')
	.then(age => {
    return checkAge(age)
	})
	.then(isOver18 => {
    if (isOver18) {
        console.log('Maior de idade')
    } else {
        console.log('Menor de idade')
    }
	})
	.catch(err => {
    console.log(err.message)
})