//modulo necessario para trabalhar com requisições http


const http = require('http');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('sqlite-sql/Companies.db');


//SELECT nomeEmpresa FROM empresa
//função para fazer uma consulta sql
// Função para fazer uma consulta SQL
function consultar(termo, tabela) {
    const query = 'SELECT ' + termo + ' FROM ' + tabela;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        // Iterar sobre as linhas retornadas
        rows.forEach((row) => {
            const valorColuna = row[termo]; // Acessar o valor da coluna dinamicamente
            console.log('Valor da coluna: ' + valorColuna);
        });

        // Fechar o banco de dados após a conclusão da consulta
        db.close();
    });
}
  


//inicianso o serividor
const server = http.createServer((req, res) => {
    const { url, method } = req;

    //servidor analisa a url e responde de acordo com cada solicitação
    // caso a solicitação seja para listar empresas
    if (url === '/api/listEmpresas' && method === 'GET'){
        consultar('nomeEmpresa', 'empresa');
        
           }

    //listar todas as areas
    else if (url === '/api/listAreas' && method === 'GET') {
        console.log('LISTAR AREAS')
        consultar('nomeArea','areas')
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'listar empresas com sql' }))
    }

    //caso a solicitação seja para criar uma nova empresa
    else if (url === '/api/areaPorEmpresa' && method === 'GET') {
        console.log('area por empresa')
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'MOSTRANDO DADOS DA EMPRESA XXX' }));

    }

    //caso a solicitação seja para atualizar empresas
    else if (url === '/api/updateEmpresas' && method === 'GET') {
        console.log('ATUALIZAR EMPRESAS')
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'ATUALIZANDO EMPRESAS' }));


    }


    //caso a solicitação seja para atualizar areas
    else if (url === '/api/updateAreas' && method === 'GET') {
        console.log('ATUALIZAR AREAS')
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'ATUALIZANDO AS AREAS' }));

    }

    //caso a solicitação seja para criar uma nova empresa
    else if (url === '/api/novaEmpresa' && method === 'GET') {
        console.log('NOVA EMPRESA')
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'NOVA EMPRESA' }));

    }

    //caso a solicitação seja para criar uma nova area
    else if (url === '/api/novaArea' && method === 'GET') {
        console.log('NOVA AREA')
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'NOVA AREA' }));

    }

    //caso a solicitação não seja encontrada ou não possa ser atendida 
    else {
        console.log('pagina 404')
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Rota nao encontrada');
    }
});

//aqui é definido a porta onde o servidor será ouvido
const port = 3000;
const hostname = 'localhost';
const defaultRoute = '/api/listEmpresas'; // Rota inicial desejada
console.log('atualizando automaticamente o servidor')

server.listen(port, hostname, () => {
    console.log(`Servidor ouvindo em http://${hostname}:${port}`);
    console.log(`Acesse a rota inicial em http://${hostname}:${port}${defaultRoute}`);
});
