const { transcode } = require('buffer');
const { banco, saques, contas, transferencias, depositos } = require('../bancodedados');


const criarContas = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).jason({ menssagem: "Todos os campos são obrigatórios" })
    };

    const verificarCpf = contas.find((cpfUnico) => {
        return cpfUnico.usuario.cpf === cpf;
    });
    const verificarEmail = contas.find((emailUnico) => {
        return emailUnico.usuario.email === email;
    });

    const ultimaConta = contas.findLast((e) => {
        return e;
    });

    if (!verificarCpf || !verificarEmail) {
        contas.push({
            numero: ultimaConta.numero + 1,
            saldo: 0,
            usuario: {
                nome,
                cpf,
                data_nascimento,
                telefone,
                email,
                senha
            }
        })
        return res.status(200).json();

    } else {
        return res.status(400).json("Email ou CPF já cadastrado.");
    }
};

const listarContas = async (req, res) => {
    const { senha_banco } = req.query;

    if (banco.senha !== senha_banco) {
        return res.status(401).json({ mensagem: "Senha inválida" });
    }

    res.status(200).json(contas);
};

const atualizarDadosUsuario = async (req, res) => {
    const { numero_conta } = req.params
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).jason({ menssagem: "Todos os campos são obrigatórios" })
    }

    const encontrarNumeroConta = contas.find((c) => {
        return c.numero === Number(numero_conta);
    });

    if (!encontrarNumeroConta) {
        return res.status(404).json({ mensagem: "Conta não encontrada" });
    };

    const todasAsContas = contas.filter((tac) => {
        return tac.numero !== encontrarNumeroConta.numero;
    });

    const verificarCpf = todasAsContas.find((vCpf) => {
        return vCpf.usuario.cpf === cpf;
    });

    if (verificarCpf) {
        return res.status(409).json({ mensagem: "O CPF informado já está cadastrado" });
    };

    const verificarEmail = todasAsContas.find((vEmail) => {
        return vEmail.usuario.email === email;
    });

    if (verificarEmail) {
        return res.status(409).json({ mensagem: "O e-mail informado já está cadastrado" });
    };

    encontrarNumeroConta.usuario.nome = nome;
    encontrarNumeroConta.usuario.cpf = cpf;
    encontrarNumeroConta.usuario.data_nascimento = data_nascimento;
    encontrarNumeroConta.usuario.telefone = telefone;
    encontrarNumeroConta.usuario.email = email;
    encontrarNumeroConta.usuario.senha = senha;

    res.status(202).json();

};

const excluirConta = async (req, res) => {
    const { numero_conta } = req.params

    const encontrarNumeroConta = contas.find((c) => {
        return c.numero === Number(numero_conta);
    });

    if (!encontrarNumeroConta) {
        return res.status(404).json({ mensagem: "Conta não encontrada." })
    };

    if (encontrarNumeroConta.saldo > 0) {
        return res.status(401).json({ mensgaem: "A conta só pode ser removida se o saldo for zero." })
    }

    contas.splice(encontrarNumeroConta - 1, 1);

    return res.status(200).json();
};

const consultarSaldo = async (req, res) => {
    const { numero_conta, senha } = req.query;

    const encontrarNumeroConta = contas.find((c) => {
        return c.numero === Number(numero_conta);
    });

    if (!encontrarNumeroConta) {
        return res.status(404).json({ mensagem: "Conta não encontrada" })
    };

    if (senha !== encontrarNumeroConta.usuario.senha) {
        return res.status(401).json({ mensagem: "Senha inválida" });
    }

    return res.status(200).json({ saldo: encontrarNumeroConta.saldo });
};

const emitirExtrato = async (req, res) => {
    const { numero_conta, senha } = req.query;

    const encontrarNumeroConta = contas.find((c) => {
        return c.numero === Number(numero_conta);
    });

    if (!encontrarNumeroConta) {
        return res.status(404).json({ mensagem: "Conta não encontrada." });
    };

    if (senha !== encontrarNumeroConta.usuario.senha) {
        return res.status(401).json({ mensagem: "Senha inválida" });
    };

    const saque = saques.filter((s) => {
        return s.numero_conta === Number(numero_conta);
    });

    const deposito = depositos.filter((d) => {
        return d.numero_conta === Number(numero_conta);
    });

    const transferenciasEnviadas = transferencias.filter((tf) => {
        return tf.numero_conta_origem === Number(numero_conta)
    });

    const transferenciasRecebidas = transferencias.filter((tf) => {
        return tf.numero_conta_destino === Number(numero_conta)
    });

    const extrato = [
        {
            deposito,
            saque,
            transferenciasEnviadas,
            transferenciasRecebidas
        }
    ]

    return res.status(200).json(extrato)
};

module.exports = {
    criarContas,
    listarContas,
    atualizarDadosUsuario,
    excluirConta,
    consultarSaldo,
    emitirExtrato
}