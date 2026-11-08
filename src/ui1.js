/* ===== ИНТЕРФЕЙС: ядро, главная, бюджет ===== */
const KEY = 'budget.planner.v1', STASH = 'budget.planner.v1.stash';
let persistOK = true;
let S = null;
const ui = { tab: 'home', month: L.monthOf(L.today()), fCat: '', fType: 'all', fAll: false, allBills: false, screen: null, wiz: 0, pv: null };
const $ = (s, r) => (r || document).querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const monthLabel = (m) => MONTHS[+m.slice(5) - 1] + ' ' + m.slice(0, 4);
const fmtDate = (d) => (+d.slice(8)) + ' ' + MS[+d.slice(5, 7) - 1] + (d.slice(0, 4) !== L.today().slice(0, 4) ? ' ' + d.slice(0, 4) : '');
const plural = (n, f) => { n = Math.abs(n) % 100; const k = n % 10; return n > 10 && n < 20 ? f[2] : k > 1 && k < 5 ? f[1] : k === 1 ? f[0] : f[2]; };
const ICON = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5.5 10v10h13V10"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10.5h18"/><path d="M16 14.7h1.5"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M9 15.2l2 2 4-4"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', gear: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  l: '<path d="M15 6l-6 6 6 6"/>', r: '<path d="M9 6l6 6-6 6"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', up: '<path d="M6 14l6-6 6 6"/>', dn: '<path d="M6 10l6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', tr: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/>', ed: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
};
const ic = (n) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>';

/* ---------- хранение ---------- */
// Ключ хранения и прежние поля не меняются. Перед первым сохранением в новом формате прежние данные
// дополнительно копируются в отдельный ключ (он никогда не перезаписывается и не удаляется приложением).
function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw), n = L.normalize(parsed);
      if (n) {
        const sv = parsed && parsed.schema ? parsed.schema : 1;
        if (sv < L.SCHEMA) { try { if (!localStorage.getItem(KEY + '.backup-v' + sv)) localStorage.setItem(KEY + '.backup-v' + sv, raw); } catch (e) { /* нет места — данные всё равно остаются в основном ключе */ } }
        return n;
      }
    }
  } catch (e) { persistOK = false; }
  // Данные есть, но не читаются: сохраняем исходный текст, чтобы новое сохранение его не затёрло.
  if (raw) { try { localStorage.setItem(KEY + '.corrupt-' + Date.now(), raw); } catch (e) { /* ничего не поделать */ } }
  return L.newState();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { persistOK = false; } }
function commit(keepScroll) { save(); render(keepScroll !== false); }

/* ---------- форматирование денег ---------- */
const CURS = { RUB: 'Рубль ₽', USD: 'Доллар $', EUR: 'Евро €', KZT: 'Тенге ₸', UAH: 'Гривна ₴', BYN: 'Бел. рубль', GEL: 'Лари ₾', AMD: 'Драм ֏', TRY: 'Лира ₺' };
function fmt(k, o) {
  const frac = S.settings.cents === 'always' ? 2 : (k % 100 === 0 ? 0 : 2);
  let s;
  try { s = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: S.settings.currency, minimumFractionDigits: frac, maximumFractionDigits: frac }).format(k / 100); }
  catch (e) { s = (k / 100).toFixed(frac) + ' ' + S.settings.currency; }
  if (o && o.sign && k > 0) s = '+' + s;
  return s;
}
const groupDigits = (d) => d.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const kopToInput = (k) => (k === 0 ? '' : (k < 0 ? '-' : '') + groupDigits(String(Math.floor(Math.abs(k) / 100))) + (k % 100 === 0 ? '' : ',' + String(Math.abs(k) % 100).padStart(2, '0')));
// Поля сумм: тысячи разделяются пробелами при вводе (100 000, а не 100000). Проценты и курсы не трогаем.
function moneyField(el) {
  const i = el.dataset.i;
  if (i === 'resPct' || i === 'fxRate') return false;
  if (el.id === 'r-val' && typeof rs !== 'undefined' && rs && (rs.type === 'pctIncome' || rs.type === 'pctRemainder')) return false;
  if (i === 'wizVal' && el.getAttribute('placeholder') === '%') return false;
  return true;
}
function groupInput(el) {
  const raw = el.value;
  if (!/^-?[\d\s\u00a0\u202f]*([.,]\d*)?$/.test(raw)) return;
  const caret = el.selectionStart == null ? raw.length : el.selectionStart;
  const keep = raw.slice(0, caret).replace(/[\s\u00a0\u202f]/g, '').length;
  const clean = raw.replace(/[\s\u00a0\u202f]/g, '');
  const neg = clean[0] === '-' ? '-' : '', body = neg ? clean.slice(1) : clean;
  const m = /^(\d*)([.,]?)(\d*)/.exec(body);
  const out = neg + groupDigits(m[1]) + m[2] + m[3].slice(0, 2);
  if (out === raw) return;
  el.value = out;
  let n = 0, pos = 0;
  while (pos < out.length && n < keep) { if (!/[\s\u00a0\u202f]/.test(out[pos])) n++; pos++; }
  try { el.setSelectionRange(pos, pos); } catch (e) { /* не критично */ }
}

