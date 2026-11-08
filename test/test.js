const L = require('../src/logic.js');
const assert = require('assert');
let n = 0; const ok = (c, msg) => { n++; if (!c) { console.error('FAIL:', msg); process.exitCode = 1; } else console.log('ok  ', msg); };
const eq = (a, b, msg) => ok(a === b, msg + ' (' + a + ' vs ' + b + ')');
const R = (x) => Math.round(x * 100);
const M = '2026-10';

L.setToday('2026-10-01');
const S = L.newState();
const cid = (name) => S.cats.find((c) => c.name === name).id;
const rule = (name, type, v) => { const c = S.cats.find((x) => x.name === name); c.rule.type = type; if (type.startsWith('pct')) c.rule.pct = v; else c.rule.amount = R(v); };
S.plan[0].amount = R(60000); S.plan[1].amount = R(45000); S.plan[2].amount = R(35000);
const bill = (name, cat, amt, day) => { const b = { id: L.uid(), name, catId: cid(cat), amount: R(amt), date: M + '-' + String(day).padStart(2, '0'), period: 'month', interval: 0, endDate: '', note: '', skipped: [] }; S.bills.push(b); return b; };
const rent = bill('Аренда', 'Аренда и коммунальные услуги', 25000, 5);
const credit = bill('Кредит', 'Кредиты и рассрочки', 7000, 10);
const inet = bill('Интернет', 'Телефон и интернет', 900, 12);
const sub = bill('Подписка', 'Подписки', 699, 20);
rule('Продукты', 'fixedMonth', 18000); rule('Транспорт', 'fixedMonth', 3000); rule('Кафе и доставка', 'pctRemainder', 10);
rule('Накопления', 'pctIncome', 10); rule('Финансовая подушка', 'pctIncome', 5); rule('Одежда и покупки', 'fixedMonth', 5000);
const sumPos = (m) => S.cats.reduce((s, c) => s + Math.max(0, L.env(S, c.id, m).bal), 0);

// 1. Первое поступление
const inc1 = L.addIncome(S, { slotId: S.plan[0].id, slotMonth: M, date: '2026-10-01', amount: R(60000) });
let T = L.totals(S, M);
eq(T.cash, R(60000), '1. баланс вырос на поступление');
eq(T.incomeM, R(60000), '1. доходы месяца');
ok(L.slots(S, M).filter((x) => !x.received).length === 2, '1. будущие поступления остаются ожидаемыми');
eq(T.unalloc, R(60000), '1. до распределения всё не распределено');

// 2. Автораспределение (нехватка: приоритеты)
let pl = L.planAllocation(S, M, { refDate: '2026-10-01' });
eq(pl.adds[cid('Аренда и коммунальные услуги')], R(25000), '2. аренда зарезервирована из первого поступления');
eq(pl.adds[cid('Кредиты и рассрочки')], R(7000), '2. кредит (10-е) зарезервирован');
eq(pl.adds[cid('Телефон и интернет')], R(900), '2. интернет (12-е) зарезервирован');
eq(pl.adds[cid('Подписки')], 0, '2. подписка (20-е) отложена до следующего поступления');
eq(pl.deferred.length, 1, '2. подписка в списке отложенных');
eq(pl.adds[cid('Продукты')], R(18000), '2. продукты по правилу');
eq(pl.adds[cid('Накопления')], R(3390), '2. накопления получили остаток (недофинансированы)');
eq(pl.adds[cid('Финансовая подушка')], 0, '2. подушка не обеспечена');
eq(pl.adds[cid('Одежда и покупки')], 0, '2. личные расходы не обеспечены (низкий приоритет)');
eq(pl.total, R(60000), '2. распределено ровно доступное');
eq(pl.left, 0, '2. остаток 0, не ушли в минус');
ok(pl.shortfalls.some((x) => x.catId === cid('Финансовая подушка')), '2. подушка в списке недофинансированных');
const r = L.applyAllocation(S, M, pl.adds, { incomeId: inc1.id, date: '2026-10-01' });
ok(r.ok, '2. применено');
T = L.totals(S, M);
eq(T.cash, R(60000), '2. баланс НЕ изменился от распределения');
eq(T.unalloc, 0, '2. нераспределённое = 0');
eq(T.unfunded, R(699), '2. неоплаченное необеспеченное = подписка');
eq(T.safe, 0, '2. безопасная сумма 0');

