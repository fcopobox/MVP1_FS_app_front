/* --------------------------------------------------------------------------------------
   Função para obter a lista existente do servidor via requisição GET
-------------------------------------------------------------------------------------- */
const getList = async () => {                     
  let url = 'http://127.0.0.1:5000/get_locais';   

  fetch(url, { method: 'GET' })                   // Faz requisição GET
    .then(response => response.json())            // Converte resposta para JSON
    .then(data => {                               
      if (data.locais) {                          
        data.locais.forEach(item =>               
          insertList(item.local_nome, item.local_cidade, item.local_pais, item.local_prioridade)
        );                                        // Insere cada item na tabela
      }
    })
    .catch(error => console.error('Error:', error)); 
};

// Carrega lista ao iniciar
getList();                                        // Chama a função assim que o script é carregado


/* --------------------------------------------------------------------------------------
   Função para criar botão de remoção
-------------------------------------------------------------------------------------- */
const insertButton = (parent) => {                // Recebe a célula onde o botão será inserido
  let span = document.createElement("span");      // Cria elemento <span>
  let txt = document.createTextNode("\u00D7");    // Cria texto "×" (símbolo de fechar)
  span.className = "close";                       // Define classe CSS
  span.appendChild(txt);                          // Adiciona o texto ao span
  parent.appendChild(span);                       // Insere o span na célula
};


/* --------------------------------------------------------------------------------------
   Função para remover item da lista ao clicar no botão
-------------------------------------------------------------------------------------- */
const removeElement = () => {                     
  let close = document.getElementsByClassName("close"); // Seleciona todos os botões "×"

  for (let i = 0; i < close.length; i++) {        // Percorre todos os botões
    close[i].onclick = function () {              // Define ação ao clicar
      let row = this.parentElement.parentElement; // Obtém a linha da tabela
      const nomeItem = row.getElementsByTagName('td')[0].innerHTML; 

      if (confirm("Quer mesmo deletar este item?")) { 
        row.remove();                               
        deleteItem(nomeItem);                       // Remove no backend                         
      }
    };
  }
};


/* --------------------------------------------------------------------------------------
   Função para deletar item no servidor via DELETE
-------------------------------------------------------------------------------------- */
const deleteItem = (item) => {                    // Recebe o nome do item a ser deletado
  let url = 'http://127.0.0.1:5000/del_local?local_nome=' + encodeURIComponent(item); 

  fetch(url, { method: 'DELETE' })                
    .then(response => response.json())            // Converte resposta para JSON
    .catch(error => console.error('Error:', error)); 
};


/* -------------------------------------------------------------------------------------- 
  Função para adicionar novo item 
-------------------------------------------------------------------------------------- */
const newItem = () => {                          
  let inputNome = document.getElementById("newNome").value.trim();          
  let inputCidade = document.getElementById("newCidade").value.trim();      
  let inputPais = document.getElementById("newPais").value.trim();          
  let inputPrioridade = document.getElementById("newPrioridade").value.trim(); 

  if (inputNome === '') {                         // Valida nome
    alert("Escreva o nome de um local!");
    return;
  }

  if (inputPais === '') {                         // Valida país
    alert("Informe o país!");
    return;
  }

  if (inputPrioridade === '' || isNaN(inputPrioridade)) { // Valida prioridade
    alert("Prioridade precisa ser número!");
    return;
  }
  // Verificação de duplicidade antes de enviar ao backend
  if (itemDuplicado(inputNome, inputCidade, inputPais)) {
    alert("Este local já existe na lista!");
    return;
  }

  // Envia ao backend
  postItem(inputNome, inputCidade, inputPais, inputPrioridade) // Chama função POST
    .then(resultado => {                        // Recebe resposta do backend
      console.log("Resposta do backend:", resultado); // Log da resposta
      console.log("Status HTTP:", resultado.status);  // Log do status HTTP
      console.log("Status:", resultado.ok);           // Log do ok (true/false)
     
      if (resultado.ok) {                    // Se o backend confirmou sucesso
        insertList(inputNome, inputCidade, inputPais, inputPrioridade); // Insere no front
        alert("Item adicionado!");           // Mensagem de sucesso
      } else {
        alert("Erro ao salvar no servidor."); // Caso backend retorne erro
      }
    });
};