/* ---------- мелкие хелперы интерфейса ---------- */
let toastT = null;
function toast(msg) {
  $('#toast') && $('#toast').remove();
  const t = document.createElement('div'); t.className = 'toast'; t.id = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600);
}
function openSheet(html) {
  closeSheet();
  const ov = document.createElement('div'); ov.className = 'ov'; ov.id = 'ov';
  ov.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>';
  document.body.appendChild(ov);
  const f = ov.querySelector('[data-focus]'); if (f) setTimeout(() => f.focus(), 60);
}
function setSheet(html) { const s = document.querySelector('#ov .sheet'); if (s) s.innerHTML = '<div class="grab"></div>' + html; else openSheet(html); }
function closeSheet() { if (typeof stopListen === 'function') stopListen(); const o = $('#ov'); if (o) o.remove(); }
let okCb = null;
function ask(o) {
  okCb = o.onOk;
  openSheet('<h2>' + esc(o.title) + '</h2><p class="muted" style="margin-top:6px">' + o.text + '</p><div class="foot"><button class="btn ' + (o.danger ? 'danger' : 'primary') + ' block" data-a="askOk">' + esc(o.ok || 'Да') + '</button><button class="btn block" data-a="close">Отмена</button></div>');
}
const catName = (id) => { const c = L.cat(S, id); return c ? c.name : 'Удалённая категория'; };
function readDate(t) {
  t = String(t).trim(); if (!t) return '';
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(t); if (!m) return 'invalid';
  const iso = m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  return L.validDate(iso) ? iso : 'invalid';
}
const val = (id) => { const e = document.getElementById(id); if (!e) return ''; return e.dataset.date !== undefined ? readDate(e.value) : e.value; };
const dateField = (id, iso) => '<div class="datew"><input class="in" id="' + id + '" data-date data-i="dateMask" inputmode="numeric" autocomplete="off" placeholder="ДД.ММ.ГГГГ" maxlength="10" value="' + (iso ? iso.slice(8) + '.' + iso.slice(5, 7) + '.' + iso.slice(0, 4) : '') + '"><span class="calb" aria-hidden="true">' + ic('cal') + '<input type="date" class="calp" tabindex="-1" aria-label="Выбрать дату в календаре" data-c="datePick" data-for="' + id + '" value="' + (iso || '') + '"></span></div>';
const gv = (f, m, n) => (S.settings.gender === 'f' ? f : S.settings.gender === 'm' ? m : n);
const spanText = (a, b) => (b > a ? (a.slice(0, 7) === b.slice(0, 7) ? (+a.slice(8)) + '–' + (+b.slice(8)) + ' ' + MS[+a.slice(5, 7) - 1] : fmtDate(a) + ' – ' + fmtDate(b)) : fmtDate(a));
const slotWhen = (x) => (x.dateTo > x.date ? (+x.date.slice(8)) + '–' + (+x.dateTo.slice(8)) + ' ' + MS[+x.date.slice(5, 7) - 1] : fmtDate(x.date));
function greeting() {
  const h = new Date().getHours();
  const g = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
  return g + (S.settings.name ? ', ' + esc(S.settings.name) : '');
}
function shiftMonth(n) { ui.month = L.addMonths(ui.month, n); render(false); }
function minMonth() {
  let m = S.settings.trackFrom;
  S.txs.forEach((t) => { if (L.monthOf(t.date) < m) m = L.monthOf(t.date); });
  S.allocs.forEach((a) => { if (a.month < m) m = a.month; });
  return m;
}
function monthBar(extra) {
  const lo = minMonth() >= ui.month, hi = ui.month >= L.addMonths(L.monthOf(L.today()), 12);
  return '<div class="top"><div class="mbar"><button class="ib" data-a="mprev" aria-label="Предыдущий месяц"' + (lo ? ' disabled style="opacity:.3"' : '') + '>' + ic('l') + '</button><div class="m">' + monthLabel(ui.month) + '</div><button class="ib" data-a="mnext" aria-label="Следующий месяц"' + (hi ? ' disabled style="opacity:.3"' : '') + '>' + ic('r') + '</button></div>' + (extra || '') + '</div>';
}
const defaultDate = () => { const t = L.today(), cm = L.monthOf(t); return ui.month === cm ? t : ui.month < cm ? L.monthEnd(ui.month) : L.monthStart(ui.month); };

