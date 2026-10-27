/* =========================================================
   Dados: Supabase + cache no aparelho + fila offline
   ========================================================= */
(function () {
  'use strict';

  // ---------- Configuração ----------
  function lerConfig() {
    const base = window.APP_CONFIG || {};
    let local = {};
    try { local = JSON.parse(localStorage.getItem('compras.cfg') || '{}'); } catch (_) {}
    const url = (local.SUPABASE_URL || base.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const key = (local.SUPABASE_ANON_KEY || base.SUPABASE_ANON_KEY || '').trim();
    const ok = /^https:\/\/.+\..+/.test(url) && key.length > 20 && !/SEU-PROJETO|COLE_AQUI/i.test(url + key);
    return { url, key, ok };
  }

  // ---------- IndexedDB (cache + fila) ----------
  let dbp = null;
  function idb() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const r = indexedDB.open('app-compras', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
        if (!d.objectStoreNames.contains('outbox')) d.createObjectStore('outbox', { keyPath: 'seq', autoIncrement: true });
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    return dbp;
  }
  async function run(store, mode, fn) {
    const d = await idb();
    return new Promise((resolve, reject) => {
      const t = d.transaction(store, mode);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }
  const kv = {
    get: (k) => run('kv', 'readonly', (s) => s.get(k)),
    set: (k, v) => run('kv', 'readwrite', (s) => s.put(v, k)),
    del: (k) => run('kv', 'readwrite', (s) => s.delete(k)),
    clear: () => run('kv', 'readwrite', (s) => s.clear()),
  };
  const outbox = {
    all: () => run('outbox', 'readonly', (s) => s.getAll()),
    add: (op) => run('outbox', 'readwrite', (s) => s.add(op)),
    del: (seq) => run('outbox', 'readwrite', (s) => s.delete(seq)),
    clear: () => run('outbox', 'readwrite', (s) => s.clear()),
  };

  // ---------- Erros ----------
  function erroDeRede(e) {
    const m = String((e && (e.message || e.error_description)) || e || '');
    return !navigator.onLine || /failed to fetch|networkerror|load failed|network request failed|fetch failed|timeout|ERR_INTERNET/i.test(m);
  }
  function msgErro(e) {
    if (!e) return 'Erro desconhecido.';
    if (erroDeRede(e)) return 'Sem conexão com o servidor.';
    const m = e.message || String(e);
    if (/anonymous sign-ins are disabled/i.test(m)) return 'O login anônimo está desligado no Supabase. Veja o passo 3 do guia de instalação.';
    if (/JWT|refresh token/i.test(m)) return 'Sua sessão expirou. Entre novamente.';
    if (/bucket not found/i.test(m)) return 'Falta rodar o schema.sql novo no Supabase (SQL Editor › Run).';
    if (/could not find the function|function .* does not exist|schema cache/i.test(m)) return 'O banco está desatualizado. Rode o schema.sql novo no SQL Editor do Supabase.';
    if (/row-level security|violates row-level/i.test(m)) return 'O banco recusou o envio. Rode o schema.sql novo no SQL Editor do Supabase.';
    if (/payload too large|exceeded the maximum/i.test(m)) return 'Arquivo grande demais.';
    return m;
  }
  class AppError extends Error {
    constructor(e) { super(msgErro(e)); this.rede = erroDeRede(e); this.sessao = /Faça login novamente|sessão expirou|Sessão inválida/i.test(this.message); this.original = e; }
  }

  // ---------- Estado ----------
  const S = {
    cfg: lerConfig(),
    sb: null,
    perfil: null,
    equipes: [],
    pedidos: [],        // do servidor
    eventos: {},        // pedido_id -> []
    anexos: {},         // pedido_id -> []
    perfis: {},         // id -> perfil
    notifs: [],
    ocultos: [],        // pedidos que o usuário apagou da própria tela
    whatsapp: null,
    pendentes: [],      // fila offline (em memória)
    sincronizando: false,
    ultimaSync: null,
    online: navigator.onLine,
    ouvintes: new Set(),
  };
  function avisar(motivo) { S.ouvintes.forEach((fn) => { try { fn(motivo); } catch (e) { console.error(e); } }); }

  // ---------- Cliente ----------
  function cliente() {
    if (S.sb) return S.sb;
    if (!S.cfg.ok || !window.supabase || !window.supabase.createClient) return null;
    S.sb = window.supabase.createClient(S.cfg.url, S.cfg.key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'compras.auth' },
      realtime: { params: { eventsPerSecond: 5 } },
    });
    return S.sb;
  }
  async function garantirSessao() {
    const sb = cliente();
    if (!sb) throw new AppError(new Error('App não configurado.'));
    const { data } = await sb.auth.getSession();
    if (data && data.session) return data.session;
    const r = await sb.auth.signInAnonymously();
    if (r.error) throw new AppError(r.error);
    return r.data.session;
  }
  async function rpc(fn, args) {
    const sb = cliente();
    const { data, error } = await sb.rpc(fn, args || {});
    if (error) throw new AppError(error);
    return data;
  }

  // ---------- Login ----------
  async function entrar(usuario, senha) {
    await garantirSessao();
    const p = await rpc('entrar', { p_usuario: usuario, p_senha: senha });
    await definirPerfil(p);
    return p;
  }
  async function cadastrar(d) {
    await garantirSessao();
    const p = await rpc('cadastrar', {
      p_usuario: d.usuario, p_senha: d.senha, p_nome: d.nome, p_cdc: d.cdc, p_cargo: d.cargo, p_whatsapp: d.whatsapp || null,
    });
    await definirPerfil(p);
    return p;
  }
  async function definirPerfil(p) {
    const anterior = await kv.get('perfil');
    if (anterior && anterior.id !== p.id) {
      // outro usuário neste aparelho: limpa dados e fila do anterior
      await kv.clear(); await outbox.clear(); S.pendentes = [];
      S.pedidos = []; S.eventos = {}; S.anexos = {}; S.notifs = []; S.ocultos = [];
    }
    S.perfil = p;
    await kv.set('perfil', p);
  }
  async function sair() {
    try { if (navigator.onLine) await rpc('sair'); } catch (_) {}
    try { await S.sb.auth.signOut(); } catch (_) {}
    pararTempoReal();
    await kv.clear();
    S.perfil = null; S.pedidos = []; S.eventos = {}; S.anexos = {}; S.notifs = []; S.ocultos = []; S.whatsapp = null;
  }
  async function restaurar() {
    const p = await kv.get('perfil');
    if (!p) return null;
    S.perfil = p;
    await carregarCache();
    return p;
  }
  async function validarSessaoOnline() {
    if (!navigator.onLine || !cliente()) return true;
    try {
      await garantirSessao();
      const p = await rpc('meu_perfil');
      if (!p || !p.id) return false;
      S.perfil = p; await kv.set('perfil', p);
      return true;
    } catch (e) {
      if (e.rede) return true;
      return false;
    }
  }

  // ---------- Cache ----------
  async function carregarCache() {
    const c = (await kv.get('dados')) || {};
    S.equipes = c.equipes || [];
    S.pedidos = c.pedidos || [];
    S.eventos = c.eventos || {};
    S.anexos = c.anexos || {};
    S.perfis = c.perfis || {};
    S.notifs = c.notifs || [];
    S.ocultos = c.ocultos || [];
    S.whatsapp = c.whatsapp || null;
    S.ultimaSync = c.ultimaSync || null;
    S.pendentes = await outbox.all();
  }
  async function salvarCache() {
    await kv.set('dados', {
      equipes: S.equipes, pedidos: S.pedidos, eventos: S.eventos, anexos: S.anexos,
      perfis: S.perfis, notifs: S.notifs, ocultos: S.ocultos, whatsapp: S.whatsapp, ultimaSync: S.ultimaSync,
    });
  }

  // ---------- Baixar dados do servidor ----------
  function agrupar(lista, campo) {
    const m = {};
    for (const x of lista) (m[x[campo]] = m[x[campo]] || []).push(x);
    return m;
  }
  async function emLotes(tabela, ids, ordem) {
    const sb = cliente(); const out = [];
    for (let i = 0; i < ids.length; i += 120) {
      const { data, error } = await sb.from(tabela).select('*').in('pedido_id', ids.slice(i, i + 120)).order(ordem, { ascending: true });
      if (error) throw new AppError(error);
      out.push(...data);
    }
    return out;
  }
  let atualizando = null;
  async function atualizar() {
    if (!S.perfil || !navigator.onLine || !cliente()) return false;
    if (atualizando) return atualizando;
    atualizando = (async () => {
      const sb = cliente();
      const [eq, ped, nt, pf, wp, oc] = await Promise.all([
        sb.from('equipes').select('*').order('nome'),
        sb.from('pedidos').select('*').order('criado_em', { ascending: false }).limit(1000),
        sb.from('notificacoes').select('*').eq('para_id', S.perfil.id).order('criado_em', { ascending: false }).limit(100),
        sb.from('perfis').select('id,usuario,nome,cdc,cargo,whatsapp,ativo,foto_url'),
        sb.from('whatsapp_config').select('*').maybeSingle(),
        sb.from('pedidos_ocultos').select('pedido_id'),
      ]);
      for (const r of [eq, ped, nt, pf]) if (r.error) throw new AppError(r.error);
      const ids = ped.data.map((x) => x.id);
      const [ev, ax] = ids.length ? await Promise.all([emLotes('pedido_eventos', ids, 'id'), emLotes('anexos', ids, 'criado_em')]) : [[], []];
      S.equipes = eq.data;
      S.pedidos = ped.data;
      S.eventos = agrupar(ev, 'pedido_id');
      S.anexos = agrupar(ax, 'pedido_id');
      S.notifs = semApagadas(nt.data);
      if (!oc.error) S.ocultos = comPendentesOcultos(oc.data.map((x) => x.pedido_id));
      S.perfis = Object.fromEntries(pf.data.map((p) => [p.id, p]));
      S.whatsapp = wp.error ? S.whatsapp : wp.data;
      S.ultimaSync = new Date().toISOString();
      await salvarCache();
      avisar('dados');
      return true;
    })().catch((e) => {
      const err = e instanceof AppError ? e : new AppError(e);
      if (!err.rede) console.warn('Falha ao atualizar', err);
      if (err.sessao) avisar('sessao');
      return false;
    }).finally(() => { atualizando = null; });
    return atualizando;
  }

  // notificações apagadas que ainda não chegaram ao servidor não voltam para a lista
  function semApagadas(lista) {
    const fora = new Set();
    for (const op of S.pendentes) if (op.tipo === 'apagar_notif') op.ids.forEach((i) => fora.add(i));
    return lista.filter((n) => !fora.has(n.id));
  }
  // aplica por cima da lista do servidor o que ainda está na fila (apagar / trazer de volta)
  function comPendentesOcultos(lista) {
    const set = new Set(lista);
    for (const op of S.pendentes) if (op.tipo === 'rpc' && op.fn === 'ocultar_pedido') { if (op.args.p_ocultar === false) set.delete(op.args.p_id); else set.add(op.args.p_id); }
    return [...set];
  }

  // ---------- Tempo real ----------
  let canal = null; let timerReload = null; let timerPoll = null;
  function agendarAtualizacao(ms) {
    clearTimeout(timerReload);
    timerReload = setTimeout(() => atualizar(), ms || 800);
  }
  function iniciarTempoReal() {
    const sb = cliente();
    if (!sb || !S.perfil || canal) return;
    canal = sb.channel('compras-' + S.perfil.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => agendarAtualizacao())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedido_eventos' }, () => agendarAtualizacao())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes', filter: 'para_id=eq.' + S.perfil.id },
        (payload) => { avisar({ tipo: 'notificacao', dado: payload.new }); agendarAtualizacao(300); })
      .subscribe();
    clearInterval(timerPoll);
    timerPoll = setInterval(() => { if (document.visibilityState === 'visible') atualizar(); }, 60000);
  }
  function pararTempoReal() {
    clearInterval(timerPoll);
    if (canal && S.sb) { try { S.sb.removeChannel(canal); } catch (_) {} }
    canal = null;
  }

  // ---------- Fila offline ----------
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  async function enfileirar(op) {
    op.criado = new Date().toISOString();
    op.perfil_id = S.perfil && S.perfil.id;
    await outbox.add(op);
    S.pendentes = await outbox.all();
    avisar('fila');
    return sincronizar();
  }
  function nomeSeguro(n) {
    return (n || 'arquivo').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-80);
  }
  async function executar(op) {
    const sb = cliente();
    if (op.tipo === 'rpc') return rpc(op.fn, op.args);
    if (op.tipo === 'upload') {
      const caminho = op.pedido_id + '/' + op.anexo_id + '-' + nomeSeguro(op.nome);
      const up = await sb.storage.from('anexos').upload(caminho, op.blob, { contentType: op.mime || 'application/octet-stream', upsert: false });
      if (up.error && !/exist|duplicate/i.test(up.error.message || '') && String(up.error.statusCode) !== '409') throw new AppError(up.error);
      const ins = await sb.from('anexos').insert({
        id: op.anexo_id, pedido_id: op.pedido_id, tipo: op.categoria, nome: op.nome, caminho,
        mime: op.mime, tamanho: op.blob ? op.blob.size : null, enviado_por: S.perfil.id,
      });
      if (ins.error && ins.error.code !== '23505') throw new AppError(ins.error);
      return true;
    }
    if (op.tipo === 'excluir_pedido') {
      // tira as fotos/orçamentos do armazenamento (se não der, o pedido é apagado mesmo assim)
      if (op.caminhos && op.caminhos.length) { try { await sb.storage.from('anexos').remove(op.caminhos); } catch (_) {} }
      await rpc('excluir_pedido', { p_id: op.pedido_id });
      return true;
    }
    if (op.tipo === 'apagar_notif') {
      const r = await sb.from('notificacoes').delete().in('id', op.ids);
      if (r.error) throw new AppError(r.error);
      return true;
    }
    throw new Error('Operação desconhecida');
  }
  let rodando = null;
  async function sincronizar() {
    if (rodando) return rodando;
    if (!navigator.onLine || !cliente() || !S.perfil) return false;
    rodando = (async () => {
      S.sincronizando = true; avisar('fila');
      const falhas = [];
      try {
        await garantirSessao();
        let fila = await outbox.all();
        for (const op of fila) {
          if (op.perfil_id && S.perfil && op.perfil_id !== S.perfil.id) { await outbox.del(op.seq); continue; }
          try {
            await executar(op);
            await outbox.del(op.seq);
          } catch (e) {
            const err = e instanceof AppError ? e : new AppError(e);
            if (err.rede) break;
            if (err.sessao) { avisar('sessao'); break; }
            await outbox.del(op.seq);
            if (op.tipo === 'rpc' && op.fn === 'criar_pedido') {
              // descarta os anexos desse pedido que não foi aceito
              for (const o of await outbox.all()) if (o.tipo === 'upload' && o.pedido_id === op.args.p.id) await outbox.del(o.seq);
            }
            if (op.tipo === 'rpc' && op.fn === 'editar_pedido' && op.grupo) {
              // edição recusada (ex.: o coordenador já decidiu): não envia as fotos novas dessa edição
              for (const o of await outbox.all()) if (o.tipo === 'upload' && o.grupo === op.grupo) await outbox.del(o.seq);
            }
            falhas.push({ op, msg: err.message });
          }
        }
      } catch (e) {
        const err = e instanceof AppError ? e : new AppError(e);
        if (!err.rede) falhas.push({ op: { rotulo: 'sincronizar' }, msg: err.message });
      } finally {
        S.pendentes = await outbox.all();
        S.sincronizando = false;
      }
      avisar({ tipo: 'sync', falhas });
      await atualizar();
      return falhas;
    })().finally(() => { rodando = null; });
    return rodando;
  }

  // ---------- Visão combinada (servidor + o que ainda está no aparelho) ----------
  function eventoLocal(titulo, detalhe, criado) {
    return { id: 'local-' + Math.random().toString(36).slice(2), tipo: 'local', titulo, detalhe, criado_em: criado, autor_nome: S.perfil && S.perfil.nome, autor_cargo: S.perfil && S.perfil.cargo, _local: true };
  }
  function visao() {
    const pedidos = S.pedidos.map((p) => Object.assign({}, p));
    const porId = Object.fromEntries(pedidos.map((p) => [p.id, p]));
    const eventos = {}; for (const k in S.eventos) eventos[k] = S.eventos[k].slice();
    const anexos = {}; for (const k in S.anexos) anexos[k] = S.anexos[k].slice();
    const addEv = (id, ev) => { (eventos[id] = eventos[id] || []).push(ev); };
    const excluidos = new Set(S.pendentes.filter((op) => op.tipo === 'excluir_pedido').map((op) => op.pedido_id));
    for (const op of S.pendentes) {
      if (op.tipo === 'rpc' && op.fn === 'criar_pedido' && !porId[op.args.p.id]) {
        const d = op.args.p; const eq = S.equipes.find((e) => e.nome === d.equipe && e.cdc === S.perfil.cdc);
        const p = {
          id: d.id, numero: null, criado_em: op.criado, data_pedido: d.data_pedido, solicitante_id: S.perfil.id, cdc: S.perfil.cdc,
          departamento: d.departamento, equipe: d.equipe, equipe_tipo: eq ? eq.tipo : null, frota: d.frota, tipo_pedido: d.tipo_pedido,
          itens: d.itens, motivo: d.motivo, data_necessidade: d.data_necessidade, etapa: 'coordenador', status_compra: null, _local: true,
        };
        pedidos.unshift(p); porId[p.id] = p;
        addEv(p.id, eventoLocal('Solicitação salva no aparelho', 'Será enviada automaticamente quando houver internet.', op.criado));
      } else if (op.tipo === 'rpc' && op.fn === 'editar_pedido') {
        const d = op.args.p; const p = porId[d.id]; if (!p) continue;
        const eq = S.equipes.find((e) => e.nome === d.equipe && e.cdc === p.cdc);
        Object.assign(p, {
          departamento: d.departamento, equipe: d.equipe, equipe_tipo: d.equipe ? (eq ? eq.tipo : p.equipe_tipo) : null,
          frota: eq && eq.tipo === 'Mecanizado' ? d.frota : null, tipo_pedido: d.tipo_pedido, itens: d.itens,
          motivo: d.motivo, data_necessidade: d.data_necessidade, _pendente: true,
        });
        const rem = d.remover_anexos || [];
        if (rem.length && anexos[d.id]) anexos[d.id] = anexos[d.id].filter((a) => !rem.includes(a.id));
        addEv(d.id, eventoLocal('Alteração salva no aparelho (aguardando envio)', null, op.criado));
      } else if (op.tipo === 'rpc' && op.fn === 'ocultar_pedido') {
        continue;
      } else if (op.tipo === 'rpc') {
        const id = op.args.p_id; const p = porId[id]; if (!p) continue;
        p._pendente = true;
        if (op.fn === 'decidir_coordenador') {
          p.etapa = op.args.p_aprovar ? 'analista' : 'negado'; if (!op.args.p_aprovar) { p.negado_por = 'Coordenador'; p.justificativa_negativa = op.args.p_justificativa; }
          addEv(id, eventoLocal(op.args.p_aprovar ? 'Aprovado pelo coordenador (aguardando envio)' : 'Negado pelo coordenador (aguardando envio)', op.args.p_justificativa, op.criado));
        } else if (op.fn === 'decidir_analista') {
          p.etapa = op.args.p_aprovar ? 'compras' : 'negado'; if (op.args.p_aprovar) p.status_compra = 'Pendente'; else { p.negado_por = 'Analista de Custo'; p.justificativa_negativa = op.args.p_justificativa; }
          addEv(id, eventoLocal(op.args.p_aprovar ? 'Aprovado pelo analista (aguardando envio)' : 'Negado pelo analista (aguardando envio)', op.args.p_justificativa, op.criado));
        } else if (op.fn === 'atualizar_compra') {
          if (op.args.p_status) p.status_compra = op.args.p_status;
          addEv(id, eventoLocal('Compras: ' + (op.args.p_status || 'observação') + ' (aguardando envio)', op.args.p_observacao, op.criado));
        } else if (op.fn === 'confirmar_recebimento') {
          p.etapa = 'recebido'; p.status_compra = 'Finalizado'; p.recebido_em = op.criado;
          addEv(id, eventoLocal('Recebimento confirmado (aguardando envio)', op.args.p_observacao, op.criado));
        }
      } else if (op.tipo === 'upload') {
        (anexos[op.pedido_id] = anexos[op.pedido_id] || []).push({ id: op.anexo_id, pedido_id: op.pedido_id, tipo: op.categoria, nome: op.nome, mime: op.mime, _blob: op.blob, _local: true });
      }
    }
    return { pedidos: excluidos.size ? pedidos.filter((p) => !excluidos.has(p.id)) : pedidos, eventos, anexos };
  }

  // ---------- Ações ----------
  async function criarPedido(dados, arquivos) {
    const id = uuid();
    const p = Object.assign({ id }, dados);
    await outbox.add({ tipo: 'rpc', fn: 'criar_pedido', args: { p }, rotulo: 'enviar a solicitação', criado: new Date().toISOString(), perfil_id: S.perfil.id });
    for (const a of arquivos) {
      await outbox.add({ tipo: 'upload', pedido_id: id, anexo_id: uuid(), categoria: a.categoria, nome: a.nome, mime: a.mime, blob: a.blob, rotulo: 'enviar o anexo ' + a.nome, criado: new Date().toISOString(), perfil_id: S.perfil.id });
    }
    S.pendentes = await outbox.all();
    avisar('fila');
    const falhas = await sincronizar();
    const ainda = (await outbox.all()).some((o) => o.tipo === 'rpc' && o.args && o.args.p && o.args.p.id === id);
    return { id, offline: ainda, falhas: Array.isArray(falhas) ? falhas : [] };
  }
  async function editarPedido(id, dados, arquivos, removidos) {
    const grupo = uuid(); const agora = new Date().toISOString();
    const p = Object.assign({}, dados, { id, remover_anexos: removidos || [] });
    await outbox.add({ tipo: 'rpc', fn: 'editar_pedido', args: { p }, grupo, rotulo: 'salvar a alteração do pedido', criado: agora, perfil_id: S.perfil.id });
    for (const a of arquivos) {
      await outbox.add({ tipo: 'upload', pedido_id: id, anexo_id: uuid(), grupo, categoria: a.categoria, nome: a.nome, mime: a.mime, blob: a.blob, rotulo: 'enviar o anexo ' + a.nome, criado: agora, perfil_id: S.perfil.id });
    }
    S.pendentes = await outbox.all();
    avisar('fila');
    const falhas = await sincronizar();
    const ainda = (await outbox.all()).some((o) => o.grupo === grupo && o.tipo === 'rpc');
    return { offline: ainda, falhas: Array.isArray(falhas) ? falhas : [] };
  }
  // apaga o pedido de vez (só o solicitante, antes de o Compras finalizar)
  async function excluirPedido(p) {
    if (p._local) {
      // ainda não saiu do aparelho: basta tirar da fila
      for (const o of await outbox.all()) {
        const alvo = o.pedido_id || (o.args && ((o.args.p && o.args.p.id) || o.args.p_id));
        if (alvo === p.id) await outbox.del(o.seq);
      }
      S.pendentes = await outbox.all(); avisar('fila'); avisar('dados');
      return [];
    }
    const caminhos = (S.anexos[p.id] || []).map((a) => a.caminho).filter(Boolean);
    return enfileirar({ tipo: 'excluir_pedido', pedido_id: p.id, caminhos, rotulo: 'apagar o pedido' });
  }
  // apaga a solicitação só da tela de quem fez (o pedido continua no banco); ocultar=false traz de volta
  async function ocultarPedido(id, ocultar) {
    ocultar = ocultar !== false;
    const set = new Set(S.ocultos); if (ocultar) set.add(id); else set.delete(id);
    S.ocultos = [...set]; await salvarCache(); avisar('dados');
    return enfileirar({ tipo: 'rpc', fn: 'ocultar_pedido', args: { p_id: id, p_ocultar: ocultar }, rotulo: ocultar ? 'apagar o pedido da tela' : 'trazer o pedido de volta' });
  }
  async function apagarNotificacoes(ids) {
    if (!ids.length) return;
    S.notifs = S.notifs.filter((n) => !ids.includes(n.id));
    await salvarCache(); avisar('dados');
    return enfileirar({ tipo: 'apagar_notif', ids, rotulo: ids.length > 1 ? 'apagar as notificações' : 'apagar a notificação' });
  }
  const acao = (fn, args, rotulo) => enfileirar({ tipo: 'rpc', fn, args, rotulo });
  const decidirCoordenador = (id, aprovar, just) => acao('decidir_coordenador', { p_id: id, p_aprovar: aprovar, p_justificativa: just || null }, aprovar ? 'aprovar o pedido' : 'negar o pedido');
  const decidirAnalista = (id, aprovar, just) => acao('decidir_analista', { p_id: id, p_aprovar: aprovar, p_justificativa: just || null }, aprovar ? 'aprovar o pedido' : 'negar o pedido');
  const atualizarCompra = (id, status, obs) => acao('atualizar_compra', { p_id: id, p_status: status || null, p_observacao: obs || null }, 'atualizar a compra');
  const confirmarRecebimento = (id, obs) => acao('confirmar_recebimento', { p_id: id, p_observacao: obs || null }, 'confirmar o recebimento');

  async function marcarLidas(ids) {
    if (!ids.length) return;
    S.notifs = S.notifs.map((n) => (ids.includes(n.id) ? Object.assign({}, n, { lida: true }) : n));
    await salvarCache(); avisar('dados');
    if (!navigator.onLine) return;
    try { await cliente().from('notificacoes').update({ lida: true }).in('id', ids); } catch (_) {}
  }
  async function salvarWhatsapp(tel, apikey, ativo) {
    await rpc('salvar_whatsapp', { p_telefone: tel, p_apikey: apikey, p_ativo: ativo });
    await atualizar();
  }
  async function alterarSenha(atual, nova) { await rpc('alterar_senha', { p_atual: atual, p_nova: nova }); }

  // ---------- Foto de perfil ----------
  async function salvarFoto(blob) {
    const sb = cliente();
    const caminho = S.perfil.id + '/foto-' + Date.now() + '.jpg';
    const up = await sb.storage.from('avatares').upload(caminho, blob, { contentType: 'image/jpeg', upsert: false });
    if (up.error) throw new AppError(up.error);
    const url = sb.storage.from('avatares').getPublicUrl(caminho).data.publicUrl;
    await rpc('salvar_foto', { p_url: url });
    await mudarFotoLocal(url);
  }
  async function removerFoto() { await rpc('salvar_foto', { p_url: null }); await mudarFotoLocal(null); }
  async function mudarFotoLocal(url) {
    S.perfil = Object.assign({}, S.perfil, { foto_url: url });
    if (S.perfis[S.perfil.id]) S.perfis[S.perfil.id] = Object.assign({}, S.perfis[S.perfil.id], { foto_url: url });
    await kv.set('perfil', S.perfil); await salvarCache(); avisar('dados');
  }

  // ---------- Recuperação de senha ----------
  async function solicitarCodigo(usuario) { await garantirSessao(); return rpc('solicitar_codigo_senha', { p_usuario: usuario }); }
  async function redefinirComCodigo(usuario, codigo, nova) { await garantirSessao(); return rpc('redefinir_com_codigo', { p_usuario: usuario, p_codigo: codigo, p_nova: nova }); }
  const coordRedefinirSenha = (perfilId) => rpc('coordenador_redefinir_senha', { p_perfil: perfilId });
  async function precisaTrocarSenha() { try { return !!(await rpc('precisa_trocar_senha')); } catch (_) { return false; } }

  async function linkAnexo(a) {
    if (a._blob) return URL.createObjectURL(a._blob);
    if (!navigator.onLine) return null;
    const cache = linkAnexo.cache || (linkAnexo.cache = {});
    const c = cache[a.caminho];
    if (c && c.ate > Date.now()) return c.url;
    const { data, error } = await cliente().storage.from('anexos').createSignedUrl(a.caminho, 3600);
    if (error) return null;
    cache[a.caminho] = { url: data.signedUrl, ate: Date.now() + 3500 * 1000 };
    return data.signedUrl;
  }

  async function salvarEquipe(nome, tipo) {
    const { error } = await cliente().from('equipes').insert({ cdc: S.perfil.cdc, nome: nome.trim().toUpperCase(), tipo });
    if (error) throw new AppError(error.code === '23505' ? new Error('Essa equipe já existe.') : error);
    await atualizar();
  }
  async function removerEquipe(id) {
    const { error } = await cliente().from('equipes').delete().eq('id', id);
    if (error) throw new AppError(error);
    await atualizar();
  }

  // ---------- Conexão ----------
  window.addEventListener('online', () => { S.online = true; avisar('rede'); sincronizar(); iniciarTempoReal(); });
  window.addEventListener('offline', () => { S.online = false; avisar('rede'); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.perfil) { sincronizar(); } });

  window.Store = {
    S, lerConfig, cliente, garantirSessao, entrar, cadastrar, sair, restaurar, validarSessaoOnline,
    atualizar, sincronizar, iniciarTempoReal, pararTempoReal, visao, criarPedido, editarPedido, ocultarPedido, excluirPedido, apagarNotificacoes,
    decidirCoordenador, decidirAnalista, atualizarCompra, confirmarRecebimento,
    marcarLidas, salvarWhatsapp, alterarSenha, linkAnexo, salvarEquipe, removerEquipe,
    salvarFoto, removerFoto, solicitarCodigo, redefinirComCodigo, coordRedefinirSenha, precisaTrocarSenha,
    ouvir: (fn) => { S.ouvintes.add(fn); return () => S.ouvintes.delete(fn); },
    AppError, uuid,
  };
})();