// 3. Расход
L.addExpense(S, { date: '2026-10-02', amount: R(3000), catId: cid('Продукты'), title: 'Супермаркет' });
T = L.totals(S, M);
eq(T.cash, R(57000), '3. остаток денег уменьшился');
eq(L.env(S, cid('Продукты'), M).bal, R(15000), '3. остаток категории уменьшился');
eq(T.unalloc, 0, '3. нераспределённое не изменилось');
eq(T.spentM, R(3000), '3. потрачено за месяц');

// 4. Оплата кредита / аренды ровно один раз
L.setToday('2026-10-05');
const tx = L.payBill(S, rent, '2026-10-05', R(25000), '2026-10-05');
ok(tx, '4. аренда отмечена оплаченной');
T = L.totals(S, M);
eq(T.cash, R(32000), '4. денежный остаток уменьшился ровно один раз');
eq(L.env(S, cid('Аренда и коммунальные услуги'), M).bal, 0, '4. остаток категории = 0');
eq(T.unalloc, 0, '4. не вычтено повторно (нераспределённое по-прежнему 0)');
ok(L.payBill(S, rent, '2026-10-05', R(25000), '2026-10-05') === null, '4. повторная оплата невозможна');
eq(L.billItems(S, M).find((i) => i.bill.id === rent.id).paid, true, '4. статус «оплачено»');

// 5. Изменение плановой суммы второго поступления
S.plan[1].amount = R(50000);
eq(L.totals(S, M).cash, R(32000), '5. смена плана не меняет баланс');
S.plan[1].amount = R(45000);

// 6. Второе и третье поступления
L.setToday('2026-10-15');
const inc2 = L.addIncome(S, { slotId: S.plan[1].id, slotMonth: M, date: '2026-10-15', amount: R(45000) });
T = L.totals(S, M);
eq(T.cash, R(77000), '6. после второго баланс вырос');
pl = L.planAllocation(S, M, { refDate: '2026-10-15' });
eq(pl.adds[cid('Подписки')], R(699), '6. подписка (20-е) зарезервирована из второго поступления');
eq(pl.adds[cid('Продукты')], 0, '6. продукты не пополняются сверх месячного лимита');
eq(pl.adds[cid('Накопления')], R(10500) - R(3390), '6. накопления: 10% от суммы поступлений минус уже выделенное');
eq(pl.adds[cid('Финансовая подушка')], R(5250), '6. подушка 5% от поступлений');
eq(pl.adds[cid('Одежда и покупки')], R(5000), '6. одежда по фиксированной сумме');
ok(pl.total <= pl.pool0, '6. не больше доступного');
ok(pl.left >= 0, '6. левый остаток неотрицательный');
L.applyAllocation(S, M, pl.adds, { incomeId: inc2.id, date: '2026-10-15' });
eq(L.totals(S, M).cash, R(77000), '6. баланс не изменился после распределения');
eq(L.totals(S, M).unfunded, 0, '6. все обязательства месяца обеспечены');
L.setToday('2026-10-25');
const inc3 = L.addIncome(S, { slotId: S.plan[2].id, slotMonth: M, date: '2026-10-25', amount: R(35000) });
T = L.totals(S, M);
eq(T.cash, R(112000), '6. после третьего баланс = 60000+45000+35000−3000−25000');
pl = L.planAllocation(S, M, { refDate: '2026-10-25' });
eq(pl.adds[cid('Накопления')], R(14000) - R(10500), '6. третье: накопления догоняют 10% от 140000');
L.applyAllocation(S, M, pl.adds, { incomeId: inc3.id, date: '2026-10-25' });
T = L.totals(S, M);
eq(T.cash, R(112000), '6. баланс неизменен после третьего распределения');
eq(T.cash - sumPos(M), T.unalloc, '6. нераспределённое = баланс − деньги в конвертах');
ok(T.unalloc >= 0, '6. нераспределённое неотрицательно');
const rerun = L.planAllocation(S, M, { refDate: '2026-10-25' });
eq(rerun.total, 0, '6. повторный расчёт ничего не добавляет (нет двойного учёта)');

