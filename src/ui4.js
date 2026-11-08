/* ===== ИНТЕРФЕЙС: значки, валюты и курсы, цели, долги ===== */

/* ---------- значки (собственные линейные иконки + эмодзи + своя картинка) ---------- */
Object.assign(ICON, {
  debt: '<path d="M4 8h14M14 4l4 4-4 4"/><path d="M20 16H6M10 12l-4 4 4 4"/>',
  c_home: ICON.home, c_wallet: ICON.wallet,
  c_cart: '<path d="M3 4h2.5l2 11h10l2-8H7"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
  c_car: '<path d="M4 15v-3l2-5h12l2 5v3M4 15h16M4 15v2.5M20 15v2.5"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',
  c_health: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>',
  c_cup: '<path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M16 10h1.5a2 2 0 0 1 0 4H16M8 3v2M12 3v2"/>',
  c_bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  c_sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
  c_star: '<path d="M12 4l2.4 5 5.4.7-4 3.7 1 5.4L12 16.2 7.2 18.8l1-5.4-4-3.7 5.4-.7z"/>',
  c_ticket: '<path d="M4 8V6h16v2a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v2H4v-2a2 2 0 0 0 0-4v0a2 2 0 0 0 0-4z"/><path d="M14 6v12"/>',
  c_gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-3-5 0M12 9c2-4 6-3 5 0"/>',
  c_coin: '<circle cx="12" cy="12" r="8"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-1.9-.4-2.5-1.2M12 6.5V8M12 16v1.5"/>',
  c_shield: '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',
  c_phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  c_card: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  c_repeat: '<path d="M4 11V9a3 3 0 0 1 3-3h11M15 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H6M9 21l-3-3 3-3"/>',
  c_plane: '<path d="M3 13l18-8-6 15-3-6z"/><path d="M12 14l-1 5"/>',
  c_book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
  c_paw: '<circle cx="7" cy="10" r="1.6"/><circle cx="11" cy="7" r="1.6"/><circle cx="15" cy="7" r="1.6"/><circle cx="18.5" cy="10" r="1.6"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 2-4 1.5-2 .5-4 .5-4-1.5z"/>',
  c_tool: '<path d="M14 6a4 4 0 0 0 4.5 5.2L10 19.7a2 2 0 0 1-3-3L15.5 8.2A4 4 0 0 0 14 6z"/>',
  c_leaf: '<path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z"/><path d="M5 19l8-8"/>',
  c_music: '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
  c_film: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M8 5v14M16 5v14M3 10h5M3 14h5M16 10h5M16 14h5"/>',
  c_cloud: '<path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4.8 4.8 0 0 1 17 18z"/>',
});
const ICON_KEYS = ['home', 'cart', 'car', 'health', 'cup', 'bag', 'sparkle', 'star', 'ticket', 'gift', 'coin', 'shield', 'phone', 'card', 'repeat', 'plane', 'book', 'paw', 'tool', 'leaf', 'music', 'film', 'cloud', 'wallet'];
const DEFAULT_ICON = { 'Аренда и коммунальные услуги': 'home', 'Кредиты и рассрочки': 'card', 'Подписки': 'repeat', 'Телефон и интернет': 'phone', 'Страховки и регулярные платежи': 'shield', 'Продукты': 'cart', 'Дом и быт': 'tool', 'Транспорт': 'car', 'Здоровье и аптека': 'health', 'Кафе и доставка': 'cup', 'Одежда и покупки': 'bag', 'Красота и уход': 'sparkle', 'Хобби': 'star', 'Развлечения и отдых': 'ticket', 'Подарки': 'gift', 'Накопления': 'coin', 'Финансовая подушка': 'shield', 'Отпуск и крупные покупки': 'plane' };
// v: '' — по умолчанию, 'none' — без значка, 'ic:ключ' — значок, 'data:image/…' — своя картинка, иначе эмодзи.
function iconHTML(v, name, cls) {
  cls = 'ico ' + (cls || '');
  if (v === 'none') return '';
  if (!v && name && DEFAULT_ICON[name]) v = 'ic:' + DEFAULT_ICON[name];
  if (typeof v === 'string' && v.indexOf('data:image/') === 0) return '<span class="' + cls + '"><img alt="" src="' + esc(v) + '"></span>';
  if (typeof v === 'string' && v.indexOf('ic:') === 0 && ICON['c_' + v.slice(3)]) return '<span class="' + cls + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON['c_' + v.slice(3)] + '</svg></span>';
  if (v && typeof v === 'string' && v.indexOf('ic:') !== 0) return '<span class="' + cls + ' em" aria-hidden="true">' + esc(v) + '</span>';
  const l = String(name || '?').trim().charAt(0).toUpperCase();
  return '<span class="' + cls + ' ltr" aria-hidden="true">' + esc(l) + '</span>';
}
const catIcon = (c) => iconHTML(c.icon, c.name);
const icoState = {};
function iconPicker(t, cur, opts) {
  opts = opts || {};
  icoState[t] = cur || '';
  return '<label class="f">Значок</label><div class="ipk" id="ipk-' + t + '"><div class="ipk-top"><span id="ipk-' + t + '-p">' + iconHTML(cur, opts.name, 'big') + '</span>' +
    '<input class="in" id="ipk-' + t + '-e" maxlength="4" placeholder="Эмодзи" aria-label="Эмодзи вместо значка" data-i="icoEmoji" data-t="' + t + '" autocomplete="off">' +
    (opts.upload ? '<label class="btn sm" style="cursor:pointer">Картинка<input type="file" accept="image/*" hidden data-c="icoFile" data-t="' + t + '"></label>' : '') +
    '<button class="btn sm ghost" data-a="icoPick" data-t="' + t + '" data-v="">Сбросить</button><button class="btn sm ghost" data-a="icoPick" data-t="' + t + '" data-v="none">Без значка</button></div>' +
    '<div class="ipk-grid">' + ICON_KEYS.map((k) => '<button type="button" class="ipk-i' + (cur === 'ic:' + k ? ' on' : '') + '" data-a="icoPick" data-t="' + t + '" data-v="ic:' + k + '" aria-label="Значок ' + k + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON['c_' + k] + '</svg></button>').join('') + '</div></div>';
}
function icoSet(t, v, name) {
  icoState[t] = v;
  const p = document.getElementById('ipk-' + t + '-p'); if (p) p.innerHTML = iconHTML(v, name, 'big');
  document.querySelectorAll('#ipk-' + t + ' .ipk-i').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
}
function resizeImage(file, cb) {
  const r = new FileReader();
  r.onerror = () => cb(null);
  r.onload = () => {
    const img = new Image();
    img.onerror = () => cb(null);
    img.onload = () => {
      const s = 96, c = document.createElement('canvas'); c.width = c.height = s;
      const g = c.getContext('2d'), k = Math.max(s / img.width, s / img.height), w = img.width * k, h = img.height * k;
      g.fillStyle = '#fff'; g.fillRect(0, 0, s, s); g.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
      try { cb(c.toDataURL('image/jpeg', 0.82)); } catch (e) { cb(null); }
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

/* ---------- валюты и курсы ---------- */
const FX_LIST = ['USD', 'EUR', 'TRY', 'THB', 'CNY', 'AED', 'GEL', 'AMD', 'KZT', 'GBP', 'UAH', 'BYN', 'JPY', 'VND'];
const fxBase = () => S.settings.currency;
const fxList = () => FX_LIST.filter((k) => k !== fxBase());
function fxRate(cur) {
  const f = S.fx || {};
  if (f.base === fxBase() && f.per && f.per[cur] > 0) return f.per[cur];
  return (f.last && f.last[cur] > 0) ? f.last[cur] : 0;
}
const fxStale = () => !S.fx || S.fx.base !== fxBase() || !S.fx.at || (Date.now() - Date.parse(S.fx.at)) > 12 * 3600 * 1000;
const rateText = (r) => (r >= 100 ? r.toFixed(2) : r >= 1 ? r.toFixed(2) : r.toFixed(4)).replace('.', ',');
async function fetchRates() {
  const base = fxBase();
  const get = async (url) => { const c = new AbortController(); const t = setTimeout(() => c.abort(), 8000); try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error('http'); return await r.json(); } finally { clearTimeout(t); } };
  try { const f = L.ratesFromApi(await get('https://open.er-api.com/v6/latest/' + base), base); if (f) return f; } catch (e) { /* пробуем следующий источник */ }
  if (base === 'RUB') { try { const f = L.ratesFromCbr(await get('https://www.cbr-xml-daily.ru/daily_json.js')); if (f) return f; } catch (e) { /* нет сети */ } }
  return null;
}
let fxBusy = false;
async function refreshRates(quiet) {
  if (fxBusy) return false; fxBusy = true;
  const f = await fetchRates(); fxBusy = false;
  if (f) { f.last = Object.assign({}, S.fx && S.fx.last, S.fx && S.fx.base === f.base ? S.fx.per : {}); S.fx = f; save(); if (!quiet) toast('Курсы обновлены'); return true; }
  if (!quiet) toast('Не удалось получить курс. Введите его вручную.');
  return false;
}
// Блок «валюта + курс» для форм расхода (p='f') и быстрой записи (p='q').
function fxBlock(p, cur, rate) {
  return '<div class="two" style="margin-top:6px"><div><label class="f" for="' + p + '-cur">Валюта</label><select class="sel" id="' + p + '-cur" data-c="fxCur"><option value="">' + esc(fxBase()) + ' (учётная)</option>' + fxList().map((k) => '<option value="' + k + '"' + (k === cur ? ' selected' : '') + '>' + k + ' ' + L.CURRENCIES[k].sign + ' · ' + L.CURRENCIES[k].name + '</option>').join('') + '</select></div>' +
    '<div id="' + p + '-ratew"' + (cur ? '' : ' hidden') + '><label class="f" for="' + p + '-rate">Курс: 1 ' + (cur || '…') + ' = ? ' + esc(L.CURRENCIES[fxBase()] ? L.CURRENCIES[fxBase()].sign : fxBase()) + '</label><input class="in" id="' + p + '-rate" inputmode="decimal" data-i="fxRate" data-p="' + p + '" value="' + (rate ? rateText(rate).replace(/,?0+$/, '') : '') + '"></div></div>' +
    '<div class="xs muted" id="' + p + '-fxi" style="min-height:18px"></div>';
}
const fxRead = (p) => { const cur = val(p + '-cur') || '', rate = parseFloat(String(val(p + '-rate') || '').replace(',', '.')) || 0; return { cur, rate }; };
function fxInfoUpd(p) {
  const e = document.getElementById(p + '-fxi'); if (!e) return;
  const { cur, rate } = fxRead(p); if (!cur) { e.innerHTML = ''; return; }
  const amt = L.parseMoney(val(p === 'f' ? 'f-amount' : 'q-amt')) || 0;
  const at = S.fx && S.fx.base === fxBase() && S.fx.at ? ' · курс на ' + new Date(S.fx.at).toLocaleDateString('ru-RU') : '';
  e.innerHTML = rate > 0 ? (amt > 0 ? '≈ <b>' + fmt(L.convert(amt, rate)) + '</b> по курсу ' + rateText(rate) + at : 'Курс ' + rateText(rate) + at) + ' <button class="link" style="min-height:0" data-a="fxRefresh" data-p="' + p + '">Обновить</button>' : 'Курс не найден. Введите вручную или <button class="link" style="min-height:0" data-a="fxRefresh" data-p="' + p + '">обновите</button> (нужен интернет).';
}
function fxAfter(p) { fxInfoUpd(p); if (p === 'f') { if (typeof expInfo === 'function') expInfo(editTx()); } else qCheck(); }
async function fxChanged(p) {
  const { cur } = fxRead(p), w = document.getElementById(p + '-ratew'); if (w) w.hidden = !cur;
  const lab = w && w.querySelector('label'); if (lab) lab.firstChild.textContent = 'Курс: 1 ' + (cur || '…') + ' = ? ' + (L.CURRENCIES[fxBase()] ? L.CURRENCIES[fxBase()].sign : fxBase());
  const inp = document.getElementById(p + '-rate'); if (!cur) { fxAfter(p); return; }
  let r = fxRate(cur); if (inp) inp.value = r ? rateText(r).replace(/,?0+$/, '') : '';
  fxAfter(p);
  if (!r || fxStale()) { const ok = await refreshRates(true); const now = fxRead(p).cur; if (ok && now === cur && inp && !inp.dataset.touched) { r = fxRate(cur); if (r) inp.value = rateText(r).replace(/,?0+$/, ''); } fxAfter(p); }
}
// Итог по полям формы: { amount (в учётной валюте), cur, orig, rate } или { error }
function fxCollect(p, amtId) {
  const typed = L.parseMoney(val(amtId)), { cur, rate } = fxRead(p);
  if (!typed || typed <= 0) return { error: 'Введите сумму больше нуля' };
  if (!cur) return { amount: typed };
  if (!(rate > 0)) return { error: 'Укажите курс ' + cur };
  return { amount: L.convert(typed, rate), cur, orig: typed, rate };
}
const fxLabel = (t) => (t.cur ? ' · ' + fmtForeign(t.orig, t.cur) + ' × ' + rateText(t.rate) : '');
function fmtForeign(k, cur) { const frac = k % 100 === 0 ? 0 : 2; try { return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: cur, minimumFractionDigits: frac, maximumFractionDigits: frac }).format(k / 100); } catch (e) { return (k / 100).toFixed(frac) + ' ' + cur; } }

