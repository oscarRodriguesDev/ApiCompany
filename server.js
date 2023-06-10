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
function pushEnterprise(nomeEmpresa,descEmpresa,nomeArea,descArea) {
  // Conexão com o banco de dados SQLite
  var id=0;
  const db = new sqlite.Database('sqlite-sql/Companies.db');
  const query1 = `INSERT INTO empresa (nomeEmpresa, descricaoEmpresa) VALUES (?, ?)`
  
  //adcionando a empresa no banco
  db.run(query1, [nomeEmpresa, descEmpresa], function(err) {
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
    
      db.run(query3, params3, function(err) {
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






//inicianso o serividor
const server = http.createServer((req, res) => {
    const { url, method } = req;

    //servidor analisa a url e responde de acordo com cada solicitação
    // caso a solicitação seja para listar empresas
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
          //console.log(valores);
        });
      }
      

    //listar todas as areas
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
          //console.log(valores);
        });
    }



    //caso a solicitação seja para listar as areas por empresa
    else if (url.includes('/api/areaPorEmpresa') && req.method === 'GET') {
      //var nomeEmpresa = 'A&D-software'
      const myURL = new URL(`http://${req.headers.host}${req.url}`);
      const queryParams = myURL.searchParams;
      const nomeEmpresa = queryParams.get('nomeEmpresa');
      console.log('Dados capturados:', nomeEmpresa);
      const url = `http://${req.headers.host}${req.url}`;
      console.log('URL completa:', url);
      var valores = {};
      consulta_complex(nomeEmpresa,valores, function () {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
       // res.end(JSON.stringify(valores));
        res.end(JSON.stringify({'nomeEmpresa': valores['nomeEmpresa'],'nomeArea':valores['nomeArea']} ));
        console.log(valores)
       
        
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

    //caso a solicitação seja para criar uma nova empresa
    else if (url.includes('/api/novaEmpresa') && req.method === 'GET') {
      console.log('rota encontrada com sucesso!')
      const myURL = new URL(`http://${req.headers.host}${req.url}`);
      const queryParams = myURL.searchParams;
      const nomeEmpresa = queryParams.get('nomeEmpresa'); 
      const descEmpresa = queryParams.get('descEmpresa');
      const nomeArea = queryParams.get('nomeArea');
      const descArea = queryParams.get('descArea');
      console.log('Dados capturados:', nomeEmpresa, descEmpresa, nomeArea, descArea)
      //efetivamente criar a empresa
      pushEnterprise(nomeEmpresa,descEmpresa,nomeArea,descArea)
      
       

    }

    //caso a solicitação seja para criar uma nova area
    else if (url === '/api/novaArea' && method === 'GET') {
        //...
      //

    }

    //caso a solicitação não seja encontrada ou não possa ser atendida 
    else {
        console.log('pagina 404')
   
    }
});



//aqui é definido a porta onde o servidor será ouvido
const port = 3000;
const hostname = 'localhost';
const defaultRoute = '/api/listEmpresas';
console.log('atualizando automaticamente o servidor')

server.listen(port, hostname, () => {
    console.log(`Servidor ouvindo em http://${hostname}:${port}`);
    console.log(`Acesse a rota inicial em http://${hostname}:${port}${defaultRoute}`);
});
