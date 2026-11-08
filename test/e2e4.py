import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/budget/dist/test.html'
MOCK="""
window.SpeechRecognition=window.webkitSpeechRecognition=class{constructor(){}
 start(){ setTimeout(()=>{this.onstart&&this.onstart();
   setTimeout(()=>{this.onresult&&this.onresult({results:[[{transcript:'купила воду за восемьдесят пять рублей'}]]});
     setTimeout(()=>{this.onend&&this.onend()},100)},300)},50)}
 abort(){}
};"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
        await ctx.add_init_script(MOCK)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(URL); await pg.click('[data-a=wizSkipAll]')
        await pg.wait_for_timeout(2800)
        await pg.screenshot(path='shots/50_nav_mic.png')
        await pg.click('.nav .mic')
        await pg.wait_for_timeout(900)
        print('text:',await pg.input_value('#q-text'))
        print('amt:',await pg.input_value('#q-amt'),'| cat:',await pg.evaluate("document.getElementById('q-cat').selectedOptions[0].text"))
        print('status:',await pg.inner_text('#q-status'))
        print('save enabled:',not await pg.is_disabled('#q-save'))
        await pg.screenshot(path='shots/51_quick.png')
        await pg.click('#q-save')
        await pg.wait_for_timeout(300)
        print('tx:',await pg.evaluate("JSON.stringify(S.txs.map(t=>[t.title,t.amount,L.cat(S,t.catId).name,t.date===L.today()]))"))
        # typed + learn
        await pg.click('.nav .mic'); await pg.wait_for_timeout(900)
        await pg.fill('#q-text','вчера печенье 120'); await pg.dispatch_event('#q-text','input')
        print('cat guess for печенье:',await pg.evaluate("document.getElementById('q-cat').selectedOptions[0].text"),'| when:',await pg.inner_text('#q-when'))
        await pg.select_option('#q-cat',label='Хобби')
        await pg.click('#q-save'); await pg.wait_for_timeout(200)
        await pg.click('.nav .mic'); await pg.wait_for_timeout(900)
        await pg.fill('#q-text','печенье 90'); await pg.dispatch_event('#q-text','input')
        print('learned:',await pg.evaluate("document.getElementById('q-cat').selectedOptions[0].text"))
        await pg.click('[data-a=qMore]'); await pg.wait_for_timeout(200)
        print('more ->',await pg.inner_text('#ov h2'),'|',await pg.input_value('#f-amount'),'|',await pg.input_value('#f-title'),'|',await pg.input_value('#f-date'))
        await pg.keyboard.press('Escape')
        # home view + budget after
        print('hero:',(await pg.inner_text('.hero')).replace('\n',' | '))
        print('ERRORS:',errs)
        # unsupported path
        ctx2=await b.new_context(viewport={'width':390,'height':844})
        p2=await ctx2.new_page()
        await p2.add_init_script("delete window.webkitSpeechRecognition;delete window.SpeechRecognition;")
        await p2.goto(URL); await p2.click('[data-a=wizSkipAll]'); await p2.click('.nav .mic'); await p2.wait_for_timeout(300)
        print('unsupported:',await p2.inner_text('#q-status'))
        await b.close()
asyncio.run(main())
