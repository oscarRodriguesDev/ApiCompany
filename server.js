const http = require('http');
const sqlite = require('sqlite3').verbose();

/**
 * Função listarEmpresas
 * 
 * Esta função consulta o banco de dados SQLite e retorna uma lista de empresas com seus nomes e descrições.
 * 
 * @param {Function} callAction - Função de retorno que será chamada após a consulta ser concluída.
 *    O primeiro parâmetro da função de retorno é um objeto de erro, caso ocorra algum erro durante 
 * a consulta.
 *    O segundo parâmetro é um array de objetos contendo as informações das empresas.
 *        Cada objeto tem as propriedades 'nomeEmpresa' e 'descricaoEmpresa'.
 * 
 * @returns {void}
 * @author Oscar Rodrigues
 */
function listarEmpresas(callAction) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');
  const selectQuery = 'SELECT nomeEmpresa, descricaoEmpresa FROM empresa';
  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      callAction(err, null);
      return;
    }
    const empresas = rows.map((row) => ({
      nomeEmpresa: row.nomeEmpresa,
      descricaoEmpresa: row.descricaoEmpresa,
    }));
    callAction(null, empresas);
    db.close();
  });
}


/**
 * Função listarAreas
 * Esta função consulta o banco de dados SQLite e retorna uma lista de empresas com suas respectivas áreas 
 * e descrições.
 * @param {Function} callAction - Função de retorno que será chamada após a consulta ser concluída.
 * O primeiro parâmetro da função de retorno é um objeto de erro, caso ocorra algum erro durante a 
 * consulta.
 * O segundo parâmetro é um objeto contendo as informações das empresas e suas áreas.   
 * Cada chave do objeto é o nome da empresa, e o valor correspondente é um objeto com as áreas e 
 * descrições relacionadas.
 * @returns {void}
 * @author Oscar Rodrigues
 */
function listarAreas(callAction) {
  const db = new sqlite.Database('./sqlite-sql/Companies.db');
  const selectQuery ='SELECT e.nomeEmpresa, a.nomeArea, a.descricaoArea FROM empresa AS e JOIN areas AS a ON a.idEmpresa = e.idEmpresa';

  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error(err);
      callAction(err, null);
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

    callAction(null, empresas);

    db.close();
  });
}


/**
 * Função listarEmpresasPorAreas
 * Esta função consulta o banco de dados SQLite e retorna uma lista de empresas com as áreas correspondentes.
 * @param {Function} callAction - Função de retorno que será chamada após a consulta ser concluída.
 *O primeiro parâmetro da função de retorno é um objeto de erro, caso ocorra algum erro durante a consulta.
 *O segundo parâmetro é um objeto contendo as informações das empresas e suas áreas.
 * Cada chave do objeto é o nome da empresa, e o valor correspondente é um array com as áreas relacionadas.
 * @returns {void}
 * @author Oscar Rodrigues
 */
function listarEmpresasPorAreas(callAction) {
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
      callAction(err, null);
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

    callAction(null, empresasPorAreas);

    db.close();
  });
}



/**
 * Função consulta_complex.
 * Esta função realiza uma consulta complexa no banco de dados SQLite, buscando informações específicas 
 * de uma empresa e suas áreas correspondentes.
 * @param {string} empresa - O nome da empresa a ser consultada.
 * @param {object} valores - Um objeto que armazenará os valores retornados pela consulta.
 * O objeto deve conter as propriedades 'nomeEmpresa' e 'nomeArea'.
 * @param {Function} callAction - Função de retorno que será chamada após a consulta ser concluída.
 * O primeiro parâmetro da função de retorno é um objeto de erro, caso ocorra algum erro durante a consulta.
 * @returns {void}
 * @author Oscar Rodrigues
 */