// 7. Следующий месяц
const N = '2026-11';
L.setToday('2026-11-02');
eq(L.totals(S, M).cash, R(112000), '7. октябрь не изменился');
eq(L.totals(S, M).spentM, R(28000), '7. расходы октября сохранены');
eq(L.totals(S, N).spentM, 0, '7. в ноябре расходов ещё нет');
eq(L.totals(S, N).incomeM, 0, '7. в ноябре доходов ещё нет');
const nb = L.billItems(S, N).filter((i) => i.inMonth);
eq(nb.length, 4, '7. в ноябре сформировано 4 платежа');
ok(nb.every((i) => i.due.startsWith(N) && !i.paid), '7. новые платежи в нужном месяце, ожидают оплаты');
eq(L.billItems(S, N).filter((i) => i.overdue).length, 3, '7. неоплаченные октябрьские платежи видны как просроченные (не смешаны с ноябрьскими)');
eq(L.slots(S, N).filter((x) => x.received).length, 0, '7. поступления ноября ожидаются заново');
eq(L.env(S, cid('Продукты'), N).carry, L.env(S, cid('Продукты'), M).bal, '7. остаток конверта переходит в новый месяц');

// 9. Перераспределение
const before = L.totals(S, M);
const mv = L.move(S, M, cid('Накопления'), cid('Хобби'), R(1000));
ok(mv.ok, '9. перенос между категориями');
const after = L.totals(S, M);
eq(after.cash, before.cash, '9. общий баланс не изменился');
eq(after.unalloc, before.unalloc, '9. нераспределённое не изменилось');
ok(!L.move(S, M, cid('Хобби'), cid('Подарки'), R(5000)).ok, '9. нельзя перенести больше, чем есть');

// 10. Удаление
const e1 = L.addExpense(S, { date: '2026-10-26', amount: R(500), catId: cid('Хобби') });
const b1 = L.env(S, cid('Хобби'), M).bal, c1 = L.totals(S, M).cash;
L.deleteTx(S, e1.id);
eq(L.env(S, cid('Хобби'), M).bal, b1 + R(500), '10. удаление расхода вернуло остаток категории');
eq(L.totals(S, M).cash, c1 + R(500), '10. и денежный баланс');
const payTx = S.txs.find((t) => t.billId === rent.id);
L.deleteTx(S, payTx.id);
eq(L.billItems(S, M).find((i) => i.bill.id === rent.id).paid, false, '10. удаление оплаты возвращает платёж в «ожидает»');
const cashBefore = L.totals(S, M).cash;
L.deleteTx(S, inc3.id);
eq(L.totals(S, M).cash, cashBefore - R(35000), '10. удаление дохода уменьшило баланс');
eq(S.allocs.filter((a) => a.incomeId === inc3.id).length, 0, '10. и его распределение');

// 11. Экспорт / импорт
const json = JSON.stringify({ app: 'budget', data: S });
const S2 = L.normalize(JSON.parse(json).data);
assert.deepStrictEqual(S2.txs, S.txs); assert.deepStrictEqual(S2.allocs, S.allocs);
eq(S2.txs.length, S.txs.length, '11. импорт без дублирования');
eq(L.totals(S2, M).cash, L.totals(S, M).cash, '11. баланс после импорта совпал');
ok(L.normalize({ foo: 1 }) === null, '11. мусор отклоняется');

// 12. Перерасход
const over = L.addExpense(S, { date: '2026-10-27', amount: R(99999), catId: cid('Транспорт') });
const eTr = L.env(S, cid('Транспорт'), M);
ok(eTr.bal < 0, '12. остаток категории отрицательный (перерасход виден)');
const T12 = L.totals(S, M);
ok(T12.over > 0, '12. перерасход учтён в сводке');
eq(T12.cash - sumPos(M), T12.unalloc, '12. перерасход уменьшает свободные деньги, а не скрыт');
L.deleteTx(S, over.id);

