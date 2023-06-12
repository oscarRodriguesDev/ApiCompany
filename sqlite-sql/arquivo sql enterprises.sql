/*criando a empresa:
CREATE TABLE empresa (
  idEmpresa INTEGER PRIMARY KEY,
  nomeEmpresa VARCHAR(100) UNIQUE,
  descricaoEmpresa TEXT
);*/
/*criando a area
CREATE TABLE areas (
idArea INTEGER PRIMARY KEY,
  nomeArea TEXT,
  descricaoArea TEXT,
  idEmpresa INTEGER,
  FOREIGN KEY (idEmpresa) REFERENCES empresa(idEmpresa)
)*/

/*Recuperar dados das empresa*/
/*
SELECT e.nomeEmpresa, e.descricaoEmpresa, a.nomeArea, a.descricaoArea
FROM empresa AS e
JOIN areas AS a ON e.idEmpresa = a.idEmpresa;*/

/*selecionar dados basicos da empresa*/
/*
SELECT nomeEmpresa, descricaoEmpresa FROM empresa*/

/*criar uma nova area*/
/*INSERT INTO areas(nomeArea,descricaoArea,idEmpresa)
values("Desenvolvimento","area de codificação -DEV",1)*/

/*Inserir nova empresa*/
/*
INSERT into empresa (nomeEmpresa,descricaoEmpresa) 
VALUES("Empresa4","metalurgica")*/


/*inserir nova area na empresa*/
/*
INSERT INTO areas (nomeArea,descricaoArea,idEmpresa)
VALUES("Medico-","Medicina do trabalho", 4) */

/*abrindo somente nomes das empresas*/
/*SELECT nomeEmpresa FROM empresa*/

/*nomes de todas as areas*/
/*SELECT nomeArea FROM areas*/

/*todos os dados das empresas
SELECT *
FROM empresa
INNER JOIN areas ON empresa.idEmpresa = areas.idEmpresa;*/
/*
SELECT empresa.nomeEmpresa, areas.nomeArea
FROM empresa
INNER JOIN areas ON empresa.idEmpresa = areas.idEmpresa
WHERE empresa.nomeEmpresa = 'A&D-software';*/

/*SELECT idEmpresa FROM empresa WHERE nomeEmpresa == 'A&D-software'*/
/*8DELETE FROM empresa WHERE nomeEmpresa = 'Empresa2';*/
/*select dos dados que tenho que exibir na tela react
SELECT empresa.nomeEmpresa, empresa.descricaoEmpresa, areas.nomeArea, areas.descricaoArea
FROM empresa
JOIN areas ON empresa.idEmpresa = areas.idEmpresa;*/

/*SELECT e.nomeEmpresa, a.nomeArea, a.descricaoArea FROM empresa AS e JOIN areas AS a  ON a.idEmpresa = e.idEmpresa*/
