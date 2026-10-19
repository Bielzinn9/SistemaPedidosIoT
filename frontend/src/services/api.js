
const API_URL = 'http://localhost:3333';

export async function criarPedido(pedido) {
  const resposta = await fetch(`${API_URL}/api/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pedido),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Não foi possível registrar o pedido.');
  }

  return dados;
}

export async function listarPedidos() {
  const resposta = await fetch(`${API_URL}/api/pedidos`);

  if (!resposta.ok) {
    throw new Error('Não foi possível consultar os pedidos.');
  }

  return resposta.json();
}
