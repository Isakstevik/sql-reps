/* SQL Reps — app */
(function () {
  'use strict';

  const PGLITE_URL = 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.2.17/dist/index.js';
  const DATA = window.SQLREPS_DATA;
  const EX = window.SQLREPS_EXERCISES;
  const TOPICS = window.SQLREPS_TOPICS;
  const EXMAP = Object.fromEntries(EX.map((e) => [e.id, e]));
  const DSMAP = Object.fromEntries(DATA.datasets.map((d) => [d.key, d]));
  const TOPICMAP = Object.fromEntries(TOPICS.map((t) => [t.key, t]));
  const LEVELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const topicIdx = Object.fromEntries(TOPICS.map((t, i) => [t.key, i]));
  const PATH = EX.slice().sort((a, b) => topicIdx[a.topic] - topicIdx[b.topic] || a.level - b.level || a._i - b._i);
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const MOD = isMac ? '⌘' : 'Ctrl+';

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------- storage ----------------
  const KEY = 'sqlreps.v1';
  function freshStore() {
    return { v: 1, ex: {}, days: {}, goal: 10, mode: 'path', filters: { topics: [], levels: [], status: 'all' }, cur: {}, theme: null };
  }
  function loadStore() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 1) return Object.assign(freshStore(), s);
    } catch (e) { /* ignore */ }
    return freshStore();
  }
  let S = loadStore();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const dayKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const rec = (id) => S.ex[id] || (S.ex[id] = { a: 0, c: 0, solved: false, review: false, last: null, best: null, t: 0 });
  const peek = (id) => S.ex[id] || { a: 0, c: 0, solved: false, review: false, last: null, best: null, t: 0 };

  // ---------------- state ----------------
  const st = { id: null, variant: 0, hints: 0, revealed: false, done: false, start: 0, elapsed: 0, recent: [], dsShown: null, solArm: 0 };
  let editor;

  // ---------------- database ----------------
  let db;
  let queue = Promise.resolve();
  function withDb(fn) { const p = queue.then(fn, fn); queue = p.catch(() => {}); return p; }
  function toResult(res) {
    let r = null;
    for (const x of res) if (x.fields && x.fields.length) r = x;
    if (!r) return { fields: [], rows: [], noRows: true };
    const fields = r.fields.map((f) => f.name);
    const rows = r.rows.map((row) => (Array.isArray(row) ? row : fields.map((f) => row[f])));
    return { fields, rows };
  }
  function run(sql, schema) {
    return withDb(async () => {
      await db.exec(`SET search_path TO ${schema}, public`);
      await db.exec('BEGIN');
      const t0 = performance.now();
      try {
        const res = await db.exec(sql, { rowMode: 'array' });
        const out = toResult(res);
        out.ms = performance.now() - t0;
        return out;
      } finally {
        try { await db.exec('ROLLBACK'); } catch (e) { /* ignore */ }
      }
    });
  }

  // ---------------- exercise helpers ----------------
  const vars = (ex, i) => (ex.vars ? ex.vars[i] : null);
  const fill = (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)) : s);
  const cur = () => EXMAP[st.id];
  const expectedCache = new Map();
  async function expected(ex, vi) {
    const k = ex.id + '#' + vi;
    if (!expectedCache.has(k)) expectedCache.set(k, await run(fill(ex.solution, vars(ex, vi)), ex.ds));
    return expectedCache.get(k);
  }

  // ---------------- comparison ----------------
  function numStr(n) { const r = Math.round((n + Math.sign(n) * 1e-9) * 100) / 100; return Object.is(r, -0) ? '0' : String(r); }
  function norm(v) {
    if (v === null || v === undefined) return '∅';
    if (typeof v === 'bigint') return numStr(Number(v));
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return numStr(v);
    if (v instanceof Date) return isNaN(v) ? 'Invalid' : v.toISOString().replace(/T00:00:00(\.000)?Z$/, '');
    if (typeof v === 'object') return JSON.stringify(v);
    const s = String(v).trim();
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) return numStr(parseFloat(s));
    const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T]00:00:00(\.0+)?(\+00(:00)?|Z)?$/);
    if (m) return m[1];
    return s;
  }
  const rowKey = (r) => JSON.stringify(r);
  function bag(rows) { const m = new Map(); for (const r of rows) { const k = rowKey(r); m.set(k, (m.get(k) || 0) + 1); } return m; }
  function sameBag(a, b) {
    if (a.length !== b.length) return false;
    const m = bag(a);
    for (const r of b) { const k = rowKey(r); const c = m.get(k); if (!c) return false; m.set(k, c - 1); }
    return true;
  }
  const colVals = (rows, i) => rows.map((r) => r[i]).sort().join('\u0001');

  function tryReorder(E, U) {
    // match each expected column to a user column holding identical values
    const n = E[0] ? E[0].length : 0;
    if (!E.length) return null;
    const used = new Set(), map = [];
    for (let i = 0; i < n; i++) {
      const target = colVals(E, i);
      let found = -1;
      for (let j = 0; j < n; j++) if (!used.has(j) && colVals(U, j) === target) { found = j; break; }
      if (found < 0) return null;
      used.add(found); map.push(found);
    }
    if (map.every((j, i) => j === i)) return null;
    return U.map((r) => map.map((j) => r[j]));
  }

  function compare(exp, got, ordered) {
    const out = { ok: false, msgs: [], extra: new Set(), missing: new Set(), reordered: false };
    const E = exp.rows.map((r) => r.map(norm));
    let U = got.rows.map((r) => r.map(norm));
    const ec = exp.fields.length, uc = got.fields.length;
    if (got.noRows) { out.msgs.push('Your query did not return a result set. Write a SELECT.'); return out; }
    if (ec !== uc) {
      out.msgs.push(`Expected <b>${ec}</b> column${ec === 1 ? '' : 's'} (${exp.fields.map((f) => '<code>' + esc(f) + '</code>').join(', ')}), you returned <b>${uc}</b>.`);
      if (E.length !== U.length) out.msgs.push(`Expected <b>${E.length}</b> rows, you returned <b>${U.length}</b>.`);
      return out;
    }
    const check = (rows) => (ordered ? E.length === rows.length && E.every((r, i) => rowKey(r) === rowKey(rows[i])) : sameBag(E, rows));
    if (check(U)) { out.ok = true; return out; }
    if (sameBag(E, U) === false && E.length === U.length) {
      const re = tryReorder(E, U);
      if (re && check(re)) { out.ok = true; out.reordered = true; return out; }
      if (re) { U = re; out.reordered = true; }
    }
    // diagnose
    if (ordered && sameBag(E, U)) {
      out.msgs.push('Right rows, wrong order. Check your <code>ORDER BY</code> (including tie-breakers).');
      return out;
    }
    if (E.length !== U.length) out.msgs.push(`Expected <b>${E.length}</b> row${E.length === 1 ? '' : 's'}, you returned <b>${U.length}</b>.`);
    // multiset diff
    const m = bag(E);
    U.forEach((r, i) => { const k = rowKey(r); const c = m.get(k); if (c) m.set(k, c - 1); else out.extra.add(i); });
    const left = new Map(m);
    E.forEach((r, i) => { const k = rowKey(r); const c = left.get(k); if (c) { out.missing.add(i); left.set(k, c - 1); } });
    if (out.extra.size) out.msgs.push(`<b>${out.extra.size}</b> of your rows ${out.extra.size === 1 ? 'is' : 'are'} not in the expected result.`);
    if (out.missing.size) out.msgs.push(`<b>${out.missing.size}</b> expected row${out.missing.size === 1 ? ' is' : 's are'} missing from yours.`);
    // per-column diagnosis
    if (E.length === U.length && E.length) {
      const bad = [];
      for (let i = 0; i < ec; i++) if (colVals(E, i) !== colVals(U, i)) bad.push(i);
      if (bad.length && bad.length < ec) {
        out.msgs.push('Column' + (bad.length > 1 ? 's ' : ' ') + bad.map((i) => `<code>${esc(got.fields[i])}</code>`).join(', ') + ' contain' + (bad.length > 1 ? '' : 's') + ' different values than expected.');
        const roundish = bad.every((i) => {
          const a = E.map((r) => r[i]).filter((x) => x !== '∅'), b = U.map((r) => r[i]).filter((x) => x !== '∅');
          if (!a.length || a.some((x) => isNaN(+x)) || b.some((x) => isNaN(+x))) return false;
          const sa = a.map(Number).sort((x, y) => x - y), sb = b.map(Number).sort((x, y) => x - y);
          if (sa.concat(sb).every((x) => Number.isInteger(x))) return false;
          return sa.length === sb.length && sa.every((x, k) => Math.abs(x - sb[k]) <= Math.max(1, Math.abs(x) * 0.01));
        });
        if (roundish) out.msgs.push('The numbers are close — check rounding or integer division (use <code>12.0</code> instead of <code>12</code>).');
      }
    }
    const uniq = new Set(U.map(rowKey)).size;
    if (uniq < U.length && new Set(E.map(rowKey)).size === E.length) out.msgs.push('Your result has duplicate rows. Is a JOIN multiplying rows, or do you need <code>DISTINCT</code>?');
    if (!U.length && E.length) out.msgs.push('Your query returned no rows. Check your WHERE conditions (text values are case-sensitive).');
    return out;
  }

  // ---------------- rendering helpers ----------------
  function isNumLike(v) { return typeof v === 'number' || typeof v === 'bigint' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v)); }
  function cell(v) {
    if (v === null || v === undefined) return '<td class="null">NULL</td>';
    if (v instanceof Date) return `<td>${esc(v.toISOString().slice(0, 10))}</td>`;
    if (typeof v === 'object') return `<td>${esc(JSON.stringify(v))}</td>`;
    return `<td${isNumLike(v) ? ' class="num"' : ''}>${esc(v)}</td>`;
  }
  function table(res, opts) {
    opts = opts || {};
    const max = opts.max || 200;
    const rows = res.rows.slice(0, max);
    let h = '<div class="tbl-wrap"><table class="grid"><thead><tr><th></th>' + res.fields.map((f) => `<th>${esc(f)}</th>`).join('') + '</tr></thead><tbody>';
    rows.forEach((r, i) => {
      const cls = opts.mark && opts.mark.has(i) ? ` class="${opts.markClass}"` : '';
      h += `<tr${cls}><td class="rn">${i + 1}</td>` + r.map(cell).join('') + '</tr>';
    });
    if (!rows.length) h += `<tr><td></td><td colspan="${Math.max(res.fields.length, 1)}" class="null">no rows</td></tr>`;
    h += '</tbody></table></div>';
    if (res.rows.length > max) h += `<div class="result-meta">Showing first ${max} of ${res.rows.length} rows.</div>`;
    return h;
  }
  const fmtTime = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  // ---------------- top bar & stats ----------------
  function streak() {
    let n = 0; const d = new Date();
    if (!S.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (S.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function solvedCount() { return EX.filter((e) => peek(e.id).solved).length; }
  function renderStats() {
    const t = S.days[today()] || 0, g = S.goal || 10;
    const p = Math.min(1, t / g), C = 2 * Math.PI * 6;
    $('#stat-today').innerHTML = `<svg class="ring" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="var(--border)" stroke-width="2.4"/><circle cx="8" cy="8" r="6" fill="none" stroke="${p >= 1 ? 'var(--ok)' : 'var(--accent)'}" stroke-width="2.4" stroke-dasharray="${C * p} ${C}" transform="rotate(-90 8 8)" stroke-linecap="round"/></svg>Today <b>${t}/${g}</b>`;
    const s = streak();
    $('#stat-streak').innerHTML = `Streak <b>${s}d</b>`;
    $('#stat-solved').innerHTML = `Solved <b>${solvedCount()}/${EX.length}</b>`;
  }
  function renderMode() {
    document.querySelectorAll('#mode-seg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === S.mode));
    $('#filters').hidden = S.mode !== 'practice';
    if (S.mode === 'practice') renderFilters();
  }

  // ---------------- practice filters ----------------
  function statusOk(e, s) {
    const r = peek(e.id);
    if (s === 'unsolved') return !r.solved;
    if (s === 'review') return r.review;
    return true;
  }
  function pool() {
    const f = S.filters;
    return EX.filter((e) => (!f.topics.length || f.topics.includes(e.topic)) && (!f.levels.length || f.levels.includes(e.level)) && statusOk(e, f.status));
  }
  function renderFilters() {
    const f = S.filters;
    const reviewN = EX.filter((e) => peek(e.id).review).length;
    $('#filters').innerHTML =
      `<div class="fgroup"><span class="flabel">Topic</span>${TOPICS.map((t) => `<button class="chip${f.topics.includes(t.key) ? ' on' : ''}" data-topic="${t.key}">${esc(t.name)}</button>`).join('')}</div>` +
      `<div class="fgroup"><span class="flabel">Level</span>${[1, 2, 3].map((l) => `<button class="chip${f.levels.includes(l) ? ' on' : ''}" data-level="${l}">${LEVELS[l]}</button>`).join('')}</div>` +
      `<div class="fgroup"><span class="flabel">Show</span>${[['all', 'All'], ['unsolved', 'Unsolved'], ['review', `Needs review (${reviewN})`]].map(([k, n]) => `<button class="chip${f.status === k ? ' on' : ''}" data-status="${k}">${n}</button>`).join('')}</div>` +
      `<span class="spacer"></span><span class="pool-count">${pool().length} exercises in pool</span>`;
  }
  function onFilterClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const f = S.filters;
    if (b.dataset.topic) { const k = b.dataset.topic; f.topics = f.topics.includes(k) ? f.topics.filter((x) => x !== k) : f.topics.concat(k); }
    else if (b.dataset.level) { const l = +b.dataset.level; f.levels = f.levels.includes(l) ? f.levels.filter((x) => x !== l) : f.levels.concat(l); }
    else if (b.dataset.status) f.status = b.dataset.status;
    else return;
    save(); renderFilters();
    const p = pool();
    if (p.length && !p.some((x) => x.id === st.id)) next();
    else if (!p.length) renderExercise();
  }

  // ---------------- navigation ----------------
  function pickPractice() {
    const p = pool();
    if (!p.length) return null;
    let cand = p.filter((e) => e.id !== st.id && !st.recent.includes(e.id));
    if (!cand.length) cand = p.filter((e) => e.id !== st.id);
    if (!cand.length) cand = p;
    const now = Date.now();
    const w = cand.map((e) => {
      const r = peek(e.id);
      let x = r.review ? 4 : !r.solved ? 3 : 1;
      if (r.t && now - r.t < 3600e3) x *= 0.3;
      return x;
    });
    let tot = w.reduce((a, b) => a + b, 0), x = Math.random() * tot;
    for (let i = 0; i < cand.length; i++) { x -= w[i]; if (x < 0) return cand[i].id; }
    return cand[cand.length - 1].id;
  }
  function next() {
    if (S.mode === 'path') {
      const i = PATH.findIndex((e) => e.id === st.id);
      load(PATH[(i + 1) % PATH.length].id);
    } else {
      const id = pickPractice();
      if (id) load(id); else renderExercise();
    }
  }
  function prev() {
    if (S.mode !== 'path') return;
    const i = PATH.findIndex((e) => e.id === st.id);
    load(PATH[(i - 1 + PATH.length) % PATH.length].id);
  }
  function retry() { load(st.id, { retry: true }); }

  function load(id, opts) {
    opts = opts || {};
    const ex = EXMAP[id]; if (!ex) return;
    if (st.id && st.id !== id) { st.recent.unshift(st.id); st.recent = st.recent.slice(0, 5); }
    let v = 0;
    if (ex.vars) {
      const n = ex.vars.length;
      v = Math.floor(Math.random() * n);
      if (opts.retry && n > 1 && v === st.variant) v = (v + 1 + Math.floor(Math.random() * (n - 1))) % n;
    }
    Object.assign(st, { id, variant: v, hints: 0, revealed: false, done: false, start: Date.now(), elapsed: 0, solArm: 0 });
    S.cur[S.mode] = id; save();
    renderExercise();
    renderSchema(ex.ds);
    $('#output').innerHTML = '';
    editor.setValue('');
    editor.clearHistory();
    setTimeout(() => editor.focus(), 0);
    if (!$('#drawer').hidden) renderDrawer();
  }

  // ---------------- exercise view ----------------
  function renderExercise() {
    const ex = cur();
    const box = $('#exercise');
    if (S.mode === 'practice' && !pool().length) {
      box.innerHTML = '<div class="empty">No exercises match these filters. Clear a filter to keep practising.</div>';
      return;
    }
    if (!ex) { box.innerHTML = ''; return; }
    const v = vars(ex, st.variant);
    const r = peek(ex.id);
    const pos = S.mode === 'path' ? `<span>${PATH.findIndex((e) => e.id === ex.id) + 1} / ${PATH.length}</span>` : '';
    const status = r.solved ? `<span class="status-dot solved"></span><span>Solved · ${r.c} rep${r.c === 1 ? '' : 's'}</span>` : r.review ? '<span class="status-dot review"></span><span>Needs review</span>' : '';
    const hints = ex.hints.slice(0, st.hints).map((h, i) => `<li><span>Hint ${i + 1}</span>${esc(h)}</li>`).join('');
    const sol = st.revealed ? `<div class="solution"><div class="sol-head"><span>Solution</span><span>Try typing it yourself rather than copying.</span></div><pre>${esc(formatSQL(fill(ex.solution, v)))}</pre></div>` : '';
    box.innerHTML = `
      <div class="meta">
        <span>${esc(TOPICMAP[ex.topic].name)}</span>
        <span class="pill lvl-${ex.level}">${LEVELS[ex.level]}</span>
        <span class="pill">${esc(DSMAP[ex.ds].title)}</span>
        ${ex.ordered ? '<span class="pill" title="Row order is checked">Order matters</span>' : ''}
        ${ex.vars ? `<span class="pill" title="Retry gives new values">${ex.vars.length} variants</span>` : ''}
        ${pos}${status}
      </div>
      <h1>${esc(ex.title)}</h1>
      <p class="prompt">${fill(ex.prompt, v)}</p>
      ${hints ? `<ul class="hints">${hints}</ul>` : ''}
      ${sol}`;
    const hb = $('#btn-hint');
    hb.textContent = st.hints >= ex.hints.length ? 'No more hints' : `Hint ${st.hints + 1}/${ex.hints.length}`;
    hb.disabled = st.hints >= ex.hints.length;
    $('#btn-solution').textContent = st.revealed ? 'Solution shown' : 'Solution';
    $('#btn-solution').disabled = st.revealed;
  }

  function formatSQL(sql) {
    return sql
      .replace(/\s+(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|LEFT JOIN|JOIN|UNION ALL|UNION|INTERSECT|EXCEPT)\s+/g, '\n$1 ')
      .replace(/\),\s+(\w+) AS \(/g, '),\n$1 AS (')
      .replace(/\) SELECT /g, ')\nSELECT ');
  }

  // ---------------- schema panel ----------------
  function renderSchema(key) {
    const ds = DSMAP[key];
    if (st.dsShown === key) return;
    st.dsShown = key;
    const el = $('#schema');
    el.innerHTML = `
      <div class="ds-head"><h2>${esc(ds.title)} dataset</h2><p>${esc(ds.desc)}</p></div>
      ${ds.note ? `<div class="ds-note">${esc(ds.note)}</div>` : ''}
      ${ds.tables.map((t) => `
        <div class="tcard open" data-t="${t.name}">
          <div class="tcard-head"><span class="tname">${t.name}</span><span class="tcount">${ds.rows[t.name].length.toLocaleString('en-US')} rows</span>
            <svg class="chev" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg></div>
          <div class="cols">
            ${t.desc ? `<div class="tdesc">${esc(t.desc)}</div>` : ''}
            ${t.cols.map((c) => `<div class="col"><span class="cname" data-ins="${c.n}" title="Insert into editor">${c.n}</span>${c.pk ? '<span class="badge pk">PK</span>' : ''}${c.fk ? `<span class="badge fk">→ ${c.fk}</span>` : ''}<span class="ctype">${c.t}</span></div>`).join('')}
            <button class="btn sm ghost preview-btn" data-preview="${t.name}">Preview rows</button>
            <div class="preview"></div>
          </div>
        </div>`).join('')}`;
    editor.setOption('hintOptions', Object.assign({}, editor.getOption('hintOptions'), { tables: Object.fromEntries(ds.tables.map((t) => [t.name, t.cols.map((c) => c.n)])) }));
  }
  async function onSchemaClick(e) {
    const ins = e.target.closest('[data-ins]');
    if (ins) { editor.replaceSelection(ins.dataset.ins); editor.focus(); return; }
    const pv = e.target.closest('[data-preview]');
    if (pv) {
      const box = pv.nextElementSibling;
      if (box.innerHTML) { box.innerHTML = ''; pv.textContent = 'Preview rows'; return; }
      try {
        const res = await run(`SELECT * FROM ${pv.dataset.preview} LIMIT 8`, st.dsShown);
        box.innerHTML = table(res);
        pv.textContent = 'Hide preview';
      } catch (err) { box.innerHTML = `<div class="err">${esc(err.message)}</div>`; }
      return;
    }
    const head = e.target.closest('.tcard-head');
    if (head) head.parentElement.classList.toggle('open');
  }

  // ---------------- actions ----------------
  function setOutput(html) { $('#output').innerHTML = html; }
  function errorBanner(err) {
    return `<div class="banner bad"><div class="b-body"><div class="b-title">SQL error</div><div class="err">${esc(err.message || String(err))}</div></div></div>`;
  }
  async function doRun() {
    const ex = cur(); if (!ex) return;
    const sql = editor.getValue().trim();
    if (!sql) return;
    try {
      const res = await run(sql, ex.ds);
      if (res.noRows) { setOutput('<div class="banner info"><div class="b-body">Statement ran, but returned no result set. (Changes are rolled back automatically.)</div></div>'); return; }
      setOutput(`<div class="result-meta">${res.rows.length} row${res.rows.length === 1 ? '' : 's'} · ${res.ms.toFixed(0)} ms · Run only shows your result — press Submit to check it.</div>${table(res)}`);
    } catch (err) { setOutput(errorBanner(err)); }
  }

  async function doSubmit() {
    const ex = cur(); if (!ex) return;
    const sql = editor.getValue().trim();
    if (!sql) return;
    if (st.done) { flashDone(); return; }
    let exp;
    try { exp = await expected(ex, st.variant); } catch (err) { setOutput(errorBanner({ message: 'Internal error in reference solution: ' + err.message })); return; }
    const r = rec(ex.id);
    let got;
    try { got = await run(sql, ex.ds); } catch (err) {
      r.a++; r.last = 'fail'; r.review = true; r.t = Date.now(); save(); renderStats();
      setOutput(errorBanner(err) + hintNudge());
      return;
    }
    const cmp = compare(exp, got, !!ex.ordered);
    r.a++; r.t = Date.now();
    if (cmp.ok) {
      const secs = (Date.now() - st.start) / 1000;
      st.done = true; st.elapsed = secs;
      r.c++; r.last = 'pass';
      if (!st.revealed) { r.solved = true; r.review = false; if (!r.best || secs < r.best) r.best = secs; }
      else r.review = true;
      S.days[today()] = (S.days[today()] || 0) + 1;
      save(); renderStats(); renderExercise(); if (S.mode === 'practice') renderFilters();
      const g = S.goal || 10, t = S.days[today()];
      const goalMsg = t === g ? ' · Daily goal reached!' : '';
      const best = r.best ? ` · best ${fmtTime(r.best)}` : '';
      setOutput(`
        <div class="banner ok">
          <div class="b-body"><div class="b-title">Correct</div>
            <div>Solved in ${fmtTime(secs)}${best} · rep #${r.c}${goalMsg}${st.revealed ? ' · solution was shown, so it stays in your review list' : ''}${cmp.reordered ? ' · (columns in a different order — accepted)' : ''}</div></div>
          <div class="b-actions">
            <button class="btn" id="b-retry">${ex.vars && ex.vars.length > 1 ? 'Retry, new values' : 'Retry'} <kbd>R</kbd></button>
            <button class="btn primary" id="b-next">Next <kbd>N</kbd></button>
          </div>
        </div>
        ${table(got)}`);
      $('#b-retry').onclick = retry; $('#b-next').onclick = next;
      editor.getInputField().blur();
      $('#b-next').focus();
    } else {
      r.last = 'fail'; r.review = true;
      save(); renderStats();
      const msgs = cmp.msgs.length ? cmp.msgs : ['The values do not match the expected result.'];
      setOutput(`
        <div class="banner bad"><div class="b-body"><div class="b-title">Not quite</div><ul>${msgs.map((m) => `<li>${m}</li>`).join('')}</ul>${hintNudge()}</div></div>
        ${cmp.extra.size || cmp.missing.size ? '<div class="legend"><span><i style="background:var(--bad-weak)"></i>In yours, not expected</span><span><i style="background:var(--warn-weak)"></i>Expected, missing in yours</span></div>' : ''}
        <div class="cmp">
          <div><h4>Your result · ${got.rows.length} rows</h4>${table(got, { mark: cmp.extra, markClass: 'extra', max: 100 })}</div>
          <div><h4>Expected · ${exp.rows.length} rows</h4>${table(exp, { mark: cmp.missing, markClass: 'missing', max: 100 })}</div>
        </div>`);
    }
  }
  function hintNudge() {
    const ex = cur(); const r = peek(ex.id);
    if (st.hints < ex.hints.length && r.a >= 1) return `<div style="margin-top:6px;font-size:13px;color:var(--muted)">Stuck? Press <b>Hint</b> (${ex.hints.length - st.hints} left).</div>`;
    return '';
  }
  function flashDone() {
    const b = $('#b-next'); if (b) { b.focus(); b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 250 }); }
  }
  function doHint() {
    const ex = cur(); if (!ex || st.hints >= ex.hints.length) return;
    st.hints++; renderExercise();
  }
  function doSolution() {
    const ex = cur(); if (!ex || st.revealed) return;
    const b = $('#btn-solution');
    if (!st.solArm) {
      st.solArm = 1; b.textContent = 'Click again to reveal';
      setTimeout(() => { if (!st.revealed) { st.solArm = 0; b.textContent = 'Solution'; } }, 3000);
      return;
    }
    st.revealed = true;
    const r = rec(ex.id); r.review = true; r.t = Date.now(); save();
    renderExercise();
  }

  // ---------------- drawer ----------------
  function renderDrawer() {
    const d = $('#drawer');
    let h = `<div class="drawer-head"><b>All exercises</b><button class="icon-btn" data-close aria-label="Close">✕</button></div>`;
    for (const t of TOPICS) {
      const list = PATH.filter((e) => e.topic === t.key);
      const solved = list.filter((e) => peek(e.id).solved).length;
      h += `<h3><span>${esc(t.name)}</span><span>${solved}/${list.length}</span></h3>`;
      for (const e of list) {
        const r = peek(e.id);
        h += `<div class="item${e.id === st.id ? ' cur' : ''}" data-go="${e.id}"><span class="status-dot${r.solved && !r.review ? ' solved' : r.review ? ' review' : ''}"></span>${esc(e.title)}<span class="lv">${LEVELS[e.level]}</span></div>`;
      }
    }
    d.innerHTML = h;
  }
  function openDrawer() { renderDrawer(); $('#drawer').hidden = false; $('#drawer-backdrop').hidden = false; const c = $('#drawer .item.cur'); if (c) c.scrollIntoView({ block: 'center' }); }
  function closeDrawer() { $('#drawer').hidden = true; $('#drawer-backdrop').hidden = true; }

  // ---------------- progress modal ----------------
  function openProgress() {
    const totalReps = Object.values(S.days).reduce((a, b) => a + b, 0);
    const g = S.goal || 10;
    const days = [];
    const d = new Date(); d.setDate(d.getDate() - 27);
    for (let i = 0; i < 28; i++) { days.push([dayKey(d), S.days[dayKey(d)] || 0]); d.setDate(d.getDate() + 1); }
    const maxD = Math.max(g, ...days.map((x) => x[1]));
    const review = EX.filter((e) => peek(e.id).review).length;
    const rows = TOPICS.map((t) => {
      const list = EX.filter((e) => e.topic === t.key);
      const s = list.filter((e) => peek(e.id).solved && !peek(e.id).review).length;
      const rv = list.filter((e) => peek(e.id).review).length;
      return `<div class="trow"><span>${esc(t.name)}</span><div class="track"><div class="s" style="width:${100 * s / list.length}%"></div><div class="r" style="width:${100 * rv / list.length}%"></div></div><span class="n">${s}/${list.length}</span></div>`;
    }).join('');
    $('#modal').innerHTML = `
      <h2>Progress <button class="icon-btn" data-close aria-label="Close">✕</button></h2>
      <div class="kpis">
        <div class="kpi"><div class="v">${solvedCount()}<span style="font-size:14px;color:var(--faint)">/${EX.length}</span></div><div class="l">Solved</div></div>
        <div class="kpi"><div class="v">${totalReps}</div><div class="l">Total reps</div></div>
        <div class="kpi"><div class="v">${streak()}</div><div class="l">Day streak</div></div>
        <div class="kpi"><div class="v">${review}</div><div class="l">Needs review</div></div>
      </div>
      <div class="goal-row">Daily goal <input id="goal-in" type="number" min="1" max="200" value="${g}"> correct submissions</div>
      <div class="section-title">Last 28 days</div>
      <div class="days">${days.map(([k, n]) => `<div class="${n === 0 ? 'zero' : n >= g ? 'goal' : ''}" style="height:${n ? Math.max(6, 100 * n / maxD) : 3}%" title="${k}: ${n} reps"></div>`).join('')}</div>
      <div class="section-title">By topic <span style="text-transform:none;letter-spacing:0;font-weight:400">— green solved, amber needs review</span></div>
      ${rows}
      <div class="modal-foot"><button class="btn ghost sm danger" id="reset-btn">Reset all progress</button>
        ${review ? `<button class="btn sm" id="review-btn">Practise the ${review} to review</button>` : ''}</div>`;
    $('#modal').hidden = false; $('#modal-backdrop').hidden = false;
    $('#goal-in').onchange = (e) => { const v = Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 10)); S.goal = v; save(); renderStats(); };
    $('#reset-btn').onclick = (e) => {
      if (e.target.dataset.armed) { const theme = S.theme; S = freshStore(); S.theme = theme; save(); closeModal(); renderStats(); renderMode(); load(PATH[0].id); return; }
      e.target.dataset.armed = '1'; e.target.textContent = 'Click again to erase everything';
    };
    const rb = $('#review-btn');
    if (rb) rb.onclick = () => { S.mode = 'practice'; S.filters = { topics: [], levels: [], status: 'review' }; save(); closeModal(); renderMode(); next(); };
  }
  function closeModal() { $('#modal').hidden = true; $('#modal-backdrop').hidden = true; }

  // ---------------- timer ----------------
  setInterval(() => {
    if (!st.id) return;
    const s = st.done ? st.elapsed : (Date.now() - st.start) / 1000;
    $('#timer').textContent = fmtTime(s);
  }, 500);

  // ---------------- theme ----------------
  function toggleTheme() {
    const curDark = document.documentElement.getAttribute('data-theme') ? document.documentElement.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    S.theme = curDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', S.theme);
    save();
  }

  // ---------------- wiring ----------------
  function wire() {
    editor = CodeMirror.fromTextArea($('#editor'), {
      mode: 'text/x-pgsql', lineNumbers: true, indentUnit: 2, tabSize: 2, lineWrapping: true,
      matchBrackets: true, autoCloseBrackets: true, placeholder: 'Write your SQL here…',
      extraKeys: {
        'Cmd-Enter': doRun, 'Ctrl-Enter': doRun,
        'Shift-Cmd-Enter': doSubmit, 'Shift-Ctrl-Enter': doSubmit,
        'Ctrl-Space': 'autocomplete',
        Tab: (cm) => { if (cm.somethingSelected()) cm.indentSelection('add'); else cm.replaceSelection('  '); },
        Esc: (cm) => cm.getInputField().blur()
      },
      hintOptions: {
        completeSingle: false,
        extraKeys: {
          Enter: (cm, handle) => { handle.close(); cm.execCommand('newlineAndIndent'); },
          Tab: (cm, handle) => handle.pick()
        }
      }
    });
    editor.on('inputRead', (cm, change) => {
      if (change.origin !== '+input') return;
      const ch = change.text[change.text.length - 1];
      if (/^[A-Za-z_.]$/.test(ch)) cm.showHint({ completeSingle: false });
    });
    document.querySelector('.mod-run').textContent = MOD + '↵';
    document.querySelector('.mod-submit').textContent = (isMac ? '⇧⌘' : 'Ctrl+Shift+') + '↵';

    $('#btn-run').onclick = doRun;
    $('#btn-submit').onclick = doSubmit;
    $('#btn-hint').onclick = doHint;
    $('#btn-solution').onclick = doSolution;
    $('#btn-list').onclick = openDrawer;
    $('#btn-progress').onclick = openProgress;
    $('#btn-theme').onclick = toggleTheme;
    $('#filters').addEventListener('click', onFilterClick);
    $('#schema').addEventListener('click', onSchemaClick);
    $('#drawer').addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) return closeDrawer();
      const it = e.target.closest('[data-go]');
      if (it) { closeDrawer(); load(it.dataset.go); }
    });
    $('#drawer-backdrop').onclick = closeDrawer;
    $('#modal-backdrop').onclick = closeModal;
    $('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
    document.querySelectorAll('#mode-seg button').forEach((b) => {
      b.onclick = () => {
        if (S.mode === b.dataset.mode) return;
        S.mode = b.dataset.mode; save(); renderMode();
        const saved = S.cur[S.mode];
        if (saved && EXMAP[saved] && (S.mode === 'path' || pool().some((e) => e.id === saved))) load(saved); else if (S.mode === 'path') load(PATH[0].id); else next();
      };
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeDrawer(); closeModal(); return; }
      const typing = editor.hasFocus() || /INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '');
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !editor.hasFocus()) { e.preventDefault(); (e.shiftKey ? doSubmit : doRun)(); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (st.done && (k === 'n' || (k === 'enter' && document.activeElement !== $('#b-retry')))) { e.preventDefault(); next(); }
      else if (st.done && k === 'r') { e.preventDefault(); retry(); }
      else if (k === 'l') { e.preventDefault(); $('#drawer').hidden ? openDrawer() : closeDrawer(); }
      else if (k === 'e' || k === '/') { e.preventDefault(); editor.focus(); }
    });
  }

  // ---------------- self test (dev) ----------------
  window.sqlrepsSelfTest = async function () {
    const report = [];
    for (const ex of EX) {
      const n = ex.vars ? ex.vars.length : 1;
      for (let i = 0; i < n; i++) {
        try {
          const r = await run(fill(ex.solution, vars(ex, i)), ex.ds);
          report.push({ id: ex.id, v: i, rows: r.rows.length, cols: r.fields.length });
        } catch (err) { report.push({ id: ex.id, v: i, error: err.message }); }
      }
    }
    return report;
  };

  // ---------------- boot ----------------
  async function boot() {
    const lt = $('#loading-text');
    try {
      wire();
      lt.textContent = 'Starting PostgreSQL…';
      const mod = await import(PGLITE_URL);
      const raw = (x) => x;
      db = new mod.PGlite({ parsers: { 20: raw, 1082: raw, 1114: raw, 1184: raw, 1700: raw, 1186: raw } });
      await db.waitReady;
      lt.textContent = 'Building practice datasets…';
      for (const ds of DATA.datasets) await db.exec(DATA.buildSQL(ds));
      $('#loading').hidden = true;
      renderStats(); renderMode();
      const saved = S.cur[S.mode];
      if (saved && EXMAP[saved]) load(saved);
      else if (S.mode === 'path') load(PATH[0].id);
      else next();
      editor.refresh();
    } catch (err) {
      console.error(err);
      $('#loading').classList.add('error');
      lt.textContent = 'Could not start the database: ' + (err && err.message ? err.message : err) + '. Check your internet connection (the engine loads from a CDN the first time) and reload.';
    }
  }
  boot();
})();
