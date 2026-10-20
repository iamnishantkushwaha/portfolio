"""Optional local QA using an already installed Python Playwright environment."""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.environ.get('TEST_BASE_URL','http://127.0.0.1:3100')
OUT=Path(__file__).resolve().parents[1]/'docs'/'evidence'/'phase-3'

async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        for javascript in [True,False]:
            context=await browser.new_context(java_script_enabled=javascript)
            page=await context.new_page()
            errors=[]
            page.on('pageerror',lambda error: errors.append(str(error)))
            page.on('console',lambda message: errors.append(message.text) if message.type=='error' else None)
            for width in ([320,390,768,1024,1440] if javascript else [320,390,1440]):
                await page.set_viewport_size({'width':width,'height':1000 if width>767 else 844})
                response=await page.goto(BASE,wait_until='networkidle')
                assert response.status==200
                await page.evaluate('document.fonts.ready')
                dimensions=await page.evaluate('''()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,background:getComputedStyle(document.body).backgroundColor,font:getComputedStyle(document.body).fontFamily,containerWidth:document.querySelector('.container').getBoundingClientRect().width})''')
                assert dimensions['width']==dimensions['scrollWidth'],dimensions
                assert dimensions['background']=='rgb(247, 248, 245)',dimensions
                for section in ['projects','about','experience','skills','services','education','contact']:
                    assert await page.locator('#'+section).is_visible(),section
                assert await page.get_by_role('heading',level=1).count()==1
                if javascript and width<768:
                    toggle=page.locator('.menu-toggle')
                    assert await toggle.is_visible()
                    assert not await page.locator('#main-navigation-links').is_visible()
                    await toggle.click()
                    assert await page.locator('#main-navigation-links').is_visible()
                    assert await page.evaluate('document.documentElement.scrollWidth===innerWidth')
                    assert await toggle.get_attribute('aria-expanded')=='true'
                    await page.keyboard.press('Escape')
                    assert await toggle.get_attribute('aria-expanded')=='false'
                    assert await toggle.evaluate('(element)=>document.activeElement===element')
                    await toggle.click()
                    await page.locator('#main-navigation-links').get_by_role('link',name='Work',exact=True).click()
                    assert await toggle.get_attribute('aria-expanded')=='false'
                    await expect(page.locator('#projects-heading')).to_be_focused()
                    assert page.url.endswith('#projects')
                if not javascript:
                    assert await page.locator('#main-navigation-links').is_visible()
                    assert not await page.locator('.menu-toggle').is_visible()
                results.append({'javascript':javascript,'viewport':width,'passed':True,**dimensions})
                if javascript and width in [390,1440]:
                    await page.goto(BASE,wait_until='networkidle')
                    await page.screenshot(path=str(OUT/f'foundation-{width}.png'),full_page=True)
            assert not errors,errors
            await context.close()
        context=await browser.new_context(reduced_motion='reduce',viewport={'width':390,'height':844})
        page=await context.new_page()
        await page.goto(BASE,wait_until='networkidle')
        await page.keyboard.press('Tab')
        assert await page.get_by_role('link',name='Skip to content').evaluate('(element)=>document.activeElement===element')
        await page.keyboard.press('Enter')
        assert await page.locator('#main-content').evaluate('(element)=>document.activeElement===element')
        assert await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--motion-hero').trim()") in ['0ms','0s']
        assert await page.evaluate('document.getAnimations().length')==0
        results.append({'test':'skip-link focus and reduced-motion preference','passed':True})
        await context.close()
        await browser.close()
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'browser-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))

if __name__=='__main__':asyncio.run(main())