/* ---------- рендер ---------- */
function render(keepScroll) {
  const y = window.scrollY;
  const app = $('#app');
  let h = '';
  if (S.settings.demo) h += '<div class="demo"><span>Показаны демо-данные</span><button class="btn sm" data-a="demoOff">Вернуть мои данные</button></div>';
  if (!persistOK) h += '<div class="banner bad" style="margin-bottom:12px">Браузер не разрешает сохранять данные. Пока вкладка открыта, всё работает, но после закрытия данные пропадут. Сделайте резервную копию в настройках.</div>';
  h += ({ home: viewHome, budget: viewBudget, pay: viewPay, hist: viewHist, debts: viewDebts })[ui.tab]();
  app.innerHTML = h;
  const tabBtn = (x) => '<button data-a="tab" data-t="' + x[0] + '" class="' + (ui.tab === x[0] ? 'on' : '') + '"' + (ui.tab === x[0] ? ' aria-current="page"' : '') + '>' + ic(x[1]) + x[2] + '</button>';
  $('#nav').innerHTML = '<div>' + tabBtn(['home', 'home', 'Главная']) + tabBtn(['budget', 'wallet', 'Бюджет']) + '<button class="mic" data-a="qOpen" aria-label="Быстрая запись расхода голосом">' + ic('mic') + '</button>' + tabBtn(['pay', 'cal', 'Платежи']) + tabBtn(['debts', 'debt', 'Долги']) + tabBtn(['hist', 'list', 'История']) + '</div>';
  const fab = $('#fab');
  fab.setAttribute('aria-label', ui.tab === 'pay' ? 'Добавить платёж' : ui.tab === 'debts' ? 'Добавить долг' : 'Добавить');
  fab.dataset.a = ui.tab === 'pay' ? 'billNew' : ui.tab === 'debts' ? 'debtNew' : 'fabMenu';
  if (keepScroll !== false) window.scrollTo(0, y); else window.scrollTo(0, 0);
  renderScreen();
}

