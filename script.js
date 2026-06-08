// ============================================================
//  🎮 CONFIGURAÇÕES — altere aqui para personalizar
// ============================================================
const EMOJIS = ['🚀', '🎸', '🦊', '🌈', '🔥', '💎', '🎯', '⚡'];
// Dica: troque por outros emojis ou use letras, números, etc.

const TOTAL_PARES = EMOJIS.length; // 8 pares = 16 cartas

// ============================================================
//  ESTADO DO JOGO
// ============================================================
let cartasViradas  = [];   // cartas atualmente viradas (max 2)
let acertos        = 0;    // pares encontrados
let tentativas     = 0;    // total de tentativas
let bloqueado      = false;// impede clique durante animação
let inicio         = null; // timestamp de início
let timerID        = null; // ID do setInterval do cronômetro

// ============================================================
//  INICIALIZAR / REINICIAR JOGO
// ============================================================
function iniciarJogo() {
  // Resetar estado
  cartasViradas = [];
  acertos       = 0;
  tentativas    = 0;
  bloqueado     = false;

  // Resetar UI
  document.getElementById('tentativas').textContent = '0';
  document.getElementById('acertos').textContent    = '0';
  document.getElementById('tempo').textContent      = '0s';
  document.getElementById('progresso').style.width  = '0%';
  document.getElementById('vitoria').classList.remove('visivel');

  // Parar cronômetro anterior
  clearInterval(timerID);
  inicio  = Date.now();
  timerID = setInterval(atualizarTempo, 1000);

  // Criar e embaralhar cartas
  const pares    = [...EMOJIS, ...EMOJIS];
  const embaralhadas = embaralhar(pares);

  // Renderizar grade
  const grade = document.getElementById('grade');
  grade.innerHTML = '';

  embaralhadas.forEach((emoji, i) => {
    const carta = document.createElement('div');
    carta.className = 'carta';
    carta.setAttribute('role', 'listitem');
    carta.setAttribute('aria-label', 'Carta virada para baixo');
    carta.style.animationDelay = `${i * 40}ms`;
    carta.dataset.emoji = emoji;

    carta.innerHTML = `
      <div class="carta-inner">
        <div class="carta-verso">
          <span class="icone-verso">✦</span>
        </div>
        <div class="carta-frente" aria-hidden="true">
          ${emoji}
        </div>
      </div>`;

    carta.addEventListener('click', () => clicarCarta(carta));
    grade.appendChild(carta);
  });
}

// ============================================================
//  LÓGICA: CLICAR NUMA CARTA
// ============================================================
function clicarCarta(carta) {
  // Ignorar clique em carta já virada, acertada, ou durante animação
  if (
    bloqueado ||
    carta.classList.contains('virada') ||
    carta.classList.contains('acertada')
  ) return;

  // Virar a carta
  carta.classList.add('virada');
  carta.setAttribute('aria-label', `Carta: ${carta.dataset.emoji}`);
  cartasViradas.push(carta);

  // Se só uma carta virada, aguardar próxima
  if (cartasViradas.length < 2) return;

  // Duas cartas viradas: verificar par
  bloqueado = true;
  tentativas++;
  atualizarStat('tentativas', tentativas);

  const [c1, c2] = cartasViradas;

  if (c1.dataset.emoji === c2.dataset.emoji) {
    // ✅ PAR ENCONTRADO
    setTimeout(() => {
      c1.classList.add('acertada');
      c2.classList.add('acertada');
      c1.classList.remove('virado');
      c2.classList.remove('virado');
      c1.setAttribute('aria-label', `Par encontrado: ${c1.dataset.emoji}`);
      c2.setAttribute('aria-label', `Par encontrado: ${c2.dataset.emoji}`);
      cartasViradas = [];
      bloqueado     = false;

      acertos++;
      atualizarStat('acertos', acertos);
      atualizarProgresso(acertos / TOTAL_PARES * 100);

      if (acertos === TOTAL_PARES) exibirVitoria();
    }, 400);

  } else {
    // ❌ NÃO É PAR
    c1.classList.add('errado');
    c2.classList.add('errado');

    setTimeout(() => {
      c1.classList.remove('virada', 'errado');
      c2.classList.remove('virada', 'errado');
      c1.setAttribute('aria-label', 'Carta virada para baixo');
      c2.setAttribute('aria-label', 'Carta virada para baixo');
      cartasViradas = [];
      bloqueado     = false;
    }, 900);
  }
}

// ============================================================
//  VITÓRIA
// ============================================================
function exibirVitoria() {
  clearInterval(timerID);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  const eficiencia = Math.round((TOTAL_PARES / tentativas) * 100);

  document.getElementById('msg-vitoria').textContent =
    `${tentativas} tentativas · ${segundos}s · ${eficiencia}% de eficiência`;

  setTimeout(() => {
    document.getElementById('vitoria').classList.add('visivel');
  }, 300);
}

// ============================================================
//  AUXILIARES
// ============================================================
function embaralhar(arr) {
  // Fisher-Yates shuffle
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
  void el.offsetWidth; // reflow para reiniciar animação
  el.classList.add('pulsar');
}

function atualizarTempo() {
  const s = Math.round((Date.now() - inicio) / 1000);
  document.getElementById('tempo').textContent = `${s}s`;
}

function atualizarProgresso(pct) {
  document.getElementById('progresso').style.width = `${pct}%`;
}

// ============================================================
//  INICIAR AO CARREGAR
// ============================================================
iniciarJogo();