// ============================================================
//  🎮 CONFIGURAÇÕES — POKÉMONS DA PRIMEIRA GERAÇÃO
// ============================================================
const TODOS_POKEMONS = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  nome: `Pokémon ${i + 1}`,
  img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`
}));

// ============================================================
//  🎮 CONFIGURAÇÕES — NÍVEIS DO JOGO
// ============================================================
const NIVEIS = {
  facil: TODOS_POKEMONS.slice(0, 8),
  medio: TODOS_POKEMONS.slice(0, 16),
  dificil: TODOS_POKEMONS.slice(0, 32)
};

// ============================================================
//  ⏳ TEMPO LIMITE POR DIFICULDADE
// ============================================================
const TEMPOS = {
  facil: 60,
  medio: 120,
  dificil: 180
};

// ============================================================
//  🎚️ DIFICULDADE ATUAL
// ============================================================
let nivelAtual = 'facil';
let EMOJIS = NIVEIS[nivelAtual];
let TOTAL_PARES = EMOJIS.length;
let tempoLimite = TEMPOS[nivelAtual];

// ============================================================
//  ESTADO DO JOGO
// ============================================================
let cartasViradas = [];
let acertos = 0;
let tentativas = 0;
let bloqueado = true;
let jogoIniciado = false;
let inicio = null;
let timerID = null;

// ============================================================
//  ▶ INICIAR PARTIDA
// ============================================================
function iniciarPartida() {
  nivelAtual = document.getElementById('nivel').value;

  EMOJIS = NIVEIS[nivelAtual];
  TOTAL_PARES = EMOJIS.length;
  tempoLimite = TEMPOS[nivelAtual];

  jogoIniciado = true;
  bloqueado = false;

  iniciarJogo();
}

// ============================================================
//  INICIALIZAR / REINICIAR JOGO
// ============================================================
function iniciarJogo() {
  cartasViradas = [];
  acertos = 0;
  tentativas = 0;
  bloqueado = false;

  document.getElementById('tentativas').textContent = '0';
  document.getElementById('acertos').textContent = '0';
  document.getElementById('tempo').textContent = `${tempoLimite}s`;
  document.getElementById('progresso').style.width = '0%';

  document.getElementById('vitoria').classList.remove('visivel');

  clearInterval(timerID);
  inicio = Date.now();
  timerID = setInterval(atualizarTempo, 1000);

  const pares = [...EMOJIS, ...EMOJIS];
  const embaralhadas = embaralhar(pares);

  const grade = document.getElementById('grade');
  grade.innerHTML = '';

  // ============================================================
  //  🧱 AJUSTAR COLUNAS POR NÍVEL
  // ============================================================
  let colunas = 4;

  if (nivelAtual === 'medio') {
    colunas = 8;
  }

  if (nivelAtual === 'dificil') {
    colunas = 8;
  }

  grade.style.gridTemplateColumns =
    `repeat(${colunas}, var(--tamanho-carta))`;

  // ============================================================
  //  🃏 CRIAR CARTAS
  // ============================================================
  embaralhadas.forEach((pokemon, i) => {
    const carta = document.createElement('div');

    carta.className = 'carta';
    carta.setAttribute('role', 'listitem');
    carta.setAttribute('aria-label', 'Carta virada para baixo');
    carta.style.animationDelay = `${i * 20}ms`;

    carta.dataset.nome = pokemon.nome;

    carta.innerHTML = `
      <div class="carta-inner">
        <div class="carta-verso">
          <span class="icone-verso">✦</span>
        </div>

        <div class="carta-frente" aria-hidden="true">
          <img 
            src="${pokemon.img}" 
            alt="${pokemon.nome}" 
            class="pokemon-img"
          >
        </div>
      </div>
    `;

    carta.addEventListener('click', () => clicarCarta(carta));
    grade.appendChild(carta);
  });
}

// ============================================================
//  LÓGICA: CLICAR NUMA CARTA
// ============================================================
function clicarCarta(carta) {
  if (
    !jogoIniciado ||
    bloqueado ||
    carta.classList.contains('virada') ||
    carta.classList.contains('acertada')
  ) return;

  carta.classList.add('virada');
  carta.setAttribute('aria-label', `Carta: ${carta.dataset.nome}`);

  cartasViradas.push(carta);

  if (cartasViradas.length < 2) return;

  bloqueado = true;
  tentativas++;
  atualizarStat('tentativas', tentativas);

  const [c1, c2] = cartasViradas;

  if (c1.dataset.nome === c2.dataset.nome) {
    // ============================================================
    //  ✅ PAR ENCONTRADO
    // ============================================================
    setTimeout(() => {
      c1.classList.add('acertada');
      c2.classList.add('acertada');

      c1.classList.remove('virada');
      c2.classList.remove('virada');

      c1.setAttribute('aria-label', `Par encontrado: ${c1.dataset.nome}`);
      c2.setAttribute('aria-label', `Par encontrado: ${c2.dataset.nome}`);

      cartasViradas = [];
      bloqueado = false;

      acertos++;
      atualizarStat('acertos', acertos);
      atualizarProgresso((acertos / TOTAL_PARES) * 100);

      if (acertos === TOTAL_PARES) {
        exibirVitoria();
      }
    }, 400);
  } else {
    // ============================================================
    //  ❌ NÃO É PAR
    // ============================================================
    c1.classList.add('errado');
    c2.classList.add('errado');

    setTimeout(() => {
      c1.classList.remove('virada', 'errado');
      c2.classList.remove('virada', 'errado');

      c1.setAttribute('aria-label', 'Carta virada para baixo');
      c2.setAttribute('aria-label', 'Carta virada para baixo');

      cartasViradas = [];
      bloqueado = false;
    }, 900);
  }
}

// ============================================================
//  CRONÔMETRO REGRESSIVO
// ============================================================
function atualizarTempo() {
  const tempoDecorrido =
    Math.round((Date.now() - inicio) / 1000);

  const tempoRestante =
    tempoLimite - tempoDecorrido;

  document.getElementById('tempo').textContent =
    `${tempoRestante}s`;

  if (tempoRestante <= 0) {
    clearInterval(timerID);

    document.getElementById('tempo').textContent = '0s';

    exibirDerrota();
  }
}

// ============================================================
//  VITÓRIA
// ============================================================
function exibirVitoria() {
  clearInterval(timerID);

  jogoIniciado = false;
  bloqueado = true;

  document.querySelector('#vitoria h2').textContent = 'Parabéns!';
  document.querySelector('.vitoria-emoji').textContent = '🏆';

  const segundos =
    Math.round((Date.now() - inicio) / 1000);

  const eficiencia =
    Math.round((TOTAL_PARES / tentativas) * 100);

  document.getElementById('msg-vitoria').textContent =
    `${tentativas} tentativas · ${segundos}s · ${eficiencia}% de eficiência`;

  setTimeout(() => {
    document.getElementById('vitoria').classList.add('visivel');
  }, 300);
}

// ============================================================
//  DERROTA
// ============================================================
function exibirDerrota() {
  jogoIniciado = false;
  bloqueado = true;

  document.querySelector('#vitoria h2').textContent = 'Fim de Jogo';
  document.querySelector('.vitoria-emoji').textContent = '💀';

  document.getElementById('msg-vitoria').textContent =
    '⏰ Tempo esgotado! Tente novamente.';

  document.getElementById('vitoria').classList.add('visivel');
}

// ============================================================
//  AUXILIARES
// ============================================================
function embaralhar(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function atualizarStat(id, valor) {
  const el = document.getElementById(id);

  el.textContent = valor;
  el.classList.remove('pulsar');

  void el.offsetWidth;

  el.classList.add('pulsar');
}

function atualizarProgresso(pct) {
  document.getElementById('progresso').style.width = `${pct}%`;
}

// ============================================================
//  AGUARDAR JOGADOR INICIAR
// ============================================================
document.getElementById('tempo').textContent = '--';