// Конфликт приоритетов
{
  L.setToday('2026-03-01');
  const X = L.newState(); X.settings.trackFrom = '2026-03';
  const c1 = X.cats.find((c) => c.name === 'Подписки'), c2 = X.cats.find((c) => c.name === 'Телефон и интернет');
  X.bills.push({ id: 'a', name: 'А', catId: c1.id, amount: R(1000), date: '2026-03-05', period: 'month', skipped: [] });
  X.bills.push({ id: 'b', name: 'Б', catId: c2.id, amount: R(3000), date: '2026-03-05', period: 'month', skipped: [] });
  X.plan = [];
  L.addIncome(X, { date: '2026-03-01', amount: R(2000) });
  let p = L.planAllocation(X, '2026-03', { refDate: '2026-03-01' });
  eq(p.conflicts.length, 1, 'К. конфликт обязательств одного приоритета обнаружен');
  eq(p.total, 0, 'К. автоматически ничего не выбрано произвольно');
  p = L.planAllocation(X, '2026-03', { refDate: '2026-03-01', conflictMode: 'proportional' });
  eq(p.total, R(2000), 'К. пропорционально: всё распределено');
  eq(p.adds[c1.id], R(500), 'К. пропорционально: 1/4');
  p = L.planAllocation(X, '2026-03', { refDate: '2026-03-01', conflictMode: 'order' });
  eq(p.adds[c1.id], R(1000), 'К. по порядку: первый полностью');
}
// Периодичность
{
  const b = { date: '2026-03-15', period: 'year', amount: 1200000 };
  eq(L.occ(b, '2026-10-01', '2026-10-31').length, 0, 'П. годовая подписка не попадает в октябрь');
  eq(L.occ(b, '2027-03-01', '2027-03-31')[0], '2027-03-15', 'П. годовая в марте');
  eq(L.occ({ date: '2026-10-01', period: 'week' }, '2026-10-01', '2026-10-31').length, 5, 'П. еженедельно 5 раз в октябре');
  eq(L.occ({ date: '2026-01-31', period: 'month' }, '2026-02-01', '2026-02-28')[0], '2026-02-28', 'П. 31-е в феврале → 28-е');
  eq(L.occ({ date: '2026-01-31', period: 'month' }, '2026-04-01', '2026-04-30')[0], '2026-04-30', 'П. 31-е в апреле → 30-е');
  eq(L.occ({ date: '2026-10-01', period: 'month', endDate: '2026-11-30' }, '2026-12-01', '2026-12-31').length, 0, 'П. дата окончания');
  eq(L.occ({ date: '2026-10-01', period: 'custom', interval: 10 }, '2026-10-01', '2026-10-31').length, 4, 'П. пользовательский интервал 10 дней');
}

// Период поступления: платёж внутри периода резервируется сразу
{
  L.setToday('2026-05-01');
  const X = L.newState(); X.settings.trackFrom = '2026-05';
  X.plan = [{ id: 'p1', name: 'Первое', day: 1, amount: R(10000), dayTo: 0 }, { id: 'p2', name: 'Второе', day: 10, dayTo: 15, amount: R(10000) }];
  const k = X.cats.find((c) => c.name === 'Подписки');
  X.bills.push({ id: 'z', name: 'Z', catId: k.id, amount: R(500), date: '2026-05-12', period: 'month', skipped: [] });
  L.addIncome(X, { slotId: 'p1', slotMonth: '2026-05', date: '2026-05-01', amount: R(10000) });
  const sl = L.slots(X, '2026-05');
  eq(sl[1].dateTo, '2026-05-15', 'Период: конец периода 15-е');
  const pp = L.planAllocation(X, '2026-05', { refDate: '2026-05-01' });
  eq(pp.adds[k.id], R(500), 'Период: платёж 12-го внутри периода 10-15 резервируется сразу');
  eq(pp.deferred.length, 0, 'Период: ничего не отложено');
}

