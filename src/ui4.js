/* ===== ИНТЕРФЕЙС: значки, валюты и курсы, цели, долги ===== */

/* ---------- значки (собственные линейные иконки + эмодзи + своя картинка) ---------- */
Object.assign(ICON, {
  debt: '<path d="M4 8h14M14 4l4 4-4 4"/><path d="M20 16H6M10 12l-4 4 4 4"/>',
  c_home: '<path d="M3.5 11.5L12 4l8.5 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5V14h4v5.5"/>',
  c_wallet: '<rect x="3.5" y="6" width="17" height="13" rx="3.5" fill="currentColor" fill-opacity=".18"/><path d="M3.5 10h17M16 14.5h1.5"/>',
  c_cart: '<path d="M3 4.5h2.4l2.2 10.5h10.2l2-8H6.3"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/>',
  c_car: '<path d="M3.5 17v-3.5A1.5 1.5 0 0 1 5 12h14a1.5 1.5 0 0 1 1.5 1.5V17z"/><path d="M6 12l1.7-4.5h8.6L18 12"/><circle cx="7.5" cy="17" r="1.9"/><circle cx="16.5" cy="17" r="1.9"/>',
  c_health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor" fill-opacity=".18"/><path d="M12 9.3v4.4M9.8 11.5h4.4"/>',
  c_cup: '<path d="M5.5 9h11v5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5.5 14z" fill="currentColor" fill-opacity=".18"/><path d="M16.5 10.5h1.2a2.3 2.3 0 0 1 0 4.6h-1.4M9 3.5c0 1 1 1.2 1 2.2M13 3.5c0 1 1 1.2 1 2.2"/>',
  c_bag: '<path d="M5.5 8.5h13l-1 11h-11z" fill="currentColor" fill-opacity=".18"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
  c_sparkle: '<path d="M11 4l1.9 5.1L18 11l-5.1 1.9L11 18l-1.9-5.1L4 11l5.1-1.9z" fill="currentColor" fill-opacity=".18"/><path d="M18.5 3.5v3M17 5h3M18.5 16v3.5M16.8 17.8h3.4"/>',
  c_star: '<path d="M12 4l2.5 5.2 5.5.8-4 3.9.9 5.6L12 16.8 7.1 19.5l.9-5.6-4-3.9 5.5-.8z" fill="currentColor" fill-opacity=".18"/>',
  c_ticket: '<path d="M4 8V6.5h16V8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v1.5H4V16a2 2 0 0 0 0-4v0a2 2 0 0 0 0-4z" fill="currentColor" fill-opacity=".18"/><path d="M14.5 6.5v11" stroke-dasharray="1.5 2"/>',
  c_gift: '<path d="M4.5 10h15v9.5h-15z" fill="currentColor" fill-opacity=".18"/><path d="M3.5 7.5h17V10h-17zM12 7.5v12M12 7.5C10 4 6.8 5 8 7.5M12 7.5c2-3.5 5.2-2.5 4 0"/>',
  c_coin: '<path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" fill="currentColor" fill-opacity=".18"/><path d="M14.6 9.4c-.6-.8-1.5-1.2-2.6-1.2-1.4 0-2.5.8-2.5 1.9s1 1.5 2.5 1.9 2.5.8 2.5 1.9-1.1 1.9-2.5 1.9c-1.1 0-2-.4-2.6-1.2M12 6.8v1.4M12 15.8v1.4"/>',
  c_shield: '<path d="M12 3.5l7 2.8v5.4c0 4.2-3 7.3-7 8.8-4-1.5-7-4.6-7-8.8V6.3z" fill="currentColor" fill-opacity=".18"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  c_phone: '<path d="M7.5 3.5h9a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" fill="currentColor" fill-opacity=".18"/><path d="M10.5 18h3"/>',
  c_card: '<path d="M4.5 6h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9A1.5 1.5 0 0 1 4.5 6z" fill="currentColor" fill-opacity=".18"/><path d="M3 10.2h18M6.5 15h3"/>',
  c_repeat: '<path d="M5 12a7 7 0 0 1 12-4.9L19 9M19 12a7 7 0 0 1-12 4.9L5 15"/><path d="M19 4.5V9h-4.5M5 19.5V15h4.5"/>',
  c_plane: '<path d="M12 3c1 0 1.6 1 1.6 2v4.5l7 4v2l-7-2v4l2 1.5V20l-3.6-1-3.6 1v-1.5l2-1.5v-4l-7 2v-2l7-4V5c0-1 .6-2 1.6-2z"/>',
  c_book: '<path d="M5.5 4.5h10.5a2 2 0 0 1 2 2v13H7.5a2 2 0 0 1-2-2z" fill="currentColor" fill-opacity=".18"/><path d="M5.5 17.5a2 2 0 0 1 2-2H18"/>',
  c_paw: '<ellipse cx="7" cy="10.5" rx="1.7" ry="2.1" fill="currentColor" fill-opacity=".18"/><ellipse cx="10.8" cy="6.8" rx="1.7" ry="2.1" fill="currentColor" fill-opacity=".18"/><ellipse cx="15.2" cy="6.8" rx="1.7" ry="2.1" fill="currentColor" fill-opacity=".18"/><ellipse cx="19" cy="10.5" rx="1.7" ry="2.1" fill="currentColor" fill-opacity=".18"/><path d="M8 17.2c0-2.6 1.8-4.7 4-4.7s4 2.1 4 4.7c0 1.7-1.8 1.8-4 1.2-2.2.6-4 .5-4-1.2z" fill="currentColor" fill-opacity=".18"/>',
  c_tool: '<path d="M15 4.5a4 4 0 0 0-3.6 5.4l-6.6 6.6a2 2 0 0 0 2.8 2.8l6.6-6.6a4 4 0 0 0 5.4-3.6l-2.7 2.7-2.6-.6-.6-2.6 2.7-2.7a4 4 0 0 0-1.4-.4z"/>',
  c_leaf: '<path d="M5 19C5 10 10 5 19.5 5 19.5 14 14.5 19 5 19z" fill="currentColor" fill-opacity=".18"/><path d="M5 19l8-8"/>',
  c_music: '<path d="M9 17.5V6.5l10-2v11" fill="currentColor" fill-opacity=".18"/><circle cx="6.8" cy="17.5" r="2.2" fill="currentColor" fill-opacity=".18"/><circle cx="16.8" cy="15.5" r="2.2" fill="currentColor" fill-opacity=".18"/>',
  c_film: '<path d="M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" fill="currentColor" fill-opacity=".18"/><path d="M8 6.5v11M16 6.5v11M3 10.5h5M3 13.5h5M16 10.5h5M16 13.5h5"/>',
  c_cloud: '<path d="M7.5 18.5a4 4 0 0 1-.6-7.9A5.5 5.5 0 0 1 17.5 9a4.8 4.8 0 0 1-.5 9.5z" fill="currentColor" fill-opacity=".18"/>',
});
const ICON_KEYS = ['home', 'cart', 'car', 'health', 'cup', 'bag', 'sparkle', 'star', 'ticket', 'gift', 'coin', 'shield', 'phone', 'card', 'repeat', 'plane', 'book', 'paw', 'tool', 'leaf', 'music', 'film', 'cloud', 'wallet'];
const T_SAGE = '#B7CC9C', T_SAND = '#EBD497', T_CLAY = '#EBB397', T_SKY = '#A8CAD8', T_LAV = '#CBBEDF', T_ROSE = '#EBB4BE', T_TEAL = '#A6D2C6', T_STONE = '#D2CDBC';
const ICON_TINT = { home: T_SAGE, wallet: T_SAGE, cart: T_CLAY, car: T_SKY, health: T_ROSE, cup: T_SAND, bag: T_LAV, sparkle: T_ROSE, star: T_SAND, ticket: T_LAV, gift: T_ROSE, coin: T_SAND, shield: T_TEAL, phone: T_SKY, card: T_STONE, repeat: T_TEAL, plane: T_SKY, book: T_LAV, paw: T_CLAY, tool: T_STONE, leaf: T_SAGE, music: T_ROSE, film: T_LAV, cloud: T_SKY };
const DEFAULT_ICON = { 'Аренда и коммунальные услуги': 'home', 'Кредиты и рассрочки': 'card', 'Подписки': 'repeat', 'Телефон и интернет': 'phone', 'Страховки и регулярные платежи': 'shield', 'Продукты': 'cart', 'Дом и быт': 'tool', 'Транспорт': 'car', 'Здоровье и аптека': 'health', 'Кафе и доставка': 'cup', 'Одежда и покупки': 'bag', 'Красота и уход': 'sparkle', 'Хобби': 'star', 'Развлечения и отдых': 'ticket', 'Подарки': 'gift', 'Накопления': 'coin', 'Финансовая подушка': 'shield', 'Отпуск и крупные покупки': 'plane' };
// v: '' — по умолчанию, 'none' — без значка, 'ic:ключ' — значок, 'data:image/…' — своя картинка, иначе эмодзи.
function iconHTML(v, name, cls) {
  cls = 'ico ' + (cls || '');
  if (v === 'none') return '';
  if (!v && name && DEFAULT_ICON[name]) v = 'ic:' + DEFAULT_ICON[name];
  if (typeof v === 'string' && v.indexOf('data:image/') === 0) return '<span class="' + cls + ' pic"><img alt="" src="' + esc(v) + '"></span>';
  if (typeof v === 'string' && v.indexOf('ic:') === 0 && ICON['c_' + v.slice(3)]) return '<span class="' + cls + '" style="--t:' + (ICON_TINT[v.slice(3)] || T_SAGE) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON['c_' + v.slice(3)] + '</svg></span>';
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
    '<div class="ipk-grid">' + ICON_KEYS.map((k) => '<button type="button" style="--t:' + (ICON_TINT[k] || T_SAGE) + '" class="ipk-i' + (cur === 'ic:' + k ? ' on' : '') + '" data-a="icoPick" data-t="' + t + '" data-v="ic:' + k + '" aria-label="Значок ' + k + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON['c_' + k] + '</svg></button>').join('') + '</div></div>';
}
function icoSet(t, v, name) {
  icoState[t] = v;
  const p = document.getElementById('ipk-' + t + '-p'); if (p) p.innerHTML = iconHTML(v, name, 'big');
  document.querySelectorAll('#ipk-' + t + ' .ipk-i').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
}
function resizeImage(file, cb, W, H) {
  const r = new FileReader();
  r.onerror = () => cb(null);
  r.onload = () => {
    const img = new Image();
    img.onerror = () => cb(null);
    img.onload = () => {
      const cw = W || 96, ch = H || 96, c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const g = c.getContext('2d'), k = Math.max(cw / img.width, ch / img.height), w = img.width * k, h = img.height * k;
      g.fillStyle = '#fff'; g.fillRect(0, 0, cw, ch); g.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
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
  return '<div class="card" style="margin-top:12px;padding:12px 14px">' + (c.goal.photo ? '<img class="gph" alt="" src="' + esc(c.goal.photo) + '">' : '') + '<div class="row"><b class="sp">' + esc(goalName(c)) + ': ' + fmt(gi.target) + '</b><span class="xs muted">к ' + fmtDate(gi.date) + '</span></div><div class="prog"><i style="width:' + pct + '%"></i></div><div class="sm" style="margin-top:6px">' +
    (gi.done ? 'Цель достигнута: накоплено ' + fmt(gi.saved) + '.' : 'Накоплено ' + fmt(gi.saved) + ' (' + pct + '%). ' + (gi.overdue ? 'Срок прошёл, осталось ' + fmt(gi.left) + '.' : 'Чтобы успеть, откладывайте <b>' + fmt(gi.perMonth) + '</b> в месяц (' + gi.months + ' ' + plural(gi.months, ['мес.', 'мес.', 'мес.']) + ' до цели).')) + '</div></div>';
}
const goalName = (c) => (c.goal && c.goal.name) || 'Цель';
const daysLeftText = (date) => { const n = L.daysBetween(L.today(), date); return n < 0 ? 'срок прошёл' : n === 0 ? 'сегодня' : n < 60 ? 'через ' + n + ' ' + plural(n, ['день', 'дня', 'дней']) : 'через ' + Math.round(n / 30.4) + ' мес.'; };
// Карточки целей для главного экрана: фото, прогресс, сколько откладывать.
function goalsHome(m) {
  const cs = S.cats.filter((c) => L.goalInfo(S, c, m)).sort((a, b) => (a.goal.date < b.goal.date ? -1 : 1));
  if (!cs.length) return '';
  let h = '<div class="sect"><h2>Мои цели</h2></div>';
  cs.forEach((c) => {
    const gi = L.goalInfo(S, c, m), pct = Math.min(100, Math.round(gi.saved / gi.target * 100));
    const title = c.goal.name || c.name;
    h += '<button class="goalc' + (c.goal.photo ? ' has' : '') + '" data-a="cat" data-id="' + c.id + '">' +
      (c.goal.photo ? '<div class="gimg" style="background-image:url(' + "'" + esc(c.goal.photo) + "'" + ')"></div>' : '<div class="gimg none">' + iconHTML(c.icon, c.name, 'big') + '</div>') +
      '<div class="gbody"><div class="row"><b class="sp gt">' + esc(title) + '</b><span class="pill ' + (gi.done ? 'ok' : '') + '">' + (gi.done ? 'готово' : daysLeftText(gi.date)) + '</span></div>' +
      '<div class="num gsum">' + fmt(gi.saved) + ' <span class="muted sm">из ' + fmt(gi.target) + '</span></div><div class="prog"><i style="width:' + pct + '%"></i></div>' +
      '<div class="xs muted" style="margin-top:6px">к ' + fmtDate(gi.date) + (gi.done ? '' : gi.overdue ? ' · срок прошёл' : ' · откладывать ' + fmt(gi.perMonth) + ' в месяц') + '</div></div></button>';
  });
  return h;
}
function goalLine(c, m) {
  const gi = L.goalInfo(S, c, m); if (!gi) return '';
  return '<div class="xs muted" style="margin-top:6px">Цель ' + fmt(gi.target) + ' к ' + fmtDate(gi.date) + (gi.done ? ' · достигнута' : gi.overdue ? ' · срок прошёл' : ' · откладывать ' + fmt(gi.perMonth) + '/мес.') + '</div>';
}
let goalPhoto = '';
function goalPhotoHTML() {
  return (goalPhoto ? '<img class="gph" alt="Фото цели" src="' + esc(goalPhoto) + '">' : '<div class="gph none">Добавьте фото мечты: оно будет на главном экране</div>') +
    '<div class="two" style="margin-top:8px"><label class="btn soft" style="cursor:pointer;justify-content:center">' + (goalPhoto ? 'Заменить фото' : 'Добавить фото') + '<input type="file" accept="image/*" hidden data-c="goalFile"></label>' + (goalPhoto ? '<button class="btn ghost" data-a="goalPhotoDel">Убрать фото</button>' : '<span></span>') + '</div>';
}
function goalPhotoUpd() { const e = document.getElementById('g-photo'); if (e) e.innerHTML = goalPhotoHTML(); }
function openGoal(id) {
  const c = L.cat(S, id); if (!c) return;
  const g = c.goal || { target: 0, date: '' };
  goalPhoto = g.photo || '';
  setSheet('<h2>Цель: ' + esc(c.name) + '</h2><p class="muted sm" style="margin-top:4px">Например, отпуск или крупная покупка. Приложение посчитает, сколько откладывать каждый месяц.</p>' +
    '<div id="g-photo">' + goalPhotoHTML() + '</div>' +
    '<label class="f" for="g-name">Название цели</label><input class="in" id="g-name" maxlength="40" placeholder="Например: Отпуск в Грузии" value="' + esc(g.name || '') + '">' +
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
  c.goal = { target: t, date: d, name: val('g-name').trim().slice(0, 40), photo: goalPhoto || '' };
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
  const net = T.owed - T.owe;
  h += '<section class="hero" style="margin-bottom:12px"><div class="eyebrow">' + (net > 0 ? 'В итоге вы в плюсе' : net < 0 ? 'В итоге вы в минусе' : 'В итоге в нуле') + '</div><div class="big" style="' + (net < 0 ? 'color:var(--bad)' : '') + '">' + fmt(net, { sign: true }) + '</div><div class="legend"><span>Вам вернут ' + fmt(T.owed) + '</span><span>' + gv('Вы должны', 'Вы должны', 'Вы должны') + ' ' + fmt(T.owe) + '</span></div></section>';
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
  return '<h2>Голосовая запись с главного экрана</h2><p class="sm muted" style="margin-top:6px">Настоящий виджет на экран телефона веб-приложение создать не может. На Android можно вынести на главный экран ярлык, который сразу открывает быструю запись с включённым микрофоном.</p>' +
    '<div class="card" style="margin-top:12px"><b>Android (Chrome)</b><p class="sm" style="margin-top:4px">1. Установите приложение: меню ⋮ → «Установить приложение».<br>2. Зажмите значок «Бюджет» на экране: появится пункт «Голосовая запись».<br>3. Перетащите его на главный экран, получится отдельная кнопка.</p></div>' +
    '<div class="card" style="margin-top:10px"><b>iPhone</b><p class="sm" style="margin-top:4px">Виджет или отдельный ярлык для записи на iPhone сделать нельзя: у каждого значка с сайта на iPhone свои, отдельные данные, и расход мог бы записаться «не туда». Поэтому добавьте приложение на экран один раз (Safari → «Поделиться» → «На экран “Домой”») и пользуйтесь кнопкой микрофона посередине внизу. Если микрофон в приложении не включится, нажмите значок диктовки на клавиатуре: сумма и название распознаются так же.</p></div>' +
        '<p class="xs muted" style="margin-top:10px">Распознавание речи делает сам телефон. В Chrome на Android для этого обычно нужен интернет.</p><div class="foot"><button class="btn block" data-a="close">Закрыть</button></div>';
}

function debtsHome() {
  const D = L.debtTotals(S), open = S.debts.filter((d) => L.debtLeft(d) > 0).sort((a, b) => ((a.due || '9') < (b.due || '9') ? -1 : 1));
  if (!open.length) return '';
  const net = D.owed - D.owe;
  return '<div class="sect"><h2>Долги</h2><button class="link" data-a="tab" data-t="debts">Все долги</button></div><div class="card" style="padding:14px 16px"><div class="row"><div class="sp"><div class="xs muted">' + (net > 0 ? 'В итоге в плюсе' : net < 0 ? 'В итоге в минусе' : 'В итоге в нуле') + '</div><div class="num" style="font-size:24px;font-weight:600;' + (net < 0 ? 'color:var(--bad)' : '') + '">' + fmt(net, { sign: true }) + '</div></div><div class="xs muted" style="text-align:right">вам вернут ' + fmt(D.owed) + '<br>вы должны ' + fmt(D.owe) + '</div></div></div><div class="list" style="margin-top:8px">' + open.slice(0, 3).map(debtRow).join('') + '</div>';
}
