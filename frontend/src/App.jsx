
import { useMemo, useState } from 'react';
import { criarPedido } from './services/api';
import './App.css';

const produtos = [
  {
    id: 1,
    nome: 'Hambúrguer Clássico',
    categoria: 'Hambúrgueres',
    preco: 18.9,
    descricao: 'Pão, hambúrguer artesanal, queijo e salada.',
    emoji: '🍔',
  },
  {
    id: 2,
    nome: 'Cheeseburger',
    categoria: 'Hambúrgueres',
    preco: 21.9,
    descricao: 'Hambúrguer, queijo cheddar e molho especial.',
    emoji: '🍔',
  },
  {
    id: 3,
    nome: 'Pizza de Calabresa',
    categoria: 'Pizzas',
    preco: 39.9,
    descricao: 'Molho de tomate, queijo e calabresa.',
    emoji: '🍕',
  },
  {
    id: 4,
    nome: 'Pizza de Mussarela',
    categoria: 'Pizzas',
    preco: 36.9,
    descricao: 'Molho de tomate, mussarela e orégano.',
    emoji: '🍕',
  },
  {
    id: 5,
    nome: 'Refrigerante',
    categoria: 'Bebidas',
    preco: 6.9,
    descricao: 'Lata de refrigerante 350 ml.',
    emoji: '🥤',
  },
  {
    id: 6,
    nome: 'Água Mineral',
    categoria: 'Bebidas',
    preco: 4.9,
    descricao: 'Garrafa de água mineral 500 ml.',
    emoji: '💧',
  },
  {
    id: 7,
    nome: 'Brownie',
    categoria: 'Sobremesas',
    preco: 9.9,
    descricao: 'Brownie de chocolate.',
    emoji: '🍫',
  },
  {
    id: 8,
    nome: 'Sorvete',
    categoria: 'Sobremesas',
    preco: 8.9,
    descricao: 'Sorvete cremoso.',
    emoji: '🍨',
  },
];

const categorias = [
  'Todos',
  'Hambúrgueres',
  'Pizzas',
  'Bebidas',
  'Sobremesas',
];

const dinheiro = (valor) =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

function App() {
  const [categoria, setCategoria] = useState('Todos');
  const [carrinho, setCarrinho] = useState([]);
  const [cliente, setCliente] = useState('');
  const [mesa, setMesa] = useState('1');
  const [observacao, setObservacao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);

  const produtosFiltrados = produtos.filter(
    (produto) =>
      categoria === 'Todos' || produto.categoria === categoria
  );

  const quantidadeItens = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const subtotal = useMemo(
    () =>
      carrinho.reduce(
        (total, item) => total + item.preco * item.quantidade,
        0
      ),
    [carrinho]
  );

  function adicionarProduto(produto) {
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.id === produto.id);

      if (existente) {
        return atual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...atual, { ...produto, quantidade: 1 }];
    });

    setMensagem('');
    setPedidoFinalizado(null);
  }

  function alterarQuantidade(id, variacao) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.id === id
            ? { ...item, quantidade: item.quantidade + variacao }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );

    setMensagem('');
  }

  