// Период оплаты платежа
{
  L.setToday('2026-06-01');
  const X = L.newState(); X.settings.trackFrom = '2026-06';
  const k = X.cats.find((c) => c.name === 'Подписки');
  X.bills.push({ id: 'w', name: 'W', catId: k.id, amount: R(300), date: '2026-06-05', span: 5, period: 'month', skipped: [] });
  const it = L.billItems(X, '2026-06')[0];
  eq(it.dueEnd, '2026-06-10', 'Период платежа: окно 5–10 июня');
  eq(L.daysBetween('2026-06-05', '2026-06-10'), 5, 'Период платежа: дни между датами');
  eq(L.billItems(X, '2026-07').find((i) => i.inMonth).dueEnd, '2026-07-10', 'Период платежа: повторяется каждый месяц');
}

// Быстрая запись
{
  const T = (t) => L.parseQuick(t);
  eq(T('вода 85').amount, 8500, 'Быстрая: «вода 85»'); eq(T('вода 85').title, 'Вода', 'Быстрая: название');
  eq(T('купила воду за 85 рублей').amount, 8500, 'Быстрая: «купила воду за 85 рублей»');
  eq(T('потратила 1200 на продукты').amount, 120000, 'Быстрая: «потратила 1200 на продукты»');
  eq(T('кофе двести пятьдесят').amount, 25000, 'Быстрая: числа словами 250');
  eq(T('купила восемьдесят пять рублей хлеб').amount, 8500, 'Быстрая: «восемьдесят пять»');
  eq(T('такси 1 350,50').amount, 135050, 'Быстрая: «1 350,50»');
  eq(T('хлеб сто двадцать рублей пятьдесят копеек').amount, 12050, 'Быстрая: рубли и копейки словами');
  eq(T('две тысячи триста обувь').amount, 230000, 'Быстрая: «две тысячи триста»');
  eq(T('полторы тысячи парикмахер').amount, 150000, 'Быстрая: «полторы тысячи»');
  eq(T('два кофе 500').amount, 50000, 'Быстрая: «два кофе 500» берёт сумму, не количество');
  eq(T('вчера такси 400').dateOff, -1, 'Быстрая: «вчера»');
  eq(T('привет').amount, null, 'Быстрая: нет суммы');
  const Q = L.newState();
  const gc = (t) => { const c = L.cat(Q, L.guessCat(Q, T(t).words)); return c ? c.name : ''; };
  eq(gc('вода 85'), 'Продукты', 'Быстрая: вода → Продукты');
  eq(gc('такси 400'), 'Транспорт', 'Быстрая: такси → Транспорт');
  eq(gc('кофе 250'), 'Кафе и доставка', 'Быстрая: кофе → Кафе');
  eq(gc('газировка 80'), '', 'Быстрая: неизвестное слово без категории');
  L.learnCat(Q, T('газировка 80').words, Q.cats.find((c) => c.name === 'Продукты').id);
  eq(gc('газировка 90'), 'Продукты', 'Быстрая: запомнила выбор пользователя');
}
eq(L.parseMoney('1 234,56'), 123456, 'Д. разбор суммы');
eq(L.parseMoney('abc'), null, 'Д. мусор → null');
eq(L.parseMoney('0,1'), 10, 'Д. 0,1 → 10 коп');
// Демо
L.setToday('2026-10-13');
const D = L.demoState(); const dt = L.totals(D, '2026-10');
ok(dt.unalloc >= 0 && dt.cash === D.settings.startBalance + 6000000 - 184050 - 45000 - 62000, 'Демо: цифры сходятся');
console.log('\n' + n + ' проверок');

