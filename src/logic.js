/* ===== ЛОГИКА: деньги хранятся в целых копейках, даты — строки YYYY-MM-DD ===== */
const L = {};
(function () {
  const pad = (n) => String(n).padStart(2, '0');
  let _today = null;
  L.setToday = (d) => { _today = d; };
  L.today = () => {
    if (_today) return _today;
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  L.uid = () => 'i' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  /* ---------- даты ---------- */
  const daysIn = (m) => { const [y, mo] = m.split('-').map(Number); return new Date(Date.UTC(y, mo, 0)).getUTCDate(); };
  const monthOf = (d) => d.slice(0, 7);
  const monthStart = (m) => m + '-01';
  const monthEnd = (m) => m + '-' + pad(daysIn(m));
  const addMonths = (m, n) => { const [y, mo] = m.split('-').map(Number); const t = y * 12 + (mo - 1) + n; return Math.floor(t / 12) + '-' + pad((t % 12) + 1); };
  const dayOfMonth = (m, day) => m + '-' + pad(Math.min(Math.max(1, day | 0), daysIn(m)));
  const addDays = (d, n) => { const [y, m, dd] = d.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, dd + n)); return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate()); };
  const addMonthsDate = (anchor, k) => { const nm = addMonths(monthOf(anchor), k); return nm + '-' + pad(Math.min(+anchor.slice(8), daysIn(nm))); };
  Object.assign(L, { daysIn, monthOf, monthStart, monthEnd, addMonths, dayOfMonth, addDays });
  L.daysBetween = (a, b) => Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8))) / 86400000);
  L.validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && L.daysIn(s.slice(0, 7)) >= +s.slice(8) && +s.slice(8) >= 1 && +s.slice(5, 7) >= 1 && +s.slice(5, 7) <= 12;

  /* ---------- деньги ---------- */
  L.parseMoney = (s, allowNeg) => {
    if (typeof s === 'number') return Number.isFinite(s) ? Math.round(s * 100) : null;
    let t = String(s == null ? '' : s).replace(/[\s ₽$€₸₴]/g, '').replace(',', '.');
    let neg = false;
    if (allowNeg && t[0] === '-') { neg = true; t = t.slice(1); }
    if (!/^(\d+(\.\d*)?|\.\d+)$/.test(t)) return null;
    const [a, b = ''] = t.split('.');
    const v = (parseInt(a || '0', 10)) * 100 + parseInt((b + '00').slice(0, 2), 10);
    return neg ? -v : v;
  };
  L.pctOf = (base, pct) => Math.floor((base * Math.round((pct || 0) * 100)) / 10000);
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

  /* ---------- стартовые данные ---------- */
  L.PRIO = { oblig: 1, daily: 2, goals: 3, personal: 4 };
  L.defaultGroups = () => [
    { id: 'g_oblig', name: 'Обязательства', kind: 'oblig' },
    { id: 'g_daily', name: 'Повседневная жизнь', kind: 'daily' },
    { id: 'g_personal', name: 'Личные расходы', kind: 'personal' },
    { id: 'g_goals', name: 'Накопления и цели', kind: 'goals' },
  ];
  L.STARTER = {
    oblig: ['Аренда и коммунальные услуги', 'Кредиты и рассрочки', 'Подписки', 'Телефон и интернет', 'Страховки и регулярные платежи'],
    daily: ['Продукты', 'Дом и быт', 'Транспорт', 'Здоровье и аптека', 'Кафе и доставка'],
    personal: ['Одежда и покупки', 'Красота и уход', 'Хобби', 'Развлечения и отдых', 'Подарки'],
    goals: ['Накопления', 'Финансовая подушка', 'Отпуск и крупные покупки'],
  };
  L.newRule = (kind) => ({ type: 'manual', amount: 0, pct: 0, priority: L.PRIO[kind] || 3, min: 0, max: 0 });
  L.newCat = (groupId, name, kind) => ({ id: L.uid(), groupId, name, rule: L.newRule(kind) });
  L.starterCats = () => {
    const out = [];
    L.defaultGroups().forEach((g) => L.STARTER[g.kind].forEach((n) => out.push(L.newCat(g.id, n, g.kind))));
    return out;
  };
  L.newState = () => ({
    v: 1,
    settings: { name: '', gender: '', currency: 'RUB', cents: 'auto', startBalance: 0, trackFrom: monthOf(L.today()), reservePct: 0, reserveFixed: 0, setupDone: false, demo: false },
    groups: L.defaultGroups(),
    cats: L.starterCats(),
    bills: [],
    plan: [
      { id: L.uid(), name: 'Поступление 1', day: 1, amount: 0 },
      { id: L.uid(), name: 'Поступление 2', day: 15, amount: 0 },
      { id: L.uid(), name: 'Поступление 3', day: 25, amount: 0 },
    ],
    txs: [],
    allocs: [],
    quick: { map: {} },
  });

  L.normalize = (raw) => {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.cats) || !Array.isArray(raw.txs) || !Array.isArray(raw.allocs) || !Array.isArray(raw.bills) || !Array.isArray(raw.plan) || !Array.isArray(raw.groups)) return null;
    const base = L.newState();
    const S = JSON.parse(JSON.stringify(raw));
    S.v = 1;
    S.quick = S.quick && typeof S.quick.map === 'object' && S.quick.map ? S.quick : { map: {} };
    S.settings = Object.assign({}, base.settings, S.settings || {});
    const int = (x) => (Number.isFinite(x) ? Math.round(x) : 0);
    S.settings.startBalance = int(S.settings.startBalance);
    S.cats.forEach((c) => { c.rule = Object.assign(L.newRule('personal'), c.rule || {}); c.name = String(c.name || 'Категория'); });
    S.bills.forEach((b) => { b.span = b.span > 0 ? Math.min(366, b.span | 0) : 0; b.amount = int(b.amount); b.skipped = Array.isArray(b.skipped) ? b.skipped : []; b.period = b.period || 'month'; });
    S.plan.forEach((p) => { p.amount = int(p.amount); p.dayTo = p.dayTo > p.day ? p.dayTo | 0 : 0; });
    S.txs.forEach((t) => { t.amount = int(t.amount); });
    S.allocs.forEach((a) => { a.amount = int(a.amount); });
    return S;
  };

  /* ---------- базовые выборки ---------- */
  L.cat = (S, id) => S.cats.find((c) => c.id === id);
  L.group = (S, id) => S.groups.find((g) => g.id === id);
  L.catKind = (S, c) => { const g = c && L.group(S, c.groupId); return g ? g.kind : 'personal'; };

  L.cash = (S, m) => {
    const e = monthEnd(m);
    let c = S.settings.startBalance;
    for (const t of S.txs) if (t.date <= e) c += t.type === 'income' ? t.amount : -t.amount;
    return c;
  };

  L.env = (S, id, m) => {
    const s = monthStart(m), e = monthEnd(m);
    let carry = 0, alloc = 0, spent = 0;
    for (const a of S.allocs) if (a.catId === id) { if (a.month < m) carry += a.amount; else if (a.month === m) alloc += a.amount; }
    for (const t of S.txs) if (t.type === 'expense' && t.catId === id) { if (t.date < s) carry -= t.amount; else if (t.date <= e) spent += t.amount; }
    return { carry, alloc, spent, avail: carry + alloc, bal: carry + alloc - spent };
  };

  /* ---------- платежи ---------- */
  L.occ = (b, from, to) => {
    const out = [];
    if (!b.date) return out;
    const end = b.endDate && b.endDate < to ? b.endDate : to;
    for (let k = 0; k < 6000; k++) {
      const d = b.period === 'week' ? addDays(b.date, 7 * k)
        : b.period === 'year' ? addMonthsDate(b.date, 12 * k)
          : b.period === 'custom' ? addDays(b.date, Math.max(1, b.interval | 0) * k)
            : b.period === 'once' ? (k === 0 ? b.date : '9999-12-31')
              : addMonthsDate(b.date, k);
      if (d > end) break;
      if (d >= from) out.push(d);
    }
    return out;
  };

  // Платежи, относящиеся к месяцу m, и неоплаченные за прошлые месяцы (просрочка).
  L.billItems = (S, m) => {
    const e = monthEnd(m), s = monthStart(m), ts = monthStart(S.settings.trackFrom);
    const out = [];
    for (const b of S.bills) {
      for (const d of L.occ(b, ts, e)) {
        const tx = S.txs.find((t) => t.billId === b.id && t.dueDate === d) || null;
        const skipped = (b.skipped || []).includes(d);
        out.push({ bill: b, due: d, dueEnd: b.span > 0 ? addDays(d, b.span) : d, tx, skipped, paid: !!tx, paidAsOf: !!tx && tx.date <= e, amount: tx ? tx.amount : b.amount, inMonth: d >= s, overdue: d < s && !tx && !skipped });
      }
    }
    out.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.bill.name.localeCompare(b.bill.name)));
    return out;
  };

  // Какие неоплаченные платежи уже обеспечены деньгами в своём конверте.
  L.coverage = (S, m) => {
    const items = L.billItems(S, m).filter((i) => !i.paidAsOf && !i.skipped);
    const pool = {};
    let covered = 0, short = 0;
    for (const it of items) {
      const cid = it.bill.catId;
      if (!(cid in pool)) pool[cid] = L.cat(S, cid) ? Math.max(0, L.env(S, cid, m).bal) : 0;
      const cov = Math.min(pool[cid], it.amount);
      pool[cid] -= cov;
      it.covered = cov; it.short = it.amount - cov;
      covered += cov; short += it.short;
    }
    return { items, covered, short };
  };

  /* ---------- сводные показатели ---------- */
  L.totals = (S, m) => {
    const s = monthStart(m), e = monthEnd(m);
    const cash = L.cash(S, m);
    let pos = 0, over = 0;
    for (const c of S.cats) { const b = L.env(S, c.id, m).bal; if (b > 0) pos += b; else over -= b; }
    const cov = L.coverage(S, m);
    const unalloc = cash - pos;
    return {
      cash, pos, over, unalloc,
      reserved: cov.covered, unfunded: cov.short, pending: cov.items,
      safe: Math.max(0, unalloc - cov.short),
      incomeM: sum(S.txs.filter((t) => t.type === 'income' && t.date >= s && t.date <= e), (t) => t.amount),
      spentM: sum(S.txs.filter((t) => t.type === 'expense' && t.date >= s && t.date <= e), (t) => t.amount),
    };
  };

  L.slots = (S, m) =>
    S.plan.map((p) => {
      const tx = S.txs.find((t) => t.type === 'income' && t.slotId === p.id && t.slotMonth === m) || null;
      const date = dayOfMonth(m, p.day);
      return { slot: p, date, dateTo: p.dayTo > p.day ? dayOfMonth(m, p.dayTo) : date, planned: p.amount, tx, received: !!tx };
    }).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // Плановая сумма категории на месяц (по её правилу и платежам).
  L.planned = (S, c, m) => {
    const slots = S.plan;
    const planInc = sum(slots, (p) => p.amount);
    const billsSum = sum(L.billItems(S, m).filter((i) => i.inMonth && i.bill.catId === c.id && !i.skipped), (i) => i.amount);
    return Math.max(billsSum, L.ruleAmount(S, c, planInc, m));
  };
  L.ruleAmount = (S, c, planInc, m, depth) => {
    const r = c.rule;
    if (r.type === 'fixedMonth') return r.amount;
    if (r.type === 'fixedEach') return r.amount * S.plan.length;
    if (r.type === 'pctIncome') return L.pctOf(planInc, r.pct);
    if (r.type === 'pctRemainder' && !depth) {
      const ob = sum(S.cats.filter((x) => L.catKind(S, x) === 'oblig'), (x) => Math.max(sum(L.billItems(S, m).filter((i) => i.inMonth && i.bill.catId === x.id && !i.skipped), (i) => i.amount), L.ruleAmount(S, x, planInc, m, 1)));
      return L.pctOf(Math.max(0, planInc - ob), r.pct);
    }
    return 0;
  };

  /* ---------- автораспределение ---------- */
  // Возвращает предложение: сколько добавить в каждую категорию. Состояние не меняет.
  L.planAllocation = (S, m, opts) => {
    opts = opts || {};
    const s = monthStart(m), e = monthEnd(m);
    const A = opts.fresh ? S.allocs.filter((a) => !(a.kind === 'income' && a.month === m)) : S.allocs;
    const S2 = Object.assign({}, S, { allocs: A });
    const T = L.totals(S2, m);
    const incTxs = S.txs.filter((t) => t.type === 'income' && t.date >= s && t.date <= e);
    const incomeTotal = sum(incTxs, (t) => t.amount);
    const nPlan = incTxs.filter((t) => t.kind === 'plan').length;
    const t0 = L.today();
    const ref = opts.refDate || (t0 >= s && t0 <= e ? t0 : t0 < s ? s : e);
    const future = L.slots(S, m).filter((x) => !x.received && x.dateTo > ref);
    const horizon = future.length ? future[0].dateTo : addDays(e, 1);

    const cats = S.cats, idx = {};
    cats.forEach((c, i) => { idx[c.id] = i; });
    const add = {}, bal = {}, mA = {};
    cats.forEach((c) => {
      add[c.id] = 0;
      bal[c.id] = L.env(S2, c.id, m).bal;
      mA[c.id] = sum(A.filter((a) => a.catId === c.id && a.month === m && a.kind !== 'move'), (a) => a.amount);
    });
    let pool = Math.max(0, T.unalloc);
    const pool0 = pool;
    const prio = (cid) => (L.cat(S, cid) ? L.cat(S, cid).rule.priority : 1);
    const cov = L.coverage(S2, m);
    const urgent = cov.items.filter((i) => i.short > 0 && i.due < horizon);
    const deferred = cov.items.filter((i) => i.short > 0 && i.due >= horizon);
    const billNeed = {};
    urgent.forEach((i) => { billNeed[i.bill.catId] = (billNeed[i.bill.catId] || 0) + i.short; });
    const events = [], shortfalls = [], conflicts = [];

    const give = (catId, x, ev) => {
      if (x <= 0 || !(catId in add)) return 0;
      add[catId] += x; pool -= x; events.push(Object.assign({ catId, amount: x }, ev));
      return x;
    };
    const list = [];
    urgent.forEach((i) => list.push({ kind: 'bill', it: i, catId: i.bill.catId, pr: prio(i.bill.catId), due: i.due, need: i.short, given: 0 }));
    cats.filter((c) => c.rule.min > 0).forEach((c) => list.push({ kind: 'min', catId: c.id, pr: c.rule.priority, due: '~', need: 0, given: 0 }));
    list.sort((a, b) => a.pr - b.pr || (a.kind === b.kind ? 0 : a.kind === 'bill' ? -1 : 1) || (a.due < b.due ? -1 : a.due > b.due ? 1 : 0) || (idx[a.catId] ?? 0) - (idx[b.catId] ?? 0));

    let locked = false;
    for (let i = 0; i < list.length && !locked;) {
      const it = list[i];
      if (it.kind === 'bill') {
        const grp = [];
        let j = i;
        while (j < list.length && list[j].kind === 'bill' && list[j].pr === it.pr && list[j].due === it.due) { grp.push(list[j]); j++; }
        const total = sum(grp, (g) => g.need);
        const ev = (g) => ({ kind: 'bill', label: g.it.bill.name, due: g.it.due });
        if (grp.length > 1 && total > pool) {
          if (opts.conflictMode === 'proportional') {
            const p0 = pool;
            grp.forEach((g) => { g.given = give(g.catId, Math.floor((p0 * g.need) / total), ev(g)); });
          } else if (opts.conflictMode === 'order') {
            grp.slice().sort((a, b) => (idx[a.catId] ?? 0) - (idx[b.catId] ?? 0)).forEach((g) => { g.given = give(g.catId, Math.min(g.need, pool), ev(g)); });
          } else {
            conflicts.push({ priority: it.pr, due: it.due, total, pool, items: grp.map((g) => ({ catId: g.catId, label: g.it.bill.name, need: g.need })) });
            locked = true;
          }
        } else grp.forEach((g) => { g.given = give(g.catId, Math.min(g.need, pool), ev(g)); });
        grp.forEach((g) => { if (!locked && g.need > g.given) shortfalls.push({ catId: g.catId, label: g.it.bill.name, short: g.need - g.given, kind: 'bill', due: g.due }); });
        i = j;
      } else {
        const c = L.cat(S, it.catId);
        let need = Math.max(0, c.rule.min - (bal[c.id] + add[c.id]));
        if (c.rule.max > 0) need = Math.min(need, Math.max(0, c.rule.max - (bal[c.id] + add[c.id])));
        const g = give(c.id, Math.min(need, pool), { kind: 'min', label: 'Минимум' });
        if (need > g) shortfalls.push({ catId: c.id, label: c.name, short: need - g, kind: 'min' });
        i++;
      }
    }

    // Свободный резерв (оставляем нераспределённым)
    const keep = L.pctOf(incomeTotal, S.settings.reservePct) + (incomeTotal > 0 ? S.settings.reserveFixed || 0 : 0);
    if (!locked) {
      const wants = cats.filter((c) => c.rule.type !== 'manual').sort((a, b) => a.rule.priority - b.rule.priority || idx[a.id] - idx[b.id]);
      for (const c of wants) {
        const r = c.rule, measured = mA[c.id] + add[c.id];
        let target = 0, label = '';
        if (r.type === 'fixedMonth') { target = r.amount; label = 'Фикс. в месяц'; }
        else if (r.type === 'fixedEach') { target = r.amount * nPlan; label = 'Фикс. с поступления'; }
        else if (r.type === 'pctIncome') { target = L.pctOf(incomeTotal, r.pct); label = r.pct + '% от поступлений'; }
        else if (r.type === 'pctRemainder') {
          const ob = sum(cats.filter((x) => L.catKind(S, x) === 'oblig'), (x) => mA[x.id] + add[x.id]);
          target = L.pctOf(Math.max(0, incomeTotal - ob), r.pct); label = r.pct + '% от остатка';
        }
        let need = Math.max(0, target - measured);
        if (r.max > 0) need = Math.min(need, Math.max(0, r.max - (bal[c.id] + add[c.id])));
        const x = give(c.id, Math.min(need, Math.max(0, pool - keep)), { kind: 'want', label });
        if (need > x) shortfalls.push({ catId: c.id, label: c.name, short: need - x, kind: 'want' });
      }
    }
    const total = sum(Object.values(add), (v) => v);
    let surplus = 0;
    incTxs.forEach((t) => { if (t.kind === 'plan' && t.planned > 0 && t.amount > t.planned) surplus += t.amount - t.planned; });
    return { month: m, adds: add, total, pool0, left: T.unalloc - total, keep, events, shortfalls, deferred, conflicts, horizon, billNeed, incomeTotal, surplus, locked, unalloc: T.unalloc };
  };

  /* ---------- изменения состояния (мутируют S, возвращают {ok,error}) ---------- */
  L.applyAllocation = (S, m, adds, opts) => {
    opts = opts || {};
    const S2 = Object.assign({}, S, { allocs: opts.fresh ? S.allocs.filter((a) => !(a.kind === 'income' && a.month === m)) : S.allocs });
    const total = sum(Object.values(adds), (v) => Math.max(0, v));
    const free = L.totals(S2, m).unalloc;
    if (total > Math.max(0, free)) return { ok: false, error: 'Нельзя распределить больше свободных денег: доступно ' + Math.max(0, free) };
    if (opts.fresh) S.allocs = S2.allocs;
    const date = opts.date || L.today();
    for (const cid of Object.keys(adds)) if (adds[cid] > 0 && L.cat(S, cid)) S.allocs.push({ id: L.uid(), month: m, catId: cid, amount: adds[cid], date, kind: 'income', incomeId: opts.incomeId || null });
    return { ok: true, total };
  };
  L.topUp = (S, m, catId, amount, date) => {
    if (!(amount > 0)) return { ok: false, error: 'Введите сумму больше нуля' };
    const free = L.totals(S, m).unalloc;
    if (amount > free) return { ok: false, error: 'Свободных денег меньше: доступно ' + Math.max(0, free) };
    S.allocs.push({ id: L.uid(), month: m, catId, amount, date: date || L.today(), kind: 'manual' });
    return { ok: true };
  };
  L.release = (S, m, catId, amount, date) => {
    const b = L.env(S, catId, m).bal;
    if (!(amount > 0)) return { ok: false, error: 'Введите сумму больше нуля' };
    if (amount > b) return { ok: false, error: 'В конверте меньше: доступно ' + Math.max(0, b) };
    S.allocs.push({ id: L.uid(), month: m, catId, amount: -amount, date: date || L.today(), kind: 'manual' });
    return { ok: true };
  };
  L.move = (S, m, from, to, amount, date) => {
    if (!(amount > 0)) return { ok: false, error: 'Введите сумму больше нуля' };
    if (from === to) return { ok: false, error: 'Выберите другую категорию' };
    const b = L.env(S, from, m).bal;
    if (amount > b) return { ok: false, error: 'В категории только ' + Math.max(0, b) };
    const moveId = L.uid(), d = date || L.today();
    S.allocs.push({ id: L.uid(), month: m, catId: from, amount: -amount, date: d, kind: 'move', moveId });
    S.allocs.push({ id: L.uid(), month: m, catId: to, amount, date: d, kind: 'move', moveId });
    return { ok: true };
  };
  // Сколько денег категории заняты под неоплаченные платежи
  L.committed = (S, catId, m) => {
    const need = sum(L.coverage(S, m).items.filter((i) => i.bill.catId === catId), (i) => i.amount);
    return Math.min(Math.max(0, L.env(S, catId, m).bal), need);
  };
  L.pendingSum = (S, catId, m) => sum(L.coverage(S, m).items.filter((i) => i.bill.catId === catId), (i) => i.amount);

  L.addIncome = (S, o) => {
    const slot = o.slotId ? S.plan.find((p) => p.id === o.slotId) : null;
    const tx = { id: L.uid(), type: 'income', kind: slot ? 'plan' : 'extra', date: o.date, amount: o.amount, source: o.source || (slot ? slot.name : ''), slotId: slot ? slot.id : null, slotMonth: slot ? o.slotMonth : null, planned: slot ? slot.amount : 0 };
    S.txs.push(tx);
    return tx;
  };
  L.addExpense = (S, o) => {
    const tx = { id: L.uid(), type: 'expense', date: o.date, amount: o.amount, catId: o.catId, title: o.title || '', method: o.method || '' };
    S.txs.push(tx);
    return tx;
  };
  L.payBill = (S, bill, due, amount, date) => {
    if (S.txs.some((t) => t.billId === bill.id && t.dueDate === due)) return null;
    const tx = { id: L.uid(), type: 'expense', date, amount, catId: bill.catId, title: bill.name, method: '', billId: bill.id, dueDate: due };
    S.txs.push(tx);
    return tx;
  };
  L.deleteTx = (S, id) => {
    S.txs = S.txs.filter((t) => t.id !== id);
    S.allocs = S.allocs.filter((a) => a.incomeId !== id);
  };
  L.deleteAllocGroup = (S, ids) => { S.allocs = S.allocs.filter((a) => !ids.includes(a.id)); };

  // Правила: проверка на плановый месяц
  L.ruleCheck = (S, m) => {
    const planInc = sum(S.plan, (p) => p.amount);
    const rows = S.cats.map((c) => ({ c, planned: L.planned(S, c, m) }));
    const demand = sum(rows, (r) => r.planned) + L.pctOf(planInc, S.settings.reservePct) + (S.settings.reserveFixed || 0);
    const pctSum = sum(S.cats.filter((c) => c.rule.type === 'pctIncome'), (c) => c.rule.pct);
    return { planInc, demand, diff: planInc - demand, pctSum };
  };

  /* ---------- группировка записей распределения для истории ---------- */
  L.allocGroups = (S) => {
    const map = new Map();
    for (const a of S.allocs) {
      const key = a.kind === 'move' ? 'm' + a.moveId : a.kind === 'income' ? 'i' + a.date + (a.incomeId || '') : 'a' + a.id;
      if (!map.has(key)) map.set(key, { key, kind: a.kind, date: a.date, month: a.month, incomeId: a.incomeId || null, items: [] });
      map.get(key).items.push(a);
    }
    return [...map.values()];
  };


  /* ---------- быстрая запись: разбор фразы «вода 85» ---------- */
  const NW = { ноль: 0, один: 1, одна: 1, одну: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7, восемь: 8, девять: 9, десять: 10, одиннадцать: 11, двенадцать: 12, тринадцать: 13, четырнадцать: 14, пятнадцать: 15, шестнадцать: 16, семнадцать: 17, восемнадцать: 18, девятнадцать: 19, двадцать: 20, тридцать: 30, сорок: 40, пятьдесят: 50, шестьдесят: 60, семьдесят: 70, восемьдесят: 80, девяносто: 90, сто: 100, двести: 200, триста: 300, четыреста: 400, пятьсот: 500, шестьсот: 600, семьсот: 700, восемьсот: 800, девятьсот: 900 };
  const THOU = /^тысяч/;
  const FILLER = new Set(['купила', 'купил', 'потратила', 'потратил', 'заплатила', 'заплатил', 'оплатила', 'оплатил', 'взяла', 'взял', 'за', 'на', 'я', 'только', 'что', 'сегодня', 'вчера', 'рублей', 'рубля', 'рубль', 'руб', 'р', 'копеек', 'копейки', 'копейка', 'коп', '₽', 'пожалуйста', 'расход', 'трата', 'добавь', 'добавить', 'запиши', 'записать']);
  L.parseQuick = (text) => {
    let t = String(text || '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"!?;:()]/g, ' ').replace(/\s+/g, ' ').trim();
    let dateOff = 0;
    if (/(^|\s)вчера(\s|$)/.test(t)) dateOff = -1;
    t = t.replace(/полторы тысячи/g, '1500');
    const toks = t.split(' ').filter(Boolean).map((w) => ({ w, num: null, kind: '' }));
    // слова-числа → числа
    for (let i = 0; i < toks.length;) {
      if (!(toks[i].w in NW) && !THOU.test(toks[i].w)) { i++; continue; }
      let j = i, cur = 0, total = 0, any = false;
      while (j < toks.length && ((toks[j].w in NW) || THOU.test(toks[j].w))) {
        if (THOU.test(toks[j].w)) { total += (cur || 1) * 1000; cur = 0; } else cur += NW[toks[j].w];
        any = true; j++;
      }
      if (any && !(THOU.test(toks[i].w) && j === i + 1 && false)) {
        toks[i].num = (total + cur) * 100; toks[i].kind = 'word'; toks[i].end = j;
      }
      i = j;
    }
    const cands = [];
    for (let i = 0; i < toks.length; i++) {
      const w = toks[i].w;
      if (toks[i].num != null) { cands.push({ i, end: toks[i].end, val: toks[i].num, kind: 'word' }); i = toks[i].end - 1; continue; }
      const m = /^\d+(?:[.,]\d{1,2})?$/.exec(w);
      if (m) {
        let k = i, txt = w;
        while (k + 1 < toks.length && /^\d{3}(?:[.,]\d{1,2})?$/.test(toks[k + 1].w) && /^\d{1,3}$/.test(toks[i].w) && k === i) { txt += toks[k + 1].w; k++; }
        const v = L.parseMoney(txt);
        if (v != null) cands.push({ i, end: k + 1, val: v, kind: 'digit' });
        i = k;
      }
    }
    const isCur = (w) => w && /^(руб|р$|₽|рубл)/.test(w);
    let pick = null;
    for (const c of cands) { if (isCur(toks[c.end] && toks[c.end].w) || (c.i > 0 && isCur(toks[c.i - 1].w))) { pick = c; break; } }
    if (!pick) { const d = cands.filter((c) => c.kind === 'digit'); pick = d.length ? d[d.length - 1] : cands.slice().sort((a, b) => b.val - a.val)[0] || null; }
    let amount = pick ? pick.val : null, used = new Set();
    if (pick) {
      for (let k = pick.i; k < pick.end; k++) used.add(k);
      // «85 рублей 50 копеек»
      let k = pick.end;
      if (toks[k] && /^(руб|р$|рубл)/.test(toks[k].w)) { used.add(k); k++; }
      const c2 = cands.find((c) => c.i === k);
      if (c2 && toks[c2.end] && /^коп|^к$/.test(toks[c2.end].w) && c2.val % 100 === 0 && c2.val < 10000) { amount += c2.val / 100; for (let q = c2.i; q <= c2.end; q++) used.add(q); }
    }
    const words = toks.filter((x, i) => !used.has(i) && !FILLER.has(x.w) && !/^\d+$/.test(x.w)).map((x) => x.w);
    const title = words.join(' ');
    return { amount: amount && amount > 0 ? amount : null, title: title ? title[0].toUpperCase() + title.slice(1) : '', words, dateOff };
  };
  L.QUICK_DICT = {
    'Продукты': ['вод', 'молок', 'хлеб', 'продукт', 'овощ', 'фрукт', 'мяс', 'сыр', 'яйц', 'магазин', 'пятероч', 'магнит', 'перекрест', 'вкусвилл', 'ашан', 'картош', 'банан', 'яблок', 'куриц', 'колбас', 'творог', 'йогурт', 'конфет', 'шоколад', 'чай$', 'сок$', 'печень', 'масл', 'круп', 'макарон'],
    'Кафе и доставка': ['кофе', 'капучин', 'латте', 'обед', 'ужин', 'завтрак', 'ресторан', 'кафе', 'пицц', 'бургер', 'суши', 'ролл', 'достав', 'макдон', 'столов', 'перекус', 'десерт'],
    'Транспорт': ['такси', 'метро', 'автобус', 'трамва', 'маршрут', 'бензин', 'заправ', 'парков', 'проезд', 'электрич', 'каршеринг', 'самокат'],
    'Здоровье и аптека': ['аптек', 'лекарств', 'таблет', 'врач', 'анализ', 'стоматолог', 'витамин', 'больниц', 'клиник'],
    'Дом и быт': ['порош', 'лампоч', 'хозяйств', 'уборк', 'посуд', 'губк', 'мыло', 'батарейк', 'ремонт', 'пакет'],
    'Одежда и покупки': ['футболк', 'куртк', 'обув', 'кроссовк', 'джинс', 'платье', 'одежд', 'сумк', 'носк', 'белье', 'свитер'],
    'Красота и уход': ['маникюр', 'педикюр', 'парикмах', 'стрижк', 'косметик', 'крем', 'шампун', 'салон', 'массаж', 'духи', 'помад'],
    'Развлечения и отдых': ['кино', 'театр', 'концерт', 'музей', 'билет', 'боулинг', 'квест'],
    'Подарки': ['подар', 'цвет', 'букет', 'открытк'],
    'Хобби': ['хобби', 'краск', 'книг', 'рукодел', 'абонемент'],
    'Подписки': ['подписк', 'netflix', 'spotify', 'кинопоиск', 'icloud'],
    'Телефон и интернет': ['интернет', 'связь$', 'мобильн', 'тариф'],
    'Аренда и коммунальные услуги': ['аренд', 'коммунал', 'жкх', 'квартплат'],
  };
  L.guessCat = (S, words) => {
    const votes = {};
    words.forEach((w) => { const id = S.quick && S.quick.map[w.slice(0, 5)]; if (id && L.cat(S, id)) votes[id] = (votes[id] || 0) + 2; });
    const best = Object.keys(votes).sort((a, b) => votes[b] - votes[a])[0];
    if (best) return best;
    for (const name of Object.keys(L.QUICK_DICT)) {
      const c = S.cats.find((x) => x.name === name); if (!c) continue;
      if (words.some((w) => L.QUICK_DICT[name].some((k) => (k.endsWith('$') ? w === k.slice(0, -1) : w.startsWith(k))))) return c.id;
    }
    return '';
  };
  L.learnCat = (S, words, catId) => { if (!S.quick) S.quick = { map: {} }; words.forEach((w) => { if (w.length >= 3 && /[а-яa-z]/.test(w)) S.quick.map[w.slice(0, 5)] = catId; }); };

  /* ---------- демо-данные ---------- */
  L.demoState = () => {
    const S = L.newState();
    S.settings.setupDone = true; S.settings.demo = true;
    const m = monthOf(L.today());
    const cid = (n) => S.cats.find((c) => c.name === n).id;
    S.plan = [
      { id: L.uid(), name: 'Пример: аванс', day: 1, amount: 6000000 },
      { id: L.uid(), name: 'Пример: зарплата', day: 15, amount: 4500000 },
      { id: L.uid(), name: 'Пример: подработка', day: 25, amount: 3000000 },
    ];
    const bill = (name, cat, amount, day, period) => S.bills.push({ id: L.uid(), name, catId: cid(cat), amount, date: dayOfMonth(m, day), period: period || 'month', interval: 0, endDate: '', note: '', skipped: [] });
    bill('Пример: аренда', 'Аренда и коммунальные услуги', 2800000, 5);
    bill('Пример: рассрочка', 'Кредиты и рассрочки', 700000, 10);
    bill('Пример: музыка и кино', 'Подписки', 69900, 20);
    bill('Пример: интернет', 'Телефон и интернет', 90000, 12);
    const setRule = (n, type, v) => { const c = S.cats.find((x) => x.name === n); c.rule.type = type; if (type === 'pctIncome' || type === 'pctRemainder') c.rule.pct = v; else c.rule.amount = v; };
    setRule('Продукты', 'fixedMonth', 1800000); setRule('Транспорт', 'fixedMonth', 300000); setRule('Здоровье и аптека', 'fixedMonth', 200000);
    setRule('Кафе и доставка', 'pctRemainder', 10); setRule('Красота и уход', 'pctRemainder', 8); setRule('Развлечения и отдых', 'pctRemainder', 8);
    setRule('Накопления', 'pctIncome', 10); setRule('Финансовая подушка', 'pctIncome', 5);
    const first = L.addIncome(S, { slotId: S.plan[0].id, slotMonth: m, date: dayOfMonth(m, 1) <= L.today() ? dayOfMonth(m, 1) : L.today(), amount: 6000000 });
    const res = L.planAllocation(S, m, { refDate: first.date });
    L.applyAllocation(S, m, res.adds, { incomeId: first.id, date: first.date });
    const dd = (d) => (dayOfMonth(m, d) <= L.today() ? dayOfMonth(m, d) : L.today());
    L.addExpense(S, { date: dd(2), amount: 184050, catId: cid('Продукты'), title: 'Пример: супермаркет' });
    L.addExpense(S, { date: dd(3), amount: 45000, catId: cid('Транспорт'), title: 'Пример: проезд' });
    L.addExpense(S, { date: dd(4), amount: 62000, catId: cid('Кафе и доставка'), title: 'Пример: кофе и ужин' });
    return S;
  };
})();
if (typeof module !== 'undefined') module.exports = L;