/* ---------- Главная ---------- */
function slotRow(x) {
  const d = x.date, range = x.dateTo > x.date;
  const right = x.received
    ? '<div class="amt pos">' + fmt(x.tx.amount) + '</div>'
    : '<button class="btn soft sm" data-a="recv" data-slot="' + x.slot.id + '">' + gv('Получила', 'Получил', 'Поступило') + '</button>';
  const status = x.received ? 'Получено ' + fmtDate(x.tx.date) + (x.tx.planned && x.tx.amount !== x.tx.planned ? ' · план ' + fmt(x.tx.planned) : '')
    : (x.planned > 0 ? 'Ожидается · план ' + fmt(x.planned) : 'Ожидается · сумма не задана');
  return '<div class="li"><div style="width:' + (range ? 58 : 46) + 'px;text-align:center;flex:none"><div class="num" style="font-size:' + (range ? 17 : 22) + 'px;font-weight:600;line-height:1.1">' + (range ? (+d.slice(8)) + '–' + (+x.dateTo.slice(8)) : (+d.slice(8))) + '</div><div class="xs muted">' + MS[+d.slice(5, 7) - 1] + '</div></div><div class="sp"><div class="t">' + esc(x.slot.name) + '</div><div class="s">' + status + '</div></div>' + right + '</div>';
}
function catRow(c, m, detailed) {
  const e = L.env(S, c.id, m), p = L.planned(S, c, m);
  const pct = e.avail > 0 ? e.spent / e.avail : (e.spent > 0 ? 9 : 0);
  const cls = e.bal < 0 ? 'bad' : (e.avail > 0 && pct >= 0.85 ? 'warn' : '');
  const badge = e.bal < 0 ? '<span class="pill bad">Перерасход ' + fmt(-e.bal) + '</span>' : cls === 'warn' ? '<span class="pill warn">Почти исчерпано</span>' : '';
  let body;
  if (detailed) {
    body = '<div class="cols4"><div><div class="l">План на месяц</div><div class="v">' + (p > 0 ? fmt(p) : '—') + '</div></div><div><div class="l">Выделено' + (e.carry ? ' (с переносом)' : '') + '</div><div class="v">' + fmt(e.avail) + '</div></div><div><div class="l">Потрачено</div><div class="v">' + fmt(e.spent) + '</div></div><div><div class="l">Использовано</div><div class="v">' + (e.avail > 0 ? Math.round(pct * 100) + '%' : e.spent > 0 ? '—' : '0%') + '</div></div></div>';
  } else {
    body = '<div class="mini"><span>План <b>' + (p > 0 ? fmt(p) : '—') + '</b></span><span>Выделено <b>' + fmt(e.avail) + '</b></span><span>Потрачено <b>' + fmt(e.spent) + '</b></span></div>';
  }
  return '<button class="cat" data-a="cat" data-id="' + c.id + '"><div class="row">' + catIcon(c) + '<div class="nm sp">' + esc(c.name) + (badge ? '<div style="margin-top:4px">' + badge + '</div>' : '') + '</div><div class="amt ' + (e.bal < 0 ? 'neg' : '') + '">' + fmt(e.bal) + '</div></div>' + body + '<div class="prog ' + cls + '"><i style="width:' + Math.min(100, Math.round(pct * 100)) + '%"></i></div>' + goalLine(c, m) + '</button>';
}
function billRow(it, opts) {
  opts = opts || {};
  const cat = catName(it.bill.catId);
  let badge = '';
  if (it.paid) badge = '<span class="pill ok">оплачено ' + fmtDate(it.tx.date) + '</span>';
  else if (it.skipped) badge = '<span class="pill">пропущен</span>';
  else {
    if (it.short > 0) badge = '<span class="pill warn">не отложено ' + fmt(it.short) + '</span>';
    else if (it.covered != null) badge = '<span class="pill ok">деньги отложены</span>';
    if (it.dueEnd < L.today()) badge = '<span class="pill bad">просрочен</span> ' + badge;
  }
  const act = it.paid ? 'unpay' : it.skipped ? 'unskip' : 'pay';
  return '<div class="li" style="gap:10px">' + (opts.check ? '<button class="chk ' + (it.paid ? 'on' : '') + '" data-a="' + act + '" data-b="' + it.bill.id + '" data-d="' + it.due + '" aria-label="' + (it.paid ? 'Отменить оплату' : it.skipped ? 'Вернуть платёж' : 'Отметить оплаченным') + '">' + ic('ok') + '</button>' : '') +
    '<button class="sp" style="text-align:left;min-width:0" data-a="' + (opts.check ? 'billEdit' : 'payOpen') + '" data-b="' + it.bill.id + '" data-d="' + it.due + '"><div class="t">' + esc(it.bill.name) + '</div><div class="s">' + spanText(it.due, it.dueEnd) + ' · ' + esc(cat) + '</div><div style="margin-top:4px">' + badge + '</div></button><div class="amt">' + fmt(it.amount) + '</div></div>';
}
function viewHome() {
  const m = ui.month, T = L.totals(S, m), isNow = m === L.monthOf(L.today());
  const share = T.cash > 0 ? Math.min(100, Math.round(T.pos / T.cash * 100)) : 0;
  const pendSum = T.pending.reduce((s, i) => s + i.amount, 0);
  let h = monthBar('<button class="ib" data-a="settings" aria-label="Настройки бюджета">' + ic('gear') + '</button>');
  h += '<div class="sm muted" style="margin:-6px 4px 12px">' + greeting() + '</div><div class="stack">';
  h += '<section class="hero"><div class="eyebrow">' + (isNow ? 'Сейчас на руках' : 'На конец месяца на руках') + '</div><div class="big">' + fmt(T.cash) + '</div><div class="split"><i style="width:' + share + '%"></i></div><div class="legend"><span>В конвертах ' + fmt(T.pos) + '</span><span>Не распределено ' + fmt(T.unalloc) + '</span></div></section>';
  h += '<section class="safe"><div class="lab">Можно потратить свободно</div><div class="v">' + fmt(T.safe) + '</div><p>' + (T.unfunded > 0 ? 'Свободные деньги ' + fmt(Math.max(0, T.unalloc)) + ' минус ' + fmt(T.unfunded) + ' на платежи, которые пока не обеспечены.' : 'Деньги, которые не нужны ни в конвертах, ни на неоплаченные платежи.') + '</p></section>';
  if (T.unalloc < 0) h += '<div class="banner bad"><div>Выделено больше, чем есть на руках: на <b>' + fmt(-T.unalloc) + '</b>. Уменьшите суммы в конвертах или верните деньги в свободные.</div></div>';
  else if (T.over > 0) h += '<div class="banner"><div>Перерасход по категориям: <b>' + fmt(T.over) + '</b>. Он покрыт из свободных денег. Можно изменить бюджет категории.</div></div>';
  if (T.unfunded > 0) h += '<div class="banner"><div>Пока не отложено на платежи: <b>' + fmt(T.unfunded) + '</b>. <button class="link" style="min-height:0" data-a="alloc">Распределить деньги</button></div></div>';
  h += '<div class="quick"><button class="btn primary" data-a="recv">' + gv('Получила деньги', 'Получил деньги', 'Деньги поступили') + '</button><button class="btn" data-a="alloc">Распределить деньги</button><button class="btn" data-a="expNew">Добавить расход</button><button class="btn" data-a="incExtra">Добавить доход</button></div>';
  h += '<div class="grid2"><div class="stat"><div class="l">Получено за месяц</div><div class="v">' + fmt(T.incomeM) + '</div></div><div class="stat"><div class="l">Потрачено</div><div class="v">' + fmt(T.spentM) + '</div></div><div class="stat"><div class="l">Отложено под платежи</div><div class="v">' + fmt(T.reserved) + '</div><div class="xs muted">к оплате ' + fmt(pendSum) + '</div></div><div class="stat"><div class="l">Можно распределить</div><div class="v ' + (T.unalloc < 0 ? 'neg' : '') + '">' + fmt(T.unalloc) + '</div></div></div>';
  h += '</div>';
  const slots = L.slots(S, m);
  h += '<div class="sect"><h2>Поступления</h2><button class="link" data-a="settings">Настроить</button></div>';
  h += slots.length ? '<div class="list">' + slots.map(slotRow).join('') + '</div>' : '<div class="card empty"><h3>Поступления не настроены</h3><p>Укажите даты и суммы, когда вы получаете деньги.</p><button class="btn soft" data-a="settings">Настроить</button></div>';
  const up = ui.allBills ? T.pending : T.pending.slice(0, 4);
  h += '<div class="sect"><h2>Ближайшие платежи</h2><button class="link" data-a="tab" data-t="pay">Вкладка платежей</button></div>';
  h += up.length ? '<div class="list">' + up.map((i) => billRow(i, {})).join('') + '</div>' + (T.pending.length > 4 ? '<button class="btn soft block" style="margin-top:10px" data-a="billsAll">' + (ui.allBills ? 'Свернуть список' : 'Показать все платежи (' + T.pending.length + ')') + '</button>' : '') : '<div class="card empty"><h3>Платежей к оплате нет</h3><p>' + (S.bills.length ? 'Всё оплачено или платежей в этом месяце нет.' : 'Добавьте кредиты, подписки и другие регулярные платежи.') + '</p>' + (S.bills.length ? '' : '<button class="btn soft" data-a="billNew">Добавить платёж</button>') + '</div>';
  h += goalsHome(m);
  h += debtsHome();
  h += '<div class="sect"><h2>Категории</h2><button class="link" data-a="tab" data-t="budget">Бюджет</button></div>';
  h += '<div class="chips grpchips">' + S.groups.filter((g) => S.cats.some((c) => c.groupId === g.id)).map((g) => '<button class="chip" data-a="grpGo" data-id="' + g.id + '">' + esc(g.name) + '</button>').join('') + '</div>';
  h += catGroups(m, false);
  return h;
}
function catGroups(m, detailed) {
  let h = '';
  S.groups.forEach((g) => {
    const cs = S.cats.filter((c) => c.groupId === g.id);
    if (!cs.length && !detailed) return;
    const tot = cs.reduce((s, c) => s + L.env(S, c.id, m).bal, 0);
    h += '<div class="gh" id="grp-' + g.id + '" style="scroll-margin-top:76px"><h3>' + esc(g.name) + '</h3><span class="xs muted">осталось <span class="num">' + fmt(tot) + '</span></span></div><div class="list">';
    h += cs.length ? cs.map((c) => catRow(c, m, detailed)).join('') : '<div class="li muted sm">В этой группе пока нет категорий</div>';
    if (detailed) h += '<button class="li" style="color:var(--accent-deep);font-weight:500" data-a="catNew" data-g="' + g.id + '">' + ic('plus').replace('<svg', '<svg width="20" height="20" style="stroke:currentColor;fill:none;stroke-width:2"') + 'Добавить категорию</button>';
    h += '</div>';
  });
  return h;
}