/* ===== v5: совместимость со старыми данными ===== */
{
  const fs2 = require('fs');
  const raw = JSON.parse(fs2.readFileSync(__dirname + '/fixtures/v1-state.json', 'utf8'));
  const exp = JSON.parse(fs2.readFileSync(__dirname + '/fixtures/v1-expected.json', 'utf8'));
  const before = JSON.stringify(raw);
  const N = L.normalize(raw);
  ok(JSON.stringify(raw) === before, 'v5. normalize не меняет исходный объект');
  ok(N && N.schema === 2 && N.v === 1, 'v5. старые данные читаются, v=1 сохранён, schema=2');
  eq(N.txs.length, raw.txs.length, 'v5. операции не потеряны'); eq(N.allocs.length, raw.allocs.length, 'v5. распределения не потеряны');
  eq(N.bills.length, raw.bills.length, 'v5. платежи не потеряны'); eq(N.cats.length, raw.cats.length, 'v5. категории не потеряны');
  eq(N.settings.name, 'Тест', 'v5. имя сохранено'); eq(N.bills[0].span, 5, 'v5. период платежа сохранён'); eq(N.plan[0].dayTo, 3, 'v5. период поступления сохранён');
  ok(N.quick.map['хлеб'.slice(0, 5)] === raw.quick.map['хлеб'.slice(0, 5)], 'v5. обученные категории сохранены');
  ok(Array.isArray(N.debts) && N.debts.length === 0 && N.fx && N.fx.per, 'v5. новые поля добавлены пустыми');
  L.setToday('2026-10-20');
  const T = L.totals(N, '2026-10');
  eq(T.cash, exp.cash, 'v5. баланс как раньше'); eq(T.spentM, exp.spentM, 'v5. расходы как раньше'); eq(T.safe, exp.safe, 'v5. «можно тратить» как раньше');
  ok(N.cats.every((c) => L.env(N, c.id, '2026-10').bal === exp.env[c.id]), 'v5. остатки всех конвертов как раньше');
  // повторная нормализация идемпотентна
  ok(JSON.stringify(L.normalize(N)) === JSON.stringify(N), 'v5. normalize идемпотентна');
  // пустые/битые новые поля
  const odd = JSON.parse(before); odd.debts = 'x'; odd.fx = null; odd.cats[0].goal = { target: -1 };
  const O = L.normalize(odd); ok(Array.isArray(O.debts) && O.fx.per && O.cats[0].goal === null, 'v5. битые новые поля не ломают загрузку');
}

/* ===== v5: голос — суммы от тысячи ===== */
{
  const q = (t) => L.parseQuick(t);
  const A = (t, kop, title, cur) => { const r = q(t); ok(r.amount === kop && (title === undefined || r.title === title) && (r.cur || '') === (cur || ''), 'голос: «' + t + '» → ' + (r.amount / 100) + ' ' + r.title + (r.cur ? ' ' + r.cur : '')); };
  A('кофе 5000', 500000, 'Кофе'); A('кофе 5 000 рублей', 500000, 'Кофе'); A('такси 5 тысяч', 500000, 'Такси'); A('такси 5тысяч', 500000, 'Такси');
  A('продукты пять тысяч двести', 520000, 'Продукты'); A('ужин 1,5 тысячи', 150000, 'Ужин'); A('обед 2 тысячи 500', 250000, 'Обед'); A('кофе 5к', 500000, 'Кофе');
  A('кофе 1.200', 120000, 'Кофе'); A('подарок 12 345 руб.', 1234500, 'Подарок'); A('вода 85', 8500, 'Вода'); A('вода 85 рублей 50 копеек', 8550, 'Вода');
  A('шопинг 5000₽', 500000, 'Шопинг'); A('полторы тысячи кофе', 150000, 'Кофе'); A('тысяча двести продукты', 120000, 'Продукты'); A('2 тысячи 500 рублей такси', 250000, 'Такси');
  A('кофе 4 евро', 400, 'Кофе', 'EUR'); A('отель 3 тысячи долларов', 300000, 'Отель', 'USD'); A('обед 800 бат', 80000, 'Обед', 'THB');
  ok(!/тысяч/i.test(q('такси 5 тысяч').title), 'голос: слово «тысяч» не попадает в название');
}

