//modulo necessario para trabalhar com requisições http


const http = require('http');
const sqlite = require('sqlite3').verbose();



/**Função para consulta simples de sql */
function consultar(termo, tabela, valores, callback) {
  const db = new sqlite.Database('sqlite-sql/Companies.db');
  const query = 'SELECT ' + termo + ' FROM ' + tabela;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      callback(err);
      return;
    }

    rows.forEach((row, index) => {
      const valorColuna = row[termo];
      valores[index + 1] = valorColuna;
    });

    db.close();

    callback(null);
  });
}



//consulta para usar duas tabelas
function consulta_complex(empresa, valores, callback) {
  const db = new sqlite.Database('sqlite-sql/Companies.db');
  const query = `SELECT empresa.nomeEmpresa, areas.nomeArea
                   FROM empresa
                   INNER JOIN areas ON empresa.idEmpresa = areas.idEmpresa
                   WHERE empresa.nomeEmpresa = ?`;

  db.get(query, [empresa], (err, row) => {
    if (err) {
      console.error(err);
      callback(err);
      db.close();
      return;
    }

    valores.nomeEmpresa = row.nomeEmpresa;
    valores.nomeArea = row.nomeArea;

    db.close();

    callback(null);
  });
}


//função para criar uma nova empresa, obrigatoriamente com pelo menos uma area
function pushEnterprise(nomeEmpresa, descEmpresa, nomeArea, descArea) {
  // Conexão com o banco de dados SQLite
  var id = 0;
  const db = new sqlite.Database('sqlite-sql/Companies.db');
  const query1 = `INSERT INTO empresa (nomeEmpresa, descricaoEmpresa) VALUES (?, ?)`

  //adcionando a empresa no banco
  db.run(query1, [nomeEmpresa, descEmpresa], function (err) {
    if (err) {
      console.error(err.message);
      return;
    }
  });

  // Executa a consulta para obter o ID da empresa
  const query2 = `SELECT idEmpresa FROM empresa WHERE nomeEmpresa = ?`;
  db.get(query2, [nomeEmpresa], (err, row) => {
    if (err) {
      console.error(err.message);
      db.close();
      return;
    }
    if (row) {
      const id = row.idEmpresa;
      const query3 = `INSERT INTO areas (nomeArea, descricaoArea, idEmpresa) VALUES (?, ?, ?)`;
      const params3 = [nomeArea, descArea, id];

      db.run(query3, params3, function (err) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(`Nova área adicionada com o ID: ${this.lastID}`);
      });
    }
    else {
      // Caso a empresa não seja encontrada
      console.error(`A empresa ${nomeEmpresa} não foi encontrada.`);
    }
  });
  db.close();
}

//função para deletar empresas  completas
function deleteCompany(nomeEmpresa) {
  const db = new sqlite.Database('sqlite-sql/Companies.db');
  // Deleta as áreas relacionadas à empresa
  db.run('DELETE FROM areas WHERE idEmpresa = (SELECT idEmpresa FROM empresa WHERE nomeEmpresa = ?)', [nomeEmpresa], function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Áreas relacionadas deletadas com sucesso!');
  });
  // Deleta a empresa
  db.run('DELETE FROM empresa WHERE nomeEmpresa = ?', [nomeEmpresa], function (err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Empresa deletada com sucesso!');
  });
  db.close();
}



/**instancia do servidor para definição das rotas da api */
const server = http.createServer((req, res) => {
  const { url, method } = req;

  /**Essa rota lista todas as empresas do banco de dados */
  if (url === '/api/listEmpresas' && method === 'GET') {
    const valores = {};
    consultar('nomeEmpresa', 'empresa', valores, (err) => {
      if (err) {
        console.error('Ocorreu um erro:', err);
        // Lógica para lidar com o erro, se necessário
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(valores));
     console.log(valores)
     //falta apenas recuperar os dados na pagina tambem
    });
  }


  /**Essa rota lista todas as areas contidas no Banco de dados */
  else if (url === '/api/listAreas' && method === 'GET') {
    const valores = {};
    consultar('nomeArea', 'areas', valores, (err) => {
      if (err) {
        console.error('Ocorreu um erro:', err);
        // Lógica para lidar com o erro, se necessário
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(valores));
      console.log(valores);
      //só falta recuperar os dados na pagina
    });
  }



/**Essa rota permite visualizar as areas por empresa */
  else if (url.includes('/api/areaPorEmpresa') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    console.log('Dados capturados:', nomeEmpresa);
    const url = `http://${req.headers.host}${req.url}`;
    console.log('URL completa:', url);
    var valores = {};
    consulta_complex(nomeEmpresa, valores, function () {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 'nomeEmpresa': valores['nomeEmpresa'], 'nomeArea': valores['nomeArea'] }));
      console.log(valores)
    // ao  invés de mostrar os dados em aberto num paragrafo desejo mostrar os dados numa tabela
    })
  }

  //caso a solicitação seja para atualizar empresas
  else if (url === '/api/updateEmpresas' && method === 'GET') {
    //...
    //

  }


  //caso a solicitação seja para atualizar areas
  else if (url === '/api/updateAreas' && method === 'GET') {
    //...
    //

  }

  /** essa rota permite criação de empresas */
  else if (url.includes('/api/novaEmpresa') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const descEmpresa = queryParams.get('descEmpresa');
    const nomeArea = queryParams.get('nomeArea');
    const descArea = queryParams.get('descArea');
    console.log('Dados capturados:', nomeEmpresa, descEmpresa, nomeArea, descArea)
    //efetivamente criar a empresa
    pushEnterprise(nomeEmpresa, descEmpresa, nomeArea, descArea)



  }

  //caso a solicitação seja para criar uma nova area
  else if (url === '/api/novaArea' && method === 'GET') {
    //...
    //

  }

  //nova rota para deletar uma empresa informa
  //falta resolver a forma de pegar pela url
  else if (url.includes('/api/deleteCompany') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    deleteCompany(nomeEmpresa) 
  }



  /**caso a rota não seja encontrada somos encaminhados para a pagina de erro 404 */
  else {
    //posteriormente posso criar uma pagina de erro 404
    console.log('pagina 404')
  }
});



/**Definições de porta onde servidor irá rodar e a rota inicial a ser acessada */
const port = 3000;
const hostname = 'localhost';
const defaultRoute = '/api/listEmpresas';
console.log('atualizando automaticamente o servidor')
server.listen(port, hostname, () => {
  console.log(`Acesse a rota inicial em http://${hostname}:${port}${defaultRoute}`);
});
