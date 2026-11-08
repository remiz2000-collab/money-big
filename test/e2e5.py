import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/budget/dist/test.html'
FIX=open('test/fixtures/v1-state.json',encoding='utf8').read()
INIT="""
if(!localStorage.getItem('budget.planner.v1')) localStorage.setItem('budget.planner.v1', %s);
window.fetch=async(u)=>({ok:true,json:async()=>({result:'success',rates:{RUB:1,USD:0.0108,EUR:0.0099}})});
""" % json.dumps(FIX)
def chk(c,m): print(('ok   ' if c else 'FAIL ')+m)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
        await ctx.add_init_script(INIT)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        raw=await pg.evaluate("localStorage.getItem('budget.planner.v1')")
        bak=await pg.evaluate("localStorage.getItem('budget.planner.v1.backup-v1')")
        chk(raw==FIX and bak==FIX,'старые данные: основной ключ не тронут, резервная копия идентична')
        chk(await pg.evaluate("S.txs.length")==json.loads(FIX)['txs'].__len__(),'старые данные загружены')
        await pg.screenshot(path='shots/60_home.png')
        # голос
        await pg.click('.nav .mic'); await pg.fill('#q-text','продукты 5 тысяч'); await pg.wait_for_timeout(200)
        chk((await pg.input_value('#q-amt')).replace('\u00a0','')=='5000','голос: 5 тысяч → сумма 5000')
        await pg.fill('#q-text','обед 20 долларов'); await pg.wait_for_timeout(900)
        chk(await pg.input_value('#q-cur')=='USD','валюта распознана из фразы')
        chk(await pg.input_value('#q-rate') not in ('','0'),'курс подставлен: '+await pg.input_value('#q-rate'))
        await pg.screenshot(path='shots/61_quick_usd.png')
        await pg.select_option('#q-cat',index=2); await pg.wait_for_timeout(100)
        await pg.click('#q-save'); await pg.wait_for_timeout(200)
        t=await pg.evaluate("S.txs[S.txs.length-1]")
        chk(t['cur']=='USD' and t['orig']==2000 and abs(t['amount']-t['orig']*t['rate'])<1,'расход в USD сохранён: %s'%t)
        # меню +
        await pg.click('#fab'); await pg.wait_for_timeout(100)
        chk('Платёж' in await pg.inner_text('#ov'),'в «+» есть «Платёж»')
        await pg.click('#ov [data-a=billNew]'); await pg.wait_for_timeout(100)
        chk(await pg.locator('#ov >> text=Назад').count()>0,'у нового платежа кнопка «Назад»')
        await pg.fill('#f-name','Музыка'); await pg.fill('#f-amount','199')
        await pg.click('#ov .ipk-i >> nth=14'); 
        await pg.click('#ov [data-a=billSave]'); await pg.wait_for_timeout(200)
        chk(await pg.evaluate("S.bills.some(b=>b.name==='Музыка'&&b.icon==='ic:repeat')"),'платёж со значком создан из «+»')
        # долги
        await pg.click('[data-t=debts]'); await pg.click('[data-a=debtNew]'); await pg.fill('#d-who','Анна'); await pg.fill('#d-amt','10000')
        await pg.click('#ov [data-a=debtSave]'); await pg.wait_for_timeout(200)
        await pg.click('[data-a=debtOpen]'); await pg.fill('#d-pay','3000'); await pg.click('[data-a=debtPay]'); await pg.wait_for_timeout(200)
        chk(await pg.evaluate("L.debtLeft(S.debts[0])")==700000,'долг: частичный возврат')
        await pg.screenshot(path='shots/62_debt.png'); await pg.click('#ov [data-a=close]')
        await pg.screenshot(path='shots/63_debts.png')
        # цель + значок категории
        await pg.click('[data-t=budget]'); await pg.click('.cat >> nth=0'); await pg.click('[data-a=goalOpen]')
        await pg.fill('#g-target','120000'); await pg.fill('#g-date','15.03.2027'); await pg.wait_for_timeout(100)
        print(await pg.inner_text('#g-prev'))
        await pg.click('[data-a=goalSave]'); await pg.wait_for_timeout(200)
        chk(await pg.evaluate("S.cats[0].goal && S.cats[0].goal.target===12000000")==True,'цель сохранена')
        await pg.screenshot(path='shots/64_goal.png'); await pg.keyboard.press('Escape')
        await pg.click('[data-a=catEdit]') if await pg.locator('[data-a=catEdit]').count() else None
        await pg.screenshot(path='shots/65_budget.png')
        # старые данные не потеряны после сохранений
        chk(await pg.evaluate("JSON.parse(localStorage.getItem('budget.planner.v1.backup-v1'))==null?false:true"),'резервная копия на месте')
        chk(await pg.evaluate("L.totals(S,'2026-10').cash")>0,'расчёты работают')
        print('errors:',errs)
        await b.close()
asyncio.run(main())
