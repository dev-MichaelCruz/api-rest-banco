const express = require('express');
const rotas = express();

const criar = require('./controladores/contas');
const listar = require('./controladores/contas');
const atualizar = require('./controladores/contas');
const excluir = require('./controladores/contas');
const depositar = require('./controladores/transacoes');
const sacar = require('./controladores/transacoes');
const tranferir = require('./controladores/transacoes');
const saldo = require('./controladores/contas');
const extrato = require('./controladores/contas');

//ROTAS DE CONTAS
rotas.post('/contas', criar.criarContas);
rotas.get('/contas', listar.listarContas);
rotas.put('/contas/:numeroConta/usuario', atualizar.atualizarDadosUsuario);
rotas.delete('/contas/:numeroConta', excluir.excluirConta);
rotas.get('/contas/saldo', saldo.consultarSaldo);
rotas.get('/contas/extrato', extrato.emitirExtrato);

//ROTAS DE TRANSAÇÕES
rotas.post('/transacoes/depositar', depositar.depositarDinheiro);
rotas.post('/transacoes/sacar', sacar.sacarDinheiro);
rotas.post('/transacoes/transferir', tranferir.transferirEntreContas);


module.exports = rotas;
