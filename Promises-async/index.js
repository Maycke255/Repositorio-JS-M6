/* Para usarmos funções assincronas, usamos apenas a palavra async no inicio, assim não precisamos retornar uma nova promise nem nada
apenas declarar a palavra async no incio já e o bastante, exemplo ocm o exercicio anterior: */
//Também não usamos as palavras reservadas resolve e reject, o return da propria promise e o resolve, e o reject acontece quando usamos:
//Promise.reject()
async function checkAge(age) {
    if (!age) {
        //Aqui estamos rejeitando a promise
        return Promise.reject(new Error('age is required'));
    } else {
        //Aqui e o resolve da promise
        return age > 18;
    }
}

async function getAge(birthday) {
    if (!birthday) {
        //Aqui estamos rejeitando a promise
        return Promise.reject(new Error("birthday is required"));
    } else {
        const birthYear = new Date(birthday).getFullYear();
        const currentYear = new Date().getFullYear();
        const youAge = currentYear - birthYear;
        console.log(`Sua idade: ${youAge}.`);
        //Aqui e o resolve da promise
        return youAge;
    }
}

getAge('2004-09-02')
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
});

//APROVEITANDO O ARQUIVO E USAR O AWAIT
/* No caso do await não iriamos precisar usar tratamentos de erros para promises */