import fs from 'fs';
import puppeteer from 'puppeteer';

import FileStoring from './file_storing.js';
import Article from './articles.js';
import User from './user.js';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './data',
        defaultViewport: null
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    if (fs.existsSync('result.csv')) {
        const user = new User();
        await user.loginToVinted(page);
        let items = FileStoring.parseCSV(fs.readFileSync('result.csv', 'utf8'));
        await page.waitForNavigation();

        await user.sendMessage(
            page,
            //items[Index de l'article].link,
            "Bonjour, j'aimerai savoir si ce jean est toujours disponible ?"
        );
        await page.screenshot({path: 'screenshot.png'});
        await user.logout(page);
        console.log("Done! Message send.");
    }
    else await Article.searchForArticle(page);

    await browser.close();
})();