/* ---------- Бюджет ---------- */
function viewBudget() {
  const m = ui.month, T = L.totals(S, m);
  let h = monthBar('<button class="ib" data-a="settings" aria-label="Настройки бюджета">' + ic('gear') + '</button>');
  h += '<div class="card stack"><div><div class="muted sm">Не распределено</div><div class="num" style="font-size:36px;font-weight:600;letter-spacing:-.03em;' + (T.unalloc < 0 ? 'color:var(--bad)' : '') + '">' + fmt(T.unalloc) + '</div><div class="sm muted">Деньги на руках ' + fmt(T.cash) + ', в конвертах ' + fmt(T.pos) + '</div></div>';
  h += '<button class="btn primary block" data-a="alloc">Распределить автоматически</button><div class="two"><button class="btn" data-a="rules">Правила</button><button class="btn" data-a="settings">Категории</button></div></div>';
  if (T.unalloc < 0) h += '<div class="banner bad" style="margin-top:12px"><div>Выделено больше, чем есть: нужно вернуть в свободные <b>' + fmt(-T.unalloc) + '</b>.</div></div>';
  h += '<p class="xs muted" style="margin:12px 4px 0">Остаток каждой категории переходит в следующий месяц. Перерасход можно закрыть, перенеся деньги из другой категории.</p>';
  h += catGroups(m, true);
  return h;
}

