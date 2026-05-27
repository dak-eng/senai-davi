function mf() {
   
    let input = document.getElementById("myInput");
    let div = document.getElementById("myDiv");
   const cep = input.value;

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            div.innerHTML = `
                <p>CEP: ${data.cep}</p>
                <p>Logradouro: ${data.logradouro}</p>
                <p>Bairro: ${data.bairro}</p>
                <p>Cidade: ${data.localidade}</p>
                <p>Estado: ${data.uf}</p>
            `;
        })
        .catch(error => {
            div.innerHTML = `<p>Erro ao buscar o CEP. Verifique se o CEP é válido.</p>`;
            console.error('Erro:', error);
        });
}
