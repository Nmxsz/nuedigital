import { chromium, expect, test } from "@playwright/test"

test("Login nuedigital", async ({page}) =>{

    // Login Daten
    const username = '';
    const password = '';

    // //erzeugt eine Instanz
    // const browser = await chromium.launch({
    //     headless: false,
    //     timeout: 600000000
    // });

    // // erzeugt einen neuen Kontext
    // const context = await browser.newContext();

    // //erzuegt einen "Tab" Cookies und Cache wird nicht geshared bei mehreren Tabs?
    // const page = await context.newPage();

    await page.goto('https://nuernberg.digital/index.html');
    
    await page.click('text=Auswahl speichern');

    await page.click('//i[@id="login__icon"]');

    await page.fill('//input[@id="user"]', username);
    await page.fill('//input[@id="pass"]', password);

    await page.click('//input[@type="submit"]');

    await expect (page).toHaveURL(/.user-profil.html/);

    await page.goto('https://nuernberg.digital/programm-2023/programmuebersicht.html');

    await expect (page).toHaveURL(/.programm-2023\/programmuebersicht.html/);
    
    let nextButtonExists = await page.$("//a[text()='nächste']") !== null;

    let lastUrl = 'https://nuernberg.digital/programm-2023/programmuebersicht.html';
    while(nextButtonExists) {       
        
        
        const detailsHrefs = await page.$$eval('a', links => 
        links.filter(link => link.textContent === 'Details').map(link => link.href)
        );
        
        for (const details of detailsHrefs) {
            await Promise.all([
                page.goto(details)
            ]);
    
            const isAlreadyRegistered =  await page.$('//span[text()="Bereits angemeldet"]');

            const price = await page.innerText("//th[text()='Preis']/following-sibling::td");
            if (!isAlreadyRegistered) {
                console.log('noch nicht angemeldet');
    
    
                if (price == "kostenlos") {
                    

                    const AnmeldenButton = await page.$("//a[text()='Anmelden']") !== null;
                    if (AnmeldenButton) {
                        await page.click("//a[text()='Anmelden']");

                        const isVorOrt = await page.$('//input[@id="tx_seminars_pi1_registration_editor__wunsch_vor_ort_dabei_sein_checkbox"]') !== null;
                        if (isVorOrt) {
                            await page.click('//input[@id="tx_seminars_pi1_registration_editor__wunsch_vor_ort_dabei_sein_checkbox"]');
                        }
                        await page.click('//input[@id="tx_seminars_pi1_registration_editor__terms_checkbox"]');
            
                        await page.click('//input[@id="tx_seminars_pi1_registration_editor__button_submit"]');
                        await expect(page.getByText('Danke für deine Anmeldung zum Event')).toBeTruthy();
                        console.log('erfolgreich angemeldet');
                    }
                    
                }
    
            } else {
                if (price != "kostenlos") {
                    console.log('wieder abmelden');
                    console.log(details);
                }
            }
        }   

        await Promise.all([
            page.goto(lastUrl)
        ]);

        const nextButton = await page.$("//a[text()='nächste']");
        await nextButton?.click();

        await Promise.all([
            lastUrl = page.url()
        ]);

        nextButtonExists = await page.$("//a[text()='nächste']") !== null;
    }

}) 