/* ===== v5: цели, долги, валюты ===== */
{
  L.setToday('2026-10-20');
  const G = L.newState(); const c = G.cats.find((x) => x.name === 'Отпуск и крупные покупки');
  c.goal = { target: 12000000, date: '2027-03-15' };
  eq(L.monthsLeft('2026-10', '2027-03-15'), 6, 'цель: 6 месяцев (окт–мар включительно)');
  eq(L.goalInfo(G, c, '2026-10').perMonth, 2000000, 'цель: 120 000 / 6 = 20 000 в месяц');
  G.allocs.push({ id: 'a1', month: '2026-10', catId: c.id, amount: 2000000, date: '2026-10-01', kind: 'manual' });
  eq(L.goalInfo(G, c, '2026-10').perMonth, 2000000, 'цель: взнос этого месяца не меняет сумму в этом месяце');
  eq(L.goalInfo(G, c, '2026-11').perMonth, 2000000, 'цель: в следующем месяце (120−20)/5 = 20 000');
    c.goal.date = '2026-09-01'; ok(L.goalInfo(G, c, '2026-10').overdue && L.goalInfo(G, c, '2026-10').perMonth === 12000000, 'цель: просрочена — весь остаток в этом месяце');
  c.goal.date = '2027-03-15'; c.rule.type = 'goal'; G.plan.forEach((p) => { p.amount = 5000000; });
  L.setToday('2026-11-02'); G.allocs = []; L.addIncome(G, { slotId: G.plan[0].id, slotMonth: '2026-11', date: '2026-11-01', amount: 5000000 });
  const res = L.planAllocation(G, '2026-11', { refDate: '2026-11-01' }); eq(res.adds[c.id], 2400000, 'цель: автораспределение кладёт 120 000 / 5 мес. = 24 000'); L.setToday('2026-10-20');
  // долги
  const D = L.newState(); const d1 = L.addDebt(D, { who: 'Анна', dir: 'owe', amount: 1000000 }); const d2 = L.addDebt(D, { who: 'Олег', dir: 'owed', amount: 500050 });
  eq(L.payDebt(D, d1.id, 300000, '2026-10-20'), 300000, 'долг: частичный возврат'); eq(L.payDebt(D, d1.id, 9999999), 700000, 'долг: возврат не больше остатка');
  eq(L.debtLeft(d1), 0, 'долг: закрыт'); eq(L.debtTotals(D).owed, 500050, 'долг: мне должны'); eq(L.debtTotals(D).owe, 0, 'долг: я должна');
  eq(L.cash(D, '2026-10'), 0, 'долг: баланс не затронут');
  // валюты
  eq(L.convert(2000, 92.37), 184740, '20.00 USD × 92.37 = 1847.40 ₽ (в копейках)');
  const E = L.newState(); const t = L.addExpense(E, { date: '2026-10-20', amount: L.convert(2000, 92.37), catId: E.cats[0].id, title: 'Кофе', cur: 'USD', orig: 2000, rate: 92.37 });
  ok(t.cur === 'USD' && t.orig === 2000 && t.rate === 92.37 && t.amount === 184740, 'валюта: операция хранит исходную сумму и курс');
  const t2 = L.addExpense(E, { date: '2026-10-20', amount: 100, catId: E.cats[0].id }); ok(!('cur' in t2), 'валюта: обычная операция без новых полей');
  const f1 = L.ratesFromApi({ result: 'success', rates: { RUB: 1, USD: 0.0108, EUR: 0.0099 } }, 'RUB'); ok(Math.abs(f1.per.USD - 92.59) < 0.1 && !f1.per.RUB, 'курсы: разбор ответа с базой RUB');
  const f2 = L.ratesFromCbr({ Date: '2026-10-20T11:30:00+03:00', Valute: { USD: { Nominal: 1, Value: 92.3 }, JPY: { Nominal: 100, Value: 60 } } }); ok(f2.per.USD === 92.3 && f2.per.JPY === 0.6, 'курсы: разбор ЦБ с учётом номинала');
  ok(L.ratesFromApi({}, 'RUB') === null, 'курсы: пустой ответ → null');
}
