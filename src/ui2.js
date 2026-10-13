/* ===== ИНТЕРФЕЙС: платежи, история, формы расходов/доходов/платежей ===== */
const backBtn = (menu) => (menu ? '<button class="btn block" data-a="fabMenu">Назад</button>' : '<button class="btn block" data-a="close">Отмена</button>');
const PERIODS = { month: 'Каждый месяц', week: 'Каждую неделю', year: 'Раз в год', custom: 'Свой интервал', once: 'Один раз' };
const periodText = (b) => (b.period === 'custom' ? 'Каждые ' + (b.interval | 0) + ' ' + plural(b.interval | 0, ['день', 'дня', 'дней']) : PERIODS[b.period] || '');

function decorate(items, m) {
  const cov = L.coverage(S, m), map = {};
  cov.items.forEach((c) => { map[c.bill.id + '|' + c.due] = c; });
  items.forEach((i) => { const c = map[i.bill.id + '|' + i.due]; if (c) { i.covered = c.covered; i.short = c.short; } });
  return items;
}
function viewPay() {
  const m = ui.month;
  const all = decorate(L.billItems(S, m), m);
  const inM = all.filter((i) => i.inMonth && !i.skipped);
  const total = inM.reduce((s, i) => s + i.amount, 0);
  const left = inM.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0);
  const overdue = all.filter((i) => i.overdue);
  const od = overdue.reduce((s, i) => s + i.amount, 0);
  let h = monthBar('<button class="btn soft sm" data-a="billNew">' + 'Добавить</button>');
  h += '<div class="grid2"><div class="stat"><div class="l">Обязательства за месяц</div><div class="v">' + fmt(total) + '</div></div><div class="stat"><div class="l">Осталось оплатить</div><div class="v">' + fmt(left + od) + '</div>' + (od ? '<div class="xs neg">из них просрочено ' + fmt(od) + '</div>' : '') + '</div></div>';
  if (!S.bills.length) {
    h += '<div class="card empty" style="margin-top:16px"><h3>Здесь будут обязательные платежи</h3><p>Кредиты, рассрочки, подписки, аренда. Приложение зарезервирует деньги на них при каждом поступлении.</p><button class="btn primary" data-a="billNew">Добавить платёж</button></div>';
    return h;
  }
  const sec = (title, arr, note) => (arr.length ? '<div class="sect"><h2>' + title + '</h2>' + (note ? '<span class="xs muted">' + note + '</span>' : '') + '</div><div class="list">' + arr.map((i) => billRow(i, { check: true })).join('') + '</div>' : '');
  h += sec('Просрочено', overdue, 'не оплачено в прошлых месяцах');
  h += sec('Ожидают оплаты', inM.filter((i) => !i.paid));
  h += sec('Оплачено', inM.filter((i) => i.paid));
  h += sec('Пропущено', all.filter((i) => i.inMonth && i.skipped));
  if (!all.some((i) => i.inMonth)) h += '<div class="card empty" style="margin-top:16px"><h3>В этом месяце платежей нет</h3><p>Регулярные платежи появятся здесь автоматически по их датам.</p></div>';
  const shown = new Set(all.map((i) => i.bill.id));
  const others = S.bills.filter((b) => !shown.has(b.id));
  if (others.length) {
    h += '<div class="sect"><h2>Не в этом месяце</h2></div><div class="list">' + others.map((b) => {
      const nx = L.occ(b, L.addDays(L.monthEnd(m), 1), L.monthEnd(L.addMonths(m, 36)))[0];
      const ended = b.endDate && b.endDate < L.monthStart(m);
      return '<button class="li" data-a="billEdit" data-b="' + b.id + '"><div class="sp"><div class="t">' + esc(b.name) + '</div><div class="s">' + (ended ? 'закончился ' + fmtDate(b.endDate) : b.date > L.monthEnd(m) ? 'начнётся ' + fmtDate(b.date) : nx ? 'следующий ' + fmtDate(nx) : 'платежей больше нет') + ' · ' + periodText(b) + '</div></div><div class="amt">' + fmt(b.amount) + '</div></button>';
    }).join('') + '</div>';
  }
  return h;
}