function consulta_complex(empresa, valores, callAction) {
  const db = new sqlite.Database('sqlite-sql/Companies.db');
  const query = `SELECT empresa.nomeEmpresa, areas.nomeArea
                   FROM empresa
                   INNER JOIN areas ON empresa.idEmpresa = areas.idEmpresa
                   WHERE empresa.nomeEmpresa = ?`;

  db.get(query, [empresa], (err, row) => {
    if (err) {
      console.error(err);
      callAction(err);
      db.close();
      return;
    }

    valores.nomeEmpresa = row.nomeEmpresa;
    valores.nomeArea = row.nomeArea;

    db.close();

    callAction(null);
  });
}


/**
 * Função pushEnterprise
 *
 * Esta função insere uma nova empresa no banco de dados SQLite.
 *
 * @param {string} nomeEmpresa - O nome da empresa a ser inserida.
 * @param {string} descEmpresa - A descrição da empresa a ser inserida.
 * @param {string} nomeArea - O nome da área relacionada à empresa.
 * @param {string} descArea - A descrição da área relacionada à empresa.
 *
 * @returns {void}
 * @author Oscar Rodrigues
 */
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


/**
 * Função deleteCompany
 * Esta função deleta uma empresa e suas áreas relacionadas do banco de dados SQLite.
 * @param {string} nomeEmpresa - O nome da empresa a ser deletada.
 * @returns {void}
 * @author Oscar Rodrigues
 */
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

/**
 * Função inserirArea
 *
 * Esta função insere uma nova área relacionada a uma empresa no banco de dados SQLite.
 *
 * @param {string} nomeEmpresa - O nome da empresa à qual a área será relacionada.
 * @param {string} nomeArea - O nome da área a ser inserida.
 * @param {string} descricaoArea - A descrição da área a ser inserida.
 *
 * @returns {void}
 * @author Oscar Rodrigues
 */
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


/**
 * Função deleteArea
 *
 * Esta função deleta uma área relacionada a uma empresa do banco de dados SQLite.
 *
 * @param {string} nomeEmpresa - O nome da empresa à qual a área está relacionada.
 * @param {string} nomeArea - O nome da área a ser deletada.
 *
 * @returns {void}
 * @author Oscar Rodrigues
 */
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


/**
 * Função updateArea
 *
 * Esta função atualiza a descrição de uma área relacionada a uma empresa no banco de dados SQLite. 
 * Se a área não existir, uma nova área é criada.
 * @param {string} nomeEmpresa - O nome da empresa à qual a área está relacionada.
 * @param {string} nomeArea - O nome da área a ser atualizada ou criada.
 * @param {string} novaDescricaoArea - A nova descrição da área.
 * @returns {void}
 * @author Oscar Rodrigues
 */
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



/**
 * Função updateEmpresa
 *
 * Esta função atualiza a descrição de uma empresa no banco de dados SQLite.
 *
 * @param {string} nomeEmpresa - O nome da empresa a ser atualizada.
 * @param {string} novaDescricao - A nova descrição da empresa.
 *
 * @returns {void}
 * @author Oscar Rodrigues
 */
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


  /** 
 * Verifica se a rota é '/api/listEmpresas' e o método é 'GET'.
 * Chama a função "listarEmpresas" e envia uma resposta à requisição recebida
 *  e trata possíveis erros.
 */
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
  



