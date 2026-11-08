import asyncio, json
from playwright.async_api import async_playwright
FIX=open('test/fixtures/v1-state.json',encoding='utf8').read()
def chk(c,m): print(('ok   ' if c else 'FAIL ')+m)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
        await ctx.add_init_script("if(!localStorage.getItem('budget.planner.v1')) localStorage.setItem('budget.planner.v1', %s);"%json.dumps(FIX))
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///home/claude/budget/dist/test.html'); await pg.wait_for_timeout(500)
        n0=await pg.locator('#app .sect:has(h2:text("Ближайшие платежи")) + .list .li').count()
        await pg.click('[data-a=billsAll]'); await pg.wait_for_timeout(200)
        n1=await pg.locator('#app .sect:has(h2:text("Ближайшие платежи")) + .list .li').count()
        print(n0,n1); chk(n1>n0,'список платежей раскрылся')
        await pg.screenshot(path='shots/96_all.png')
        await pg.click('[data-a=billsAll]'); chk(await pg.locator('#app .sect:has(h2:text("Ближайшие платежи")) + .list .li').count()==n0,'свернулся')
        await pg.click('.grpchips .chip >> nth=2'); await pg.wait_for_timeout(900)
        y=await pg.evaluate("document.getElementById('grp-g_daily')?Math.round(document.getElementById('grp-g_daily').getBoundingClientRect().top):null")
        print('group top',y); chk(y is not None and y<200,'прокрутило к группе')
        await pg.screenshot(path='shots/97_chips.png'); print('errors:',errs); await b.close()
asyncio.run(main())
