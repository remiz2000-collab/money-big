/* ===== ИНТЕРФЕЙС: распределение, правила, настройки, мастер, обработчики ===== */
const GKIND = { oblig: 'На обязательные платежи', daily: 'На повседневное', personal: 'На личное', goals: 'В накопления и цели' };
const PRIOS = ['1 · Самый высокий', '2 · Высокий', '3 · Средний', '4 · Низкий', '5 · Самый низкий'];
const RTYPES = { manual: 'Вручную', fixedMonth: 'Сумма в месяц', fixedEach: 'Сумма с каждого поступления', pctIncome: '% от поступления', pctRemainder: '% от остатка после обязательств', goal: 'Цель к дате' };
const ruleText = (c) => {
  const r = c.rule; let t = '';
  if (r.type === 'manual') t = 'Вручную';
  else if (r.type === 'fixedMonth') t = fmt(r.amount) + ' в месяц';
  else if (r.type === 'fixedEach') t = fmt(r.amount) + ' с каждого поступления';
  else if (r.type === 'pctIncome') t = r.pct + '% от поступления';
  else if (r.type === 'goal') t = c.goal ? 'Цель к дате: ' + fmt(L.goalInfo(S, c, ui.month) ? L.goalInfo(S, c, ui.month).perMonth : 0) + ' в месяц' : 'Цель к дате (не задана)';
  else t = r.pct + '% от остатка после обязательств';
  if (r.min > 0) t += ' · минимум ' + fmt(r.min);
  if (r.max > 0) t += ' · максимум ' + fmt(r.max);
  return t;
};

/* ---------- предпросмотр распределения ---------- */
function openAlloc(o) {
  o = o || {};
  ui.pv = { m: o.month || ui.month, income: o.income || null, refDate: o.refDate || null, fresh: !!o.fresh, mode: null, res: null, adds: {} };
  pvCompute();
}
function pvCompute() {
  const pv = ui.pv;
  pv.res = L.planAllocation(S, pv.m, { refDate: pv.refDate || undefined, fresh: pv.fresh, conflictMode: pv.mode });
  pv.adds = Object.assign({}, pv.res.adds);
  renderPv();
}
function pvReason(c) {
  const ev = ui.pv.res.events.filter((e) => e.catId === c.id).map((e) => (e.kind === 'bill' ? 'Платёж «' + e.label + '» до ' + fmtDate(e.due) : e.kind === 'min' ? 'Минимальная сумма' : e.label));
  return ev.join(' · ');
}
function renderPv() {
  const pv = ui.pv, r = pv.res, m = pv.m;
  const inc = pv.income ? S.txs.find((t) => t.id === pv.income) : null;
  const need = (c) => r.billNeed[c.id] || 0;
  const short = (c) => r.shortfalls.some((s) => s.catId === c.id);
  const prim = S.cats.filter((c) => (pv.adds[c.id] || 0) > 0 || need(c) > 0 || short(c));
  const rest = S.cats.filter((c) => !prim.includes(c));
  const row = (c) => '<div class="ar"><div class="sp"><div class="t">' + esc(c.name) + '</div><div class="xs muted">' + (pvReason(c) ? esc(pvReason(c)) + ' · ' : '') + 'сейчас ' + fmt(L.env(S, c.id, m).bal) + '</div><div class="xs warnc" id="pw-' + c.id + '"></div></div><input class="in" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="' + esc(c.name) + '" data-i="pv" data-id="' + c.id + '" value="' + kopToInput(pv.adds[c.id] || 0) + '"></div>';
  let h = '<h2>Распределение денег</h2>';
  h += '<p class="muted sm">' + (inc ? 'Поступило <b>' + fmt(inc.amount) + '</b>' + (inc.planned > 0 ? ' (план ' + fmt(inc.planned) + ')' : '') + '. ' : '') + 'Свободно для распределения: <b>' + fmt(Math.max(0, r.unalloc)) + '</b>. Баланс на руках от распределения не меняется.</p>';
  if (r.conflicts.length) {
    const c0 = r.conflicts[0];
    h += '<div class="banner bad" style="margin-top:12px"><div><b>Денег не хватает на равнозначные платежи на ' + fmtDate(c0.due) + '.</b> Нужно ' + fmt(c0.total) + ', есть ' + fmt(c0.pool) + '. Выберите, как поступить:<div style="margin-top:6px">' + c0.items.map((x) => esc(x.label) + ' — ' + fmt(x.need)).join('<br>') + '</div><div class="stack" style="margin-top:10px"><button class="btn sm" data-a="pvConflict" data-mode="proportional">Разделить поровну по доле</button><button class="btn sm" data-a="pvConflict" data-mode="order">Сначала по порядку категорий</button><span class="xs muted">Или закройте окно и распределите вручную.</span></div></div></div>';
  }
  if (r.deferred.length) h += '<div class="banner good" style="margin-top:12px"><div>' + r.deferred.length + ' ' + plural(r.deferred.length, ['платёж', 'платежа', 'платежей']) + ' (' + fmt(r.deferred.reduce((s, i) => s + i.short, 0)) + ') позже ближайшего поступления' + (r.horizon <= L.monthEnd(m) ? ' (' + fmtDate(r.horizon) + ')' : '') + '. Деньги на них зарезервируются из следующего поступления.</div></div>';
  if (r.surplus > 0) h += '<div class="banner good" style="margin-top:12px"><div>Поступило на <b>' + fmt(r.surplus) + '</b> больше плана. Лишнее остаётся свободным, если не задать суммы ниже.</div></div>';
  if (r.unalloc <= 0 && !r.conflicts.length) h += '<div class="banner" style="margin-top:12px"><div>Свободных денег для распределения нет.</div></div>';
  h += '<div class="grid2" style="margin-top:14px">' + ['oblig', 'daily', 'personal', 'goals'].map((k) => '<div class="stat"><div class="l">' + GKIND[k] + '</div><div class="v" id="pv-g-' + k + '">0</div></div>').join('') + '</div>';
  h += '<div class="stat" style="margin-top:10px;background:var(--accent-soft);border:0"><div class="l" style="color:var(--accent-deep)">Останется свободным</div><div class="v" id="pv-free">0</div></div>';
  if (r.shortfalls.length) {
    h += '<div class="card" style="margin-top:12px"><b>Пока не обеспечено</b>' + r.shortfalls.map((s) => { const c = L.cat(S, s.catId); const g = c && L.catKind(S, c) === 'goals'; return '<div class="row sm" style="margin-top:8px"><div class="sp">' + esc(s.kind === 'bill' ? s.label + ' (' + esc(catName(s.catId)) + ')' : catName(s.catId)) + (g ? ' <span class="pill">цель</span>' : '') + '</div><div class="amt warnc">−' + fmt(s.short) + '</div></div>'; }).join('') + '</div>';
  }
  h += '<div style="margin-top:14px">' + prim.map(row).join('') + '</div>';
  if (rest.length) h += '<details style="margin-top:6px"><summary class="sm muted" style="min-height:44px;display:flex;align-items:center">Остальные категории (' + rest.length + ')</summary>' + rest.map(row).join('') + '</details>';
  if (S.allocs.some((a) => a.kind === 'income' && a.month === m)) h += '<label class="check" style="margin-top:8px"><input type="checkbox" data-c="pvFresh"' + (pv.fresh ? ' checked' : '') + '>Заменить прежнее автораспределение месяца</label>';
  h += '<div class="errt" id="pv-err"></div><div class="foot"><button class="btn primary block" id="pv-apply" data-a="pvApply">Применить распределение</button><button class="btn block" data-a="pvRecalc">Пересчитать по правилам</button><button class="btn ghost block" data-a="close">' + (pv.income ? 'Оставить нераспределённым' : 'Закрыть') + '</button></div>';
  setSheet(h);
  pvLive();
}
function pvLive() {
  const pv = ui.pv; if (!pv) return;
  let total = 0, bad = false;
  const g = { oblig: 0, daily: 0, personal: 0, goals: 0 };
  document.querySelectorAll('#ov [data-i="pv"]').forEach((el) => {
    const raw = el.value.trim(), v = raw === '' ? 0 : L.parseMoney(raw);
    el.classList.toggle('err', v === null);
    if (v === null) { bad = true; return; }
    pv.adds[el.dataset.id] = v; total += v;
    const c = L.cat(S, el.dataset.id); g[L.catKind(S, c)] = (g[L.catKind(S, c)] || 0) + v;
    const need = pv.res.billNeed[el.dataset.id] || 0, w = document.getElementById('pw-' + el.dataset.id);
    if (w) w.textContent = need > v ? 'Не хватит на платежи: ещё ' + fmt(need - v) : '';
  });
  Object.keys(g).forEach((k) => { const e = document.getElementById('pv-g-' + k); if (e) e.textContent = fmt(g[k]); });
  const free = pv.res.unalloc - total, fe = document.getElementById('pv-free');
  if (fe) { fe.textContent = fmt(free); fe.style.color = free < 0 ? 'var(--bad)' : ''; }
  const err = document.getElementById('pv-err'), btn = document.getElementById('pv-apply');
  const msg = bad ? 'Проверьте суммы: нужны числа.' : free < 0 ? 'Выделяется больше, чем есть свободных денег: на ' + fmt(-free) + '. Уменьшите суммы.' : '';
  if (err) err.textContent = msg;
  if (btn) btn.disabled = !!msg || total === 0;
}
function pvApply() {
  const pv = ui.pv; pvLive();
  const r = L.applyAllocation(S, pv.m, pv.adds, { incomeId: pv.income, fresh: pv.fresh, date: pv.refDate || L.today() });
  if (!r.ok) { $('#pv-err').textContent = r.error; return; }
  ui.pv = null; commit(); closeSheet(); toast('Деньги распределены');
}

