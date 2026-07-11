/* =====================================================================
   TELLUS IMOBILIÁRIA — LÓGICA DA APLICAÇÃO
   Organização:
   1. Estado global (objeto de dados do imóvel)
   2. Definição das perguntas do questionário
   3. Elementos do DOM
   4. Motor do chat (renderização de perguntas / respostas)
   5. Validações
   6. Máscara de telefone
   7. Finalização + integração futura (enviarDados)
   8. Tela de sucesso + confete
   9. Efeitos do Hero (odômetro)
   10. Inicialização / eventos globais
   ===================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------
     1. ESTADO GLOBAL
     Objeto único onde todas as respostas do usuário são armazenadas.
     ------------------------------------------------------------------- */
  const dados = {
    cidade: "",
    bairro: "",
    tipo: "",
    areaConstruida: "",
    areaTerreno: "",
    quartos: "",
    banheiros: "",
    garagem: "",
    caracteristicas: [],
    estado: "",
    idade: "",
    objetivo: "",
    nome: "",
    telefone: "",
    email: ""
  };

  let currentStepIndex = 0;
  let selectedOptionValue = null;      // valor temporário para perguntas de escolha única
  let selectedChecklist = [];          // valores temporários para checklist

  /* -------------------------------------------------------------------
     2. DEFINIÇÃO DAS PERGUNTAS
     Cada pergunta descreve: chave no objeto `dados`, texto, tipo de
     resposta e opções (quando aplicável). Isso torna fácil adicionar,
     remover ou reordenar perguntas no futuro.
     ------------------------------------------------------------------- */
  const perguntas = [
    {
      key: 'cidade',
      texto: 'Em qual cidade está seu imóvel?',
      tipo: 'options',
      opcoes: ['Matelândia', 'Medianeira', 'Foz do Iguaçu', 'Céu Azul', 'São Miguel', 'Outra']
    },
    {
      key: 'bairro',
      texto: 'Qual o bairro?',
      tipo: 'text',
      placeholder: 'Digite o nome do bairro'
    },
    {
      key: 'tipo',
      texto: 'O imóvel é:',
      tipo: 'options',
      opcoes: ['Casa', 'Apartamento', 'Terreno', 'Comercial', 'Outro']
    },
    {
      key: 'areaConstruida',
      texto: 'Qual a área construída? (em m²)',
      tipo: 'number',
      placeholder: 'Ex: 120'
    },
    {
      key: 'areaTerreno',
      texto: 'E a área do terreno? (em m²)',
      tipo: 'number',
      placeholder: 'Ex: 360'
    },
    {
      key: 'quartos',
      texto: 'Quantos quartos o imóvel possui?',
      tipo: 'options',
      opcoes: ['1', '2', '3', '4', '5 ou mais']
    },
    {
      key: 'banheiros',
      texto: 'E quantos banheiros?',
      tipo: 'options',
      opcoes: ['1', '2', '3', '4 ou mais']
    },
    {
      key: 'garagem',
      texto: 'Quantas vagas de garagem?',
      tipo: 'options',
      opcoes: ['Nenhuma', '1', '2', '3 ou mais']
    },
    {
      key: 'caracteristicas',
      texto: 'O imóvel possui alguns destes diferenciais?',
      tipo: 'checklist',
      opcoes: ['Piscina', 'Área Gourmet', 'Suíte', 'Edícula', 'Energia Solar', 'Móveis Planejados', 'Sacada', 'Churrasqueira', 'Portão Eletrônico', 'Outro']
    },
    {
      key: 'estado',
      texto: 'Qual o estado de conservação do imóvel?',
      tipo: 'options',
      opcoes: ['Novo', 'Excelente', 'Bom', 'Regular', 'Precisa reforma']
    },
    {
      key: 'idade',
      texto: 'Há quanto tempo o imóvel foi construído?',
      tipo: 'text',
      placeholder: 'Ex: 5 anos'
    },
    {
      key: 'objetivo',
      texto: 'Você pretende:',
      tipo: 'options',
      opcoes: ['Vender', 'Alugar', 'Ainda estou pesquisando']
    },
    {
      key: 'nome',
      texto: 'Qual o seu nome?',
      tipo: 'text',
      placeholder: 'Digite seu nome completo'
    },
    {
      key: 'telefone',
      texto: 'Qual o seu WhatsApp? (com DDD)',
      tipo: 'phone',
      placeholder: '(00) 00000-0000'
    },
    {
      key: 'email',
      texto: 'Por fim, qual o seu e-mail? (opcional)',
      tipo: 'email',
      placeholder: 'seuemail@exemplo.com',
      opcional: true
    }
  ];

  /* -------------------------------------------------------------------
     3. ELEMENTOS DO DOM
     ------------------------------------------------------------------- */
  const heroSection = document.getElementById('hero');
  const chatSection = document.getElementById('chatSection');
  const successSection = document.getElementById('successSection');
  const chatBody = document.getElementById('chatBody');
  const chatFooter = document.getElementById('chatFooter');
  const progressFill = document.getElementById('progressFill');
  const stepLabel = document.getElementById('stepLabel');
  const startBtn = document.getElementById('startBtn');
  const headerCta = document.getElementById('headerCta');
  const closeChat = document.getElementById('closeChat');
  const whatsappBtn = document.getElementById('whatsappBtn');

  /* -------------------------------------------------------------------
     4. MOTOR DO CHAT
     ------------------------------------------------------------------- */

  // Inicia o questionário a partir do zero
  function iniciarQuestionario() {
    currentStepIndex = 0;
    heroSection.style.display = 'none';
    chatSection.classList.add('is-active');
    chatBody.innerHTML = '';
    renderPergunta(currentStepIndex);
  }

  // Renderiza a pergunta do índice informado como uma nova bolha de chat
  function renderPergunta(index) {
    const pergunta = perguntas[index];
    if (!pergunta) return;

    atualizarProgresso(index);
    selectedOptionValue = null;
    selectedChecklist = Array.isArray(dados[pergunta.key]) ? [...dados[pergunta.key]] : [];

    // Indicador de "digitando" antes da pergunta aparecer, para um efeito de conversa natural
    const typingEl = criarIndicadorDigitando();
    chatBody.appendChild(typingEl);
    scrollToBottom();

    setTimeout(() => {
      typingEl.remove();
      const msg = criarBolhaBot(pergunta.texto);
      chatBody.appendChild(msg);
      scrollToBottom();
      renderRespostaFooter(pergunta);
    }, 420);
  }

  function criarIndicadorDigitando() {
    const wrap = document.createElement('div');
    wrap.className = 'msg';
    wrap.innerHTML = `
      <span class="msg-bot-icon">${iconeLogo()}</span>
      <span class="msg-bubble"><span class="typing-indicator"><span></span><span></span><span></span></span></span>
    `;
    return wrap;
  }

  function criarBolhaBot(texto) {
    const wrap = document.createElement('div');
    wrap.className = 'msg';
    wrap.innerHTML = `
      <span class="msg-bot-icon">${iconeLogo()}</span>
      <span class="msg-bubble">${texto}</span>
    `;
    return wrap;
  }

  function criarBolhaUsuario(texto) {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-user';
    wrap.innerHTML = `<span class="msg-bubble">${texto}</span>`;
    return wrap;
  }

  function iconeLogo() {
    return `<svg width="14" height="14" viewBox="0 0 30 30" fill="none"><path d="M15 2L27 9V21L15 28L3 21V9L15 2Z" stroke="currentColor" stroke-width="1.8"/><path d="M15 9L21 12.5V19.5L15 23L9 19.5V12.5L15 9Z" fill="currentColor"/></svg>`;
  }

  // Constrói a área de resposta no rodapé do chat, de acordo com o tipo da pergunta
  function renderRespostaFooter(pergunta) {
    chatFooter.innerHTML = '';

    switch (pergunta.tipo) {
      case 'options':
        chatFooter.appendChild(criarOpcoes(pergunta));
        break;
      case 'checklist':
        chatFooter.appendChild(criarChecklist(pergunta));
        break;
      case 'text':
      case 'number':
      case 'email':
        chatFooter.appendChild(criarCampoTexto(pergunta));
        break;
      case 'phone':
        chatFooter.appendChild(criarCampoTelefone(pergunta));
        break;
    }
  }

  // --- Perguntas de escolha única (avançam automaticamente após seleção) ---
  function criarOpcoes(pergunta) {
    const container = document.createElement('div');
    container.className = 'option-grid';

    pergunta.opcoes.forEach((opcao) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = opcao;
      btn.addEventListener('click', () => {
        dados[pergunta.key] = opcao;
        chatBody.appendChild(criarBolhaUsuario(opcao));
        scrollToBottom();
        chatFooter.innerHTML = '';
        avancar();
      });
      container.appendChild(btn);
    });

    if (currentStepIndex > 0) container.appendChild(criarBotaoVoltar());
    return container;
  }

  // --- Checklist (múltipla escolha, requer botão de continuar) ---
  function criarChecklist(pergunta) {
    const wrapper = document.createElement('div');

    const grid = document.createElement('div');
    grid.className = 'check-grid';

    pergunta.opcoes.forEach((opcao) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'check-btn';
      if (selectedChecklist.includes(opcao)) btn.classList.add('is-selected');
      btn.innerHTML = `<span class="check-box">${iconeCheck()}</span><span>${opcao}</span>`;
      btn.addEventListener('click', () => {
        if (selectedChecklist.includes(opcao)) {
          selectedChecklist = selectedChecklist.filter((v) => v !== opcao);
          btn.classList.remove('is-selected');
        } else {
          selectedChecklist.push(opcao);
          btn.classList.add('is-selected');
        }
      });
      grid.appendChild(btn);
    });

    wrapper.appendChild(grid);
    wrapper.appendChild(criarBarraAcoes(() => {
      dados.caracteristicas = [...selectedChecklist];
      const resumo = selectedChecklist.length ? selectedChecklist.join(', ') : 'Nenhum diferencial selecionado';
      chatBody.appendChild(criarBolhaUsuario(resumo));
      scrollToBottom();
      chatFooter.innerHTML = '';
      avancar();
    }));

    return wrapper;
  }

  function iconeCheck() {
    return `<svg viewBox="0 0 16 16" width="10" height="10"><path d="M2 8.5L6 12.5L14 3.5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  // --- Campos de texto / número / e-mail ---
  function criarCampoTexto(pergunta) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field-wrap';

    const input = document.createElement('input');
    input.className = 'text-input';
    input.type = pergunta.tipo === 'number' ? 'number' : (pergunta.tipo === 'email' ? 'email' : 'text');
    input.placeholder = pergunta.placeholder || '';
    input.value = dados[pergunta.key] || '';
    if (pergunta.tipo === 'number') input.min = '0';

    const erro = document.createElement('p');
    erro.className = 'field-error';
    erro.innerHTML = `<svg viewBox="0 0 16 16" width="13" height="13"><path d="M8 1L15 14H1L8 1Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 6V9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="11.7" r="0.8" fill="currentColor"/></svg> ${mensagemErro(pergunta)}`;

    wrapper.appendChild(input);
    wrapper.appendChild(erro);

    const confirmar = () => {
      const valor = input.value.trim();
      if (!pergunta.opcional && !validarCampo(pergunta.tipo, valor)) {
        erro.classList.add('is-visible');
        input.focus();
        return;
      }
      erro.classList.remove('is-visible');
      dados[pergunta.key] = valor;
      chatBody.appendChild(criarBolhaUsuario(valor || 'Prefiro não informar'));
      scrollToBottom();
      chatFooter.innerHTML = '';
      avancar();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmar();
    });

    wrapper.appendChild(criarBarraAcoes(confirmar, pergunta.opcional ? 'Continuar' : 'Continuar'));
    setTimeout(() => input.focus(), 50);
    return wrapper;
  }

  // --- Campo de telefone com máscara automática ---
  function criarCampoTelefone(pergunta) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field-wrap';

    const input = document.createElement('input');
    input.className = 'text-input';
    input.type = 'tel';
    input.placeholder = pergunta.placeholder;
    input.value = dados[pergunta.key] || '';
    input.addEventListener('input', () => {
      input.value = aplicarMascaraTelefone(input.value);
    });

    const erro = document.createElement('p');
    erro.className = 'field-error';
    erro.innerHTML = `<svg viewBox="0 0 16 16" width="13" height="13"><path d="M8 1L15 14H1L8 1Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 6V9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="11.7" r="0.8" fill="currentColor"/></svg> Informe um WhatsApp válido com DDD.`;

    wrapper.appendChild(input);
    wrapper.appendChild(erro);

    const confirmar = () => {
      const valor = input.value.trim();
      const digitos = valor.replace(/\D/g, '');
      if (digitos.length < 10) {
        erro.classList.add('is-visible');
        input.focus();
        return;
      }
      erro.classList.remove('is-visible');
      dados.telefone = valor;
      chatBody.appendChild(criarBolhaUsuario(valor));
      scrollToBottom();
      chatFooter.innerHTML = '';
      avancar();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmar();
    });

    wrapper.appendChild(criarBarraAcoes(confirmar));
    setTimeout(() => input.focus(), 50);
    return wrapper;
  }

  function criarBarraAcoes(onContinuar, label) {
    const bar = document.createElement('div');
    bar.className = 'footer-actions';

    if (currentStepIndex > 0) {
      bar.appendChild(criarBotaoVoltar());
    }

    const continuarBtn = document.createElement('button');
    continuarBtn.type = 'button';
    continuarBtn.className = 'btn-continue';
    continuarBtn.textContent = label || 'Continuar';
    continuarBtn.addEventListener('click', onContinuar);
    bar.appendChild(continuarBtn);

    return bar;
  }

  function criarBotaoVoltar() {
    const voltarBtn = document.createElement('button');
    voltarBtn.type = 'button';
    voltarBtn.className = 'btn-back';
    voltarBtn.textContent = '← Voltar';
    voltarBtn.addEventListener('click', voltar);
    return voltarBtn;
  }

  function avancar() {
    currentStepIndex++;
    if (currentStepIndex < perguntas.length) {
      renderPergunta(currentStepIndex);
    } else {
      finalizarQuestionario();
    }
  }

  function voltar() {
    if (currentStepIndex === 0) return;
    // Remove a última pergunta (bot) e a última resposta (usuário) exibidas
    const msgs = chatBody.querySelectorAll('.msg');
    if (msgs.length >= 1) msgs[msgs.length - 1].remove(); // pergunta atual (se já sem resposta) ou resposta
    currentStepIndex--;
    const msgsAtualizadas = chatBody.querySelectorAll('.msg');
    if (msgsAtualizadas.length >= 1) msgsAtualizadas[msgsAtualizadas.length - 1].remove(); // pergunta anterior
    renderPergunta(currentStepIndex);
  }

  function atualizarProgresso(index) {
    const percent = ((index + 1) / perguntas.length) * 100;
    progressFill.style.width = percent + '%';
    stepLabel.textContent = `Pergunta ${index + 1} de ${perguntas.length}`;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }

  /* -------------------------------------------------------------------
     5. VALIDAÇÕES
     ------------------------------------------------------------------- */
  function validarCampo(tipo, valor) {
    if (!valor) return false;
    if (tipo === 'number') return !isNaN(Number(valor)) && Number(valor) >= 0;
    if (tipo === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    return valor.length > 0;
  }

  function mensagemErro(pergunta) {
    if (pergunta.tipo === 'number') return 'Informe um valor numérico válido.';
    if (pergunta.tipo === 'email') return 'Informe um e-mail válido.';
    return 'Este campo é obrigatório.';
  }

  /* -------------------------------------------------------------------
     6. MÁSCARA DE TELEFONE — formato (00) 00000-0000
     ------------------------------------------------------------------- */
  function aplicarMascaraTelefone(valor) {
    let v = valor.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/(\d{0,2})/, '($1');
    }
    return v.trim();
  }

  /* -------------------------------------------------------------------
     7. FINALIZAÇÃO DO QUESTIONÁRIO + INTEGRAÇÃO FUTURA
     ------------------------------------------------------------------- */
  function finalizarQuestionario() {
    stepLabel.textContent = 'Finalizando...';
    progressFill.style.width = '100%';
    chatFooter.innerHTML = '';

    const mensagens = [
      'Analisando as informações...',
      'Calculando valorização da região...',
      'Consultando fatores do mercado...'
    ];

    chatBody.innerHTML = `
      <div class="loading-msgs">
        <div class="loading-ring"></div>
        <p class="loading-text" id="loadingText">${mensagens[0]}</p>
      </div>
    `;

    const loadingText = document.getElementById('loadingText');
    let i = 0;
    const intervalo = setInterval(() => {
      i++;
      if (i < mensagens.length) loadingText.textContent = mensagens[i];
    }, 1000);

    setTimeout(() => {
      clearInterval(intervalo);
      enviarDados();
      mostrarTelaSucesso();
    }, 3000);
  }

  /**
   * enviarDados()
   * ---------------------------------------------------------------
   * Ponto único de integração com back-end / banco de dados externo.
   *
   * Envia os dados para a planilha do Google Sheets através de um
   * Apps Script publicado como Web App. Basta colar a URL gerada
   * na implantação em GOOGLE_SHEETS_URL logo abaixo.
   *
   * Passo a passo de como gerar essa URL: crie a planilha, vá em
   * Extensões > Apps Script, cole o código do doPost() (arquivo
   * apps-script-codigo.gs) e implante como "App da Web" com acesso
   * "Qualquer pessoa". Copie a URL /exec gerada e cole abaixo.
   *
   * Outras integrações futuras podem ser adicionadas do mesmo jeito:
   *
   *   // Supabase
   *   fetch('https://SEU_PROJETO.supabase.co/rest/v1/avaliacoes', {
   *     method: 'POST',
   *     headers: {
   *       'Content-Type': 'application/json',
   *       'apikey': 'SUA_CHAVE_ANON',
   *       'Authorization': 'Bearer SUA_CHAVE_ANON'
   *     },
   *     body: JSON.stringify(dados)
   *   });
   *
   *   // Firebase (Firestore via REST ou SDK)
   *   // db.collection('avaliacoes').add(dados);
   *
   *   // API própria / Webhook (ex: Zapier, Make, n8n)
   *   fetch('https://sua-api.com/webhook/avaliacao', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(dados)
   *   });
   * ---------------------------------------------------------------
   */
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbya9nwE-9pT0qsn7u9eI9XnVnmQdT4L_Fahlq0DzOy4FGDs6GleMA5nGHBPmQTbyaqL/exec';

  function enviarDados() {
    console.log('Dados da avaliação prontos para envio:', dados);

    if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL.indexOf('COLE_AQUI') !== -1) {
      console.warn('GOOGLE_SHEETS_URL ainda não foi configurada — dados não foram enviados à planilha.');
      return;
    }

    // "no-cors" é necessário porque o Apps Script não retorna cabeçalhos
    // CORS explícitos; o envio funciona normalmente mesmo sem ler a resposta.
    fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(dados)
    }).catch((erro) => {
      console.error('Falha ao enviar dados para a planilha:', erro);
    });
  }

  /* -------------------------------------------------------------------
     8. TELA DE SUCESSO + CONFETE
     ------------------------------------------------------------------- */
  function mostrarTelaSucesso() {
    chatSection.classList.remove('is-active');
    successSection.classList.add('is-active');

    const numero = '554598369092';
    const mensagem = encodeURIComponent('Olá! Acabei de preencher a avaliação do meu imóvel e gostaria de receber minha estimativa.');
    whatsappBtn.href = `https://wa.me/${numero}?text=${mensagem}`;

    dispararConfete();
  }

  function dispararConfete() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = canvas.offsetWidth * DPR;
      canvas.height = canvas.offsetHeight * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const cores = ['#C8A24A', '#0F5132', '#D9BA71', '#146740', '#FFFFFF'];
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = prefersReduced ? 0 : 90;

    const particulas = Array.from({ length: total }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: -20 - Math.random() * 200,
      w: 5 + Math.random() * 5,
      h: 8 + Math.random() * 6,
      cor: cores[Math.floor(Math.random() * cores.length)],
      velY: 2 + Math.random() * 2.5,
      velX: -1 + Math.random() * 2,
      rot: Math.random() * 360,
      velRot: -6 + Math.random() * 12
    }));

    let frames = 0;
    const maxFrames = 260;

    function tick() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particulas.forEach((p) => {
        p.x += p.velX;
        p.y += p.velY;
        p.rot += p.velRot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.cor;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frames++;
      if (frames < maxFrames) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      }
    }
    if (total > 0) requestAnimationFrame(tick);
  }

  /* -------------------------------------------------------------------
     9. EFEITOS DO HERO — contador do cartão de estimativa
     ------------------------------------------------------------------- */
  function animarOdometro() {
    const el = document.getElementById('heroOdometer');
    if (!el) return;
    const alvo = 428500;
    const duracao = 1800;
    const inicio = performance.now();

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const facilitado = 1 - Math.pow(1 - progresso, 3);
      const valor = Math.floor(alvo * facilitado);
      el.textContent = valor.toLocaleString('pt-BR');
      if (progresso < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* -------------------------------------------------------------------
     10. INICIALIZAÇÃO / EVENTOS GLOBAIS
     ------------------------------------------------------------------- */
  function voltarParaHero() {
    chatSection.classList.remove('is-active');
    heroSection.style.display = '';
  }

  function init() {
    document.getElementById('year').textContent = new Date().getFullYear();

    startBtn.addEventListener('click', iniciarQuestionario);
    headerCta.addEventListener('click', (e) => {
      e.preventDefault();
      iniciarQuestionario();
    });
    closeChat.addEventListener('click', voltarParaHero);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      setTimeout(animarOdometro, 300);
    } else {
      document.getElementById('heroOdometer').textContent = '428.500';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
