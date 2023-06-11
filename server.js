const http = require('http');
const sqlite = require('sqlite3').verbose();

/**Função para listar as empresas e suas descrições */
function listarEmpresas(callback) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');

  const selectQuery = 'SELECT nomeEmpresa, descricaoEmpresa FROM empresa';

  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      callback(err, null);
      return;
    }

    const empresas = rows.map((row) => ({
      nomeEmpresa: row.nomeEmpresa,
      descricaoEmpresa: row.descricaoEmpresa,
    }));

    callback(null, empresas);

    db.close();
  });
}


//função para listar as areas e suas respectivas descrições
function listarAreas(callback) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');
  const selectQuery ='SELECT e.nomeEmpresa, a.nomeArea, a.descricaoArea FROM empresa AS e JOIN areas AS a ON a.idEmpresa = e.idEmpresa';

  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      callback(err, null);
      return;
    }

    const empresas = {};

    rows.forEach((row) => {
      const nomeEmpresa = row.nomeEmpresa;
      const nomeArea = row.nomeArea;
      const descricaoArea = row.descricaoArea;

      if (!empresas[nomeEmpresa]) {
        empresas[nomeEmpresa] = {};
      }

      empresas[nomeEmpresa][nomeArea] = descricaoArea;
    });

    callback(null, empresas);

    db.close();
  });
}


//função para listar todas as empresas por area
function listarEmpresasPorAreas(callback) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');

  const selectQuery = `
    SELECT empresa.nomeEmpresa, areas.nomeArea
    FROM empresa
    LEFT JOIN areas ON empresa.idEmpresa = areas.idEmpresa
    ORDER BY empresa.nomeEmpresa
  `;

  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      callback(err, null);
      return;
    }

    const empresasPorAreas = {};
    rows.forEach((row) => {
      const { nomeEmpresa, nomeArea } = row;
      if (!empresasPorAreas[nomeEmpresa]) {
        empresasPorAreas[nomeEmpresa] = [];
      }
      empresasPorAreas[nomeEmpresa].push(nomeArea);
    });

    callback(null, empresasPorAreas);

    db.close();
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


//função para adcionar areas 
function inserirArea(nomeEmpresa, nomeArea, descricaoArea) {
  const db = new sqlite.Database('sqlite-sql/Companies.db');
  const query = 'SELECT idEmpresa FROM empresa WHERE nomeEmpresa = ?';
  db.get(query, [nomeEmpresa], function (err, row) {
    if (err) {
      console.error('ocorreu o erro ' + err);
      return;
    }
    if (!row) {
      console.log('Empresa não encontrada!');
      return;
    }
    const idEmpresa = row.idEmpresa;
    const insertQuery = 'INSERT INTO areas (nomeArea, descricaoArea, idEmpresa) VALUES (?, ?, ?)';
    db.run(insertQuery, [nomeArea, descricaoArea, idEmpresa], function (err) {
      if (err) {
        console.error('ocorreu o erro ' + err);
        return;
      }
      console.log('Área inserida com sucesso!');
    });
  });
  db.close();
}


/**Função para deletar area de determinada empresa */
function deleteArea(nomeEmpresa, nomeArea) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');
  const queryEmpresa = 'SELECT idEmpresa FROM empresa WHERE nomeEmpresa = ?';
  db.get(queryEmpresa, [nomeEmpresa], function (err, rowEmpresa) {
    if (err) {
      console.error(err);
      return;
    }
    if (!rowEmpresa) {
      console.log('Empresa não encontrada!');
      return;
    }
    const idEmpresa = rowEmpresa.idEmpresa;
    const deleteQuery = 'DELETE FROM areas WHERE idEmpresa = ? AND nomeArea = ?';
    db.run(deleteQuery, [idEmpresa, nomeArea], function (err) {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Área deletada com sucesso!');
    });
  });

  db.close();
}


/**Função para alterar descrição da area de uma empresa */
function updateArea(nomeEmpresa, nomeArea, novaDescricaoArea) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');
  const queryEmpresa = 'SELECT idEmpresa FROM empresa WHERE nomeEmpresa = ?';
  db.get(queryEmpresa, [nomeEmpresa], function (err, rowEmpresa) {
    if (err) {
      console.error(err);
      return;
    }
    if (!rowEmpresa) {
      console.log('Empresa não encontrada!');
      return;
    }
    const idEmpresa = rowEmpresa.idEmpresa;
    const queryArea = 'SELECT nomeArea FROM areas WHERE idEmpresa = ? AND nomeArea = ?';
    db.get(queryArea, [idEmpresa, nomeArea], function (err, rowArea) {
      if (err) {
        console.error(err);
        return;
      }
      if (!rowArea) {
        const insertQuery = 'INSERT INTO areas (nomeArea, descricaoArea, idEmpresa) VALUES (?, ?, ?)';
        db.run(insertQuery, [nomeArea, novaDescricaoArea, idEmpresa], function (err) {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Nova área criada com sucesso!');
        });
      } else {
        const updateQuery = 'UPDATE areas SET descricaoArea = ? WHERE idEmpresa = ? AND nomeArea = ?';
        db.run(updateQuery, [novaDescricaoArea, idEmpresa, nomeArea], function (err) {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Área atualizada com sucesso!');
        });
      }
    });
  });
  db.close();
}



