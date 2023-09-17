const bancodedados = require('../bancodedados');
const { contas, saques, depositos, transferencias } = require('../bancodedados');

const sacarDinheiro = async (req, res) => {
    const { numero_conta, senha, valor } = req.body;

    const encontrarNumeroConta = contas.find((c) => {
        return c.numero === Number(numero_conta);
    });

    if (!encontrarNumeroConta) {
        return res.status(404).json({ mensagem: "Conta não encontrada" });
    }

    if (senha !== encontrarNumeroConta.usuario.senha) {
        return res.status(401).json({ mensagem: "Senha inválida" });
    }

    if (encontrarNumeroConta.saldo < valor) {
        return res.status(406).json({ mensagem: "Saldo insuficiente" });
    };

    encontrarNumeroConta.saldo -= valor;

    saques.push({
        data: new Date(),
        numero_conta,
        valor
    });

    return res.status(200).json();
};

const depositarDinheiro = async (req, res) => {
    const { numero_conta, valor } = req.body;

    const encontrarNumeroConta = contas.find((c) => {
        return c.numero === Number(numero_conta);
    });

    if (!encontrarNumeroConta) {
        return res.status(404).json({ mensagem: "Conta não encontrada" });
    };

    if (valor <= 0) {
        return res.status(401).json({ mensagem: "Valor de depósito deve ser maior que zero." })
    };

    encontrarNumeroConta.saldo += valor;

    saques.push({
        data: new Date(),
        numero_conta,
        valor
    });
    return res.status(200).json();
};

const transferirEntreContas = async (req, res) => {
    const { numero_conta_origem, valor, senha, numero_conta_destino } = req.body;

    const encontrarContaOrigem = contas.find((co) => {
        return co.numero === Number(numero_conta_origem);
    });

    if (!encontrarContaOrigem) {
        return res.status(404).json({ mensagem: "Conta de origem não encontrada." });
    };

    if (senha !== encontrarContaOrigem.usuario.senha) {
        return res.status(401).json({ mensagem: "Senha inválida" });
    };

    const encontrarContaDestino = contas.find((cd) => {
        return cd.numero === Number(numero_conta_destino);
    });

    if (!encontrarContaDestino) {
        return res.status(404).json({ mensagem: "Conta de destino não encontrada." });
    };

    if (encontrarContaOrigem.saldo < valor) {
        return res.status(406).json({ mensagem: "Saldo insuficiente." });
    }

    encontrarContaOrigem.saldo -= valor;

    encontrarContaDestino.saldo += valor;

    transferencias.push({
        data: new Date(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    })

    return res.status(200).json();
};

module.exports = {
    sacarDinheiro,
    depositarDinheiro,
    transferirEntreContas
}
