/* =========================================================
   App de Compras — interface
   ========================================================= */
(function () {
  'use strict';
  const S = Store.S;

  // ---------- Listas ----------
  const CDCS = ['SMA - Suzano', 'CBO - Capão Bonito', 'CBO - Bracell', 'Santa Branca - Suzano', 'Caçapava - Suzano', 'Escavadeira - Suzano'];
  const CARGOS = ['Coordenador', 'Supervisor', 'Encarregado', 'Comprador', 'Analista de Custo', 'Administrativo'];
  const DEPARTAMENTOS = ['Oficina', 'Almoxarifado', 'Qualidade', 'Segurança', 'Supervisão', 'Coordenação', 'Administrativo', 'RH'];
  const TIPOS = ['Planejado', 'Emergencial', 'Regularização'];
  const STATUS_COMPRA = ['Pendente', 'Em cotação', 'Em transporte', 'Aguardando retirada', 'Finalizado'];
  const UNIDADES = ['un', 'pç', 'cx', 'jogo', 'par', 'kg', 'L', 'm', 'rolo', 'galão', 'balde', 'saco'];

  // ---------- Ícones ----------
  const P = {
    plus: 'M12 5v14M5 12h14',
    list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a3 3 0 0 1 3-3h7M18 9v6a3 3 0 0 1-3 3H8',
    check: 'M9 12l2 2 4-4M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
    calc: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
    cart: 'M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.2M10 20h.01M17 20h.01',
    db: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
    bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
    image: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
    camera: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5zM14 3v5h5M9 13h6M9 17h6',
    x: 'M6 6l12 12M18 6L6 18',
    eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    tick: 'M5 12l5 5L20 7',
    wa: 'M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3L3 21zM9 9.5c0 3 2.5 5.5 5.5 5.5l1.5-1.5-2-1-1 1c-1-.4-2-1.4-2.4-2.4l1-1-1-2L9 9.5z',
  };
  const ic = (n, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;

  // ---------- Utilidades ----------
  const h = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const hoje = () => new Date().toLocaleDateString('sv-SE');
  const dataBR = (d) => { if (!d) return '—'; const s = String(d).slice(0, 10).split('-'); return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : d; };
  const dataHora = (t) => { if (!t) return ''; const d = new Date(t); return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
  const qtd = (n) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  function diasAte(d) { const a = new Date(String(d).slice(0, 10) + 'T00:00:00'); const b = new Date(hoje() + 'T00:00:00'); return Math.round((a - b) / 86400000); }
  function prazo(d) {
    const n = diasAte(d);
    if (n < 0) return `<span class="due late">Atrasado ${-n} dia${n === -1 ? '' : 's'}</span>`;
    if (n === 0) return '<span class="due late">É para hoje</span>';
    if (n <= 3) return `<span class="due soon">${n === 1 ? 'Falta 1 dia' : `Faltam ${n} dias`}</span>`;
    return `<span class="due fine">Faltam ${n} dias</span>`;
  }
  const iniciais = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  // foto do usuário, com as iniciais por baixo caso a imagem não carregue (ex.: sem internet)
  function avatar(pessoa, cls) {
    pessoa = pessoa || {};
    return `<span class="avatar${cls ? ' ' + cls : ''}">${h(iniciais(pessoa.nome))}${pessoa.foto_url ? `<img src="${h(pessoa.foto_url)}" alt="" onerror="this.remove()">` : ''}</span>`;
  }
  function resumoItens(itens) {
    if (!itens || !itens.length) return 'Sem itens';
    const r = itens[0].produto; const n = itens.length - 1;
    return n ? `${r} + ${n} ${n === 1 ? 'item' : 'itens'}` : r;
  }
  const nomeDe = (id) => (S.perfis[id] && S.perfis[id].nome) || (S.perfil && id === S.perfil.id ? S.perfil.nome : 'Solicitante');
  function linkWhats(id, texto) {
    const p = S.perfis[id]; let tel = p && p.whatsapp ? String(p.whatsapp).replace(/\D/g, '') : '';
    if (!tel) return null;
    if (tel.length <= 11) tel = '55' + tel;
    return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
  }
  function numeroTag(p, big) {
    return p.numero ? `<span class="tag${big ? ' big' : ''}">Nº ${h(p.numero)}</span>` : `<span class="tag local${big ? ' big' : ''}">No aparelho</span>`;
  }
  function etapaInfo(p) {
    switch (p.etapa) {
      case 'coordenador': return { txt: 'Aguardando coordenador', cls: 't-wait' };
      case 'analista': return { txt: 'Aguardando analista de custo', cls: 't-wait' };
      case 'compras': return { txt: 'Compras: ' + (p.status_compra || 'Pendente'), cls: p.status_compra === 'Aguardando retirada' || p.status_compra === 'Finalizado' ? 't-warn' : 't-buy' };
      case 'recebido': return { txt: 'Finalizado', cls: 't-ok' };
      case 'negado': return { txt: 'Negado pelo ' + (p.negado_por === 'Analista de Custo' ? 'analista' : 'coordenador'), cls: 't-bad' };
      default: return { txt: p.etapa, cls: 't-wait' };
    }
  }
  const estado = (p) => { const e = etapaInfo(p); return `<span class="state ${e.cls}">${h(e.txt)}</span>`; };

  // ---------- Avisos ----------
  function toast(msg, opts) {
    opts = opts || {};
    let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast' + (opts.erro ? ' erro' : '');
    t.innerHTML = `<span>${h(msg)}</span>` + (opts.link ? `<a class="t-act" href="${h(opts.link)}" target="_blank" rel="noopener">${h(opts.linkTxt || 'Abrir')}</a>` : '');
    box.appendChild(t);
    setTimeout(() => t.remove(), opts.tempo || (opts.link ? 9000 : 4500));
  }
  function dialogo(html, onOpen) {
    const d = document.createElement('dialog');
    d.innerHTML = html;
    document.body.appendChild(d);
    d.addEventListener('close', () => setTimeout(() => d.remove(), 50));
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.showModal();
    if (onOpen) onOpen(d);
    return d;
  }
  function confirmar(titulo, texto, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const d = dialogo(`<form method="dialog" class="dlg">
        <h2>${h(titulo)}</h2>
        ${texto ? `<p>${texto}</p>` : ''}
        ${opts.campo ? `<div class="field"><label for="dlg-txt">${h(opts.campo)}</label>
          <textarea id="dlg-txt" class="input" ${opts.obrigatorio ? 'required minlength="5"' : ''} placeholder="${h(opts.placeholder || '')}"></textarea>
          ${opts.obrigatorio ? '<span class="hint">Obrigatório. O solicitante vai ler este texto.</span>' : ''}</div>` : ''}
        <div class="dlg-foot">
          <button value="nao" class="btn btn-ghost" formnovalidate>${h(opts.cancelar || 'Cancelar')}</button>
          <button value="sim" class="btn ${opts.perigo ? 'btn-danger solid' : ''}">${h(opts.ok || 'Confirmar')}</button>
        </div></form>`);
      d.addEventListener('close', () => {
        const txt = $('#dlg-txt', d);
        resolve(d.returnValue === 'sim' ? { ok: true, texto: txt ? txt.value.trim() : '' } : { ok: false });
      });
    });
  }

  // =========================================================
  //   Seções por cargo
  // =========================================================
  const SECOES = {
    solicitacao: { nome: 'Solicitação', curto: 'Solicitar', icone: 'plus' },
    pedidos: { nome: 'Pedidos', curto: 'Pedidos', icone: 'list' },
    status: { nome: 'Status', curto: 'Status', icone: 'route' },
    'aprovacao-coordenador': { nome: 'Aprovação Coordenador', curto: 'Aprovação', icone: 'check' },
    'aprovacao-analista': { nome: 'Aprovação Analista de Custo', curto: 'Aprovação', icone: 'calc' },
    compras: { nome: 'Departamento de Compras', curto: 'Compras', icone: 'cart' },
    base: { nome: 'Base de dados', curto: 'Base', icone: 'db' },
  };
  function secoesDo(cargo) {
    const s = ['solicitacao', 'pedidos', 'status'];
    if (cargo === 'Coordenador') s.push('aprovacao-coordenador', 'base');
    if (cargo === 'Analista de Custo') s.push('aprovacao-analista');
    if (cargo === 'Comprador') s.push('compras');
    return s;
  }
  // tela que abre primeiro: a de trabalho do cargo
  function secaoInicial(cargo) {
    return { 'Analista de Custo': 'aprovacao-analista', Comprador: 'compras', Coordenador: 'aprovacao-coordenador' }[cargo] || 'solicitacao';
  }
  function contagem(sec, v) {
    const me = S.perfil;
    if (sec === 'aprovacao-coordenador') return v.pedidos.filter((p) => p.cdc === me.cdc && p.etapa === 'coordenador').length;
    if (sec === 'aprovacao-analista') return v.pedidos.filter((p) => p.cdc === me.cdc && p.etapa === 'analista').length;
    if (sec === 'compras') return v.pedidos.filter((p) => p.cdc === me.cdc && p.etapa === 'compras').length;
    if (sec === 'pedidos') return v.pedidos.filter((p) => p.solicitante_id === me.id && p.etapa === 'compras' && ['Aguardando retirada', 'Finalizado'].includes(p.status_compra)).length;
    return 0;
  }

  // ---------- Rotas ----------
  function rota() {
    const [sec, q] = location.hash.replace(/^#\/?/, '').split('?');
    const params = new URLSearchParams(q || '');
    return { sec, params };
  }
  function ir(sec, params) {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    if (location.hash === '#/' + sec + q) render(true); else location.hash = '/' + sec + q;
  }

  // =========================================================
  //   Telas de entrada
  // =========================================================
  const app = () => $('#app');

  function telaConfig() {
    app().innerHTML = `<div class="auth"><div class="auth-box">
      <div class="auth-brand"><span class="tag big">Compras</span></div>
      <form class="auth-card" id="f-cfg">
        <h2>Conectar ao Supabase</h2>
        <p class="muted small">Preencha uma vez. O certo é colocar esses dados no arquivo <b>config.js</b> antes de publicar, assim ninguém precisa digitar.</p>
        <div class="field"><label for="c-url">Project URL</label><input id="c-url" class="input" required placeholder="https://xxxx.supabase.co" value="${h(S.cfg.url)}"></div>
        <div class="field"><label for="c-key">Chave anon public</label><textarea id="c-key" class="input" required placeholder="eyJhbGciOi...">${h(S.cfg.key)}</textarea>
          <span class="hint">Supabase › Project Settings › API.</span></div>
        <button class="btn btn-block">Salvar e continuar</button>
      </form></div></div>`;
    $('#f-cfg').addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('compras.cfg', JSON.stringify({ SUPABASE_URL: $('#c-url').value.trim(), SUPABASE_ANON_KEY: $('#c-key').value.trim() }));
      location.reload();
    });
  }

  function telaLogin(msg) {
    app().innerHTML = `<div class="auth"><div class="auth-box">
      <div class="auth-brand"><span class="tag big">Compras</span></div>
      <form class="auth-card" id="f-login" novalidate>
        <div><h1>Entrar</h1><p class="muted">Use seu usuário e senha.</p></div>
        ${!navigator.onLine ? `<div class="alert alert-warn">${ic('alert', 18)}<span><strong>Sem internet</strong>O primeiro acesso neste aparelho precisa de conexão.</span></div>` : ''}
        ${msg ? `<div class="alert alert-info">${h(msg)}</div>` : ''}
        <div class="field"><label for="l-user">Usuário</label><input id="l-user" class="input" autocomplete="username" autocapitalize="none" spellcheck="false" required value="${h(lembrado())}"></div>
        <div class="field"><label for="l-pass">Senha</label>
          <div class="pass"><input id="l-pass" type="password" class="input" autocomplete="current-password" required>
            <button type="button" class="pass-eye" id="l-eye" aria-label="Mostrar senha" aria-pressed="false">${ic('eye', 20)}</button></div></div>
        <div class="row" style="justify-content:space-between">
          <label class="row small" style="gap:8px"><input type="checkbox" id="l-lembrar" ${lembrado() ? 'checked' : ''}> Lembrar meu usuário</label>
          <button type="button" class="linklike small" id="to-rec">Esqueci minha senha</button>
        </div>
        <p class="form-error" id="l-err" role="alert"></p>
        <button class="btn btn-block" id="l-btn">Entrar</button>
      </form>
      <p class="auth-switch">Ainda não tem usuário? <button class="linklike" id="to-cad">Criar usuário</button></p>
    </div></div>`;
    $('#to-cad').onclick = telaCadastro;
    $('#to-rec').onclick = () => telaRecuperar($('#l-user').value.trim());
    olhoSenha($('#l-eye'), $('#l-pass'));
    $('#f-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = $('#l-user').value.trim(), s = $('#l-pass').value;
      if (!u || !s) { $('#l-err').textContent = 'Preencha usuário e senha.'; return; }
      $('#l-btn').disabled = true; $('#l-btn').textContent = 'Entrando…'; $('#l-err').textContent = '';
      try {
        await Store.entrar(u, s);
        try { if ($('#l-lembrar').checked) localStorage.setItem('compras.usuario', u.toLowerCase()); else localStorage.removeItem('compras.usuario'); } catch (_) {}
        if (await Store.precisaTrocarSenha()) return telaSenhaNova(s);
        await iniciarApp();
      }
      catch (err) { $('#l-err').textContent = err.message; $('#l-btn').disabled = false; $('#l-btn').textContent = 'Entrar'; }
    });
    ($('#l-user').value ? $('#l-pass') : $('#l-user')).focus();
  }
  function lembrado() { try { return localStorage.getItem('compras.usuario') || ''; } catch (_) { return ''; } }
  function olhoSenha(btn, ...inputs) {
    btn.onclick = () => {
      const ver = inputs[0].type === 'password';
      inputs.forEach((i) => { i.type = ver ? 'text' : 'password'; });
      btn.setAttribute('aria-pressed', String(ver)); btn.setAttribute('aria-label', ver ? 'Esconder senha' : 'Mostrar senha');
    };
  }

  // ---------- Esqueci minha senha ----------
  function telaRecuperar(usuario) {
    app().innerHTML = `<div class="auth"><div class="auth-box">
      <div class="auth-brand"><span class="tag big">Compras</span></div>
      <div class="auth-card" id="rec">
        <div><h1>Recuperar senha</h1><p class="muted">Informe seu usuário. Se o seu WhatsApp automático estiver ativo, você recebe um código. Se não, o coordenador do seu CDC é avisado.</p></div>
        <form class="stack" id="f-rec" novalidate>
          <div class="field"><label for="r-user">Usuário</label><input id="r-user" class="input" autocapitalize="none" spellcheck="false" autocomplete="username" value="${h(usuario || lembrado())}" required></div>
          <p class="form-error" id="r-err" role="alert"></p>
          <button class="btn btn-block" id="r-btn">Recuperar senha</button>
        </form>
      </div>
      <p class="auth-switch"><button class="linklike" id="to-login">Voltar para o login</button></p>
    </div></div>`;
    $('#to-login').onclick = () => telaLogin();
    $('#f-rec').addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = $('#r-user').value.trim().toLowerCase();
      if (!u) return ($('#r-err').textContent = 'Informe o usuário.');
      if (!navigator.onLine) return ($('#r-err').textContent = 'Precisa de internet para recuperar a senha.');
      $('#r-btn').disabled = true; $('#r-btn').textContent = 'Enviando…'; $('#r-err').textContent = '';
      try {
        const r = await Store.solicitarCodigo(u);
        if (String(r).startsWith('whatsapp')) return telaCodigo(u, String(r).split('|')[1]);
        $('#rec').innerHTML = r === 'coordenador'
          ? `<h1>Coordenador avisado</h1><p>O coordenador do seu CDC recebeu um aviso. Ele vai criar uma <b>senha provisória</b> e passar para você.</p>
             <p class="muted">Entre com ela normalmente. Na primeira vez, o app pede para você criar uma senha nova.</p>
             <button class="btn btn-block" id="r-ok">Voltar para o login</button>`
          : `<h1>Fale com o responsável</h1><p>Não há coordenador cadastrado no seu CDC para redefinir a senha. Peça ao responsável pelo sistema para redefinir pelo painel do Supabase.</p>
             <button class="btn btn-block" id="r-ok">Voltar para o login</button>`;
        $('#r-ok').onclick = () => telaLogin();
      } catch (ex) { $('#r-err').textContent = ex.message; $('#r-btn').disabled = false; $('#r-btn').textContent = 'Recuperar senha'; }
    });
    $('#r-user').focus();
  }
  function telaCodigo(usuario, final) {
    $('#rec').innerHTML = `<div><h1>Digite o código</h1><p class="muted">Enviamos um código de 6 números para o seu WhatsApp${final ? ' terminado em ' + h(final) : ''}. Ele vale por 15 minutos.</p></div>
      <form class="stack" id="f-cod" novalidate>
        <div class="field"><label for="k-cod">Código</label><input id="k-cod" class="input" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required style="font-size:1.4rem;letter-spacing:.3em"></div>
        <div class="field"><label for="k-s1">Senha nova</label><div class="pass"><input id="k-s1" type="password" class="input" autocomplete="new-password" minlength="6" required>
          <button type="button" class="pass-eye" id="k-eye" aria-label="Mostrar senha" aria-pressed="false">${ic('eye', 20)}</button></div></div>
        <div class="field"><label for="k-s2">Repita a senha nova</label><input id="k-s2" type="password" class="input" autocomplete="new-password" required></div>
        <p class="form-error" id="k-err" role="alert"></p>
        <button class="btn btn-block" id="k-btn">Salvar senha nova</button>
        <button type="button" class="linklike small" id="k-de-novo">Não recebi, pedir outro código</button>
      </form>`;
    olhoSenha($('#k-eye'), $('#k-s1'), $('#k-s2'));
    $('#k-de-novo').onclick = () => telaRecuperar(usuario);
    $('#f-cod').addEventListener('submit', async (e) => {
      e.preventDefault();
      const cod = $('#k-cod').value.trim(), s1 = $('#k-s1').value, err = $('#k-err');
      if (!/^\d{6}$/.test(cod)) return (err.textContent = 'O código tem 6 números.');
      if (s1.length < 6) return (err.textContent = 'A senha precisa ter pelo menos 6 caracteres.');
      if (s1 !== $('#k-s2').value) return (err.textContent = 'As senhas não são iguais.');
      $('#k-btn').disabled = true; err.textContent = '';
      try { await Store.redefinirComCodigo(usuario, cod, s1); telaLogin('Senha nova salva. Entre com ela.'); $('#l-user').value = usuario; $('#l-pass').focus(); }
      catch (ex) { err.textContent = ex.message; $('#k-btn').disabled = false; }
    });
    $('#k-cod').focus();
  }
  // depois de entrar com senha provisória
  function telaSenhaNova(atual) {
    app().innerHTML = `<div class="auth"><div class="auth-box">
      <div class="auth-brand"><span class="tag big">Compras</span></div>
      <form class="auth-card" id="f-nova" novalidate>
        <div><h1>Crie sua senha</h1><p class="muted">Você entrou com uma senha provisória. Crie uma senha sua para continuar.</p></div>
        <div class="field"><label for="n-s1">Senha nova</label><div class="pass"><input id="n-s1" type="password" class="input" autocomplete="new-password" minlength="6" required>
          <button type="button" class="pass-eye" id="n-eye" aria-label="Mostrar senha" aria-pressed="false">${ic('eye', 20)}</button></div></div>
        <div class="field"><label for="n-s2">Repita a senha nova</label><input id="n-s2" type="password" class="input" autocomplete="new-password" required></div>
        <p class="form-error" id="n-err" role="alert"></p>
        <button class="btn btn-block" id="n-btn">Salvar e entrar</button>
      </form></div></div>`;
    olhoSenha($('#n-eye'), $('#n-s1'), $('#n-s2'));
    $('#f-nova').addEventListener('submit', async (e) => {
      e.preventDefault();
      const s1 = $('#n-s1').value, err = $('#n-err');
      if (s1.length < 6) return (err.textContent = 'A senha precisa ter pelo menos 6 caracteres.');
      if (s1 !== $('#n-s2').value) return (err.textContent = 'As senhas não são iguais.');
      if (s1 === atual) return (err.textContent = 'Use uma senha diferente da provisória.');
      $('#n-btn').disabled = true; err.textContent = '';
      try { await Store.alterarSenha(atual, s1); toast('Senha criada.'); await iniciarApp(); }
      catch (ex) { err.textContent = ex.message; $('#n-btn').disabled = false; }
    });
    $('#n-s1').focus();
  }

  function telaCadastro() {
    const opts = (l) => l.map((x) => `<option>${h(x)}</option>`).join('');
    app().innerHTML = `<div class="auth"><div class="auth-box">
      <div class="auth-brand"><span class="tag big">Compras</span></div>
      <form class="auth-card" id="f-cad" novalidate>
        <div><h1>Criar usuário</h1><p class="muted">Seu CDC e cargo definem o que você vê no app.</p></div>
        <div class="field"><label for="c-user">Usuário</label><input id="c-user" class="input" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="ex.: joao.silva" required>
          <span class="hint">De 3 a 30 caracteres: letras minúsculas, números, ponto ou hífen.</span></div>
        <div class="field"><label for="c-nome">Nome completo</label><input id="c-nome" class="input" autocomplete="name" required></div>
        <div class="grid-2">
          <div class="field"><label for="c-pass">Senha</label><input id="c-pass" type="password" class="input" autocomplete="new-password" minlength="6" required></div>
          <div class="field"><label for="c-pass2">Repita a senha</label><input id="c-pass2" type="password" class="input" autocomplete="new-password" required></div>
        </div>
        <div class="field"><label for="c-cdc">CDC</label><select id="c-cdc" class="input" required><option value="">Selecione</option>${opts(CDCS)}</select></div>
        <div class="field"><label for="c-cargo">Cargo</label><select id="c-cargo" class="input" required><option value="">Selecione</option>${opts(CARGOS)}</select></div>
        <div class="field"><label for="c-wpp">WhatsApp (opcional)</label><input id="c-wpp" class="input" inputmode="tel" placeholder="(15) 99999-0000" autocomplete="tel">
          <span class="hint">Com DDD. Usado para avisar você sobre seus pedidos.</span></div>
        <p class="form-error" id="c-err" role="alert"></p>
        <button class="btn btn-block" id="c-btn">Criar usuário</button>
      </form>
      <p class="auth-switch">Já tem usuário? <button class="linklike" id="to-login">Entrar</button></p>
    </div></div>`;
    $('#to-login').onclick = () => telaLogin();
    $('#f-cad').addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = { usuario: $('#c-user').value.trim().toLowerCase(), nome: $('#c-nome').value.trim(), senha: $('#c-pass').value, cdc: $('#c-cdc').value, cargo: $('#c-cargo').value, whatsapp: $('#c-wpp').value.trim() };
      const err = $('#c-err');
      if (!/^[a-z0-9._-]{3,30}$/.test(d.usuario)) return (err.textContent = 'Usuário inválido. Use de 3 a 30 letras minúsculas, números, ponto ou hífen.');
      if (d.nome.length < 2) return (err.textContent = 'Informe seu nome completo.');
      if (d.senha.length < 6) return (err.textContent = 'A senha precisa ter pelo menos 6 caracteres.');
      if (d.senha !== $('#c-pass2').value) return (err.textContent = 'As senhas não são iguais.');
      if (!d.cdc || !d.cargo) return (err.textContent = 'Escolha o CDC e o cargo.');
      $('#c-btn').disabled = true; $('#c-btn').textContent = 'Criando…'; err.textContent = '';
      try { await Store.cadastrar(d); toast('Usuário criado. Bem-vindo!'); await iniciarApp(); }
      catch (ex) { err.textContent = ex.message; $('#c-btn').disabled = false; $('#c-btn').textContent = 'Criar usuário'; }
    });
  }

  // =========================================================
  //   Estrutura do app
  // =========================================================
  function shell() {
    const me = S.perfil;
    const secs = secoesDo(me.cargo);
    const btn = (s, curto) => `<button data-nav="${s}">${curto ? `<span class="ico">${ic(SECOES[s].icone)}<span class="nav-count" data-count="${s}" hidden></span></span>${h(SECOES[s].curto)}` : `${ic(SECOES[s].icone)}<span>${h(SECOES[s].nome)}</span><span class="nav-count" data-count="${s}" hidden></span>`}</button>`;
    app().innerHTML = `
      <header class="topbar">
        <div class="brand"><span class="tag">Compras</span><span class="cdc">${h(me.cdc)}</span></div>
        <div class="spacer"></div>
        <span class="net" id="net" hidden></span>
        <button class="icon-btn" id="btn-notif" aria-label="Notificações">${ic('bell')}<span class="badge" id="notif-n" hidden></span></button>
        <button class="user-btn" id="btn-perfil" aria-label="Meu perfil">${avatar(me)}
          <span class="who" style="display:none"><b>${h(me.nome.split(' ')[0])}</b><small>${h(me.cargo)}</small></span></button>
      </header>
      <div class="layout">
        <nav class="nav-rail" aria-label="Seções">${secs.map((s) => btn(s)).join('')}<div class="rail-foot" id="rail-foot"></div></nav>
        <main class="view" id="view" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="Seções">${secs.map((s) => btn(s, true)).join('')}</nav>`;
    if (matchMedia('(min-width: 620px)').matches) $('.user-btn .who').style.display = '';
    $$('[data-nav]').forEach((b) => (b.onclick = () => ir(b.dataset.nav)));
    $('#btn-notif').onclick = abrirNotificacoes;
    $('#btn-perfil').onclick = abrirPerfil;
  }

  function atualizarBarra() {
    if (!$('#net')) return;
    const n = S.pendentes.length;
    const net = $('#net');
    if (!navigator.onLine) { net.hidden = false; net.className = 'net'; net.textContent = n ? `Sem internet · ${n} para enviar` : 'Sem internet'; }
    else if (S.sincronizando && n) { net.hidden = false; net.className = 'net ok'; net.textContent = 'Enviando…'; }
    else if (n) { net.hidden = false; net.className = 'net'; net.textContent = `${n} para enviar`; }
    else net.hidden = true;
    const nl = S.notifs.filter((x) => !x.lida).length;
    $('#notif-n').hidden = !nl; $('#notif-n').textContent = nl > 99 ? '99+' : nl;
    const v = Store.visao();
    $$('[data-count]').forEach((el) => { const c = contagem(el.dataset.count, v); el.hidden = !c; el.textContent = c; });
    const { sec } = rota();
    $$('[data-nav]').forEach((b) => b.setAttribute('aria-current', b.dataset.nav === sec ? 'page' : 'false'));
    const f = $('#rail-foot'); if (f) f.textContent = S.ultimaSync ? 'Atualizado ' + dataHora(S.ultimaSync) : '';
  }

  // ---------- Render ----------
  let renderAdiado = false;
  function render(forcar) {
    if (!S.perfil || !$('#view')) return;
    const secs = secoesDo(S.perfil.cargo);
    let { sec, params } = rota();
    if (!secs.includes(sec)) { sec = secaoInicial(S.perfil.cargo); history.replaceState(null, '', '#/' + sec); }
    const view = $('#view');
    // não atrapalha quem está digitando
    if (!forcar && view.dataset.sec === sec && (view.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || $('[data-sujo="1"]', view))) {
      renderAdiado = true; atualizarBarra(); return;
    }
    renderAdiado = false;
    const mudouSec = view.dataset.sec !== sec;
    const abertos = $$('details[data-k][open]', view).map((d) => d.dataset.k);
    const y = window.scrollY;
    view.dataset.sec = sec;
    const v = Store.visao();
    const fn = { solicitacao: vSolicitacao, pedidos: vPedidos, status: vStatus, 'aprovacao-coordenador': vAprovacao, 'aprovacao-analista': vAprovacao, compras: vCompras, base: vBase }[sec];
    fn(view, v, params, sec);
    abertos.forEach((k) => { const d = $(`details[data-k="${CSS.escape(k)}"]`, view); if (d) d.open = true; });
    if (mudouSec) { window.scrollTo(0, 0); view.focus({ preventScroll: true }); } else window.scrollTo(0, y);
    atualizarBarra();
    hidratarAnexos(view);
  }
  document.addEventListener('focusout', () => setTimeout(() => { if (renderAdiado && !$('[data-sujo="1"]')) render(); }, 200));
  window.addEventListener('hashchange', () => render(true));

  // =========================================================
  //   Solicitação
  // =========================================================
  let anexosSol = { fotos: [], orcamentos: [], ficha: [] };

  function vSolicitacao(view, v) {
    const me = S.perfil;
    const equipes = S.equipes.filter((e) => e.cdc === me.cdc);
    anexosSol = { fotos: [], orcamentos: [], ficha: [] };
    view.innerHTML = `
      <div class="page-head"><div><h1>Solicitação</h1><p>Preencha o pedido de material. Ele segue para o coordenador do seu CDC.</p></div></div>
      <form id="f-sol" class="stack" novalidate>
        <section class="panel stack">
          <dl class="facts">
            <div><dt>Data</dt><dd>${dataBR(hoje())}</dd></div>
            <div><dt>Solicitante</dt><dd>${h(me.nome)}</dd></div>
            <div><dt>CDC</dt><dd>${h(me.cdc)}</dd></div>
          </dl>
          <div class="grid-2">
            <div class="field"><label for="s-dep">Departamento</label>
              <select id="s-dep" class="input" required><option value="">Selecione</option>${DEPARTAMENTOS.map((d) => `<option>${h(d)}</option>`).join('')}</select></div>
            <div class="field"><label for="s-eq">Equipe</label>
              <select id="s-eq" class="input" required ${equipes.length ? '' : 'disabled'}><option value="">${equipes.length ? 'Selecione' : 'Nenhuma equipe cadastrada'}</option>
              ${equipes.map((e) => `<option value="${h(e.nome)}" data-tipo="${h(e.tipo)}">${h(e.nome)} (${h(e.tipo)})</option>`).join('')}</select>
              ${equipes.length ? '' : '<span class="hint">Ainda não há equipes para o seu CDC. O coordenador cadastra em Base de dados › Equipes.</span>'}</div>
          </div>
          <div class="field" id="s-frota-box" hidden><label for="s-frota">Frota</label><input id="s-frota" class="input" placeholder="Prefixo ou número da máquina">
            <span class="hint">Equipe mecanizada: informe a frota que vai receber o material.</span></div>
          <div class="field"><span class="label" id="s-tipo-lbl">Tipo de pedido</span>
            <div class="seg" role="radiogroup" aria-labelledby="s-tipo-lbl">
              ${TIPOS.map((t, i) => `<input type="radio" name="tipo" id="tp${i}" value="${h(t)}"><label for="tp${i}" class="${t === 'Regularização' ? 'warn-opt' : ''}">${h(t)}</label>`).join('')}
            </div></div>
          <div id="s-alerta"></div>
        </section>

        <section class="panel stack">
          <div class="panel-title"><h2>Produtos</h2></div>
          <div class="seg" style="grid-template-columns:1fr 1fr" role="radiogroup" aria-label="Forma do pedido">
            <input type="radio" name="modo" id="m1" value="um" checked><label for="m1">Um produto</label>
            <input type="radio" name="modo" id="m2" value="ficha"><label for="m2">Ficha com vários itens</label>
          </div>
          <div id="itens" class="stack"></div>
          <div id="ficha-extra" class="stack" hidden>
            <button type="button" class="btn btn-ghost" id="add-item">${ic('plus', 18)} Adicionar item</button>
            <div class="field"><span class="label">Arquivo da ficha (opcional)</span>
              <label class="dropzone"><span class="dz-ico">${ic('file')}</span><span><b>Anexar ficha de solicitação</b><br><span class="small muted">PDF, foto ou planilha</span></span>
                <input type="file" id="in-ficha" accept="image/*,application/pdf,.xls,.xlsx,.csv,.doc,.docx"></label>
              <div class="files" id="lst-ficha"></div></div>
          </div>
          <div class="field"><label for="s-motivo">Por que precisa deste material?</label>
            <textarea id="s-motivo" class="input" required placeholder="Ex.: troca preventiva do filtro da frota 102, máquina parada sem a peça"></textarea></div>
        </section>

        <section class="panel stack">
          <div class="panel-title"><h2>Fotos e orçamentos</h2></div>
          <div class="field"><span class="label">Fotos do produto</span>
            <div class="grid-2">
              <label class="dropzone"><span class="dz-ico">${ic('camera')}</span><span><b>Tirar foto</b><br><span class="small muted">Abre a câmera</span></span>
                <input type="file" id="in-camera" accept="image/*" capture="environment"></label>
              <label class="dropzone"><span class="dz-ico">${ic('image')}</span><span><b>Escolher da galeria</b><br><span class="small muted">Quantas precisar</span></span>
                <input type="file" id="in-fotos" accept="image/*" multiple></label>
            </div>
            <div class="thumbs" id="lst-fotos"></div></div>
          <div class="field"><span class="label">Orçamentos (até 3)</span>
            <label class="dropzone" id="dz-orc"><span class="dz-ico">${ic('file')}</span><span><b>Anexar orçamento</b><br><span class="small muted">PDF ou foto</span></span>
              <input type="file" id="in-orc" accept="image/*,application/pdf" multiple></label>
            <div class="files" id="lst-orc"></div></div>
        </section>

        <section class="panel stack">
          <div class="field" style="max-width:320px"><label for="s-nec">Data da necessidade</label>
            <input id="s-nec" type="date" class="input" min="${hoje()}" required>
            <span class="hint">Quando o material precisa estar disponível.</span></div>
          <p class="form-error" id="s-err" role="alert"></p>
          <div class="row end"><button class="btn" id="s-btn">Enviar solicitação</button></div>
        </section>
      </form>`;

    const form = $('#f-sol', view);
    const marcar = () => { form.dataset.sujo = '1'; };
    form.addEventListener('input', marcar);
    form.addEventListener('change', marcar);

    // equipe → frota
    $('#s-eq').addEventListener('change', (e) => {
      const opt = e.target.selectedOptions[0];
      const mec = opt && opt.dataset.tipo === 'Mecanizado';
      $('#s-frota-box').hidden = !mec; if (!mec) $('#s-frota').value = '';
    });
    // tipo → alerta
    $$('input[name="tipo"]', view).forEach((r) => r.addEventListener('change', () => {
      const reg = r.value === 'Regularização' && r.checked;
      $('#s-alerta').innerHTML = reg ? `<div class="alert alert-warn">${ic('alert', 20)}<span><strong>Compra por regularização não é recomendada.</strong>Use só em último caso, quando o material já foi usado ou comprado fora do fluxo.</span></div>` : '';
      if (reg) confirmar('Regularização não é recomendada', 'Esse tipo de compra deve ser usado <b>só em último caso</b>. Se der para planejar, escolha <b>Planejado</b>.', { ok: 'Entendi, manter', cancelar: 'Trocar o tipo' })
        .then((r2) => { if (!r2.ok) { $('#tp0').checked = true; $('#s-alerta').innerHTML = ''; } });
    }));

    // itens
    const itens = $('#itens');
    const linhaItem = (i, removivel) => `<div class="item-row" data-item>
        <span class="item-num">Item ${i}</span>
        ${removivel ? `<button type="button" class="icon-btn remove" data-rm-item aria-label="Remover item ${i}">${ic('x', 18)}</button>` : ''}
        <div class="field"><label>Nome do produto</label><input class="input" data-f="produto" required placeholder="Ex.: Filtro hidráulico"></div>
        <div class="qty"><div class="field"><label>Quantidade</label><input class="input" data-f="quantidade" type="number" min="0" step="any" inputmode="decimal" required></div>
          <div class="field"><label>Unidade</label><select class="input" data-f="unidade">${UNIDADES.map((u) => `<option>${u}</option>`).join('')}</select></div></div>
        <div class="field"><label>Descrição do produto</label><textarea class="input" data-f="descricao" placeholder="Marca, modelo, medida, código da peça…"></textarea></div>
      </div>`;
    const renumerar = () => $$('[data-item]', itens).forEach((el, i) => { $('.item-num', el).textContent = 'Item ' + (i + 1); });
    itens.innerHTML = linhaItem(1, false);
    $$('input[name="modo"]', view).forEach((r) => r.addEventListener('change', () => {
      const ficha = $('#m2').checked;
      $('#ficha-extra').hidden = !ficha;
      if (!ficha) { $$('[data-item]', itens).slice(1).forEach((x) => x.remove()); }
      else if ($$('[data-item]', itens).length < 2) itens.insertAdjacentHTML('beforeend', linhaItem(2, true));
      renumerar();
    }));
    $('#add-item').onclick = () => { itens.insertAdjacentHTML('beforeend', linhaItem($$('[data-item]', itens).length + 1, true)); renumerar(); $$('[data-item]', itens).pop().querySelector('input').focus(); };
    itens.addEventListener('click', (e) => { const b = e.target.closest('[data-rm-item]'); if (b) { b.closest('[data-item]').remove(); renumerar(); } });

    // anexos
    const mostrarFotos = () => {
      $('#lst-fotos').innerHTML = anexosSol.fotos.map((f, i) => `<div class="thumb"><img src="${f.url}" alt="Foto ${i + 1}"><button type="button" data-rm="fotos" data-i="${i}" aria-label="Remover foto ${i + 1}">${ic('x', 14)}</button></div>`).join('');
    };
    const mostrarLista = (k, el) => {
      $(el).innerHTML = anexosSol[k].map((f, i) => `<div class="file-chip">${ic('file', 18)}<span class="name">${h(f.nome)}</span><span class="small muted">${Math.max(1, Math.round(f.blob.size / 1024))} KB</span><button type="button" class="icon-btn" data-rm="${k}" data-i="${i}" aria-label="Remover ${h(f.nome)}">${ic('x', 16)}</button></div>`).join('');
      if (k === 'orcamentos') $('#dz-orc').hidden = anexosSol.orcamentos.length >= 3;
    };
    const addFotos = async (e) => {
      for (const f of e.target.files) { const blob = await comprimir(f); anexosSol.fotos.push({ categoria: 'foto', nome: nomeArquivo(f, blob), mime: blob.type || f.type, blob, url: URL.createObjectURL(blob) }); }
      e.target.value = ''; mostrarFotos(); marcar();
    };
    $('#in-fotos').addEventListener('change', addFotos);
    $('#in-camera').addEventListener('change', addFotos);
    $('#in-orc').addEventListener('change', async (e) => {
      for (const f of e.target.files) {
        if (anexosSol.orcamentos.length >= 3) { toast('Máximo de 3 orçamentos.', { erro: true }); break; }
        const blob = f.type.startsWith('image/') ? await comprimir(f) : f;
        anexosSol.orcamentos.push({ categoria: 'orcamento', nome: nomeArquivo(f, blob), mime: blob.type || f.type, blob });
      }
      e.target.value = ''; mostrarLista('orcamentos', '#lst-orc'); marcar();
    });
    $('#in-ficha').addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const blob = f.type.startsWith('image/') ? await comprimir(f) : f;
      anexosSol.ficha = [{ categoria: 'ficha', nome: nomeArquivo(f, blob), mime: blob.type || f.type, blob }];
      e.target.value = ''; mostrarLista('ficha', '#lst-ficha'); marcar();
    });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rm]'); if (!b) return;
      anexosSol[b.dataset.rm].splice(+b.dataset.i, 1);
      if (b.dataset.rm === 'fotos') mostrarFotos(); else mostrarLista(b.dataset.rm, b.dataset.rm === 'ficha' ? '#lst-ficha' : '#lst-orc');
    });

    // enviar
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#s-err'); err.textContent = '';
      const tipo = ($('input[name="tipo"]:checked', view) || {}).value;
      const lista = $$('[data-item]', itens).map((el) => ({
        produto: $('[data-f="produto"]', el).value.trim(), quantidade: parseFloat(String($('[data-f="quantidade"]', el).value).replace(',', '.')),
        unidade: $('[data-f="unidade"]', el).value, descricao: $('[data-f="descricao"]', el).value.trim(),
      }));
      const dados = {
        data_pedido: hoje(), departamento: $('#s-dep').value, equipe: $('#s-eq').value, frota: $('#s-frota').value.trim() || null,
        tipo_pedido: tipo, itens: lista, motivo: $('#s-motivo').value.trim(), data_necessidade: $('#s-nec').value,
      };
      const falta = (m, el) => { err.textContent = m; if (el) el.focus(); };
      if (!dados.departamento) return falta('Escolha o departamento.', $('#s-dep'));
      if (!dados.equipe) return falta('Escolha a equipe.', $('#s-eq'));
      if (!tipo) return falta('Escolha o tipo de pedido.', $('#tp0'));
      const ruim = lista.findIndex((i) => !i.produto || !(i.quantidade > 0));
      if (ruim >= 0) return falta(`Item ${ruim + 1}: informe o nome do produto e uma quantidade maior que zero.`, $$('[data-item]', itens)[ruim].querySelector(lista[ruim].produto ? '[data-f="quantidade"]' : '[data-f="produto"]'));
      if (!dados.motivo) return falta('Diga por que precisa do material.', $('#s-motivo'));
      if (!dados.data_necessidade) return falta('Informe a data da necessidade.', $('#s-nec'));
      if (dados.data_necessidade < hoje()) return falta('A data da necessidade não pode ser no passado.', $('#s-nec'));

      const btn = $('#s-btn'); btn.disabled = true; btn.textContent = 'Enviando…';
      try {
        const arquivos = [...anexosSol.fotos, ...anexosSol.orcamentos, ...anexosSol.ficha];
        const r = await Store.criarPedido(dados, arquivos);
        const falhaPedido = r.falhas.find((f) => f.op.fn === 'criar_pedido');
        if (falhaPedido) { btn.disabled = false; btn.textContent = 'Enviar solicitação'; return falta(falhaPedido.msg); }
        delete form.dataset.sujo;
        toast(r.offline ? 'Solicitação salva no aparelho. Ela será enviada quando houver internet.' : 'Solicitação enviada para o coordenador.', { tempo: 6000 });
        ir('status', { id: r.id });
      } catch (ex) { btn.disabled = false; btn.textContent = 'Enviar solicitação'; falta(ex.message); }
    });
  }
  function nomeArquivo(f, blob) {
    if (blob !== f && blob.type === 'image/jpeg') return (f.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg';
    return f.name || ('foto-' + Date.now() + '.jpg');
  }
  async function recortarQuadrado(file, lado) {
    const bmp = await createImageBitmap(file);
    const m = Math.min(bmp.width, bmp.height);
    const c = document.createElement('canvas'); c.width = lado; c.height = lado;
    c.getContext('2d').drawImage(bmp, (bmp.width - m) / 2, (bmp.height - m) / 2, m, m, 0, 0, lado, lado);
    return new Promise((r, j) => c.toBlob((b) => (b ? r(b) : j(new Error('Não foi possível ler a foto.'))), 'image/jpeg', 0.85));
  }
  async function comprimir(file) {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.size < 350 * 1024) return file;
    try {
      const bmp = await createImageBitmap(file);
      const max = 1600; const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
      return blob && blob.size < file.size ? blob : file;
    } catch (_) { return file; }
  }

  // =========================================================
  //   Blocos reutilizados dos cartões
  // =========================================================
  function tabelaItens(itens) {
    return `<table class="items-table"><thead><tr><th>Produto</th><th style="text-align:right">Qtd.</th></tr></thead><tbody>
      ${(itens || []).map((i) => `<tr><td><b>${h(i.produto)}</b>${i.descricao ? `<div class="desc">${h(i.descricao)}</div>` : ''}</td><td class="q">${qtd(i.quantidade)} ${h(i.unidade || 'un')}</td></tr>`).join('')}
    </tbody></table>`;
  }
  function blocoAnexos(lista) {
    if (!lista || !lista.length) return '<p class="small muted">Sem fotos ou orçamentos.</p>';
    const grupo = (tipo, titulo) => {
      const l = lista.filter((a) => a.tipo === tipo); if (!l.length) return '';
      if (tipo === 'foto') return `<div><p class="sub">${titulo} (${l.length})</p><div class="gallery">${l.map((a) => `<a data-anexo="${h(a.id)}" target="_blank" rel="noopener" aria-label="Abrir ${h(a.nome)}"><img alt="${h(a.nome)}" data-anexo-img="${h(a.id)}"></a>`).join('')}</div></div>`;
      return `<div><p class="sub">${titulo} (${l.length})</p><div class="files">${l.map((a) => `<div class="file-chip">${ic('file', 18)}<span class="name">${h(a.nome)}</span><a data-anexo="${h(a.id)}" target="_blank" rel="noopener">Abrir</a></div>`).join('')}</div></div>`;
    };
    return grupo('foto', 'Fotos') + grupo('orcamento', 'Orçamentos') + grupo('ficha', 'Ficha de solicitação');
  }
  let anexosIndex = {};
  async function hidratarAnexos(root) {
    const v = Store.visao(); anexosIndex = {};
    for (const k in v.anexos) for (const a of v.anexos[k]) anexosIndex[a.id] = a;
    for (const el of $$('[data-anexo]', root)) {
      const a = anexosIndex[el.dataset.anexo]; if (!a) continue;
      const url = await Store.linkAnexo(a);
      if (url) { el.href = url; const img = el.querySelector('img'); if (img) img.src = url; }
      else { el.removeAttribute('href'); el.title = 'Disponível com internet'; if (!el.querySelector('img')) el.textContent = 'Sem internet'; }
    }
  }
  function blocoNegado(p) {
    if (p.etapa !== 'negado') return '';
    return `<div class="alert alert-danger">${ic('alert', 18)}<span><strong>Negado pelo ${p.negado_por === 'Analista de Custo' ? 'analista de custo' : 'coordenador'}</strong>${h(p.justificativa_negativa || '')}</span></div>`;
  }
  function fatosPrincipais(p, opts) {
    opts = opts || {};
    const fim = ['recebido', 'negado'].includes(p.etapa);
    return `<dl class="keyfacts">
      <div><dt>Pedido em</dt><dd>${dataBR(p.data_pedido)}</dd></div>
      <div class="need"><dt>Necessidade</dt><dd>${dataBR(p.data_necessidade)}${fim ? '' : prazo(p.data_necessidade)}</dd></div>
      <div><dt>${opts.semSolicitante ? 'Departamento' : 'Solicitante'}</dt><dd>${opts.semSolicitante ? h(p.departamento) : h(nomeDe(p.solicitante_id))}</dd></div>
      <div><dt>Equipe</dt><dd>${h(p.equipe)}${p.frota ? ` · Frota ${h(p.frota)}` : ''}${opts.cdc ? `<span class="due fine">${h(p.cdc)}</span>` : ''}</dd></div>
    </dl>`;
  }
  function cabecalho(p) {
    return `<div class="order-head">${numeroTag(p)}${estado(p)}<span class="kind ${h(p.tipo_pedido)}">${h(p.tipo_pedido)}</span><span class="when">${p._pendente ? 'Aguardando envio · ' : ''}${dataBR(p.data_pedido)}</span></div>`;
  }
  // ---------- Busca por produto ----------
  const buscas = {};
  const semAcento = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function textoBusca(p) {
    return semAcento([p.numero, p.equipe, p.frota, p.tipo_pedido, p.motivo, ...(p.itens || []).map((i) => i.produto + ' ' + (i.descricao || ''))].join(' '));
  }
  function campoBusca(sec, placeholder) {
    return `<div class="search"><span class="s-ico">${ic('search', 20)}</span>
      <input type="search" class="input" id="busca-${sec}" placeholder="${h(placeholder)}" value="${h(buscas[sec] || '')}" aria-label="Buscar produto" autocomplete="off">
      </div><p class="small muted search-none" id="busca-vazia-${sec}" hidden>Nenhum pedido com esse produto.</p>`;
  }
  // filtra sem redesenhar a tela (não perde o que está digitado)
  function ligarBusca(view, sec, seletor) {
    const inp = $('#busca-' + sec, view); if (!inp) return;
    const aplicar = () => {
      const q = semAcento(inp.value.trim()); buscas[sec] = inp.value;
      let vis = 0; const itens = $$(seletor, view);
      itens.forEach((el) => { const ok = !q || q.split(/\s+/).every((t) => el.dataset.busca.includes(t)); el.hidden = !ok; if (ok) vis++; });
      $('#busca-vazia-' + sec, view).hidden = !(q && itens.length && !vis);
    };
    inp.addEventListener('input', aplicar);
    aplicar();
  }
  function vazio(titulo, texto, acaoHtml) { return `<div class="empty"><strong>${h(titulo)}</strong>${h(texto)}${acaoHtml || ''}</div>`; }
  function chips(nome, ops, atual) {
    return `<div class="chips" role="group" aria-label="Filtro">${ops.map((o) => `<button class="chip" data-chip="${nome}" data-v="${h(o.v)}" aria-pressed="${o.v === atual}">${h(o.t)} <span class="n">${o.n}</span></button>`).join('')}</div>`;
  }
  function ligarChips(view, params, sec) {
    $$('[data-chip]', view).forEach((b) => (b.onclick = () => { const p = Object.fromEntries(params); p[b.dataset.chip] = b.dataset.v; ir(sec, p); }));
  }

  // =========================================================
  //   Pedidos (do próprio usuário)
  // =========================================================
  function vPedidos(view, v, params) {
    const meus = v.pedidos.filter((p) => p.solicitante_id === S.perfil.id);
    const grupos = {
      andamento: meus.filter((p) => ['coordenador', 'analista', 'compras'].includes(p.etapa)),
      finalizados: meus.filter((p) => p.etapa === 'recebido'),
      negados: meus.filter((p) => p.etapa === 'negado'),
    };
    const f = grupos[params.get('f')] ? params.get('f') : 'andamento';
    const lista = grupos[f];
    view.innerHTML = `
      <div class="page-head"><div><h1>Pedidos</h1><p>Somente os pedidos feitos por você.</p></div>
        <button class="btn btn-ghost" data-go="solicitacao">${ic('plus', 18)} Nova solicitação</button></div>
      ${campoBusca('pedidos', 'Buscar produto, frota ou nº do pedido')}
      ${chips('f', [{ v: 'andamento', t: 'Em andamento', n: grupos.andamento.length }, { v: 'finalizados', t: 'Finalizados', n: grupos.finalizados.length }, { v: 'negados', t: 'Negados', n: grupos.negados.length }], f)}
      <div>${lista.length ? lista.map((p) => cartaoMeu(p, v)).join('') : vazio(
        f === 'finalizados' ? 'Nenhum pedido finalizado' : f === 'negados' ? 'Nenhum pedido negado' : 'Nenhum pedido em andamento',
        f === 'andamento' ? 'Quando você enviar uma solicitação, ela aparece aqui.' : 'Os pedidos aparecem aqui quando chegam a essa situação.',
        f === 'andamento' ? '<br><button class="btn" data-go="solicitacao">Fazer uma solicitação</button>' : '')}</div>`;
    ligarChips(view, params, 'pedidos');
    ligarBusca(view, 'pedidos', 'article.order');
    $$('[data-go]', view).forEach((b) => (b.onclick = () => ir(b.dataset.go)));
    $$('[data-status]', view).forEach((b) => (b.onclick = () => ir('status', { id: b.dataset.status })));
    $$('[data-receber]', view).forEach((b) => (b.onclick = async () => {
      const p = v.pedidos.find((x) => x.id === b.dataset.receber);
      const r = await confirmar('Confirmar recebimento', `Você confirma que recebeu o material do pedido <b>nº ${h(p.numero)}</b>? O pedido vai para <b>Finalizados</b>.`, { ok: 'Confirmar recebimento', campo: 'Observação (opcional)', placeholder: 'Ex.: recebido completo no almoxarifado' });
      if (!r.ok) return;
      await executarAcao(() => Store.confirmarRecebimento(p.id, r.texto), 'Recebimento confirmado. Pedido finalizado.');
    }));
  }
  function cartaoMeu(p, v) {
    const pronto = p.etapa === 'compras' && ['Aguardando retirada', 'Finalizado', 'Em transporte'].includes(p.status_compra);
    const ultimaObs = (v.eventos[p.id] || []).filter((e) => e.autor_cargo === 'Comprador' && e.detalhe).pop();
    return `<article class="order" data-busca="${h(textoBusca(p))}">
      ${cabecalho(p)}
      <div class="order-title">${h(resumoItens(p.itens))}</div>
      ${fatosPrincipais(p, { semSolicitante: true })}
      ${blocoNegado(p)}
      ${ultimaObs && p.etapa === 'compras' ? `<div class="reason"><span class="lbl">Última observação do comprador · ${dataHora(ultimaObs.criado_em)}</span>${h(ultimaObs.detalhe)}</div>` : ''}
      ${p.etapa === 'recebido' ? `<p class="small muted">Recebido em ${dataHora(p.recebido_em)}</p>` : ''}
      <details class="more" data-k="m-${h(p.id)}"><summary>Ver detalhes</summary><div class="more-body">
        ${tabelaItens(p.itens)}
        <div class="reason"><span class="lbl">Por que precisa</span>${h(p.motivo)}</div>
        ${blocoAnexos(v.anexos[p.id])}
      </div></details>
      <div class="order-actions">
        <button class="btn btn-ghost btn-sm" data-status="${h(p.id)}">${ic('route', 18)} Ver andamento</button>
        <span class="grow"></span>
        ${p.etapa === 'compras' ? `<button class="btn ${pronto ? '' : 'btn-ghost'}" data-receber="${h(p.id)}">${ic('tick', 18)} Confirmar recebimento</button>` : ''}
      </div>
    </article>`;
  }

  // =========================================================
  //   Status (percurso + linha do tempo)
  // =========================================================
  function vStatus(view, v, params) {
    const meus = v.pedidos.filter((p) => p.solicitante_id === S.perfil.id);
    if (!meus.length) {
      view.innerHTML = `<div class="page-head"><div><h1>Status</h1><p>Acompanhe por onde seu pedido está passando.</p></div></div>
        ${vazio('Você ainda não tem pedidos', 'Faça uma solicitação para acompanhar cada etapa aqui.', '<br><button class="btn" data-go="solicitacao">Fazer uma solicitação</button>')}`;
      $$('[data-go]', view).forEach((b) => (b.onclick = () => ir(b.dataset.go)));
      return;
    }
    const sel = meus.find((p) => p.id === params.get('id')) || meus[0];
    const evs = (v.eventos[sel.id] || []).slice().sort((a, b) => String(a.criado_em).localeCompare(String(b.criado_em)));
    view.innerHTML = `
      <div class="page-head"><div><h1>Status</h1><p>Cada movimentação do seu pedido, em ordem.</p></div></div>
      <div class="status-layout">
        <div class="stack" style="gap:8px">
        ${campoBusca('status', 'Buscar produto')}
        <div class="picker" role="list" aria-label="Seus pedidos">
          ${meus.map((p) => `<button class="pick" role="listitem" data-pick="${h(p.id)}" data-busca="${h(textoBusca(p))}" aria-current="${p.id === sel.id}">
            <span class="top">${numeroTag(p)}<span class="small muted">${dataBR(p.data_pedido)}</span></span>
            <span class="desc">${h(resumoItens(p.itens))}</span>${estado(p)}</button>`).join('')}
        </div></div>
        <section class="panel">
          <div class="order-head" style="margin-bottom:12px">${numeroTag(sel, true)}<span class="kind ${h(sel.tipo_pedido)}">${h(sel.tipo_pedido)}</span></div>
          <h2 style="margin-bottom:4px">${h(resumoItens(sel.itens))}</h2>
          <p class="muted small" style="margin-bottom:16px">Equipe ${h(sel.equipe)}${sel.frota ? ' · Frota ' + h(sel.frota) : ''} · Necessidade ${dataBR(sel.data_necessidade)}</p>
          ${percurso(sel, evs)}
          ${blocoNegado(sel)}
          <h3 style="margin:18px 0 12px">Movimentações</h3>
          ${linhaDoTempo(evs)}
          ${sel.etapa === 'compras' ? `<div class="row end" style="margin-top:16px"><button class="btn" data-go-ped>${ic('tick', 18)} Confirmar recebimento em Pedidos</button></div>` : ''}
        </section>
      </div>`;
    $$('[data-pick]', view).forEach((b) => (b.onclick = () => ir('status', { id: b.dataset.pick })));
    ligarBusca(view, 'status', '.pick');
    const g = $('[data-go-ped]', view); if (g) g.onclick = () => ir('pedidos');
  }
  function percurso(p, evs) {
    const quando = (tipos) => { const e = evs.filter((x) => tipos.includes(x.tipo)).pop(); return e ? dataBR(new Date(e.criado_em).toLocaleDateString('sv-SE')).slice(0, 5) : ''; };
    const etapas = ['Solicitado', 'Coorde\u00adnador', 'Analista de custo', 'Compras', 'Recebido'];
    const ordem = { coordenador: 1, analista: 2, compras: 3, recebido: 5 };
    let atual = ordem[p.etapa]; let falha = -1;
    if (p.etapa === 'negado') { falha = p.negado_por === 'Analista de Custo' ? 2 : 1; atual = falha; }
    const datas = [quando(['criado', 'local']), quando(['aprovado_coord', 'negado_coord']), quando(['aprovado_analista', 'negado_analista']), quando(['compras']), quando(['recebido'])];
    return `<div class="route" role="list" aria-label="Percurso do pedido">${etapas.map((n, i) => {
      let cls = ''; let sub = datas[i];
      if (i === falha) { cls = 'fail'; sub = 'Negado'; }
      else if (i < atual || p.etapa === 'recebido') cls = 'done';
      else if (i === atual && falha < 0) { cls = 'now'; sub = i === 3 ? (p.status_compra || 'Pendente') : 'Agora'; }
      const marca = cls === 'done' ? ic('tick', 12) : cls === 'fail' ? ic('x', 12) : '';
      return `<div class="station ${cls}" role="listitem"><span class="dot">${marca}</span>${h(n)}<small>${h(sub || '')}</small></div>`;
    }).join('')}</div>`;
  }
  function linhaDoTempo(evs) {
    if (!evs.length) return '<p class="muted">Sem movimentações ainda.</p>';
    const cls = (e) => e._local ? 'local' : /negado/.test(e.tipo) ? 'bad' : e.tipo === 'recebido' || /aprovado/.test(e.tipo) ? 'ok' : e.tipo === 'compras' ? 'buy' : '';
    return `<ol class="timeline">${evs.map((e) => `<li class="${cls(e)}">
      <div class="t-title">${h(e.titulo)}</div>
      <div class="t-meta">${dataHora(e.criado_em)}${e.autor_nome ? ' · ' + h(e.autor_nome) + (e.autor_cargo ? ' (' + h(e.autor_cargo) + ')' : '') : ''}</div>
      ${e.detalhe ? `<div class="t-detail">${h(e.detalhe)}</div>` : ''}</li>`).join('')}</ol>`;
  }

  // =========================================================
  //   Aprovação (coordenador e analista de custo)
  // =========================================================
  function vAprovacao(view, v, params, sec) {
    const coord = sec === 'aprovacao-coordenador';
    const etapa = coord ? 'coordenador' : 'analista';
    const doCdc = v.pedidos.filter((p) => p.cdc === S.perfil.cdc);
    const aguardando = doCdc.filter((p) => p.etapa === etapa);
    const tiposDecisao = coord ? ['aprovado_coord', 'negado_coord'] : ['aprovado_analista', 'negado_analista'];
    const analisados = doCdc.filter((p) => p.etapa !== etapa && (v.eventos[p.id] || []).some((e) => tiposDecisao.includes(e.tipo)));
    const f = params.get('f') === 'feitos' ? 'feitos' : 'aguardando';
    const lista = f === 'feitos' ? analisados : aguardando;
    // separado por usuário
    const porUsuario = {};
    for (const p of lista) (porUsuario[p.solicitante_id] = porUsuario[p.solicitante_id] || []).push(p);
    const ordemGrupos = Object.keys(porUsuario).sort((a, b) => nomeDe(a).localeCompare(nomeDe(b), 'pt-BR'));
    for (const k of ordemGrupos) porUsuario[k].sort((a, b) => String(a.data_necessidade).localeCompare(String(b.data_necessidade)));

    view.innerHTML = `
      <div class="page-head"><div><h1>${coord ? 'Aprovação Coordenador' : 'Aprovação Analista de Custo'}</h1>
        <p>${coord ? 'Solicitações do CDC ' + h(S.perfil.cdc) + ' esperando sua decisão.' : 'Pedidos já aprovados pelo coordenador do CDC ' + h(S.perfil.cdc) + '.'}</p></div></div>
      ${chips('f', [{ v: 'aguardando', t: 'Aguardando decisão', n: aguardando.length }, { v: 'feitos', t: 'Já analisados', n: analisados.length }], f)}
      ${lista.length ? ordemGrupos.map((uid) => `<section class="group">
          <div class="group-head">${avatar(S.perfis[uid] || { nome: nomeDe(uid) })}<h2>${h(nomeDe(uid))}</h2><span class="count">${porUsuario[uid].length} pedido${porUsuario[uid].length > 1 ? 's' : ''}</span></div>
          ${porUsuario[uid].map((p) => cartaoAprovacao(p, v, f === 'aguardando')).join('')}
        </section>`).join('')
        : vazio(f === 'aguardando' ? 'Nada para aprovar agora' : 'Nenhum pedido analisado ainda', f === 'aguardando' ? 'Quando chegar uma solicitação nova, ela aparece aqui e você recebe um aviso.' : 'Os pedidos que você aprovar ou negar ficam listados aqui.')}`;
    ligarChips(view, params, sec);
    $$('[data-decidir]', view).forEach((b) => (b.onclick = async () => {
      const p = v.pedidos.find((x) => x.id === b.dataset.id);
      const aprovar = b.dataset.decidir === 'sim';
      const r = aprovar
        ? await confirmar('Aprovar pedido nº ' + p.numero, `${h(resumoItens(p.itens))} para ${h(nomeDe(p.solicitante_id))}. ${coord ? 'Ele segue para o analista de custo.' : 'Ele segue para o Departamento de Compras.'}`, { ok: 'Aprovar', campo: 'Comentário (opcional)' })
        : await confirmar('Negar pedido nº ' + p.numero, 'Explique o motivo. O solicitante recebe esta justificativa.', { ok: 'Negar pedido', perigo: true, campo: 'Justificativa', obrigatorio: true, placeholder: 'Ex.: já existe esse item no almoxarifado' });
      if (!r.ok) return;
      if (!aprovar && r.texto.length < 5) return toast('Escreva a justificativa da recusa.', { erro: true });
      const fn = coord ? Store.decidirCoordenador : Store.decidirAnalista;
      const link = linkWhats(p.solicitante_id, `Olá! Seu pedido de ${resumoItens(p.itens)} foi ${aprovar ? 'APROVADO' : 'NEGADO'} pelo ${coord ? 'coordenador' : 'analista de custo'}.${!aprovar ? ' Justificativa: ' + r.texto : ''}`);
      await executarAcao(() => fn(p.id, aprovar, r.texto), aprovar ? `Pedido nº ${p.numero} aprovado.` : `Pedido nº ${p.numero} negado.`, link);
    }));
  }
  function cartaoAprovacao(p, v, comAcoes) {
    const wa = linkWhats(p.solicitante_id, `Olá! Sobre o seu pedido de ${resumoItens(p.itens)}:`);
    return `<article class="order">
      ${cabecalho(p)}
      ${fatosPrincipais(p)}
      ${tabelaItens(p.itens)}
      <div class="reason"><span class="lbl">Por que precisa</span>${h(p.motivo)}</div>
      ${p.tipo_pedido === 'Regularização' ? `<div class="alert alert-warn">${ic('alert', 18)}<span>Compra por regularização: use só em último caso.</span></div>` : ''}
      ${blocoNegado(p)}
      <details class="more" data-k="a-${h(p.id)}"><summary>Mais detalhes e anexos</summary><div class="more-body">
        <p class="small"><b>Departamento:</b> ${h(p.departamento)} · <b>Equipe:</b> ${h(p.equipe)} (${h(p.equipe_tipo || '')})</p>
        ${blocoAnexos(v.anexos[p.id])}
        ${linhaDoTempo((v.eventos[p.id] || []))}
      </div></details>
      ${comAcoes ? `<div class="order-actions">
        ${wa ? `<a class="btn btn-ghost btn-sm" href="${h(wa)}" target="_blank" rel="noopener">${ic('wa', 18)} Falar com o solicitante</a>` : ''}
        <span class="grow"></span>
        <button class="btn btn-danger" data-decidir="nao" data-id="${h(p.id)}">Negar</button>
        <button class="btn" data-decidir="sim" data-id="${h(p.id)}">${ic('tick', 18)} Aprovar</button>
      </div>` : ''}
    </article>`;
  }

  // =========================================================
  //   Departamento de Compras
  // =========================================================
  function vCompras(view, v, params) {
    const base = v.pedidos.filter((p) => p.cdc === S.perfil.cdc);
    const ativos = base.filter((p) => p.etapa === 'compras');
    const recebidos = base.filter((p) => p.etapa === 'recebido');
    const f = params.get('f') || 'ativos';
    let lista;
    if (f === 'recebidos') lista = recebidos;
    else if (STATUS_COMPRA.includes(f)) lista = ativos.filter((p) => (p.status_compra || 'Pendente') === f);
    else lista = ativos;
    lista = lista.slice().sort((a, b) => String(a.data_necessidade).localeCompare(String(b.data_necessidade)));
    view.innerHTML = `
      <div class="page-head"><div><h1>Departamento de Compras</h1><p>Pedidos do CDC ${h(S.perfil.cdc)} aprovados pelo coordenador e pelo analista. Cada um fica aqui até o solicitante confirmar que recebeu.</p></div></div>
      ${chips('f', [{ v: 'ativos', t: 'Todos em compra', n: ativos.length }, ...STATUS_COMPRA.map((s) => ({ v: s, t: s, n: ativos.filter((p) => (p.status_compra || 'Pendente') === s).length })), { v: 'recebidos', t: 'Recebidos', n: recebidos.length }], f)}
      <div>${lista.length ? lista.map((p) => cartaoCompra(p, v)).join('') : vazio('Nenhum pedido aqui', f === 'recebidos' ? 'Pedidos confirmados pelos solicitantes aparecem aqui.' : 'Quando o analista de custo aprovar um pedido, ele chega aqui.')}</div>`;
    ligarChips(view, params, 'compras');
    $$('form[data-compra]', view).forEach((form) => {
      form.addEventListener('input', () => { form.dataset.sujo = '1'; });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const p = v.pedidos.find((x) => x.id === form.dataset.compra);
        const st = ($('input[type="radio"]:checked', form) || {}).value;
        const obs = $('textarea', form).value.trim();
        const atual = p.status_compra || 'Pendente';
        if (st === atual && !obs) return toast('Mude o status ou escreva uma observação.', { erro: true });
        delete form.dataset.sujo;
        const mudou = st !== atual;
        const link = linkWhats(p.solicitante_id, `Seu pedido de ${resumoItens(p.itens)}: ${mudou ? 'status ' + st.toUpperCase() + '. ' : ''}${obs}`);
        await executarAcao(() => Store.atualizarCompra(p.id, mudou ? st : null, obs), `Pedido nº ${p.numero} atualizado.`, link);
      });
    });
  }
  function cartaoCompra(p, v) {
    const ativo = p.etapa === 'compras';
    const st = p.status_compra || 'Pendente';
    const sol = S.perfis[p.solicitante_id];
    return `<article class="order">
      ${cabecalho(p)}
      ${fatosPrincipais(p)}
      <p class="small muted">Solicitante: <b>${h(nomeDe(p.solicitante_id))}</b>${sol ? ' (' + h(sol.cargo) + ')' : ''} · ${h(p.departamento)}${p.equipe_tipo ? (p.equipe_tipo === 'Mecanizado' ? ' · Equipe mecanizada' : ' · Equipe manual') : ''}</p>
      ${tabelaItens(p.itens)}
      <div class="reason"><span class="lbl">Por que precisa</span>${h(p.motivo)}</div>
      ${blocoAnexos(v.anexos[p.id])}
      <details class="more" data-k="c-${h(p.id)}"><summary>Histórico do pedido</summary><div class="more-body">${linhaDoTempo(v.eventos[p.id] || [])}</div></details>
      ${ativo ? `<form class="buy-form" data-compra="${h(p.id)}">
        ${st === 'Finalizado' ? `<div class="alert alert-info">Aguardando o solicitante confirmar o recebimento no app.</div>` : ''}
        <div class="field"><span class="label">Status do pedido</span>
          <div class="status-pills" role="radiogroup" aria-label="Status do pedido">${STATUS_COMPRA.map((s, i) => `<input type="radio" name="st-${h(p.id)}" id="st-${h(p.id)}-${i}" value="${h(s)}" ${s === st ? 'checked' : ''}><label for="st-${h(p.id)}-${i}">${h(s)}</label>`).join('')}</div></div>
        <div class="field"><label for="obs-${h(p.id)}">Observação para o solicitante</label>
          <textarea id="obs-${h(p.id)}" class="input" placeholder="Ex.: fornecedor entrega na quinta-feira; nota fiscal 1234"></textarea></div>
        <div class="row end"><button class="btn">Salvar atualização</button></div>
      </form>` : `<p class="small muted">Recebido pelo solicitante em ${dataHora(p.recebido_em)}.</p>`}
    </article>`;
  }

  // =========================================================
  //   Base de dados
  // =========================================================
  function vBase(view, v, params) {
    const me = S.perfil;
    const aba = ['pedidos', 'equipes', 'usuarios'].includes(params.get('aba')) ? params.get('aba') : 'pedidos';
    const pedidos = v.pedidos.filter((p) => !p._local);
    const equipes = S.equipes.filter((e) => me.cargo === 'Comprador' || e.cdc === me.cdc);
    const usuarios = Object.values(S.perfis).filter((u) => me.cargo === 'Comprador' || u.cdc === me.cdc).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    let corpo = '';
    if (aba === 'pedidos') {
      corpo = `<div class="panel-title"><p class="muted small">${pedidos.length} pedidos que você pode ver. Exporte para abrir no Excel.</p>
          <div class="row"><button class="btn btn-ghost btn-sm" id="exp-csv">Exportar planilha (CSV)</button><button class="btn btn-ghost btn-sm" id="exp-json">Cópia completa (JSON)</button></div></div>
        <div class="table-wrap"><table class="data"><thead><tr><th>Nº</th><th>Pedido em</th><th>Necessidade</th><th>CDC</th><th>Solicitante</th><th>Equipe</th><th>Frota</th><th>Tipo</th><th>Itens</th><th>Situação</th></tr></thead><tbody>
        ${pedidos.map((p) => `<tr><td>${h(p.numero)}</td><td>${dataBR(p.data_pedido)}</td><td>${dataBR(p.data_necessidade)}</td><td>${h(p.cdc)}</td><td>${h(nomeDe(p.solicitante_id))}</td><td>${h(p.equipe)}</td><td>${h(p.frota || '')}</td><td>${h(p.tipo_pedido)}</td><td class="wrap">${h((p.itens || []).map((i) => qtd(i.quantidade) + ' ' + (i.unidade || '') + ' ' + i.produto).join('; '))}</td><td>${h(etapaInfo(p).txt)}</td></tr>`).join('') || '<tr><td colspan="10" class="muted">Sem pedidos.</td></tr>'}
        </tbody></table></div>`;
    } else if (aba === 'equipes') {
      const pode = me.cargo === 'Coordenador';
      corpo = `<p class="muted small" style="margin-bottom:12px">${pode ? 'As equipes aparecem na hora de fazer a solicitação. Equipes mecanizadas pedem a frota.' : 'Somente o coordenador do CDC altera as equipes.'}</p>
        ${pode ? `<form id="f-eq" class="row" style="margin-bottom:14px;align-items:end">
          <div class="field" style="flex:1;min-width:140px"><label for="eq-nome">Nova equipe</label><input id="eq-nome" class="input" placeholder="Ex.: BU" required></div>
          <div class="field"><label for="eq-tipo">Tipo</label><select id="eq-tipo" class="input"><option>Mecanizado</option><option>Manual</option></select></div>
          <button class="btn">Adicionar</button></form>` : ''}
        <div class="table-wrap"><table class="data"><thead><tr><th>CDC</th><th>Equipe</th><th>Tipo</th>${pode ? '<th></th>' : ''}</tr></thead><tbody>
        ${equipes.map((e) => `<tr><td>${h(e.cdc)}</td><td><b>${h(e.nome)}</b></td><td>${h(e.tipo)}</td>${pode ? `<td><button class="btn btn-danger btn-sm" data-rm-eq="${e.id}">Remover</button></td>` : ''}</tr>`).join('') || `<tr><td colspan="4" class="muted">Nenhuma equipe cadastrada para ${h(me.cdc)}.</td></tr>`}
        </tbody></table></div>`;
    } else {
      const podeReset = me.cargo === 'Coordenador';
      corpo = `<p class="muted small" style="margin-bottom:12px">Esqueceu a senha? ${podeReset ? 'Use <b>Senha provisória</b>: o app cria uma senha temporária para você passar à pessoa, e ela cria uma nova no primeiro acesso.' : ''}</p>
        <div class="table-wrap"><table class="data"><thead><tr><th>Nome</th><th>Usuário</th><th>CDC</th><th>Cargo</th><th>WhatsApp</th>${podeReset ? '<th></th>' : ''}</tr></thead><tbody>
        ${usuarios.map((u) => `<tr><td><span class="row" style="gap:8px;flex-wrap:nowrap">${avatar(u, 'sm')}${h(u.nome)}</span></td><td>${h(u.usuario)}</td><td>${h(u.cdc)}</td><td>${h(u.cargo)}</td><td>${h(u.whatsapp || '')}</td>
          ${podeReset ? `<td>${u.id !== me.id && u.cdc === me.cdc ? `<button class="btn btn-ghost btn-sm" data-reset="${h(u.id)}">Senha provisória</button>` : ''}</td>` : ''}</tr>`).join('')}
        </tbody></table></div>`;
    }
    view.innerHTML = `
      <div class="page-head"><div><h1>Base de dados</h1><p>Tudo fica guardado no Supabase e também neste aparelho, para funcionar sem internet.</p></div></div>
      ${chips('aba', [{ v: 'pedidos', t: 'Pedidos', n: pedidos.length }, { v: 'equipes', t: 'Equipes', n: equipes.length }, { v: 'usuarios', t: 'Usuários', n: usuarios.length }], aba)}
      <section class="panel">${corpo}</section>
      <section class="panel"><h3 style="margin-bottom:6px">Acesso completo à base</h3>
        <p class="small muted">No painel do Supabase, em <b>Table Editor</b>, ficam todas as tabelas: <b>pedidos</b>, <b>pedido_eventos</b> (todas as movimentações), <b>anexos</b>, <b>perfis</b>, <b>equipes</b> e <b>notificacoes</b>. A visão <b>vw_pedidos</b> junta tudo numa linha por pedido.</p></section>`;
    ligarChips(view, params, 'base');
    const csv = $('#exp-csv', view); if (csv) csv.onclick = () => exportarCSV(pedidos, v);
    const js = $('#exp-json', view); if (js) js.onclick = () => baixar(`pedidos-${hoje()}.json`, JSON.stringify({ exportado_em: new Date().toISOString(), pedidos, eventos: v.eventos, anexos: S.anexos, equipes: S.equipes }, null, 2), 'application/json');
    const fe = $('#f-eq', view);
    if (fe) fe.onsubmit = async (e) => {
      e.preventDefault();
      if (!navigator.onLine) return toast('Precisa de internet para alterar equipes.', { erro: true });
      try { await Store.salvarEquipe($('#eq-nome').value, $('#eq-tipo').value); toast('Equipe adicionada.'); render(true); } catch (ex) { toast(ex.message, { erro: true }); }
    };
    $$('[data-reset]', view).forEach((b) => (b.onclick = async () => {
      const u = S.perfis[b.dataset.reset];
      if (!navigator.onLine) return toast('Precisa de internet para redefinir senha.', { erro: true });
      const r = await confirmar('Senha provisória para ' + u.nome, `A senha atual de <b>${h(u.usuario)}</b> deixa de funcionar. Você recebe uma senha provisória para passar a ele.`, { ok: 'Gerar senha provisória' });
      if (!r.ok) return;
      try {
        const nova = await Store.coordRedefinirSenha(u.id);
        const wa = linkWhats(u.id, `Olá, ${u.nome.split(' ')[0]}! Sua senha provisória do App de Compras é: ${nova}\nUsuário: ${u.usuario}\nAo entrar, o app pede para você criar uma senha nova.`);
        const d = dialogo(`<div class="dlg"><h2>Senha provisória criada</h2>
          <p>Passe esta senha para <b>${h(u.nome)}</b> (usuário <b>${h(u.usuario)}</b>):</p>
          <p class="temp-pass">${h(nova)}</p>
          <p class="small muted">No primeiro acesso, o app pede para ele criar uma senha nova. Esta tela não mostra a senha de novo.</p>
          <div class="dlg-foot">${wa ? `<a class="btn btn-ghost" href="${h(wa)}" target="_blank" rel="noopener">${ic('wa', 18)} Enviar no WhatsApp</a>` : ''}<button class="btn" data-x>Fechar</button></div></div>`);
        $('[data-x]', d).onclick = () => d.close();
      } catch (ex) { toast(ex.message, { erro: true }); }
    }));
    $$('[data-rm-eq]', view).forEach((b) => (b.onclick = async () => {
      const r = await confirmar('Remover equipe', 'Pedidos antigos dessa equipe continuam salvos.', { ok: 'Remover', perigo: true });
      if (!r.ok) return;
      try { await Store.removerEquipe(+b.dataset.rmEq); toast('Equipe removida.'); render(true); } catch (ex) { toast(ex.message, { erro: true }); }
    }));
  }
  function exportarCSV(pedidos, v) {
    const col = ['Número', 'Data do pedido', 'Data da necessidade', 'CDC', 'Solicitante', 'Departamento', 'Equipe', 'Tipo da equipe', 'Frota', 'Tipo de pedido', 'Produto', 'Quantidade', 'Unidade', 'Descrição', 'Motivo', 'Situação', 'Status compra', 'Justificativa negativa', 'Recebido em', 'Última movimentação'];
    const esc = (x) => { const s = String(x == null ? '' : x); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const linhas = [col.join(';')];
    for (const p of pedidos) {
      const ult = (v.eventos[p.id] || []).slice(-1)[0];
      for (const i of p.itens || []) {
        linhas.push([p.numero, dataBR(p.data_pedido), dataBR(p.data_necessidade), p.cdc, nomeDe(p.solicitante_id), p.departamento, p.equipe, p.equipe_tipo, p.frota, p.tipo_pedido,
          i.produto, String(i.quantidade).replace('.', ','), i.unidade, i.descricao, p.motivo, etapaInfo(p).txt, p.status_compra, p.justificativa_negativa,
          p.recebido_em ? dataHora(p.recebido_em) : '', ult ? ult.titulo + ' (' + dataHora(ult.criado_em) + ')' : ''].map(esc).join(';'));
      }
    }
    baixar(`pedidos-${hoje()}.csv`, '﻿' + linhas.join('\r\n'), 'text/csv;charset=utf-8');
  }
  function baixar(nome, conteudo, tipo) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  // =========================================================
  //   Ações, notificações e perfil
  // =========================================================
  async function executarAcao(fn, msgOk, linkWa) {
    try {
      const falhas = await fn();
      // erros já aparecem pelo aviso de sincronização
      if (!(Array.isArray(falhas) && falhas.length)) toast(navigator.onLine ? msgOk : msgOk + ' Será enviado quando houver internet.', linkWa ? { link: linkWa, linkTxt: 'Avisar no WhatsApp' } : {});
    } catch (e) { toast(e.message, { erro: true }); }
    render(true);
  }

  function destinoNotificacao(n) {
    const v = Store.visao(); const p = v.pedidos.find((x) => x.id === n.pedido_id); const c = S.perfil.cargo;
    if (p && p.solicitante_id === S.perfil.id) return ['status', { id: p.id }];
    if (p && c === 'Coordenador' && p.etapa === 'coordenador' && p.solicitante_id !== S.perfil.id) return ['aprovacao-coordenador'];
    if (c === 'Analista de Custo') return ['aprovacao-analista'];
    if (c === 'Comprador') return ['compras', p && p.etapa === 'recebido' ? { f: 'recebidos' } : undefined];
    return ['status', n.pedido_id ? { id: n.pedido_id } : undefined];
  }
  function abrirNotificacoes() {
    const lista = S.notifs;
    const d = dialogo(`<div class="dlg">
      <div class="dlg-head"><h2>Notificações</h2><button class="icon-btn" data-x aria-label="Fechar">${ic('x')}</button></div>
      ${lista.length ? `<div class="notif-list">${lista.map((n) => `<button class="notif ${n.lida ? '' : 'unread'}" data-n="${n.id}">
          <span class="n-title">${h(n.titulo)}</span><span class="n-text">${h(n.texto)}</span><span class="n-time">${dataHora(n.criado_em)}</span></button>`).join('')}</div>`
        : '<p class="muted">Nenhuma notificação ainda. Você será avisado aqui a cada movimentação dos pedidos.</p>'}
      <div class="dlg-foot">${lista.some((n) => !n.lida) ? '<button class="btn btn-ghost" data-todas>Marcar todas como lidas</button>' : ''}</div>
    </div>`);
    $('[data-x]', d).onclick = () => d.close();
    const todas = $('[data-todas]', d); if (todas) todas.onclick = () => { Store.marcarLidas(lista.filter((n) => !n.lida).map((n) => n.id)); d.close(); };
    $$('[data-n]', d).forEach((b) => (b.onclick = () => {
      const n = lista.find((x) => String(x.id) === b.dataset.n);
      if (!n.lida) Store.marcarLidas([n.id]);
      d.close();
      if (n.link) { location.hash = n.link; return; }
      const [sec, p] = destinoNotificacao(n); ir(sec, p);
    }));
  }

  let eventoInstalar = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); eventoInstalar = e; });

  function abrirPerfil() {
    const me = S.perfil; const w = S.whatsapp || {};
    const perm = 'Notification' in window ? Notification.permission : 'indisponivel';
    const d = dialogo(`<div class="dlg">
      <div class="dlg-head"><div class="row"><span id="p-av">${avatar(me, 'big')}</span><div><h2>${h(me.nome)}</h2><p class="small muted">${h(me.usuario)} · ${h(me.cargo)} · ${h(me.cdc)}</p></div></div>
        <button class="icon-btn" data-x aria-label="Fechar">${ic('x')}</button></div>
      <div class="row photo-actions">
        <label class="btn btn-ghost btn-sm">${ic('camera', 18)} Tirar foto<input type="file" id="p-cam" accept="image/*" capture="user" hidden></label>
        <label class="btn btn-ghost btn-sm">${ic('image', 18)} Escolher da galeria<input type="file" id="p-gal" accept="image/*" hidden></label>
        ${me.foto_url ? '<button class="btn btn-danger btn-sm" id="p-rmfoto">Remover foto</button>' : ''}
      </div>
      <hr class="sep">
      <div class="stack">
        <h3>Notificações neste aparelho</h3>
        <p class="small muted">${perm === 'granted' ? 'Ativadas. Você recebe um aviso quando um pedido seu (ou para você aprovar) se movimentar, com o app aberto ou minimizado.' : perm === 'denied' ? 'Bloqueadas no navegador. Libere nas configurações do site para receber avisos.' : perm === 'indisponivel' ? 'Este navegador não mostra notificações.' : 'Receba um aviso a cada movimentação dos pedidos.'}</p>
        ${perm === 'default' ? '<button class="btn btn-ghost" id="p-notif">Ativar notificações</button>' : ''}
      </div>
      <hr class="sep">
      <form class="stack" id="p-wpp">
        <h3>WhatsApp automático (grátis)</h3>
        <p class="small muted">O app manda as movimentações dos seus pedidos para o seu WhatsApp pelo serviço gratuito CallMeBot. Faça uma vez:</p>
        <ol class="steps small">
          <li>Abra <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener">a página do CallMeBot</a> e salve o número do robô nos seus contatos.</li>
          <li>Mande para ele pelo WhatsApp: <b>I allow callmebot to send me messages</b></li>
          <li>Ele responde com a sua chave (apikey). Cole abaixo.</li>
        </ol>
        <div class="grid-2">
          <div class="field"><label for="p-tel">Seu WhatsApp</label><input id="p-tel" class="input" inputmode="tel" value="${h(w.telefone || me.whatsapp || '')}" placeholder="5515999990000"><span class="hint">Com 55 e DDD.</span></div>
          <div class="field"><label for="p-key">Chave (apikey)</label><input id="p-key" class="input" inputmode="numeric" value="${h(w.callmebot_apikey || '')}"></div>
        </div>
        <label class="row small"><input type="checkbox" id="p-ativo" ${w.ativo === false ? '' : 'checked'}> Receber mensagens no WhatsApp</label>
        <div class="row end"><button class="btn btn-ghost">Salvar WhatsApp</button></div>
      </form>
      <hr class="sep">
      <details class="more"><summary>Trocar senha</summary><form class="more-body" id="p-senha">
        <div class="field"><label for="p-s1">Senha atual</label><input id="p-s1" type="password" class="input" autocomplete="current-password" required></div>
        <div class="field"><label for="p-s2">Nova senha</label><input id="p-s2" type="password" class="input" autocomplete="new-password" minlength="6" required></div>
        <div class="row end"><button class="btn btn-ghost">Trocar senha</button></div></form></details>
      <hr class="sep">
      <div class="dlg-foot">
        ${eventoInstalar ? '<button class="btn btn-ghost" id="p-inst">Instalar app no aparelho</button>' : ''}
        <button class="btn btn-danger" id="p-sair">Sair</button>
      </div>
    </div>`);
    $('[data-x]', d).onclick = () => d.close();
    const trocarFoto = async (e) => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      if (!navigator.onLine) return toast('Precisa de internet para trocar a foto.', { erro: true });
      try {
        const blob = await recortarQuadrado(f, 320);
        $('#p-av', d).innerHTML = avatar({ nome: me.nome, foto_url: URL.createObjectURL(blob) }, 'big');
        await Store.salvarFoto(blob); toast('Foto atualizada.'); d.close(); shell(); render(true);
      } catch (ex) { toast(ex.message, { erro: true }); }
    };
    $('#p-cam', d).onchange = trocarFoto; $('#p-gal', d).onchange = trocarFoto;
    const prm = $('#p-rmfoto', d);
    if (prm) prm.onclick = async () => { try { await Store.removerFoto(); toast('Foto removida.'); d.close(); shell(); render(true); } catch (ex) { toast(ex.message, { erro: true }); } };
    const pn = $('#p-notif', d); if (pn) pn.onclick = async () => { const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Notificações ativadas.' : 'Notificações não foram permitidas.'); d.close(); };
    const pi = $('#p-inst', d); if (pi) pi.onclick = async () => { eventoInstalar.prompt(); await eventoInstalar.userChoice; eventoInstalar = null; d.close(); };
    $('#p-wpp', d).onsubmit = async (e) => {
      e.preventDefault();
      if (!navigator.onLine) return toast('Precisa de internet para salvar.', { erro: true });
      try { await Store.salvarWhatsapp($('#p-tel', d).value, $('#p-key', d).value, $('#p-ativo', d).checked); toast('WhatsApp salvo.'); d.close(); } catch (ex) { toast(ex.message, { erro: true }); }
    };
    $('#p-senha', d).onsubmit = async (e) => {
      e.preventDefault();
      try { await Store.alterarSenha($('#p-s1', d).value, $('#p-s2', d).value); toast('Senha trocada.'); d.close(); } catch (ex) { toast(ex.message, { erro: true }); }
    };
    $('#p-sair', d).onclick = async () => {
      if (S.pendentes.length) {
        const r = await confirmar('Há envios pendentes', `${S.pendentes.length} ação(ões) ainda não foram enviadas. Se sair agora, elas serão perdidas.`, { ok: 'Sair mesmo assim', perigo: true });
        if (!r.ok) return;
      }
      d.close(); await Store.sair(); location.hash = ''; telaLogin('Você saiu do app.');
    };
  }

  async function mostrarNotificacaoNativa(n) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const opts = { body: n.texto, tag: 'n' + n.id, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { pedido: n.pedido_id } };
    try {
      const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
      if (reg) return reg.showNotification(n.titulo, opts);
      new Notification(n.titulo, opts);
    } catch (_) {}
  }

  // =========================================================
  //   Início
  // =========================================================
  Store.ouvir((m) => {
    if (m === 'sessao') { Store.sair().then(() => telaLogin('Sua sessão terminou. Entre novamente; o que estava pendente será enviado.')); return; }
    if (m && m.tipo === 'notificacao') { toast(m.dado.titulo); mostrarNotificacaoNativa(m.dado); return; }
    if (m && m.tipo === 'sync') { (m.falhas || []).forEach((f) => toast('Não foi possível ' + (f.op.rotulo || 'enviar') + ': ' + f.msg, { erro: true, tempo: 8000 })); }
    if (m === 'rede' || m === 'fila') { atualizarBarra(); if (m === 'rede') render(); return; }
    render();
  });

  async function iniciarApp() {
    shell();
    render(true);
    if (navigator.onLine) {
      const ok = await Store.validarSessaoOnline();
      if (!ok) { await Store.sair(); return telaLogin('Entre novamente para continuar.'); }
      shell(); render(true);
      Store.sincronizar().then(() => Store.atualizar());
      Store.iniciarTempoReal();
    }
  }

  async function boot() {
    if (!S.cfg.ok) return telaConfig();
    let p = null;
    try { p = await Store.restaurar(); } catch (e) { console.warn(e); }
    if (!window.supabase) {
      if (p) { shell(); render(true); toast('Sem conexão com o servidor. Mostrando os dados salvos no aparelho.'); return; }
      app().innerHTML = `<div class="auth"><div class="auth-box"><div class="auth-card"><h2>Sem conexão</h2><p>O primeiro acesso precisa de internet para baixar o app. Conecte-se e tente de novo.</p><button class="btn" onclick="location.reload()">Tentar de novo</button></div></div></div>`;
      return;
    }
    if (p) return iniciarApp();
    telaLogin();
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('message', (e) => { if (e.data && e.data.abrir) { location.hash = e.data.abrir; } });
  }
  boot();
})();