/**Função para alterar area da empresa informada*/
function updateEmpresa(nomeEmpresa, novaDescricao) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');
  const query = 'UPDATE empresa SET descricaoEmpresa = ? WHERE nomeEmpresa = ?';
  db.run(query, [novaDescricao, nomeEmpresa], function(err) {
    if (err) {
      console.error(err);
      return;
    }
    if (this.changes === 0) {
      console.log('Empresa não encontrada!');
      return;
    }
  });
  db.close();
}



/**instancia do servidor para definição das rotas da api */
const server = http.createServer((req, res) => {
  const { url, method } = req;


  /**Essa rota lista todas as empresas e suas descrições do banco de dados */
  if (url === '/api/listEmpresas' && method === 'GET') {
    listarEmpresas((err, empresas) => {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
        return;
      }
  
      // Faça o que quiser com o objeto `empresas` aqui
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(empresas));
    });
  }
  



  /**Essa rota lista todas as areas contidas no Banco de dados */
  else if (url === '/api/listAreas' && method === 'GET') {
    const areaEmpresas = {}
    listarAreas((err, areaEmpresas) => {
      if (err) {
        console.error(err);
        return;
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(areaEmpresas));
      console.log(areaEmpresas);
   
    });
  }


  /**Essa rota recupera todas as areas por empresa */
  else if (url === '/api/areasGeral' && method === 'GET') {
    var areasPorEmpresa={}
    listarEmpresasPorAreas((err, areasPorEmpresa) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(areasPorEmpresa);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(areasPorEmpresa));
      console.log(areasPorEmpresa);  
    });
  }

  
  /**Essa rota permite visualizar as areas da empresa selecionada */
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



  /**Função para alterar a descrição de uma empresa */
  else if (url.includes('/api/updateEmpresa') && req.method === 'GET') {
    //urlExample:/api/updateEmpresas/?nomeEmpresa=nome&descricao=novadescricao
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const novaDesc = queryParams.get('descricao');
    updateEmpresa(nomeEmpresa,novaDesc)
    console.log('A empresa '+nomeEmpresa+' teve sua descrição alterada para '+novaDesc)
  }



  /**Rota para atualizar areas da empresa informada */
  else if (url.includes('/api/updateArea') && req.method === 'GET') {
    //urlExample: /api/updateAreas/?nomeEmpresa=empresa&nomeArea=area&novaDesc=nova descriação a ser adcionada
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const nomeArea = queryParams.get('nomeArea');
    const novaDesc = queryParams.get('novaDesc');
    updateArea(nomeEmpresa, nomeArea, novaDesc)
    console.log('A descrição ' + novaDesc + ' foi adcionada na area de ' + nomeArea + ' da empresa ' + nomeEmpresa);
  }



  /** essa rota permite criação de empresas */
  else if (url.includes('/api/novaEmpresa') && req.method === 'GET') {
    //urlExample: /api/novaEmpresa/?nomeEmpresa=nome&descEmpresa=desc&nomeArea=area&descArea=descrição
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



  /**rota para incluir novas areas nas empresas */
  else if (url.includes('/api/novaArea') && req.method === 'GET') {
    //url:example = /api/novaArea/?nomeEmpresa=Empresa2&nomeArea=RH&descArea=Recursos Humanos
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const nomeArea = queryParams.get('nomeArea');
    const descArea = queryParams.get('descArea');
    console.log('Dados capturados:', nomeEmpresa, nomeArea, descArea)
    inserirArea(nomeEmpresa, nomeArea, descArea)

  }



  /**rota para deletar empresas */
  else if (url.includes('/api/deleteCompany') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    deleteCompany(nomeEmpresa)
  }



  /**Rota para deletar uma determinada area de uma empresa */
  else if (url.includes('/api/deleteArea') && req.method === 'GET') {
    //urlExample: /api/deleteArea/?nome=Empresa2&nomeArea=TI
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const nomeArea = queryParams.get('nomeArea');
    deleteArea(nomeEmpresa, nomeArea)
    console.log('Area de ' + nomeArea + ' da empresa ' + nomeEmpresa + ' foi deletada com sucesso!')
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
