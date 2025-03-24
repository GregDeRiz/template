import fs from 'fs';
import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        userDataDir: './data',
    });
    const page = await browser.newPage();
    await page.goto('https://www.vinted.fr/catalog?time=1742556067&catalog[]=1842&disabled_personalization=true&page=1&size_ids[]=4&color_ids[]=1&search_text=coupe%20%C3%A9vas%C3%A9', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.feed-grid');

    const articles = await page.$$('.feed-grid > .feed-grid__item');
    let items = [];
    for (const article of articles) {
        let index = articles.indexOf(article);
        if (items.length >= 10) break;

        let title = "Null";
        let price = "Null";
        let link = "Null";

        try { title = await article.$eval('a', el => el.title); }
        catch (error) { console.log("Cannot found title from article " + index + ": " + error); }
        try { link = await article.$eval('a', el => el.href); }
        catch (error) { console.log("Cannot found link from article " + index + ": " + error); }
        try { price = title.match(/\d{1,3},\d{2}\s€/)[0]; }
        catch (error) { console.log("Cannot found price from article " + index + ": " + error); }

        title = title.substring(0, title.indexOf(',')).trim();
        price = price.replace(',', '.');
        if (!link.includes("member") && title !== "Null" || price !== "Null") items.push({ title, price, link });
    }

    fs.unlinkSync('result.csv');
    for (const item of items) {
        fs.appendFile(
            'result.csv',
            `${item.title},${item.price},${item.link}\n`,
            'utf8',
            (err) => { if (err) throw err; }
        );
    }

    console.log("Done! Saved " + items.length + " articles into result.csv");
    await browser.close();
})();
