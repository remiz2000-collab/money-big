import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/budget/dist/test.html'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(URL)
        # welcome profile
        await pg.fill('#pf-name','Карина')
        await pg.click('[data-a=gender][data-g=f]')
        await pg.screenshot(path='shots/30_welcome_profile.png')
        print('name kept after gender click:',await pg.input_value('#pf-name'))
        await pg.click('[data-a=wizSkipAll]')
        print('greeting:',(await pg.inner_text('.sm.muted')).strip())
        print('quick btn:',await pg.inner_text('.quick .btn.primary'))
        # fab chooser
        await pg.click('#fab'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='shots/31_chooser.png')
        print('chooser:',(await pg.inner_text('#ov .sheet')).replace('\n',' | '))
        # expense, date typing
        await pg.click('#ov [data-a=expNew]')
        await pg.fill('#f-date','')
        await pg.type('#f-date','13102026',delay=30)
        print('typed date ->',await pg.input_value('#f-date'))
        await pg.fill('#f-date','')
        await pg.type('#f-date','5',delay=30); print('5 ->',await pg.input_value('#f-date'))
        await pg.type('#f-date','8',delay=30); print('58 ->',await pg.input_value('#f-date'))
        await pg.fill('#f-date','')
        await pg.type('#f-date','1310',delay=30); await pg.keyboard.press('Backspace'); print('after backspace ->',await pg.input_value('#f-date'))
        await pg.keyboard.press('Backspace'); print('after 2nd backspace ->',await pg.input_value('#f-date'))
        await pg.type('#f-date','2026',delay=30); print('retyped ->',await pg.input_value('#f-date'))
        await pg.screenshot(path='shots/32_expense_date.png')
        await pg.click('#ov [data-a=close]')
        # income only extra
        await pg.click('#fab'); await pg.click('#ov [data-a=incExtra]')
        print('extra sheet:',(await pg.inner_text('#ov h2')))
        print('chips present:',await pg.locator('#f-slots').count())
        await pg.click('#ov [data-a=close]')
        await pg.click('#fab'); await pg.click('#ov [data-a=recvOnly]')
        print('slot sheet:',(await pg.inner_text('#ov h2')),'| chips:',(await pg.inner_text('#f-slots')).replace('\n',' / '))
        await pg.screenshot(path='shots/33_slot_sheet.png')
        await pg.click('#ov [data-a=close]')
        # settings: period
        await pg.click('.top [data-a=settings]')
        await pg.fill('#pd-'+await pg.evaluate("S.plan[1].id"),'10')
        await pg.fill('#pt-'+await pg.evaluate("S.plan[1].id"),'15')
        await pg.screenshot(path='shots/34_settings.png')
        await pg.evaluate("document.getElementById('pg').scrollTo(0,420)")
        await pg.screenshot(path='shots/35_settings_plan.png')
        await pg.click('[data-a=back]')
        await pg.screenshot(path='shots/36_home_range.png')
        print('plan:',await pg.evaluate("JSON.stringify(S.plan.map(p=>[p.day,p.dayTo]))"))
        print('ERRORS:',[e for e in errs])
        await b.close()
asyncio.run(main())