/* ---------- Лист категории ---------- */
function openCat(id, mode) {
  const c = L.cat(S, id); if (!c) return;
  const m = ui.month, e = L.env(S, id, m), T = L.totals(S, m);
  const pend = L.pendingSum(S, id, m);
  mode = mode || 'view';
  const back = '<button class="btn block" data-a="cat" data-id="' + id + '">Назад</button>';
  if (mode === 'view') {
    const p = L.planned(S, c, m), pct = e.avail > 0 ? e.spent / e.avail : 0;
    setSheet('<h2 style="display:flex;align-items:center;gap:10px">' + catIcon(c).replace('ico ', 'ico big ') + esc(c.name) + '</h2><div class="muted sm">' + esc(L.group(S, c.groupId) ? L.group(S, c.groupId).name : '') + '</div>' +
      '<div class="num" style="font-size:36px;font-weight:600;margin:10px 0 2px;' + (e.bal < 0 ? 'color:var(--bad)' : '') + '">' + fmt(e.bal) + '</div><div class="sm muted">' + (e.bal < 0 ? 'перерасход, покрыт из свободных денег' : 'осталось в конверте') + '</div>' +
      '<div class="prog ' + (e.bal < 0 ? 'bad' : pct >= .85 ? 'warn' : '') + '"><i style="width:' + Math.min(100, Math.round(pct * 100)) + '%"></i></div>' +
      '<div class="cols4"><div><div class="l">Запланировано</div><div class="v">' + (p > 0 ? fmt(p) : '—') + '</div></div><div><div class="l">Перенос с прошлого</div><div class="v">' + fmt(e.carry) + '</div></div><div><div class="l">Выделено в месяце</div><div class="v">' + fmt(e.alloc) + '</div></div><div><div class="l">Потрачено</div><div class="v">' + fmt(e.spent) + '</div></div></div>' +
      goalBlock(c, m) +
      (pend > 0 ? '<div class="banner" style="margin-top:12px"><div>Под неоплаченные платежи нужно <b>' + fmt(pend) + '</b>, отложено <b>' + fmt(L.committed(S, id, m)) + '</b>.</div></div>' : '') +
      '<div class="foot"><div class="two"><button class="btn primary" data-a="expNew" data-cat="' + id + '">Расход</button><button class="btn soft" data-a="catMode" data-id="' + id + '" data-mode="top">Пополнить</button></div><div class="two"><button class="btn" data-a="catMode" data-id="' + id + '" data-mode="move">Перенести</button><button class="btn" data-a="catMode" data-id="' + id + '" data-mode="rel">Вернуть в свободные</button></div><div class="two"><button class="btn ghost" data-a="ruleEdit" data-id="' + id + '">Правило</button><button class="btn ghost" data-a="catEdit" data-id="' + id + '">Изменить</button></div><button class="btn ghost block" data-a="goalOpen" data-id="' + id + '">' + (c.goal ? 'Изменить цель к дате' : 'Накопить к дате (цель)') + '</button></div>');
    return;
  }
  const titles = { top: 'Пополнить из свободных', move: 'Перенести в другую категорию', rel: 'Вернуть в свободные' };
  const info = mode === 'top' ? 'Свободно: <b>' + fmt(Math.max(0, T.unalloc)) + '</b>' : 'В конверте: <b>' + fmt(Math.max(0, e.bal)) + '</b>';
  let dest = '';
  if (mode === 'move') dest = '<label class="f" for="f-to">Куда перенести</label><select class="sel" id="f-to">' + S.groups.map((g) => '<optgroup label="' + esc(g.name) + '">' + S.cats.filter((x) => x.groupId === g.id && x.id !== id).map((x) => '<option value="' + x.id + '">' + esc(x.name) + ' (' + fmt(L.env(S, x.id, m).bal) + ')</option>').join('') + '</optgroup>').join('') + '</select>';
  setSheet('<h2>' + titles[mode] + '</h2><div class="muted sm">' + esc(c.name) + ' · ' + info + '</div><label class="f" for="f-amount">Сумма</label><input class="in" id="f-amount" inputmode="decimal" autocomplete="off" placeholder="0" data-focus data-i="catAmt" data-id="' + id + '" data-mode="' + mode + '">' + dest +
    '<div class="errt" id="f-err"></div><div id="f-warn"></div><div class="foot"><button class="btn primary block" id="f-save" data-a="catDo" data-id="' + id + '" data-mode="' + mode + '">' + (mode === 'top' ? 'Пополнить' : mode === 'move' ? 'Перенести' : 'Вернуть') + '</button>' + back + '</div>');
}
