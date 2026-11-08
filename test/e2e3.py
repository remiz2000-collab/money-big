import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/budget/dist/test.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(URL); await pg.click('[data-a=wizSkipAll]')
        # back button from chooser
        await pg.click('#fab'); await pg.click('#ov [data-a=expNew]')
        print('exp foot:',(await pg.inner_text('#ov .foot')).replace('\n',' | '))
        await pg.click('#ov [data-a=fabMenu]'); print('back ->',await pg.inner_text('#ov h2'))
        await pg.click('#ov [data-a=incExtra]'); print('inc foot:',(await pg.inner_text('#ov .foot')).replace('\n',' | '))
        await pg.click('#ov [data-a=fabMenu]'); await pg.click('#ov [data-a=recvOnly]')
        print('slot foot:',(await pg.inner_text('#ov .foot')).replace('\n',' | '))
        await pg.screenshot(path='shots/40_income_calendar.png')
        # calendar picker sets text
        await pg.fill('#ov input.calp','2026-10-20')
        print('picker -> text:',await pg.input_value('#f-date'))
        await pg.fill('#f-date',''); await pg.type('#f-date','01112026',delay=20)
        print('typed ->',await pg.input_value('#f-date'),'| picker synced:',await pg.input_value('#ov input.calp'))
        await pg.keyboard.press('Escape')
        # direct expense has Cancel
        await pg.click('[data-a=expNew] >> nth=0') if False else None
        # bill with period
        await pg.click('[data-a=tab][data-t=pay]'); await pg.click('.top [data-a=billNew]')
        await pg.fill('#f-name','Интернет'); await pg.fill('#f-amount','900')
        await pg.fill('#f-date',''); await pg.type('#f-date','05102026',delay=20)
        await pg.fill('#f-dto',''); await pg.type('#f-dto','10102026',delay=20)
        await pg.screenshot(path='shots/41_bill_period.png')
        await pg.click('.sheet [data-a=billSave]')
        print('list:',(await pg.inner_text('.list')).replace('\n',' | '))
        await pg.screenshot(path='shots/42_pay_list.png')
        print('ERRORS:',errs)
        await b.close()
asyncio.run(main())