async function finalizarPedido(evento) {
  evento.preventDefault();

  if (carrinho.length === 0) {
    setMensagem('Adicione pelo menos um produto ao carrinho.');
    return;
  }

  if (!cliente.trim()) {
    setMensagem('Informe o nome do cliente.');
    return;
  }

  setMensagem('Enviando pedido...');
  setPedidoFinalizado(null);

  try {
    const pedidoSalvo = await criarPedido({
      cliente: cliente.trim(),
      mesa,
      observacao: observacao.trim(),
      itens: carrinho.map((item) => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade,
      })),
    });

    setPedidoFinalizado({
      numero: pedidoSalvo.id,
      cliente: pedidoSalvo.cliente,
      mesa: pedidoSalvo.mesa,
      observacao: pedidoSalvo.observacao,
      itens: pedidoSalvo.itens,
      total: pedidoSalvo.total,
      status: pedidoSalvo.status,
      data: pedidoSalvo.criado_em,
    });

    setCarrinho([]);
    setObservacao('');
    setMensagem('');
  } catch (erro) {
    setMensagem(
      erro.message || 'Erro ao enviar pedido. Verifique se o backend está ativo.'
    );
  }
}

  return (
    <div className="app">
      <header className="topo">
        <a className="marca" href="#inicio">
          <span className="marca-icone">🍽️</span>
          <span>
            <strong>Sabor &amp; Cia</strong>
            <small>Seu pedido, do seu jeito.</small>
          </span>
        </a>

        <a className="atalho-carrinho" href="#carrinho">
          🛒 Carrinho
          <span className="contador">{quantidadeItens}</span>
        </a>
      </header>

      <main className="conteudo" id="inicio">
        <section className="apresentacao">
          <span className="etiqueta">CARDÁPIO DIGITAL</span>
          <h1>Seu próximo sabor favorito está aqui.</h1>
          <p>
            Escolha seus produtos, monte seu pedido e envie
            para a cozinha.
          </p>
        </section>

        <section className="secao-cardapio">
          <div className="titulo-secao">
            <div>
              <h2>Nosso cardápio</h2>
              <p>Feito para deixar seu dia mais gostoso.</p>
            </div>
          </div>

          <nav className="categorias" aria-label="Categorias">
            {categorias.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  categoria === item
                    ? 'categoria ativa'
                    : 'categoria'
                }
                onClick={() => setCategoria(item)}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="grade-produtos">
            {produtosFiltrados.map((produto) => (
              <article className="produto" key={produto.id}>
                <div className="produto-imagem" aria-hidden="true">
                  {produto.emoji}
                </div>

                <div className="produto-info">
                  <span className="produto-categoria">
                    {produto.categoria}
                  </span>
                  <h3>{produto.nome}</h3>
                  <p>{produto.descricao}</p>

                  <div className="produto-rodape">
                    <strong>{dinheiro(produto.preco)}</strong>
                    <button
                      className="botao-adicionar"
                      type="button"
                      onClick={() => adicionarProduto(produto)}
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="secao-carrinho" id="carrinho">
          <div className="titulo-secao">
            <div>
              <h2>Seu carrinho</h2>
              <p>
                {quantidadeItens} item(ns) selecionado(s)
              </p>
            </div>
          </div>

          {carrinho.length === 0 ? (
            <div className="carrinho-vazio">
              <span>🛍️</span>
              <h3>Seu carrinho está vazio</h3>
              <p>Adicione algum produto do cardápio para começar.</p>
            </div>
          ) : (
            <div className="itens-carrinho">
              {carrinho.map((item) => (
                <div className="item-carrinho" key={item.id}>
                  <span className="item-emoji">{item.emoji}</span>

                  <div className="item-dados">
                    <strong>{item.nome}</strong>
                    <span>{dinheiro(item.preco)}</span>
                  </div>

                  <div className="controle-quantidade">
                    <button
                      type="button"
                      aria-label={`Diminuir ${item.nome}`}
                      onClick={() => alterarQuantidade(item.id, -1)}
                    >
                      −
                    </button>
                    <span>{item.quantidade}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar ${item.nome}`}
                      onClick={() => alterarQuantidade(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <strong className="total-item">
                    {dinheiro(item.preco * item.quantidade)}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="resumo">
            <div>
              <span>Subtotal</span>
              <strong>{dinheiro(subtotal)}</strong>
            </div>
            <div>
              <span>Taxa de entrega</span>
              <strong>R$ 0,00</strong>
            </div>
            <div className="linha-total">
              <span>Total do pedido</span>
              <strong>{dinheiro(subtotal)}</strong>
            </div>
          </div>

          <form className="formulario-pedido" onSubmit={finalizarPedido}>
            <h3>Dados do pedido</h3>

            <label htmlFor="cliente">Nome do cliente</label>
            <input
              id="cliente"
              value={cliente}
              onChange={(evento) => setCliente(evento.target.value)}
              placeholder="Digite seu nome"
              required
            />

            <label htmlFor="mesa">Número da mesa</label>
            <select
              id="mesa"
              value={mesa}
              onChange={(evento) => setMesa(evento.target.value)}
            >
              {Array.from({ length: 20 }, (_, indice) => (
                <option key={indice + 1} value={String(indice + 1)}>
                  Mesa {indice + 1}
                </option>
              ))}
            </select>

            <label htmlFor="observacao">Observações (opcional)</label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={(evento) => setObservacao(evento.target.value)}
              placeholder="Ex.: sem cebola, molho à parte..."
              rows={3}
            />

            {mensagem && (
              <p className="mensagem-erro" role="alert">
                {mensagem}
              </p>
            )}

            <button
              className="botao-finalizar"
              type="submit"
              disabled={carrinho.length === 0}
            >
              Confirmar pedido · {dinheiro(subtotal)}
            </button>
          </form>

          {pedidoFinalizado && (
            <section className="confirmacao" aria-live="polite">
              <span className="confirmacao-icone">✓</span>
              <h3>Pedido registrado com sucesso!</h3>
              <p>
                Pedido #{String(pedidoFinalizado.numero).slice(-6)}
              </p>
              <p>Cliente: {pedidoFinalizado.cliente}</p>
              <p>Mesa: {pedidoFinalizado.mesa}</p>
              <p>Total: {dinheiro(pedidoFinalizado.total)}</p>
              <p>Status: {pedidoFinalizado.status}</p>
              <small>
              Seu pedido foi salvo no banco de dados e está aguardando a cozinha.
              </small>
              <button
                className="botao-secundario"
                type="button"
                onClick={() => setPedidoFinalizado(null)}
              >
                Voltar ao cardápio
              </button>
            </section>
          )}
        </section>
      </main>

      <footer className="rodape">
        <strong>Sabor &amp; Cia</strong>
        <p>Projeto de pedidos com comunicação IoT/MQTT.</p>
      </footer>
    </div>
  );
}

export default App;