/* ---------- правила ---------- */
let rs = null;
function openRule(id) {
  const c = L.cat(S, id); if (!c) return;
  rs = Object.assign({ id }, c.rule);
  renderRuleSheet();
}
function ruleCollect() {
  if (!rs) return;
  const v = (i) => (document.getElementById(i) ? document.getElementById(i).value : null);
  if (v('r-val') !== null) { const k = L.parseMoney(v('r-val')); if (rs.type === 'pctIncome' || rs.type === 'pctRemainder') rs.pct = parseFloat(String(v('r-val')).replace(',', '.')) || 0; else rs.amount = k || 0; }
  if (v('r-min') !== null) rs.min = L.parseMoney(v('r-min')) || 0;
  if (v('r-max') !== null) rs.max = L.parseMoney(v('r-max')) || 0;
  if (v('r-pr') !== null) rs.priority = +v('r-pr');
}
function renderRuleSheet() {
  const c = L.cat(S, rs.id), pctT = rs.type === 'pctIncome' || rs.type === 'pctRemainder';
  const hasBills = S.bills.some((b) => b.catId === c.id);
  setSheet('<h2>' + esc(c.name) + '</h2><div class="muted sm">Как пополнять эту категорию</div>' +
    (hasBills ? '<div class="banner good" style="margin-top:10px"><div>Платежи этой категории резервируются автоматически по датам и суммам.</div></div>' : '') +
    '<div class="chips" style="margin-top:12px">' + Object.keys(RTYPES).map((k) => '<button class="chip ' + (rs.type === k ? 'on' : '') + '" data-a="ruleType" data-k="' + k + '">' + RTYPES[k] + '</button>').join('') + '</div>' +
    (rs.type === 'goal' ? '<p class="xs muted" style="margin-top:10px">Каждый месяц откладывается сумма, нужная, чтобы успеть накопить к дате цели. Цель задаётся в карточке категории (кнопка «Накопить к дате»).</p>' : rs.type === 'manual' ? '<p class="xs muted" style="margin-top:10px">Деньги не назначаются сами. Пополняйте вручную в разделе «Бюджет».</p>' : '<label class="f" for="r-val">' + (pctT ? 'Процент' : 'Сумма') + '</label><input class="in" id="r-val" inputmode="decimal" placeholder="0" value="' + (pctT ? (rs.pct || '') : kopToInput(rs.amount)) + '">') +
    '<label class="f" for="r-pr">Приоритет при нехватке денег</label><select class="sel" id="r-pr">' + PRIOS.map((p, i) => '<option value="' + (i + 1) + '"' + (rs.priority === i + 1 ? ' selected' : '') + '>' + p + '</option>').join('') + '</select>' +
    '<div class="two"><div><label class="f" for="r-min">Минимум</label><input class="in" id="r-min" inputmode="decimal" placeholder="0" value="' + kopToInput(rs.min) + '"></div><div><label class="f" for="r-max">Максимум в конверте</label><input class="in" id="r-max" inputmode="decimal" placeholder="Без лимита" value="' + kopToInput(rs.max) + '"></div></div>' +
    '<p class="xs muted" style="margin-top:8px">Минимум обеспечивается в первую очередь. Максимум не даёт конверту расти выше этой суммы.</p>' +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="ruleSave">Сохранить правило</button><button class="btn block" data-a="close">Отмена</button></div>');
}
function scrRules() {
  const ck = L.ruleCheck(S, ui.month);
  let h = '<div class="top"><button class="ib" data-a="back" aria-label="Назад">' + ic('l') + '</button><div class="pagetitle">Правила</div><span style="width:44px"></span></div>';
  h += '<p class="muted sm" style="margin:0 4px 14px">При каждом поступлении приложение сначала резервирует деньги на платежи по датам, затем распределяет остаток по приоритетам. Распределение не списывает деньги с баланса.</p>';
  if (ck.planInc === 0) h += '<div class="banner" style="margin-bottom:12px"><div>Укажите плановые суммы поступлений в настройках, чтобы проверить правила.</div></div>';
  else if (ck.diff < 0) h += '<div class="banner bad" style="margin-bottom:12px"><div>Правила требуют <b>' + fmt(ck.demand) + '</b>, плановых поступлений <b>' + fmt(ck.planInc) + '</b>. Не хватает ' + fmt(-ck.diff) + '. Категории с низким приоритетом получат меньше.</div></div>';
  else h += '<div class="banner good" style="margin-bottom:12px"><div>Плановые поступления <b>' + fmt(ck.planInc) + '</b>, правила занимают <b>' + fmt(ck.demand) + '</b>, свободным остаётся <b>' + fmt(ck.diff) + '</b>.</div></div>';
  if (ck.pctSum > 100) h += '<div class="banner bad" style="margin-bottom:12px"><div>Сумма процентов от поступления больше 100%.</div></div>';
  h += '<div class="card"><b>Свободный резерв</b><p class="xs muted" style="margin-top:4px">Эта часть каждого поступления не распределяется по категориям и остаётся свободной.</p><div class="two"><div><label class="f" for="rs-pct">% от поступлений</label><input class="in" id="rs-pct" inputmode="decimal" data-i="resPct" placeholder="0" value="' + (S.settings.reservePct || '') + '"></div><div><label class="f" for="rs-fix">Сумма в месяц</label><input class="in" id="rs-fix" inputmode="decimal" data-i="resFix" placeholder="0" value="' + kopToInput(S.settings.reserveFixed || 0) + '"></div></div></div>';
  S.groups.forEach((g) => {
    const cs = S.cats.filter((c) => c.groupId === g.id); if (!cs.length) return;
    h += '<div class="gh"><h3>' + esc(g.name) + '</h3></div><div class="list">' + cs.map((c) => '<button class="li" data-a="ruleEdit" data-id="' + c.id + '"><div class="sp"><div class="t">' + esc(c.name) + '</div><div class="s">' + esc(ruleText(c)) + '</div></div><span class="pill">приоритет ' + c.rule.priority + '</span></button>').join('') + '</div>';
  });
  return h + '<div style="margin-top:20px"><button class="btn primary block" data-a="alloc">Распределить автоматически</button></div>';
}

/* ---------- управление категориями и поступлениями (общее для мастера и настроек) ---------- */
function catManage() {
  return S.groups.map((g) => {
    const cs = S.cats.filter((c) => c.groupId === g.id);
    return '<div class="gh"><h3>' + esc(g.name) + '</h3></div><div class="list" style="padding:4px 12px">' + cs.map((c, i) => '<div class="row" style="padding:5px 0"><input class="in" style="min-height:44px" value="' + esc(c.name) + '" maxlength="50" aria-label="Название категории" data-i="catName" data-id="' + c.id + '"><button class="ib" data-a="catUp" data-id="' + c.id + '" aria-label="Выше"' + (i === 0 ? ' disabled style="opacity:.3"' : '') + '>' + ic('up') + '</button><button class="ib" data-a="catDn" data-id="' + c.id + '" aria-label="Ниже"' + (i === cs.length - 1 ? ' disabled style="opacity:.3"' : '') + '>' + ic('dn') + '</button><button class="ib" data-a="catDel" data-id="' + c.id + '" aria-label="Удалить">' + ic('tr') + '</button></div>').join('') + '<button class="btn soft sm block" style="margin:6px 0 8px" data-a="catNew" data-g="' + g.id + '">Добавить в «' + esc(g.name) + '»</button></div>';
  }).join('');
}
const planHint = (p) => (p.dayTo > p.day ? 'Деньги приходят с ' + p.day + ' по ' + p.dayTo + ' число каждого месяца.' : 'Деньги приходят ' + p.day + '-го числа. Если дата плавает, укажите «По число».');
const planHintUpd = (p) => { const e = document.getElementById('ph-' + p.id); if (e) e.textContent = planHint(p); };
function planHTML() {
  return '<div class="list" style="padding:4px 14px">' + S.plan.map((p) => '<div style="padding:10px 0;border-top:1px solid var(--line)" class="pr"><div class="row"><input class="in" style="min-height:44px" value="' + esc(p.name) + '" maxlength="40" aria-label="Название" data-i="planName" data-id="' + p.id + '"><button class="ib" data-a="planDel" data-id="' + p.id + '" aria-label="Удалить поступление">' + ic('tr') + '</button></div><div class="two" style="margin-top:8px"><div><label class="f" style="margin:0 0 4px" for="pd-' + p.id + '">С числа</label><input class="in" id="pd-' + p.id + '" inputmode="numeric" data-i="planDay" data-id="' + p.id + '" value="' + p.day + '"></div><div><label class="f" style="margin:0 0 4px" for="pt-' + p.id + '">По число (если период)</label><input class="in" id="pt-' + p.id + '" inputmode="numeric" placeholder="Не нужно" data-i="planDayTo" data-id="' + p.id + '" value="' + (p.dayTo > p.day ? p.dayTo : '') + '"></div></div><label class="f" style="margin:8px 0 4px" for="pa-' + p.id + '">Плановая сумма</label><input class="in" id="pa-' + p.id + '" inputmode="decimal" placeholder="0" data-i="planAmt" data-id="' + p.id + '" value="' + kopToInput(p.amount) + '"><div class="xs muted" id="ph-' + p.id + '" style="margin-top:6px">' + planHint(p) + '</div></div>').join('') + '<button class="btn soft sm block" style="margin:8px 0" data-a="planAdd">Добавить поступление</button></div>';
}
function profileHTML() {
  return '<div class="card"><label class="f" style="margin-top:0" for="pf-name">Как к вам обращаться</label><input class="in" id="pf-name" maxlength="30" placeholder="Ваше имя" autocomplete="given-name" data-i="profName" value="' + esc(S.settings.name || '') + '"><label class="f">Пол, чтобы правильно писать глаголы</label><div class="seg" role="group" aria-label="Пол">' + [['f', 'Женский'], ['m', 'Мужской'], ['', 'Не важно']].map((x) => '<button data-a="gender" data-g="' + x[0] + '" class="' + ((S.settings.gender || '') === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div></div>';
}
function maskDate(raw, del) {
  let d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length >= 1 && d[0] > '3') d = '0' + d;
  if (d.length >= 2 && +d.slice(0, 2) > 31) d = '31' + d.slice(2);
  if (d.length >= 3 && d[2] > '1') d = d.slice(0, 2) + '0' + d.slice(2);
  if (d.length >= 4 && +d.slice(2, 4) > 12) d = d.slice(0, 2) + '12' + d.slice(4);
  d = d.slice(0, 8);
  let o = d.slice(0, 2);
  if (d.length > 2) o += '.' + d.slice(2, 4);
  if (d.length > 4) o += '.' + d.slice(4);
  if (!del && (d.length === 2 || d.length === 4)) o += '.';
  return o;
}
function moneyHTML() {
  return '<label class="f" for="st-bal">Начальный остаток (деньги на руках сейчас)</label><input class="in" id="st-bal" inputmode="decimal" placeholder="0" data-i="startBal" value="' + kopToInput(S.settings.startBalance) + '"><div class="two"><div><label class="f" for="st-cur">Валюта</label><select class="sel" id="st-cur" data-c="cur">' + Object.keys(CURS).map((k) => '<option value="' + k + '"' + (S.settings.currency === k ? ' selected' : '') + '>' + CURS[k] + '</option>').join('') + '</select></div><div><label class="f" for="st-cents">Копейки</label><select class="sel" id="st-cents" data-c="cents"><option value="auto"' + (S.settings.cents === 'auto' ? ' selected' : '') + '>Если есть</option><option value="always"' + (S.settings.cents === 'always' ? ' selected' : '') + '>Всегда</option></select></div></div>';
}

/* ---------- настройки ---------- */
function scrSettings() {
  let h = '<div class="top"><button class="ib" data-a="back" aria-label="Назад">' + ic('l') + '</button><div class="pagetitle">Настройки бюджета</div><span style="width:44px"></span></div>';
  h += '<div class="sect" style="margin-top:6px"><h2>О вас</h2></div>' + profileHTML();
  h += '<div class="sect"><h2>Поступления в месяц</h2></div>' + planHTML();
  h += '<div class="sect"><h2>Деньги</h2></div><div class="card">' + moneyHTML() + '</div>';
  h += '<div class="sect"><h2>Правила и категории</h2></div><div class="list"><button class="li" data-a="rules"><div class="sp"><div class="t">Правила распределения</div><div class="s">Суммы, проценты и приоритеты</div></div>' + ic('r').replace('<svg', '<svg width="20" height="20" style="stroke:var(--muted);fill:none;stroke-width:2"') + '</button><button class="li" data-a="wizard"><div class="sp"><div class="t">Пройти мастер настройки заново</div><div class="s">Ничего не удалится</div></div></button></div>';
  h += catManage();
  h += '<div class="sect"><h2>Курсы валют</h2></div><div class="card stack"><p class="sm">Расходы в другой валюте (например, в отпуске) пересчитываются в ' + esc(S.settings.currency) + ' по курсу и попадают в обычные расходы. Курс подгружается из интернета, а при его отсутствии можно ввести вручную.</p><div class="xs muted">' + (S.fx && S.fx.base === S.settings.currency && S.fx.at ? 'Курсы загружены ' + new Date(S.fx.at).toLocaleString('ru-RU') : 'Курсы ещё не загружались') + '</div><button class="btn block" data-a="fxRefresh" data-p="">Обновить курсы</button></div>';
  h += '<div class="sect"><h2>Быстрая запись голосом</h2></div><div class="card stack"><p class="sm">Запись траты без открытия приложения: ярлык на главный экран телефона.</p><button class="btn block" data-a="voiceHelp">Как добавить на главный экран</button></div>';
  h += '<div class="sect"><h2>Данные</h2></div><div class="card stack"><p class="sm">Все данные хранятся только в этом браузере на этом устройстве. Между телефоном и компьютером они не синхронизируются. Если очистить данные сайта, они пропадут, поэтому иногда делайте резервную копию.</p>' +
    '<button class="btn block" data-a="export">Создать резервную копию</button><div id="bk-w" hidden class="stack"><textarea class="ta code" id="bk" readonly aria-label="Резервная копия"></textarea><button class="btn soft block" data-a="copy">Скопировать копию</button><p class="xs muted">Вставьте скопированный текст в заметки или отправьте себе. Скачивание файла в этом окне недоступно.</p></div>' +
    '<div class="hr"></div><label class="f" style="margin:0" for="imp">Восстановить из копии</label><textarea class="ta code" id="imp" placeholder="Вставьте текст копии сюда"></textarea><input type="file" id="imp-file" accept=".json,application/json,text/plain" data-c="impFile" aria-label="Выбрать файл копии"><div class="errt" id="imp-err"></div><button class="btn block" data-a="import">Проверить и восстановить</button></div>';
  h += '<div class="sect"><h2>Демо и сброс</h2></div><div class="card stack"><p class="sm">Демо-данные заполнены примерами, которые не относятся к вам. Ваши настоящие данные сохранятся и вернутся при выходе из демо.</p>' + (S.settings.demo ? '<button class="btn block" data-a="demoOff">Вернуть мои данные</button>' : '<button class="btn block" data-a="demoOn">Загрузить демо-данные</button>') + '<button class="btn danger block" data-a="resetAll">Удалить все данные</button></div>';
  return h;
}

/* ---------- мастер первоначальной настройки ---------- */
const WSTEPS = ['', 'Категории', 'Платежи', 'Правила', 'Поступления'];
function scrWizard() {
  const st = ui.wiz;
  const dots = st > 0 ? '<div class="dots">' + [1, 2, 3, 4].map((i) => '<i class="' + (i <= st ? 'on' : '') + '"></i>').join('') + '</div>' : '';
  let h = '', nav = '';
  if (st === 0) {
    h = '<div style="padding-top:28px"><h1 class="num" style="font-size:32px;letter-spacing:-.03em">Давайте настроим бюджет</h1><p class="muted" style="margin:12px 0 18px;font-size:17px">Это займёт пару минут. Всё можно пропустить и изменить позже.</p>' +
      '<div style="margin-bottom:14px">' + profileHTML() + '</div><div class="card stack"><div><b>1. Категории</b><div class="sm muted">Конверты, по которым делятся деньги.</div></div><div><b>2. Обязательные платежи</b><div class="sm muted">Кредиты, подписки, аренда. Суммы и даты ваши.</div></div><div><b>3. Правила</b><div class="sm muted">Как делить каждое поступление.</div></div><div><b>4. Поступления</b><div class="sm muted">Даты и суммы, когда вы получаете деньги.</div></div></div>' +
      '<p class="xs muted" style="margin-top:14px">Данные хранятся только на этом устройстве, в этом браузере. Ничего не отправляется в интернет.</p></div>';
    nav = '<button class="btn primary block" data-a="wizNext">Начать</button><button class="btn ghost block" data-a="wizSkipAll">Пропустить, настрою позже</button>';
  } else {
    h = dots + '<h1 class="num" style="font-size:26px;letter-spacing:-.02em;margin-bottom:6px">' + ['', 'Ваши категории', 'Обязательные платежи', 'Правила распределения', 'Поступления и остаток'][st] + '</h1>';
    if (st === 1) h += '<p class="muted sm">Переименуйте, удалите или добавьте свои. Порядок можно менять стрелками.</p>' + catManage();
    if (st === 2) {
      h += '<p class="muted sm" style="margin-bottom:12px">Добавьте кредиты, рассрочки, подписки и другие регулярные платежи. Не знаете сумму? Пропустите, добавите позже.</p>';
      h += S.bills.length ? '<div class="list">' + S.bills.map((b) => '<button class="li" data-a="billEdit" data-b="' + b.id + '"><div class="sp"><div class="t">' + esc(b.name) + '</div><div class="s">' + esc(catName(b.catId)) + ' · ' + fmtDate(b.date) + ' · ' + periodText(b) + '</div></div><div class="amt">' + fmt(b.amount) + '</div></button>').join('') + '</div>' : '<div class="card empty"><h3>Платежей пока нет</h3><p>Например: «iCloud 200 ГБ» в категории «Подписки».</p></div>';
      h += '<button class="btn soft block" style="margin-top:12px" data-a="billNew">Добавить платёж</button>';
    }
    if (st === 3) {
      h += '<p class="muted sm" style="margin-bottom:6px">Для платежей используются их даты и суммы. Для остальных категорий выберите способ пополнения. Приоритеты меняются в «Бюджет → Правила».</p><button class="btn ghost sm block" style="margin:8px 0" data-a="wizPreset">Подставить пример с процентами</button><p class="xs muted">Пример можно изменить в любой строке.</p>';
      h += S.groups.map((g) => {
        const cs = S.cats.filter((c) => c.groupId === g.id); if (!cs.length) return '';
        return '<div class="gh"><h3>' + esc(g.name) + '</h3></div><div class="list" style="padding:2px 14px">' + cs.map((c) => { const t = c.rule.type; const pc = t === 'pctIncome' || t === 'pctRemainder'; return '<div style="padding:10px 0;border-top:1px solid var(--line)" class="pr"><div class="t">' + esc(c.name) + (S.bills.some((b) => b.catId === c.id) ? ' <span class="pill ok">платежи по датам</span>' : '') + '</div><div class="two" style="margin-top:6px"><select class="sel" data-c="wizType" data-id="' + c.id + '" aria-label="Способ пополнения ' + esc(c.name) + '">' + Object.keys(RTYPES).map((k) => '<option value="' + k + '"' + (t === k ? ' selected' : '') + '>' + RTYPES[k] + '</option>').join('') + '</select>' + (t === 'manual' ? '<span></span>' : '<input class="in" inputmode="decimal" data-i="wizVal" data-id="' + c.id + '" placeholder="' + (pc ? '%' : 'Сумма') + '" aria-label="Значение" value="' + (pc ? (c.rule.pct || '') : kopToInput(c.rule.amount)) + '">') + '</div></div>'; }).join('') + '</div>';
      }).join('');
    }
    if (st === 4) h += '<p class="muted sm" style="margin-bottom:10px">Даты и суммы можно менять в любой момент. Плановая сумма не считается полученными деньгами.</p>' + planHTML() + '<div class="card" style="margin-top:12px">' + moneyHTML() + '</div>';
    nav = '<button class="btn primary block" data-a="' + (st === 4 ? 'wizFinish' : 'wizNext') + '">' + (st === 4 ? 'Завершить настройку' : 'Далее') + '</button><div class="two"><button class="btn block" data-a="wizBack">Назад</button>' + (st < 4 ? '<button class="btn ghost block" data-a="wizNext">Пропустить шаг</button>' : '<button class="btn ghost block" data-a="wizFinish">Пропустить</button>') + '</div>';
  }
  return h + '<div class="stack" style="margin-top:22px">' + nav + '</div>';
}
const PRESET = { 'Продукты': 15, 'Дом и быт': 5, 'Транспорт': 5, 'Здоровье и аптека': 3, 'Кафе и доставка': 5, 'Одежда и покупки': 5, 'Красота и уход': 3, 'Хобби': 3, 'Развлечения и отдых': 5, 'Подарки': 2, 'Накопления': 10, 'Финансовая подушка': 5, 'Отпуск и крупные покупки': 3 };

/* ---------- экраны ---------- */
let lastScreen = null;
function renderScreen(reset) {
  const host = $('#page');
  if (!ui.screen) { host.innerHTML = ''; lastScreen = null; document.body.style.overflow = ''; return; }
  const old = $('#pg'); const top = old && lastScreen === ui.screen && !reset ? old.scrollTop : 0;
  const inner = ({ settings: scrSettings, rules: scrRules, wizard: scrWizard })[ui.screen]();
  host.innerHTML = '<div class="page" id="pg"><div class="in">' + inner + '</div></div>';
  $('#pg').scrollTop = top; lastScreen = ui.screen; document.body.style.overflow = 'hidden';
}
function openScreen(n) { ui.screen = n; renderScreen(true); }

/* ---------- категории: служебное ---------- */
function openCatEdit(id) {
  const c = L.cat(S, id); if (!c) return;
  setSheet('<h2>Изменить категорию</h2><label class="f" for="f-name">Название</label><input class="in" id="f-name" maxlength="50" value="' + esc(c.name) + '" data-focus><label class="f" for="f-grp">Группа</label><select class="sel" id="f-grp">' + S.groups.map((g) => '<option value="' + g.id + '"' + (g.id === c.groupId ? ' selected' : '') + '>' + esc(g.name) + '</option>').join('') + '</select>' + iconPicker('cat', c.icon || '', { name: c.name }) + '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="catSave" data-id="' + id + '">Сохранить</button><button class="btn danger block" data-a="catDel" data-id="' + id + '">Удалить категорию</button><button class="btn block" data-a="close">Отмена</button></div>');
}
function openCatNew(g) {
  openSheet('<h2>Новая категория</h2><label class="f" for="f-name">Название</label><input class="in" id="f-name" maxlength="50" placeholder="Например: Питомцы" data-focus>' + iconPicker('cat', '', { name: '' }) + '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="catSave" data-g="' + g + '" data-id="">Создать</button><button class="btn block" data-a="close">Отмена</button></div>');
}
function delCat(id) {
  const c = L.cat(S, id); if (!c) return;
  if (S.bills.some((b) => b.catId === id)) { toast('В категории есть платежи. Сначала перенесите или удалите их.'); return; }
  const bal = L.env(S, id, ui.month).bal;
  ask({ title: 'Удалить категорию «' + c.name + '»?', text: 'История расходов останется, но без категории.' + (bal > 0 ? ' Деньги в конверте (' + fmt(bal) + ') вернутся в свободные.' : ''), ok: 'Удалить', danger: true, onOk: () => { S.cats = S.cats.filter((x) => x.id !== id); commit(); toast('Категория удалена'); } });
}
function swapCat(id, dir) {
  const c = L.cat(S, id), idxs = S.cats.map((x, i) => (x.groupId === c.groupId ? i : -1)).filter((i) => i >= 0);
  const p = idxs.indexOf(S.cats.indexOf(c)), q = p + dir;
  if (q < 0 || q >= idxs.length) return;
  const a = idxs[p], b = idxs[q]; [S.cats[a], S.cats[b]] = [S.cats[b], S.cats[a]];
  commit();
}

/* ---------- обработчики ---------- */
let warnAck = false;
let memStash = null;
const A = {
  tab: (d) => { ui.tab = d.t; render(false); },
  mprev: () => shiftMonth(-1), mnext: () => shiftMonth(1),
  close: () => closeSheet(),
  askOk: () => { const f = okCb; closeSheet(); if (f) f(); },
  settings: () => openScreen('settings'), rules: () => openScreen('rules'), wizard: () => { ui.wiz = 0; openScreen('wizard'); },
  back: () => { ui.screen = null; render(); },
  cat: (d) => openCat(d.id), catMode: (d) => { warnAck = false; openCat(d.id, d.mode); },
  catDo: (d) => {
    const err = (t) => { $('#f-err').textContent = t; };
    const amount = L.parseMoney(val('f-amount')); if (!amount || amount <= 0) return err('Введите сумму больше нуля');
    const m = ui.month, date = defaultDate();
    if (d.mode !== 'top') {
      const def = catDeficit(d.id, amount);
      if (def > 0 && !warnAck) { warnAck = true; $('#f-save').textContent = 'Всё равно ' + (d.mode === 'move' ? 'перенести' : 'вернуть'); return err('Сначала проверьте предупреждение ниже.'); }
    }
    const r = d.mode === 'top' ? L.topUp(S, m, d.id, amount, date) : d.mode === 'move' ? L.move(S, m, d.id, val('f-to'), amount, date) : L.release(S, m, d.id, amount, date);
    if (!r.ok) return err(r.error.replace(/(\d+)$/, (x) => fmt(+x)));
    commit(); closeSheet(); toast(d.mode === 'top' ? 'Конверт пополнен' : d.mode === 'move' ? 'Деньги перенесены' : 'Деньги возвращены в свободные');
  },
  recv: (d) => openIncome({ slot: d.slot }), incExtra: (d) => openIncome({ only: 'extra', fromMenu: !!d.menu }), recvOnly: (d) => openIncome({ only: 'slot', fromMenu: !!d.menu }),
  fabMenu: () => openSheet('<h2>Что добавить?</h2><div class="stack" style="margin-top:12px">' + [['expNew', 'Расход', 'Трата из категории: продукты, транспорт, кафе'], ['incExtra', 'Доход', 'Дополнительные деньги не по плану: подработка, подарок'], ['recvOnly', 'Поступление', 'Плановые деньги месяца: аванс, зарплата'], ['billNew', 'Платёж', 'Регулярный или разовый платёж: кредит, подписка, аренда'], ['goalNew', 'Цель', 'Накопить к дате: отпуск, крупная покупка']].map((x) => '<button class="card" style="text-align:left;min-height:68px;width:100%" data-menu="1" data-a="' + x[0] + '"><div style="font-weight:600;font-size:18px">' + x[1] + '</div><div class="sm muted">' + x[2] + '</div></button>').join('') + '</div><div class="foot"><button class="btn block" data-a="close">Отмена</button></div>'),
  qOpen: () => openQuick(true),
  qMic: () => { if (listening) stopListen(); else startListen(); },
  qSave: () => saveQuick(),
  qMore: () => {
    const a = L.parseMoney(val('q-amt')), c = val('q-cat'), title = qk.title, date = L.addDays(L.today(), qk.dateOff);
    openExpense({ cat: c });
    if (a) document.getElementById('f-amount').value = kopToInput(a);
    document.getElementById('f-title').value = title;
    document.getElementById('f-date').value = date.slice(8) + '.' + date.slice(5, 7) + '.' + date.slice(0, 4);
    const qc = document.getElementById('q-cur').value;
    if (qc) { document.getElementById('f-cur').value = qc; document.getElementById('f-rate').value = document.getElementById('q-rate').value; document.getElementById('f-ratew').hidden = false; }
    expInfo(null); fxInfoUpd('f');
  },
  gender: (d) => { S.settings.gender = d.g; commit(); },
  debtNew: () => openDebtEdit(null), debtOpen: (d) => openDebt(d.id), debtEdit: (d) => openDebtEdit(d.id), debtSave: (d) => saveDebt(d.id), debtPay: (d) => payDebtUi(d.id),
  debtDir: (d, el) => { document.getElementById('d-dir').value = d.v; el.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el)); },
  debtPayDel: (d) => { const x = S.debts.find((q) => q.id === d.id); if (x) { x.paid.splice(+d.i, 1); commit(); openDebt(d.id); } },
  debtDel: (d) => { const x = S.debts.find((q) => q.id === d.id); ask({ title: 'Удалить долг?', text: esc(x ? x.who : '') + ' · ' + fmt(x ? x.amount : 0), ok: 'Удалить', danger: true, onOk: () => { S.debts = S.debts.filter((q) => q.id !== d.id); commit(); toast('Долг удалён'); } }); },
  goalOpen: (d) => openGoal(d.id), goalNew: (d) => openGoal(null, !!d.menu), goalPhotoDel: () => { goalPhoto = ''; goalPhotoUpd(); }, goalSave: (d) => saveGoal(d.id),
  goalDel: (d) => { const c = L.cat(S, d.id); c.goal = null; if (c.rule.type === 'goal') c.rule.type = 'manual'; commit(); openCat(d.id); toast('Цель убрана'); },
  icoPick: (d) => { const nm = (document.getElementById('f-name') || {}).value; icoSet(d.t, d.v, nm); const e = document.getElementById('ipk-' + d.t + '-e'); if (e) e.value = ''; },
  fxRefresh: async (d) => { const ok = await refreshRates(false); if (ok && d.p) fxChanged(d.p); else if (ok) render(); },
  voiceHelp: () => openSheet(voiceHelpHTML()),
  alloc: () => openAlloc({ month: ui.month }),
  expNew: (d) => openExpense({ cat: d.cat, fromMenu: !!d.menu }),
  pickCat: (d) => { expSel = d.id; document.querySelectorAll('#ov .chip[data-a="pickCat"]').forEach((e) => e.classList.toggle('on', e.dataset.id === d.id)); expInfo(editTx()); },
  pickSlot: (d) => {
    incSel = d.id; document.querySelectorAll('#ov .chip[data-a="pickSlot"]').forEach((e) => e.classList.toggle('on', e.dataset.id === d.id));
    const x = L.slots(S, ui.month).find((s) => s.slot.id === d.id);
    document.getElementById('f-amount').value = x && x.planned > 0 ? kopToInput(x.planned) : '';
    document.getElementById('f-src').value = x ? x.slot.name : '';
    document.getElementById('f-plan').textContent = x && x.planned > 0 ? 'План: ' + fmt(x.planned) + '. Измените сумму, если пришло другое.' : '';
  },
  expSave: (d) => saveExpense(d.id), incSave: (d) => saveIncome(d.id),
  txOpen: (d) => { const t = S.txs.find((x) => x.id === d.id); if (t) (t.type === 'income' ? openIncome({ txId: t.id }) : openExpense({ txId: t.id })); },
  txDel: (d) => {
    const t = S.txs.find((x) => x.id === d.id); if (!t) return;
    const n = S.allocs.filter((a) => a.incomeId === t.id).length;
    ask({ title: t.type === 'income' ? 'Удалить доход?' : 'Удалить расход?', text: (t.type === 'income' ? 'Баланс уменьшится на ' + fmt(t.amount) + (n ? '. Распределение этого поступления тоже удалится.' : '.') : 'Сумма ' + fmt(t.amount) + ' вернётся в конверт и на баланс.' + (t.billId ? ' Платёж снова станет «ожидает оплаты».' : '')), ok: 'Удалить', danger: true, onOk: () => { L.deleteTx(S, t.id); commit(); toast('Удалено'); } });
  },
  agOpen: (d) => openAg(d.id),
  agDel: (d) => { const g = L.allocGroups(S).find((x) => x.key === d.id); if (!g) return; ask({ title: 'Удалить запись?', text: 'Деньги вернутся туда, откуда были выделены. Баланс на руках не изменится.', ok: 'Удалить', danger: true, onOk: () => { L.deleteAllocGroup(S, g.items.map((a) => a.id)); commit(); toast('Запись удалена'); } }); },
  hAll: () => { ui.fAll = !ui.fAll; render(false); }, hType: (d) => { ui.fType = d.t; render(); },
  billNew: (d) => openBill(null, d && d.menu ? { fromMenu: true } : undefined), billEdit: (d) => openBill(d.b), billSave: (d) => saveBill(d.b, !!d.more),
  billDel: (d) => { const b = S.bills.find((x) => x.id === d.b); ask({ title: 'Удалить платёж «' + b.name + '»?', text: 'Прошлые оплаты останутся в истории расходов.', ok: 'Удалить', danger: true, onOk: () => { S.bills = S.bills.filter((x) => x.id !== b.id); commit(); toast('Платёж удалён'); } }); },
  pay: (d) => {
    const b = S.bills.find((x) => x.id === d.b); if (!b) return;
    const it = L.billItems(S, ui.month).find((i) => i.bill.id === d.b && i.due === d.d);
    const amount = it ? it.amount : b.amount;
    if (!L.payBill(S, b, d.d, amount, L.today())) return void toast('Этот платёж уже оплачен');
    commit(); toast('Оплачено: ' + b.name + ' · ' + fmt(amount));
  }, payOpen: (d) => openPay(d.b, d.d),
  paySave: (d) => {
    const amount = L.parseMoney(val('f-amount')), date = val('f-date'), b = S.bills.find((x) => x.id === d.b);
    if (!amount || amount <= 0) return void ($('#f-err').textContent = 'Введите сумму больше нуля');
    if (!L.validDate(date)) return void ($('#f-err').textContent = 'Укажите дату оплаты');
    if (!L.payBill(S, b, d.d, amount, date)) return void ($('#f-err').textContent = 'Этот платёж уже оплачен');
    commit(); closeSheet(); toast('Платёж оплачен');
  },
  paySkip: (d) => { const b = S.bills.find((x) => x.id === d.b); b.skipped = (b.skipped || []).concat(d.d); commit(); closeSheet(); toast('Платёж пропущен'); },
  unskip: (d) => { const b = S.bills.find((x) => x.id === d.b); b.skipped = (b.skipped || []).filter((x) => x !== d.d); commit(); toast('Платёж возвращён в список'); },
  unpay: (d) => { const t = S.txs.find((x) => x.billId === d.b && x.dueDate === d.d); if (t) ask({ title: 'Отменить оплату?', text: 'Расход ' + fmt(t.amount) + ' будет удалён, деньги вернутся в конверт.', ok: 'Отменить оплату', danger: true, onOk: () => { L.deleteTx(S, t.id); commit(); toast('Оплата отменена'); } }); },
  ruleEdit: (d) => openRule(d.id),
  ruleType: (d) => { ruleCollect(); rs.type = d.k; renderRuleSheet(); },
  ruleSave: () => {
    ruleCollect();
    if ((rs.type === 'pctIncome' || rs.type === 'pctRemainder') && !(rs.pct > 0 && rs.pct <= 100)) return void ($('#f-err').textContent = 'Процент должен быть от 0 до 100');
    if ((rs.type === 'fixedMonth' || rs.type === 'fixedEach') && !(rs.amount > 0)) return void ($('#f-err').textContent = 'Введите сумму больше нуля');
    if (rs.type === 'goal' && !L.cat(S, rs.id).goal) return void ($('#f-err').textContent = 'Сначала задайте цель: сумму и дату в карточке категории');
    if (rs.max > 0 && rs.min > rs.max) return void ($('#f-err').textContent = 'Минимум не может быть больше максимума');
    const c = L.cat(S, rs.id); c.rule = { type: rs.type, amount: rs.amount, pct: rs.pct, priority: rs.priority, min: rs.min, max: rs.max };
    commit(); closeSheet(); toast('Правило сохранено');
  },
  pvConflict: (d) => { ui.pv.mode = d.mode; pvCompute(); }, pvRecalc: () => { ui.pv.mode = null; pvCompute(); }, pvApply,
  catNew: (d) => openCatNew(d.g), catEdit: (d) => openCatEdit(d.id),
  catSave: (d) => {
    const name = val('f-name').trim(); if (!name) return void ($('#f-err').textContent = 'Введите название');
    if (d.id) { const c = L.cat(S, d.id); c.name = name; c.icon = icoState.cat || ''; if (val('f-grp') && val('f-grp') !== c.groupId) { c.groupId = val('f-grp'); } }
    else { const g = L.group(S, d.g); const nc = L.newCat(g.id, name, g.kind); nc.icon = icoState.cat || ''; S.cats.push(nc); }
    commit(); closeSheet(); toast('Сохранено');
  },
  catDel: (d) => { closeSheet(); delCat(d.id); }, catUp: (d) => swapCat(d.id, -1), catDn: (d) => swapCat(d.id, 1),
  planAdd: () => { S.plan.push({ id: L.uid(), name: 'Поступление ' + (S.plan.length + 1), day: 1, amount: 0 }); commit(); },
  planDel: (d) => { const p = S.plan.find((x) => x.id === d.id); ask({ title: 'Убрать «' + p.name + '»?', text: 'Уже полученные деньги останутся в истории.', ok: 'Убрать', danger: true, onOk: () => { S.plan = S.plan.filter((x) => x.id !== p.id); commit(); } }); },
  export: () => {
    const bk = $('#bk'); bk.value = JSON.stringify({ app: 'budget-planner', version: 1, exportedAt: new Date().toISOString(), data: S }, null, 1);
    $('#bk-w').hidden = false; bk.focus(); bk.select();
  },
  copy: () => {
    const bk = $('#bk'); bk.select();
    const fb = () => { try { document.execCommand('copy'); toast('Скопировано'); } catch (e) { toast('Выделите текст и скопируйте вручную'); } };
    try { navigator.clipboard.writeText(bk.value).then(() => toast('Скопировано'), fb); } catch (e) { fb(); }
  },
  import: () => {
    const err = (t) => { $('#imp-err').textContent = t; };
    let n = null;
    try { const o = JSON.parse(val('imp')); n = L.normalize(o && o.data ? o.data : o); } catch (e) { return err('Не удалось прочитать текст. Вставьте копию целиком.'); }
    if (!n) return err('Это не похоже на резервную копию бюджета.');
    err('');
    ask({ title: 'Заменить данные из копии?', text: 'В копии: ' + n.txs.length + ' ' + plural(n.txs.length, ['операция', 'операции', 'операций']) + ', ' + n.bills.length + ' ' + plural(n.bills.length, ['платёж', 'платежа', 'платежей']) + ', ' + n.cats.length + ' ' + plural(n.cats.length, ['категория', 'категории', 'категорий']) + '. Текущие данные будут заменены, дубликатов не появится.', ok: 'Восстановить', onOk: () => { S = n; ui.screen = null; commit(); toast('Данные восстановлены'); } });
  },
  demoOn: () => {
    const go = () => {
      if (!S.settings.demo) { const j = JSON.stringify(S); memStash = j; try { localStorage.setItem(STASH, j); } catch (e) { /* остаётся в памяти */ } }
      S = L.demoState(); ui.screen = null; ui.month = L.monthOf(L.today()); commit(false); toast('Загружены демо-данные');
    };
    ask({ title: 'Загрузить демо-данные?', text: 'Ваши данные сохранятся и вернутся, когда вы выйдете из демо.', ok: 'Загрузить', onOk: go });
  },
  demoOff: () => {
    let j = memStash; try { j = localStorage.getItem(STASH) || j; } catch (e) { /* пусто */ }
    let n = null; try { n = j ? L.normalize(JSON.parse(j)) : null; } catch (e) { n = null; }
    S = n || L.newState(); if (!n) S.settings.setupDone = false;
    try { localStorage.removeItem(STASH); } catch (e) { /* пусто */ } memStash = null;
    ui.screen = S.settings.setupDone ? null : 'wizard'; ui.wiz = 0; commit(false); toast('Ваши данные возвращены');
  },
  resetAll: () => ask({ title: 'Удалить все данные?', text: 'Операции, платежи, категории и правила исчезнут с этого устройства. Это нельзя отменить. Сначала сделайте резервную копию.', ok: 'Удалить всё', danger: true, onOk: () => { S = L.newState(); ui.wiz = 0; ui.screen = 'wizard'; ui.month = L.monthOf(L.today()); commit(false); } }),
  wizNext: () => { ui.wiz = Math.min(4, ui.wiz + 1); renderScreen(true); }, wizBack: () => { ui.wiz = Math.max(0, ui.wiz - 1); renderScreen(true); },
  wizSkipAll: () => { S.settings.setupDone = true; ui.screen = null; commit(false); toast('Настроите позже в разделе настроек'); },
  wizFinish: () => { S.settings.setupDone = true; if (!S.txs.length) S.settings.trackFrom = L.monthOf(L.today()); ui.screen = null; ui.month = L.monthOf(L.today()); commit(false); toast('Настройка сохранена'); },
  wizPreset: () => { S.cats.forEach((c) => { if (PRESET[c.name] && c.rule.type === 'manual') { c.rule.type = 'pctIncome'; c.rule.pct = PRESET[c.name]; } }); commit(); toast('Пример подставлен. Измените под себя'); },
};
const editTx = () => { const b = document.querySelector('#ov [data-a="expSave"]'); return b && b.dataset.id ? S.txs.find((t) => t.id === b.dataset.id) : null; };
function catDeficit(id, amount) {
  const pend = L.pendingSum(S, id, ui.month); if (pend <= 0) return 0;
  const after = Math.max(0, L.env(S, id, ui.month).bal - amount);
  return Math.max(0, pend - after);
}
const I = {
  catAmt: (el) => {
    warnAck = false; const sv = document.getElementById('f-save'); if (sv && el.dataset.mode !== 'top') sv.textContent = el.dataset.mode === 'move' ? 'Перенести' : 'Вернуть';
    const w = document.getElementById('f-warn'); if (!w || el.dataset.mode === 'top') return;
    const a = L.parseMoney(el.value) || 0, d = catDeficit(el.dataset.id, a);
    w.innerHTML = d > 0 ? '<div class="banner bad"><div><b>Не хватит на платежи.</b> Эти деньги отложены на неоплаченные платежи категории. После операции не хватит ' + fmt(d) + '.</div></div>' : '';
  },
  expAmt: () => expInfo(editTx()),
  icoEmoji: (el) => { const v = Array.from(el.value.trim()).slice(0, 2).join(''); icoSet(el.dataset.t, v, (document.getElementById('f-name') || {}).value); },
  fxRate: (el) => { el.dataset.touched = '1'; fxAfter(el.dataset.p); },
  goalLive: () => goalLive(),
  qText: () => qUpdate(), qAmt: () => { qk.amtManual = true; qCheck(); },
  pv: () => pvLive(),
  catName: (el) => { const c = L.cat(S, el.dataset.id); if (c && el.value.trim()) { c.name = el.value.trim(); save(); } },
  planName: (el) => { const p = S.plan.find((x) => x.id === el.dataset.id); if (p && el.value.trim()) { p.name = el.value.trim(); save(); } },
  planDay: (el) => { const p = S.plan.find((x) => x.id === el.dataset.id), n = parseInt(el.value, 10); el.classList.toggle('err', !(n >= 1 && n <= 31)); if (p && n >= 1 && n <= 31) { p.day = n; if (p.dayTo && p.dayTo <= n) { p.dayTo = 0; const t = document.getElementById('pt-' + p.id); if (t) t.value = ''; } planHintUpd(p); save(); } },
  planDayTo: (el) => { const p = S.plan.find((x) => x.id === el.dataset.id), raw = el.value.trim(), n = parseInt(raw, 10); if (raw === '') { el.classList.remove('err'); if (p) { p.dayTo = 0; planHintUpd(p); save(); } return; } const okv = n > p.day && n <= 31; el.classList.toggle('err', !okv); if (okv) { p.dayTo = n; planHintUpd(p); save(); } },
  profName: (el) => { S.settings.name = el.value.trim().slice(0, 30); save(); },
  dateMask: (el, e) => { const v = maskDate(el.value, e && e.inputType && e.inputType.indexOf('delete') === 0); if (v !== el.value) el.value = v; const pk = el.parentNode.querySelector('.calp'); if (pk) { const iso = readDate(el.value); pk.value = iso && iso !== 'invalid' ? iso : ''; } if (document.getElementById('g-prev')) goalLive(); },
  planAmt: (el) => { const p = S.plan.find((x) => x.id === el.dataset.id), v = el.value.trim() === '' ? 0 : L.parseMoney(el.value); el.classList.toggle('err', v === null); if (p && v !== null) { p.amount = v; save(); } },
  startBal: (el) => { const v = el.value.trim() === '' ? 0 : L.parseMoney(el.value, true); el.classList.toggle('err', v === null); if (v !== null) { S.settings.startBalance = v; save(); } },
  resPct: (el) => { const v = el.value.trim() === '' ? 0 : parseFloat(el.value.replace(',', '.')); el.classList.toggle('err', !(v >= 0 && v <= 100)); if (v >= 0 && v <= 100) { S.settings.reservePct = v; save(); } },
  resFix: (el) => { const v = el.value.trim() === '' ? 0 : L.parseMoney(el.value); el.classList.toggle('err', v === null); if (v !== null) { S.settings.reserveFixed = v; save(); } },
  wizVal: (el) => { const c = L.cat(S, el.dataset.id), pc = c.rule.type === 'pctIncome' || c.rule.type === 'pctRemainder'; if (pc) { const v = parseFloat(el.value.replace(',', '.')); c.rule.pct = v > 0 && v <= 100 ? v : 0; } else c.rule.amount = L.parseMoney(el.value) || 0; save(); },
};
const C = {
  period: (el) => { document.getElementById('f-ivw').hidden = el.value !== 'custom'; },
  hCat: (el) => { ui.fCat = el.value; render(); },
  pvFresh: (el) => { ui.pv.fresh = el.checked; pvCompute(); },
  cur: (el) => { S.settings.currency = el.value; commit(); },
  cents: (el) => { S.settings.cents = el.value; commit(); },
  datePick: (el) => { const t = document.getElementById(el.dataset.for); if (t && el.value) { t.value = el.value.slice(8) + '.' + el.value.slice(5, 7) + '.' + el.value.slice(0, 4); t.classList.remove('err'); if (document.getElementById('g-prev')) goalLive(); } },
  qCat: () => { qk.catManual = true; qCheck(); },
  goalCat: () => goalLive(),
  fxCur: (el) => { const p = el.id.split('-')[0]; if (p === 'q') qk.curManual = true; fxChanged(p); },
  goalFile: (el) => { const f = el.files && el.files[0]; if (!f) return; resizeImage(f, (u) => { if (u) { goalPhoto = u; goalPhotoUpd(); } else toast('Не удалось прочитать фото'); }, 720, 400); },
  icoFile: (el) => { const f = el.files && el.files[0]; if (!f) return; resizeImage(f, (u) => { if (u) icoSet(el.dataset.t, u, (document.getElementById('f-name') || {}).value); else toast('Не удалось прочитать картинку'); }); },
  wizType: (el) => { const c = L.cat(S, el.dataset.id); c.rule.type = el.value; commit(); },
  impFile: (el) => { const f = el.files && el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { document.getElementById('imp').value = String(r.result || ''); }; r.readAsText(f); },
};

document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('ov')) { closeSheet(); return; }
  if (e.target.classList && e.target.classList.contains('calp')) { try { if (e.target.showPicker) e.target.showPicker(); } catch (er) { /* нативный выбор откроется сам */ } return; }
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (fn) fn(el.dataset, el);
});
document.addEventListener('input', (e) => { if (e.target.matches && e.target.matches('input[inputmode="decimal"]') && moneyField(e.target)) groupInput(e.target); const k = e.target.dataset && e.target.dataset.i; if (k && I[k]) I[k](e.target, e); });
document.addEventListener('change', (e) => { const k = e.target.dataset && e.target.dataset.c; if (k && C[k]) C[k](e.target); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* не критично */ }
S = load();
if (!S.settings.setupDone) { ui.screen = 'wizard'; ui.wiz = 0; }
if (L.monthOf(L.today()) < S.settings.trackFrom) ui.month = S.settings.trackFrom;
render();
try { if (/[?&]voice=1/.test(location.search) && S.settings.setupDone) { history.replaceState(null, '', location.pathname); setTimeout(() => openQuick(true), 150); } } catch (e) { /* не критично */ }
