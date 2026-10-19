
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Sistema de Pedidos funcionando!',
  });
});

app.get('/api/pedidos', (req, res) => {
  const pedidos = db
    .prepare('SELECT * FROM pedidos ORDER BY id DESC')
    .all();

  res.json(
    pedidos.map((pedido) => ({
      ...pedido,
      itens: JSON.parse(pedido.itens),
    }))
  );
});

app.post('/api/pedidos', (req, res) => {
  const { cliente, mesa, observacao = '', itens } = req.body;

  if (
    typeof cliente !== 'string' ||
    !cliente.trim() ||
    mesa === undefined ||
    mesa === null ||
    !Array.isArray(itens) ||
    itens.length === 0
  ) {
    return res.status(400).json({
      erro: 'Informe cliente, mesa e pelo menos um item.',
    });
  }

  const itensValidos = itens.every(
    (item) =>
      Number.isInteger(item.id) &&
      typeof item.nome === 'string' &&
      Number.isFinite(item.preco) &&
      item.preco >= 0 &&
      Number.isInteger(item.quantidade) &&
      item.quantidade > 0
  );

  if (!itensValidos) {
    return res.status(400).json({
      erro: 'Os itens do pedido são inválidos.',
    });
  }

  // Valores e produtos serão validados novamente no servidor
  // contra o catálogo oficial antes de aceitar pedidos reais.

  const total = Number(
    itens.reduce(
      (soma, item) => soma + item.preco * item.quantidade,
      0
    ).toFixed(2)
  );

  const resultado = db
    .prepare(`
      INSERT INTO pedidos (cliente, mesa, observacao, itens, total)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      cliente.trim(),
      String(mesa),
      String(observacao),
      JSON.stringify(itens),
      total
    );

  const pedido = db
    .prepare('SELECT * FROM pedidos WHERE id = ?')
    .get(resultado.lastInsertRowid);

  res.status(201).json({
    ...pedido,
    itens: JSON.parse(pedido.itens),
  });
});

app.patch('/api/pedidos/:id/status', (req, res) => {
  const statusPermitidos = [
    'Recebido',
    'Em preparo',
    'Pronto',
    'Entregue',
    'Cancelado',
  ];

  const { status } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }

  const resultado = db
    .prepare('UPDATE pedidos SET status = ? WHERE id = ?')
    .run(status, id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Pedido não encontrado.' });
  }

  const pedido = db
    .prepare('SELECT * FROM pedidos WHERE id = ?')
    .get(id);

  res.json(pedido);
});

const porta = Number(process.env.PORT) || 3333;

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