// ----------------------------------------------------------------------
// Função para verificar duplicidade no front-end
// ----------------------------------------------------------------------
const itemDuplicado = (nome, cidade, pais) => {
  const table = document.getElementById("myTable");
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) { // começa em 1 para pular o cabeçalho
    const cols = rows[i].getElementsByTagName("td");

    const nomeExistente = cols[0].textContent.trim().toLowerCase();
    const cidadeExistente = cols[1].textContent.trim().toLowerCase();
    const paisExistente = cols[2].textContent.trim().toLowerCase();

    if (
      nomeExistente === nome.toLowerCase() &&
      cidadeExistente === cidade.toLowerCase() &&
      paisExistente === pais.toLowerCase()
    ) {
      return true; // duplicado
    }
  }

  return false; // não duplicado
};


/* --------------------------------------------------------------------------------------
   Função para enviar ao backend via POST
-------------------------------------------------------------------------------------- */
const postItem = async (inputNome, inputCidade, inputPais, inputPrioridade) => { 
  let url = 'http://127.0.0.1:5000/add_local'; 

  const formData = new FormData();             // Cria objeto FormData
  formData.append("local_nome", inputNome);    
  formData.append("local_cidade", inputCidade);
  formData.append("local_pais", inputPais);    
  formData.append("local_prioridade", inputPrioridade); 

  try {
    const response = await fetch(url, {        // Envia requisição POST
      method: 'POST',
      body: formData
    });

    const data = await response.json();        // Converte resposta para JSON

    return {                                   // Retorna objeto estruturado
      ok: response.ok,                         // true/false dependendo do status HTTP
      status: response.status,                 // Código HTTP
      data: data                               // JSON retornado pelo backend
    };  

  } catch (error) {                            
    console.error("Erro no fetch:", error);    
    return null;                               
  }
};


/* --------------------------------------------------------------------------------------
   Função para inserir item na tabela HTML
-------------------------------------------------------------------------------------- */
const insertList = (local_nome, local_cidade, local_pais, local_prioridade) => { 
  const item = [local_nome, local_cidade, local_pais, local_prioridade]; // Array com dados
  const table = document.getElementById('myTable'); // Seleciona tabela
  const row = table.insertRow();                    // Cria nova linha

  item.forEach(value => {                           // Para cada valor do item
    const cel = row.insertCell();                   // Cria célula
    cel.textContent = value;                        // Insere texto
  });

  insertButton(row.insertCell());                   // Adiciona botão de remover
  removeElement();                                  // Ativa eventos de remoção

  // Limpa inputs
  document.getElementById("newNome").value = "";
  document.getElementById("newCidade").value = "";
  document.getElementById("newPais").value = "";
  document.getElementById("newPrioridade").value = "";
};


/* --------------------------------------------------------------------------------------
   Função para filtrar locais por país
-------------------------------------------------------------------------------------- */
const filtrarPorPais = () => {                      
  const pais = document.getElementById("filtroPais").value.trim(); 

  let url = "http://127.0.0.1:5000/get_locais";    
  if (pais !== "") {                                
    url += `?local_pais=${encodeURIComponent(pais)}`; // Adiciona parâmetro
  }

  fetch(url, { method: "GET" })                     // Faz requisição GET
    .then(response => response.json())              // Converte para JSON
    .then(data => {                                 
      const table = document.getElementById("myTable"); // Seleciona tabela
      
      // Redesenha cabeçalho
      table.innerHTML = `
      <tr>
        <th>Local de Interesse</th>
        <th>Cidade</th>
        <th>País</th>
        <th>Prioridade</th>
        <th>
          <img src="images/Lixeira.png" width="15px" height="15px"
          alt="Lixeira" title="Remover item">
        </th>
      </tr>
    `;
      
      if (data.locais) {                            // Se houver itens
        data.locais.forEach(item =>                 // Insere cada um
          insertList(
            item.local_nome,
            item.local_cidade,
            item.local_pais,
            item.local_prioridade
          )
        );
      }
    })
    .catch(error => console.error("Erro:", error)); 
};

// Quando o campo de filtro for apagado, recarrega toda a lista automaticamente
document.getElementById("filtroPais").addEventListener("input", function () {
    if (this.value.trim() === "") {
        filtrarPorPais(); // chama o backend sem precisar clicar no botão
    }
});

// Pressionar Enter no campo de filtro aciona o botão "Filtrar"
document.getElementById("filtroPais").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // evita submit de formulários
        filtrarPorPais();       // chama a função de filtro
    }
});
