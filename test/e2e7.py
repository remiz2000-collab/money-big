import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/budget/dist/test.html'
FIX=open('test/fixtures/v1-state.json',encoding='utf8').read()
def chk(c,m): print(('ok   ' if c else 'FAIL ')+m)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
        await ctx.add_init_script("if(!localStorage.getItem('budget.planner.v1')) localStorage.setItem('budget.planner.v1', %s);"%json.dumps(FIX))
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        await pg.click('#fab'); await pg.click('#ov [data-a=goalNew]'); await pg.wait_for_timeout(100)
        chk(await pg.locator('#ov >> text=Назад').count()>0,'у цели из «+» кнопка «Назад»')
        await pg.fill('#g-name','Отпуск в Грузии'); await pg.select_option('#g-cat','__new')
        await pg.click('#g-target'); await pg.keyboard.type('100000')
        v=await pg.input_value('#g-target'); chk(v=='100 000','группировка: '+repr(v))
        await pg.fill('#g-date','01.07.2027'); await pg.wait_for_timeout(100)
        await pg.keyboard.press('Home') if False else None
        await pg.click('[data-a=goalSave]'); await pg.wait_for_timeout(300)
        chk(await pg.evaluate("(()=>{const c=S.cats.find(x=>x.name==='Отпуск в Грузии');return !!c&&c.goal.target===10000000})()"),'цель создана с новой категорией, сумма 100 000')
        chk(await pg.locator('.goalc').count()==1,'цель на главной')
        # каретка: правка в середине
        await pg.click('#fab'); await pg.click('#ov [data-a=expNew]'); await pg.click('#f-amount'); await pg.keyboard.type('1234567,5')
        v=await pg.input_value('#f-amount'); chk(v=='1 234 567,5','расход: '+repr(v))
        await pg.keyboard.press('Home'); await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('Backspace')
        v=await pg.input_value('#f-amount'); chk(v=='234 567,5','удаление в начале: '+repr(v))
        await pg.fill('#f-amount','2500'); chk(await pg.input_value('#f-amount')=='2 500','fill → 2 500')
        await pg.keyboard.press('Escape')
        # сохранённая сумма читается верно
        await pg.click('#fab'); await pg.click('#ov [data-a=expNew]'); await pg.click('#f-amount'); await pg.keyboard.type('100000')
        await pg.click('.chip >> nth=0'); await pg.click('[data-a=expSave]'); await pg.wait_for_timeout(200)
        chk(await pg.evaluate("S.txs[S.txs.length-1].amount")==10000000,'сумма 100 000 сохранена как 10 000 000 коп.')
        await pg.screenshot(path='shots/95_after.png')
        print('errors:',errs); await b.close()
asyncio.run(main())