/** 
 * Verifica se a rota é '/api/listAreas' e o método é 'GET'.
 * Chama a função "listarAreas" e envia uma resposta à requisição recebida
 *  e trata possíveis erros.
 */ 
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


  /** 
 * Verifica se a rota é '/api/areasGeral' e o método é 'GET'.
 * Chama a função "listarEmpresasPorAreas" e envia uma resposta à requisição recebida
 *  e trata possíveis erros.
 */ 
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

  
/** 
 * Verifica se a rota é '/api/areaPorEmpresa' e o método é 'GET'.
 * Chama a função "consulta_complex" e envia uma resposta à requisição recebida
 *  e trata possíveis erros.
 */ 
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
    })
  }



  /** 
 * Verifica se a rota é '/api/updateEmpresa' e o método é 'GET'.
 * Chama a função "updateEmpresa" e altera a descrição da empresa informada pela requisição,
 * caso a empresa não exista, ela NÃO será criada automaticamente, e nada será feito no banco de dados
 * urlExample:/api/updateEmpresas/?nomeEmpresa=nome&descricao=novadescricao
 */ 
  else if (url.includes('/api/updateEmpresa') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const novaDesc = queryParams.get('descricao');
    updateEmpresa(nomeEmpresa,novaDesc)
    console.log('A empresa '+nomeEmpresa+' teve sua descrição alterada para '+novaDesc)
  }



  /** 
 * Verifica se a rota é '/api/updateArea' e o método é 'GET'.
 * Chama a função "updateArea" e realiza a alteração na area da empresas informada pela requisição,
 * caso a area informada não exista no banco de dados, a area é automaticamente criada
 * urlExample: /api/updateAreas/?nomeEmpresa=empresa&nomeArea=area&novaDesc=nova descriação a ser adcionada
 */ 
  else if (url.includes('/api/updateArea') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const nomeArea = queryParams.get('nomeArea');
    const novaDesc = queryParams.get('novaDesc');
    updateArea(nomeEmpresa, nomeArea, novaDesc)
    console.log('A descrição ' + novaDesc + ' foi adcionada na area de ' + nomeArea + ' da empresa ' + nomeEmpresa);
  }



  /** 
 * Verifica se a rota é '/api/novaEmpresa' e o método é 'GET'.
 * Chama a função "pushEnterprise" e adciona uma nova empresa no banco de dados com as especificações recebidas
 * pela requisição, se observar essa condicional, vai perceber que obrigatoriamente, quando for inserir
 * uma nova empresa no banco, deve-se tambem criar pelo menos uma area para essa empresa
 * urlExample:/api/novaEmpresa/?nomeEmpresa=nome&descEmpresa=desc&nomeArea=area&descArea=descrição
 */ 
  else if (url.includes('/api/novaEmpresa') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const descEmpresa = queryParams.get('descEmpresa');
    const nomeArea = queryParams.get('nomeArea');
    const descArea = queryParams.get('descArea');
    console.log('Dados capturados:', nomeEmpresa, descEmpresa, nomeArea, descArea)
    pushEnterprise(nomeEmpresa, descEmpresa, nomeArea, descArea)
  }



  /** 
 * Verifica se a rota é '/api/novaArea' e o método é 'GET'.
 * Chama a função "inserirArea" e adciona uma nova area na empresa informada
 * url:example = /api/novaArea/?nomeEmpresa=Empresa2&nomeArea=RH&descArea=Recursos Humanos
 */
  else if (url.includes('/api/novaArea') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    const nomeArea = queryParams.get('nomeArea');
    const descArea = queryParams.get('descArea');
    console.log('Dados capturados:', nomeEmpresa, nomeArea, descArea)
    inserirArea(nomeEmpresa, nomeArea, descArea)

  }


  /** 
 * Verifica se a rota é '/api/deleteCompany' e o método é 'GET'.
 * Chama a função "deleteCompany" e deleta a empresa informada na requisição
 * urlExample:/api/deleteCompany/?nomeEmpresa=nome-da-empresa
 */
  else if (url.includes('/api/deleteCompany') && req.method === 'GET') {
    const myURL = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = myURL.searchParams;
    const nomeEmpresa = queryParams.get('nomeEmpresa');
    deleteCompany(nomeEmpresa)
  }



  /** 
 * Verifica se a rota é '/api/deleteArea' e o método é 'GET'.
 * Chama a função "deleteArea" deletando o registro de area no banco de dados
 * urlExample: /api/deleteArea/?nome=Empresa2&nomeArea=TI
 */ 
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
const port = 8080;
const hostname = 'localhost';
const defaultRoute = '/api/listEmpresas';
console.log('atualizando automaticamente o servidor')
server.listen(port, hostname, () => {
  console.log(`Acesse a rota inicial em http://${hostname}:${port}${defaultRoute}`);
});