/* ---------- цель к дате ---------- */
function goalBlock(c, m) {
  const gi = L.goalInfo(S, c, m); if (!gi) return '';
  const pct = Math.min(100, Math.round(gi.saved / gi.target * 100));
  return '<div class="card" style="margin-top:12px;padding:12px 14px"><div class="row"><b class="sp">Цель: ' + fmt(gi.target) + '</b><span class="xs muted">к ' + fmtDate(gi.date) + '</span></div><div class="prog"><i style="width:' + pct + '%"></i></div><div class="sm" style="margin-top:6px">' +
    (gi.done ? 'Цель достигнута: накоплено ' + fmt(gi.saved) + '.' : 'Накоплено ' + fmt(gi.saved) + ' (' + pct + '%). ' + (gi.overdue ? 'Срок прошёл, осталось ' + fmt(gi.left) + '.' : 'Чтобы успеть, откладывайте <b>' + fmt(gi.perMonth) + '</b> в месяц (' + gi.months + ' ' + plural(gi.months, ['мес.', 'мес.', 'мес.']) + ' до цели).')) + '</div></div>';
}
function goalLine(c, m) {
  const gi = L.goalInfo(S, c, m); if (!gi) return '';
  return '<div class="xs muted" style="margin-top:6px">Цель ' + fmt(gi.target) + ' к ' + fmtDate(gi.date) + (gi.done ? ' · достигнута' : gi.overdue ? ' · срок прошёл' : ' · откладывать ' + fmt(gi.perMonth) + '/мес.') + '</div>';
}
function openGoal(id) {
  const c = L.cat(S, id); if (!c) return;
  const g = c.goal || { target: 0, date: '' };
  setSheet('<h2>Цель: ' + esc(c.name) + '</h2><p class="muted sm" style="margin-top:4px">Например, отпуск или крупная покупка. Приложение посчитает, сколько откладывать каждый месяц.</p>' +
    '<label class="f" for="g-target">Сколько нужно накопить</label><input class="in" id="g-target" inputmode="decimal" placeholder="0" value="' + kopToInput(g.target) + '" data-i="goalLive" data-focus>' +
    '<label class="f" for="g-date">К какой дате</label>' + dateField('g-date', g.date) +
    '<div id="g-prev" class="banner" style="margin-top:12px"><div></div></div>' +
    '<label class="li" style="padding:10px 0;gap:10px;margin-top:6px"><input type="checkbox" id="g-auto" style="width:22px;height:22px"' + (c.rule.type === 'goal' || !c.goal ? ' checked' : '') + '><span class="sp sm">Откладывать автоматически при распределении поступлений</span></label>' +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="goalSave" data-id="' + id + '">Сохранить цель</button>' + (c.goal ? '<button class="btn danger block" data-a="goalDel" data-id="' + id + '">Убрать цель</button>' : '') + '<button class="btn block" data-a="cat" data-id="' + id + '">Назад</button></div>');
  goalLive();
}
function goalLive() {
  const el = document.getElementById('g-prev'); if (!el) return;
  const idEl = document.querySelector('#ov [data-a="goalSave"]'); const c = idEl && L.cat(S, idEl.dataset.id); if (!c) return;
  const t = L.parseMoney(val('g-target')), d = val('g-date');
  let txt = 'Укажите сумму и дату.';
  if (t > 0 && d && d !== 'invalid' && L.validDate(d)) {
    const gi = L.goalInfo(S, { id: c.id, goal: { target: t, date: d } }, ui.month);
    txt = gi.done ? 'Нужная сумма уже накоплена.' : gi.overdue ? 'Эта дата уже прошла.' : 'Откладывать <b>' + fmt(gi.perMonth) + '</b> в месяц · ' + gi.months + ' ' + plural(gi.months, ['месяц', 'месяца', 'месяцев']) + ' до цели. Уже накоплено ' + fmt(gi.saved) + '.';
  }
  el.firstChild.innerHTML = txt;
}
function saveGoal(id) {
  const c = L.cat(S, id), err = (m) => { $('#f-err').textContent = m; };
  const t = L.parseMoney(val('g-target')), d = val('g-date');
  if (!(t > 0)) return err('Введите сумму больше нуля');
  if (!d || d === 'invalid' || !L.validDate(d)) return err('Укажите дату');
  c.goal = { target: t, date: d };
  if ($('#g-auto').checked) c.rule.type = 'goal'; else if (c.rule.type === 'goal') c.rule.type = 'manual';
  commit(); openCat(id); toast('Цель сохранена');
}

/* ---------- долги ---------- */
function debtRow(d) {
  const left = L.debtLeft(d), paid = L.debtPaid(d), late = d.due && left > 0 && d.due < L.today();
  return '<button class="li" data-a="debtOpen" data-id="' + d.id + '"><div class="sp"><div class="t">' + esc(d.who || 'Без имени') + '</div><div class="s">' + (d.due ? (late ? '<span class="pill bad">срок прошёл</span> ' : '') + 'до ' + fmtDate(d.due) : 'без срока') + (paid > 0 ? ' · возвращено ' + fmt(paid) + ' из ' + fmt(d.amount) : '') + (d.note ? ' · ' + esc(d.note) : '') + '</div></div><div class="amt ' + (d.dir === 'owed' ? 'pos' : '') + '">' + (left > 0 ? fmt(left) : 'закрыт') + '</div></button>';
}
function viewDebts() {
  const T = L.debtTotals(S), open = (dir) => S.debts.filter((d) => d.dir === dir && L.debtLeft(d) > 0).sort((a, b) => (a.due || '9') < (b.due || '9') ? -1 : 1), closed = S.debts.filter((d) => L.debtLeft(d) === 0);
  let h = '<div class="top"><div class="pagetitle" style="font-size:22px;font-weight:600">Долги</div><span style="width:44px"></span></div>';
  h += '<div class="grid2"><div class="stat"><div class="l">' + gv('Я должна', 'Я должен', 'Я должен(на)') + '</div><div class="v">' + fmt(T.owe) + '</div></div><div class="stat"><div class="l">Мне должны</div><div class="v pos">' + fmt(T.owed) + '</div></div></div>';
  const o1 = open('owe'), o2 = open('owed');
  h += '<div class="sect"><h2>' + gv('Я должна', 'Я должен', 'Я должен(на)') + '</h2></div>' + (o1.length ? '<div class="list">' + o1.map(debtRow).join('') + '</div>' : '<div class="card empty"><p>Долгов нет.</p></div>');
  h += '<div class="sect"><h2>Мне должны</h2></div>' + (o2.length ? '<div class="list">' + o2.map(debtRow).join('') + '</div>' : '<div class="card empty"><p>Никто не должен.</p></div>');
  h += '<div style="margin-top:14px"><button class="btn primary block" data-a="debtNew">Добавить долг</button></div>';
  if (closed.length) h += '<details style="margin-top:14px"><summary class="sm muted" style="min-height:44px;display:flex;align-items:center">Закрытые (' + closed.length + ')</summary><div class="list">' + closed.map(debtRow).join('') + '</div></details>';
  h += '<p class="xs muted" style="margin:14px 4px 0">Долги ведутся отдельно и не меняют остатки в конвертах. Когда деньги реально ушли или пришли, добавьте расход или доход.</p>';
  return h;
}
function openDebtEdit(id) {
  const d = id ? S.debts.find((x) => x.id === id) : null;
  const dir = d ? d.dir : 'owe';
  openSheet('<h2>' + (d ? 'Изменить долг' : 'Новый долг') + '</h2>' +
    '<div class="seg" role="group" style="margin-top:10px"><button class="' + (dir === 'owe' ? 'on' : '') + '" data-a="debtDir" data-v="owe">' + gv('Я должна', 'Я должен', 'Я должен(на)') + '</button><button class="' + (dir === 'owed' ? 'on' : '') + '" data-a="debtDir" data-v="owed">Мне должны</button></div><input type="hidden" id="d-dir" value="' + dir + '">' +
    '<label class="f" for="d-who">Кто</label><input class="in" id="d-who" maxlength="60" placeholder="Имя или название" value="' + esc(d ? d.who : '') + '" data-focus>' +
    '<div class="two"><div><label class="f" for="d-amt">Сумма</label><input class="in" id="d-amt" inputmode="decimal" placeholder="0" value="' + (d ? kopToInput(d.amount) : '') + '"></div><div><label class="f" for="d-date">Дата</label>' + dateField('d-date', d ? d.date : L.today()) + '</div></div>' +
    '<label class="f" for="d-due">Вернуть до (если есть срок)</label>' + dateField('d-due', d ? d.due : '') +
    '<label class="f" for="d-note">Комментарий</label><input class="in" id="d-note" maxlength="120" value="' + esc(d ? d.note : '') + '">' +
    '<div class="errt" id="f-err"></div><div class="foot"><button class="btn primary block" data-a="debtSave" data-id="' + (d ? d.id : '') + '">Сохранить</button>' + (d ? '<button class="btn block" data-a="debtOpen" data-id="' + d.id + '">Назад</button>' : '<button class="btn block" data-a="close">Отмена</button>') + '</div>');
}
function saveDebt(id) {
  const err = (m) => { $('#f-err').textContent = m; };
  const who = val('d-who').trim(), amount = L.parseMoney(val('d-amt')), date = val('d-date'), due = val('d-due');
  if (!who) return err('Укажите, кто');
  if (!(amount > 0)) return err('Введите сумму больше нуля');
  if (!date || date === 'invalid') return err('Укажите дату');
  if (due === 'invalid') return err('Проверьте дату срока');
  const o = { who, dir: val('d-dir') === 'owed' ? 'owed' : 'owe', amount, date, due: due || '', note: val('d-note').trim() };
  if (id) Object.assign(S.debts.find((x) => x.id === id), o); else L.addDebt(S, o);
  commit(); closeSheet(); toast('Долг сохранён');
}
function openDebt(id) {
  const d = S.debts.find((x) => x.id === id); if (!d) return;
  const left = L.debtLeft(d), paid = L.debtPaid(d), pct = Math.min(100, Math.round(paid / d.amount * 100));
  setSheet('<h2>' + esc(d.who) + '</h2><div class="muted sm">' + (d.dir === 'owed' ? 'Мне должны' : gv('Я должна', 'Я должен', 'Я должен(на)')) + ' · с ' + fmtDate(d.date) + (d.due ? ' · до ' + fmtDate(d.due) : '') + '</div>' +
    '<div class="num" style="font-size:36px;font-weight:600;margin:10px 0 2px">' + fmt(left) + '</div><div class="sm muted">осталось из ' + fmt(d.amount) + '</div><div class="prog"><i style="width:' + pct + '%"></i></div>' +
    (d.note ? '<p class="sm" style="margin-top:8px">' + esc(d.note) + '</p>' : '') +
    (left > 0 ? '<label class="f" for="d-pay">' + (d.dir === 'owed' ? 'Мне вернули' : 'Я вернула / вернул') + '</label><div class="two"><input class="in" id="d-pay" inputmode="decimal" placeholder="' + kopToInput(left) + '"><div>' + dateField('d-pdate', L.today()) + '</div></div><div class="errt" id="f-err"></div><button class="btn soft block" data-a="debtPay" data-id="' + id + '">Записать возврат</button>' : '<div class="banner good" style="margin-top:12px"><div>Долг закрыт.</div></div>') +
    (d.paid.length ? '<div class="xs muted" style="margin:14px 0 4px">Возвраты</div><div class="list">' + d.paid.map((p, i) => '<div class="li"><div class="sp"><div class="t">' + fmt(p.amount) + '</div><div class="s">' + (p.date ? fmtDate(p.date) : '') + '</div></div><button class="ib" data-a="debtPayDel" data-id="' + id + '" data-i="' + i + '" aria-label="Удалить возврат">' + ic('x') + '</button></div>').join('') + '</div>' : '') +
    '<div class="foot"><div class="two"><button class="btn" data-a="debtEdit" data-id="' + id + '">Изменить</button><button class="btn danger" data-a="debtDel" data-id="' + id + '">Удалить</button></div><button class="btn block" data-a="close">Закрыть</button></div>');
}
function payDebtUi(id) {
  const d = S.debts.find((x) => x.id === id); if (!d) return;
  const a = L.parseMoney(val('d-pay')) || L.debtLeft(d), date = val('d-pdate');
  if (!(a > 0)) return void ($('#f-err').textContent = 'Введите сумму больше нуля');
  if (date === 'invalid') return void ($('#f-err').textContent = 'Проверьте дату');
  const got = L.payDebt(S, id, a, date || L.today());
  if (!got) return void ($('#f-err').textContent = 'Нечего возвращать');
  commit(); openDebt(id); toast(L.debtLeft(d) === 0 ? 'Долг закрыт' : 'Возврат записан');
}

/* ---------- быстрая запись без открытия приложения ---------- */
function voiceHelpHTML() {
  let link = ''; try { link = location.origin + location.pathname + '?voice=1'; } catch (e) { link = ''; }
  return '<h2>Голосовая запись с главного экрана</h2><p class="sm muted" style="margin-top:6px">Настоящий виджет на экран телефона веб-приложение создать не может. Зато можно вынести на главный экран ярлык, который сразу открывает быструю запись с включённым микрофоном.</p>' +
    '<div class="card" style="margin-top:12px"><b>Android (Chrome)</b><p class="sm" style="margin-top:4px">1. Установите приложение: меню ⋮ → «Установить приложение».<br>2. Зажмите значок «Бюджет» на экране: появится пункт «Голосовая запись».<br>3. Перетащите его на главный экран, получится отдельная кнопка.</p></div>' +
    '<div class="card" style="margin-top:10px"><b>iPhone (Safari)</b><p class="sm" style="margin-top:4px">1. Откройте ссылку ниже в Safari.<br>2. «Поделиться» → «На экран “Домой”».<br>3. Значок будет открывать быструю запись. Если микрофон внутри такого значка не включится, нажмите значок диктовки на клавиатуре: сумма и название распознаются так же.</p></div>' +
    (link ? '<label class="f" for="vl">Ссылка на быструю запись</label><input class="in" id="vl" readonly value="' + esc(link) + '" onclick="this.select()">' : '') +
    '<p class="xs muted" style="margin-top:10px">Распознавание речи делает сам телефон. В Chrome на Android для этого обычно нужен интернет.</p><div class="foot"><button class="btn block" data-a="close">Закрыть</button></div>';
}