/* ---------- платёж: форма ---------- */
function catSelect(id, selected) {
  return '<select class="sel" id="' + id + '">' + S.groups.map((g) => {
    const cs = S.cats.filter((c) => c.groupId === g.id);
    return cs.length ? '<optgroup label="' + esc(g.name) + '">' + cs.map((c) => '<option value="' + c.id + '"' + (c.id === selected ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</optgroup>' : '';
  }).join('') + '</select>';
}
function openBill(id, more) {
  const b = id ? S.bills.find((x) => x.id === id) : null;
  if (!b && !S.cats.length) { toast('Сначала создайте категорию'); return; }
  const first = (S.cats.find((c) => L.catKind(S, c) === 'oblig') || S.cats[0]);
  const d = b || { span: 0, name: '', catId: more && more.catId || first.id, amount: 0, date: defaultDate(), period: 'month', interval: 30, endDate: '', note: '' };
  openSheet('<h2>' + (b ? 'Изменить платёж' : 'Новый платёж') + '</h2>' +
    '<label class="f" for="f-name">Название</label><input class="in" id="f-name" value="' + esc(d.name) + '" placeholder="Например: iCloud 200 ГБ" maxlength="60" ' + (b ? '' : 'data-focus') + '>' +
    '<label class="f" for="f-cat">Категория</label>' + catSelect('f-cat', d.catId) +
    '<div class="two"><div><label class="f" for="f-amount">Сумма</label><input class="in" id="f-amount" inputmode="decimal" autocomplete="off" placeholder="0" value="' + kopToInput(d.amount) + '"></div><div><label class="f" for="f-date">Ближайший платёж</label>' + dateField('f-date', d.date) + '</div></div>' +
    '<label class="f" for="f-dto">Оплатить по (если есть период)</label>' + dateField('f-dto', d.span > 0 ? L.addDays(d.date, d.span) : '') +
    '<label class="f" for="f-period">Периодичность</label><select class="sel" id="f-period" data-c="period">' + Object.keys(PERIODS).map((k) => '<option value="' + k + '"' + (d.period === k ? ' selected' : '') + '>' + PERIODS[k] + '</option>').join('') + '</select>' +
    '<div id="f-ivw" ' + (d.period === 'custom' ? '' : 'hidden') + '><label class="f" for="f-iv">Интервал, дней</label><input class="in" id="f-iv" inputmode="numeric" value="' + (d.interval || 30) + '"></div>' +
    '<label class="f" for="f-end">Дата окончания (если есть)</label>' + dateField('f-end', d.endDate || '') + '' +
    '<label class="f" for="f-note">Комментарий</label><textarea class="ta" id="f-note" maxlength="300">' + esc(d.note || '') + '</textarea>' +
    '<p class="xs muted" style="margin-top:8px">Статус «ожидает» или «оплачено» ставится отдельно для каждой даты в списке платежей.</p>' +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="billSave" data-b="' + (b ? b.id : '') + '">Сохранить</button>' +
    (b ? '<button class="btn danger block" data-a="billDel" data-b="' + b.id + '">Удалить платёж</button>' : (ui.screen === 'wizard' ? '<button class="btn soft block" data-a="billSave" data-b="" data-more="1">Сохранить и добавить ещё</button>' : '')) +
    '<button class="btn block" data-a="close">Отмена</button></div>');
}
function saveBill(id, more) {
  const err = (t) => { $('#f-err').textContent = t; };
  const name = val('f-name').trim(), amount = L.parseMoney(val('f-amount')), date = val('f-date'), period = val('f-period');
  const interval = parseInt(val('f-iv'), 10), end = val('f-end'), dto = val('f-dto');
  if (!name) return err('Введите название платежа');
  if (!amount || amount <= 0) return err('Введите сумму больше нуля');
  if (!L.validDate(date)) return err('Укажите дату ближайшего платежа');
  if (period === 'custom' && !(interval >= 1)) return err('Интервал должен быть не меньше 1 дня');
  if (end && (!L.validDate(end) || end < date)) return err('Дата окончания не может быть раньше даты платежа');
  if (dto && (!L.validDate(dto) || dto < date)) return err('Дата «Оплатить по» не может быть раньше даты платежа');
  if (dto && L.daysBetween(date, dto) > 90) return err('Период оплаты не может быть длиннее 90 дней');
  const o = { span: dto ? L.daysBetween(date, dto) : 0, name, catId: val('f-cat'), amount, date, period, interval: period === 'custom' ? interval : 0, endDate: end || '', note: val('f-note').trim() };
  if (id) Object.assign(S.bills.find((b) => b.id === id), o);
  else S.bills.push(Object.assign({ id: L.uid(), skipped: [] }, o));
  commit(); closeSheet(); toast('Платёж сохранён');
  if (more) openBill(null, { catId: o.catId });
}
function openPay(id, due) {
  const b = S.bills.find((x) => x.id === id); if (!b) return;
  const it = L.billItems(S, ui.month).find((i) => i.bill.id === id && i.due === due) || { amount: b.amount };
  const bal = L.cat(S, b.catId) ? L.env(S, b.catId, L.monthOf(L.today()) > ui.month ? L.monthOf(L.today()) : ui.month).bal : 0;
  openSheet('<h2>' + esc(b.name) + '</h2><div class="muted sm">Платёж на ' + (it.dueEnd ? spanText(due, it.dueEnd) : fmtDate(due)) + ' · ' + esc(catName(b.catId)) + '</div>' +
    '<label class="f" for="f-amount">Сколько оплачено</label><input class="bigin" id="f-amount" inputmode="decimal" value="' + kopToInput(it.amount) + '" data-focus>' +
    '<label class="f" for="f-date">Дата оплаты</label>' + dateField('f-date', L.today()) + '' +
    '<div class="banner ' + (bal >= it.amount ? 'good' : '') + '" style="margin-top:14px"><div>' + (bal >= it.amount ? 'Деньги отложены в категории. Они спишутся один раз.' : 'В категории не хватает <b>' + fmt(it.amount - Math.max(0, bal)) + '</b>. Оплата уменьшит свободные деньги.') + '</div></div>' +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="paySave" data-b="' + id + '" data-d="' + due + '">Оплачено</button><button class="btn block" data-a="paySkip" data-b="' + id + '" data-d="' + due + '">Пропустить этот платёж</button><button class="btn ghost block" data-a="close">Отмена</button></div>');
}

/* ---------- расход ---------- */
let expSel = '';
function openExpense(o) {
  o = o || {};
  const tx = o.txId ? S.txs.find((t) => t.id === o.txId) : null;
  expSel = tx ? (L.cat(S, tx.catId) ? tx.catId : '') : (o.cat || '');
  const d = tx ? tx.date : defaultDate();
  openSheet('<h2>' + (tx ? 'Изменить расход' : 'Расход') + '</h2>' +
    (tx && tx.billId ? '<div class="banner good"><div>Это оплата платежа «' + esc(tx.title) + '».</div></div>' : '') +
    '<input class="bigin" id="f-amount" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Сумма" value="' + (tx ? kopToInput(tx.amount) : '') + '" data-i="expAmt" ' + (tx ? '' : 'data-focus') + '>' +
    '<label class="f">Категория</label>' + S.groups.map((g) => { const cs = S.cats.filter((c) => c.groupId === g.id); return cs.length ? '<div class="xs muted" style="margin:10px 0 6px">' + esc(g.name) + '</div><div class="chips">' + cs.map((c) => '<button class="chip ' + (c.id === expSel ? 'on' : '') + '" data-a="pickCat" data-id="' + c.id + '">' + esc(c.name) + '</button>').join('') + '</div>' : ''; }).join('') +
    '<div class="sm" id="f-info" style="margin-top:12px;min-height:22px"></div>' +
    '<div class="two"><div><label class="f" for="f-date">Дата</label>' + dateField('f-date', d) + '</div><div><label class="f" for="f-title">Название</label><input class="in" id="f-title" maxlength="60" placeholder="Необязательно" value="' + esc(tx ? tx.title : '') + '"></div></div>' +
    '<details style="margin-top:12px"><summary class="sm muted" style="min-height:40px;display:flex;align-items:center">Способ оплаты</summary><select class="sel" id="f-method"><option value="">Не указан</option>' + ['Карта', 'Наличные', 'Перевод', 'Другое'].map((x) => '<option' + (tx && tx.method === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></details>' +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="expSave" data-id="' + (tx ? tx.id : '') + '">Сохранить</button>' + (tx ? '<button class="btn danger block" data-a="txDel" data-id="' + tx.id + '">Удалить расход</button>' : '') + '' + backBtn(o.fromMenu && !tx) + '</div>');
  expInfo(tx);
}
function expInfo(tx) {
  const el = $('#f-info'); if (!el) return;
  if (!expSel) { el.innerHTML = '<span class="muted">Выберите категорию</span>'; return; }
  const date = val('f-date') || defaultDate(), m = L.validDate(date) ? L.monthOf(date) : ui.month;
  const amt = L.parseMoney(val('f-amount')) || 0;
  let bal = L.env(S, expSel, m).bal;
  if (tx && tx.catId === expSel && L.monthOf(tx.date) <= m) bal += tx.amount;
  const after = bal - amt;
  el.innerHTML = 'Остаток: <b>' + fmt(bal) + '</b>' + (amt > 0 ? ' → после <b class="' + (after < 0 ? 'neg' : '') + '">' + fmt(after) + '</b>' : '') + (after < 0 && amt > 0 ? ' <span class="pill bad">перерасход</span>' : '');
}
function saveExpense(id) {
  const err = (t) => { $('#f-err').textContent = t; };
  const amount = L.parseMoney(val('f-amount')), date = val('f-date');
  if (!amount || amount <= 0) return err('Введите сумму больше нуля');
  if (!expSel) return err('Выберите категорию');
  if (!L.validDate(date)) return err('Укажите дату');
  const o = { amount, date, catId: expSel, title: val('f-title').trim(), method: val('f-method') };
  if (id) Object.assign(S.txs.find((t) => t.id === id), o); else L.addExpense(S, o);
  commit(); closeSheet(); toast('Расход сохранён');
}

/* ---------- доход ---------- */
let incSel = 'extra';
function openIncome(o) {
  o = o || {};
  const tx = o.txId ? S.txs.find((t) => t.id === o.txId) : null;
  const only = tx ? '' : (o.only || (o.extra ? 'extra' : ''));
  const pend = only === 'extra' ? [] : L.slots(S, ui.month).filter((x) => !x.received);
  if (only === 'slot' && !pend.length) {
    openSheet('<h2>Плановых поступлений нет</h2><p class="muted" style="margin-top:6px">Все поступления этого месяца уже получены или не настроены. Если пришли другие деньги, добавьте их как доход.</p><div class="foot"><button class="btn primary block" data-a="incExtra">Добавить доход</button><button class="btn block" data-a="close">Закрыть</button></div>');
    return;
  }
  incSel = tx ? (tx.slotId || 'extra') : (only === 'extra' ? 'extra' : (o.slot && pend.some((x) => x.slot.id === o.slot) ? o.slot : (pend.find((x) => x.date <= L.today()) || pend[0] || { slot: { id: 'extra' } }).slot.id));
  const cur = pend.find((x) => x.slot.id === incSel);
  const amount = tx ? tx.amount : (cur && cur.planned > 0 ? cur.planned : 0);
  const src = tx ? tx.source : (cur ? cur.slot.name : '');
  let pick = '';
  if (!tx && only !== 'extra') pick = '<label class="f">Какое поступление</label><div class="chips" id="f-slots">' + pend.map((x) => '<button class="chip ' + (x.slot.id === incSel ? 'on' : '') + '" data-a="pickSlot" data-id="' + x.slot.id + '">' + esc(x.slot.name) + ' · ' + slotWhen(x) + '</button>').join('') + (only === 'slot' ? '' : '<button class="chip ' + (incSel === 'extra' ? 'on' : '') + '" data-a="pickSlot" data-id="extra">Другой доход</button>') + '</div>';
  const recvLabel = gv('Получила деньги', 'Получил деньги', 'Деньги поступили');
  const title = tx ? 'Изменить доход' : only === 'extra' ? 'Новый доход' : recvLabel;
  openSheet('<h2>' + title + '</h2>' + pick +
    '<label class="f" for="f-amount">Сколько поступило</label><input class="bigin" id="f-amount" inputmode="decimal" autocomplete="off" placeholder="0" value="' + kopToInput(amount) + '" data-focus><div class="xs muted" id="f-plan" style="text-align:center;margin-top:6px">' + (cur && cur.planned > 0 ? 'План: ' + fmt(cur.planned) + '. Измените сумму, если пришло другое.' : '') + '</div>' +
    '<div class="two"><div><label class="f" for="f-date">Дата</label>' + dateField('f-date', tx ? tx.date : (L.monthOf(L.today()) === ui.month ? L.today() : (cur ? cur.date : defaultDate()))) + '</div><div><label class="f" for="f-src">Источник</label><input class="in" id="f-src" maxlength="60" placeholder="Например: подработка" value="' + esc(src) + '"></div></div>' +
    (tx ? '' : '<p class="xs muted" style="margin-top:10px">Баланс увеличится сразу. Дальше приложение предложит распределить деньги по правилам.</p>') +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="incSave" data-id="' + (tx ? tx.id : '') + '">' + (tx ? 'Сохранить' : only === 'extra' ? 'Добавить доход' : recvLabel) + '</button>' + (tx ? '<button class="btn danger block" data-a="txDel" data-id="' + tx.id + '">Удалить доход</button>' : '') + '' + backBtn(o.fromMenu && !tx) + '</div>');
}
function saveIncome(id) {
  const err = (t) => { $('#f-err').textContent = t; };
  const amount = L.parseMoney(val('f-amount')), date = val('f-date');
  if (!amount || amount <= 0) return err('Введите сумму больше нуля');
  if (!L.validDate(date)) return err('Укажите дату');
  if (id) {
    Object.assign(S.txs.find((t) => t.id === id), { amount, date, source: val('f-src').trim() });
    commit(); closeSheet(); toast('Доход сохранён');
    if (L.totals(S, L.monthOf(date)).unalloc < 0) setTimeout(() => toast('Выделено больше, чем есть на руках. Проверьте конверты.'), 1800);
    return;
  }
  const tx = L.addIncome(S, { slotId: incSel === 'extra' ? null : incSel, slotMonth: ui.month, date, amount, source: val('f-src').trim() });
  ui.month = L.monthOf(date);
  commit(false); closeSheet();
  openAlloc({ income: tx.id, month: ui.month, refDate: date });
}

/* ---------- История ---------- */
function viewHist() {
  const m = ui.month;
  let rows = [];
  S.txs.forEach((t) => { if (ui.fAll || L.monthOf(t.date) === m) rows.push({ k: 'tx', t, date: t.date }); });
  L.allocGroups(S).forEach((g) => { if (ui.fAll || L.monthOf(g.date) === m) rows.push({ k: 'ag', g, date: g.date }); });
  if (ui.fCat) rows = rows.filter((r) => (r.k === 'tx' ? r.t.type === 'expense' && r.t.catId === ui.fCat : r.g.items.some((a) => a.catId === ui.fCat)));
  if (ui.fType === 'expense') rows = rows.filter((r) => r.k === 'tx' && r.t.type === 'expense');
  if (ui.fType === 'income') rows = rows.filter((r) => r.k === 'tx' && r.t.type === 'income');
  if (ui.fType === 'alloc') rows = rows.filter((r) => r.k === 'ag');
  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const inc = rows.filter((r) => r.k === 'tx' && r.t.type === 'income').reduce((s, r) => s + r.t.amount, 0);
  const exp = rows.filter((r) => r.k === 'tx' && r.t.type === 'expense').reduce((s, r) => s + r.t.amount, 0);
  let h = ui.fAll ? '<div class="top"><div class="pagetitle" style="padding:0 6px">История</div></div>' : monthBar();
  h += '<div class="stack"><div class="chips"><button class="chip ' + (ui.fAll ? 'on' : '') + '" data-a="hAll">Все месяцы</button>' + [['all', 'Все'], ['expense', 'Расходы'], ['income', 'Доходы'], ['alloc', 'Распределение']].map((x) => '<button class="chip ' + (ui.fType === x[0] ? 'on' : '') + '" data-a="hType" data-t="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
  h += '<select class="sel" id="h-cat" data-c="hCat" aria-label="Категория"><option value="">Все категории</option>' + S.groups.map((g) => '<optgroup label="' + esc(g.name) + '">' + S.cats.filter((c) => c.groupId === g.id).map((c) => '<option value="' + c.id + '"' + (ui.fCat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</optgroup>').join('') + '</select></div>';
  if (!rows.length) {
    return h + '<div class="card empty" style="margin-top:16px"><h3>' + (S.txs.length || S.allocs.length ? 'Ничего не найдено' : 'Операций пока нет') + '</h3><p>' + (S.txs.length || S.allocs.length ? 'Измените фильтры или месяц.' : 'Добавьте первый доход или расход.') + '</p><button class="btn primary" data-a="expNew">Добавить расход</button> <button class="btn soft" data-a="incExtra">Добавить доход</button></div>';
  }
  h += '<div class="grid2" style="margin-top:14px"><div class="stat"><div class="l">Доходы</div><div class="v pos">' + fmt(inc) + '</div></div><div class="stat"><div class="l">Расходы</div><div class="v">' + fmt(exp) + '</div></div></div>';
  let last = '';
  rows.forEach((r) => {
    if (r.date !== last) { if (last) h += '</div>'; last = r.date; h += '<div class="gh"><h3>' + fmtDate(r.date) + '</h3></div><div class="list">'; }
    h += histRow(r);
  });
  return h + '</div>';
}
function histRow(r) {
  if (r.k === 'tx') {
    const t = r.t;
    if (t.type === 'income') return '<button class="li" data-a="txOpen" data-id="' + t.id + '"><div class="sp"><div class="t">' + esc(t.source || 'Доход') + '</div><div class="s">' + (t.kind === 'plan' ? 'Плановое поступление' : 'Дополнительный доход') + '</div></div><div class="amt pos">' + fmt(t.amount, { sign: true }) + '</div></button>';
    return '<button class="li" data-a="txOpen" data-id="' + t.id + '"><div class="sp"><div class="t">' + esc(t.title || catName(t.catId)) + '</div><div class="s">' + esc(catName(t.catId)) + (t.method ? ' · ' + esc(t.method) : '') + (t.billId ? ' · платёж' : '') + '</div></div><div class="amt">−' + fmt(t.amount) + '</div></button>';
  }
  const g = r.g, tot = g.items.reduce((s, a) => s + a.amount, 0);
  let title, sub, amt = fmt(Math.abs(tot));
  if (g.kind === 'move') { const a = g.items.find((x) => x.amount < 0), b = g.items.find((x) => x.amount > 0); title = 'Перенос'; sub = esc(catName(a && a.catId)) + ' → ' + esc(catName(b && b.catId)); amt = fmt(b ? b.amount : 0); }
  else if (g.kind === 'income') { title = 'Распределение поступления'; sub = g.items.length + ' ' + plural(g.items.length, ['категория', 'категории', 'категорий']); }
  else { title = tot >= 0 ? 'Пополнение конверта' : 'Возврат в свободные'; sub = esc(catName(g.items[0].catId)); }
  return '<button class="li" data-a="agOpen" data-id="' + esc(g.key) + '"><div class="sp"><div class="t">' + title + '</div><div class="s">' + sub + '</div></div><div class="amt muted">' + amt + '</div></button>';
}
function openAg(key) {
  const g = L.allocGroups(S).find((x) => x.key === key); if (!g) return;
  const ttl = g.kind === 'move' ? 'Перенос между категориями' : g.kind === 'income' ? 'Распределение поступления' : 'Ручное изменение конверта';
  openSheet('<h2>' + ttl + '</h2><div class="muted sm">' + fmtDate(g.date) + ' · деньги на руках не меняются</div><div style="margin-top:10px">' + g.items.map((a) => '<div class="ar"><div class="sp">' + esc(catName(a.catId)) + '</div><div class="amt ' + (a.amount < 0 ? 'neg' : '') + '">' + fmt(a.amount, { sign: true }) + '</div></div>').join('') + '</div><div class="foot"><button class="btn danger block" data-a="agDel" data-id="' + esc(key) + '">Удалить эту запись</button><button class="btn block" data-a="close">Закрыть</button></div>');
}

/* ---------- быстрая запись голосом или текстом ---------- */
let qk = null, rec = null, listening = false, recErr = false;
function openQuick(auto) {
  qk = { catManual: false, amtManual: false, dateOff: 0, words: [], title: '' };
  openSheet('<h2>Быстрая запись</h2><p class="muted sm" style="margin-top:4px">Скажите или напишите: «вода 85» или «купила кофе за 250».</p>' +
    '<div class="qwrap"><input class="in" id="q-text" autocomplete="off" autocapitalize="sentences" placeholder="Что и сколько" data-i="qText"><button class="micb" id="q-mic" data-a="qMic" aria-label="Говорить">' + ic('mic') + '</button></div>' +
    '<div class="sm muted" id="q-status" style="margin-top:8px;min-height:22px" role="status"></div>' +
    '<div class="two" style="margin-top:6px"><div><label class="f" for="q-amt">Сумма</label><input class="in" id="q-amt" inputmode="decimal" placeholder="0" data-i="qAmt"></div><div><label class="f">Когда</label><div class="in" id="q-when" style="display:flex;align-items:center">Сегодня</div></div></div>' +
    '<label class="f" for="q-cat">Категория</label><select class="sel" id="q-cat" data-c="qCat"><option value="">Выберите категорию</option>' + S.groups.map((g) => '<optgroup label="' + esc(g.name) + '">' + S.cats.filter((c) => c.groupId === g.id).map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('') + '</optgroup>').join('') + '</select>' +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" id="q-save" data-a="qSave" disabled>Добавить расход</button><button class="btn ghost block" data-a="qMore">Подробнее</button><button class="btn block" data-a="close">Закрыть</button></div>');
  if (auto) startListen(); else focusQ();
}
const focusQ = () => { const e = document.getElementById('q-text'); if (e) setTimeout(() => e.focus(), 50); };
function qStatus(t, bad) { const e = document.getElementById('q-status'); if (e) { e.textContent = t; e.style.color = bad ? 'var(--warn)' : ''; } }
function qMicUi() { const b = document.getElementById('q-mic'); if (b) { b.classList.toggle('on', listening); b.setAttribute('aria-label', listening ? 'Остановить запись' : 'Говорить'); } }
function qUpdate() {
  const t = val('q-text'), r = L.parseQuick(t);
  qk.words = r.words; qk.title = r.title; qk.dateOff = r.dateOff;
  const amt = document.getElementById('q-amt');
  if (!qk.amtManual) amt.value = r.amount ? kopToInput(r.amount) : '';
  const cat = document.getElementById('q-cat');
  if (!qk.catManual) cat.value = L.guessCat(S, r.words) || '';
  document.getElementById('q-when').textContent = r.dateOff === -1 ? 'Вчера' : 'Сегодня';
  qCheck();
}
function qCheck() {
  const a = L.parseMoney(val('q-amt')), c = val('q-cat'), b = document.getElementById('q-save');
  if (b) b.disabled = !(a > 0 && c);
}
function startListen() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { qStatus('Голосовой ввод здесь недоступен. Наберите текст или нажмите значок микрофона на клавиатуре телефона.', true); focusQ(); return; }
  stopListen(); recErr = false;
  try {
    rec = new SR(); rec.lang = 'ru-RU'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    rec.onstart = () => { listening = true; qMicUi(); qStatus('Слушаю. Скажите, например: «вода 85»'); };
    rec.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' '; const el = document.getElementById('q-text'); if (el) { el.value = t.trim(); qUpdate(); } };
    rec.onerror = (e) => {
      recErr = true;
      const m = { 'not-allowed': 'Нет доступа к микрофону. Разрешите его в настройках браузера или наберите текст.', 'service-not-allowed': 'Нет доступа к микрофону. Разрешите его в настройках браузера или наберите текст.', network: 'Для распознавания голоса нужен интернет. Можно набрать текст.', 'no-speech': 'Речь не распознана. Нажмите микрофон и повторите.', 'audio-capture': 'Микрофон не найден.' };
      qStatus(m[e.error] || 'Голосовой ввод не сработал. Наберите текст.', true);
      if (e.error !== 'no-speech') focusQ();
    };
    rec.onend = () => { listening = false; qMicUi(); if (!recErr) { const el = document.getElementById('q-text'); qStatus(el && el.value.trim() ? 'Проверьте сумму и категорию, затем нажмите «Добавить расход».' : 'Ничего не услышала. Нажмите микрофон и повторите.'); } };
    rec.start();
  } catch (err) { qStatus('Голосовой ввод не запустился. Наберите текст.', true); focusQ(); }
}
function stopListen() { try { if (rec) { rec.onend = null; rec.onerror = null; rec.abort(); } } catch (e) { /* уже остановлено */ } rec = null; listening = false; qMicUi(); }
function saveQuick() {
  const amount = L.parseMoney(val('q-amt')), cid = val('q-cat');
  if (!(amount > 0)) return void (document.getElementById('f-err').textContent = 'Введите сумму больше нуля');
  if (!cid) return void (document.getElementById('f-err').textContent = 'Выберите категорию');
  const date = L.addDays(L.today(), qk.dateOff);
  L.addExpense(S, { date, amount, catId: cid, title: qk.title });
  L.learnCat(S, qk.words, cid);
  commit(); closeSheet(); toast('Записано: ' + (qk.title ? qk.title + ' ' : '') + fmt(amount) + ' · ' + catName(cid));
}
