import fs from 'fs';
import puppeteer from 'puppeteer';

async function storing(article, message) {
    let option = "Null";
    try { option = article }
    catch (error) { console.log(message + ": " + error); }
    return option;
}

async function retrieveItems(articles) {
    const items = [];
    for (const article of articles) {
        if (items.length >= 10) break;

        let index = articles.indexOf(article);
        let title = await storing(article.$eval('a', el => el.title), "Cannot found title from article " + index);
        let link = await storing(article.$eval('a', el => el.href), "Cannot found link from article " + index);
        let price = "Null";

        try { price = title.match(/\d{1,3},\d{2}\s€/)[0]; }
        catch (error) { console.log("Cannot found price from article " + index + ": " + error); }

        title = title.substring(0, title.indexOf(',')).trim();
        price = price.replace(',', '.');
        if (!link.includes("member") && title !== "Null" || price !== "Null") items.push({ title, price, link });
    }
    return items;
}

async function storeItemsInFile(items) {
    for (const item of items) {
        fs.appendFile(
            'result.csv',
            `${item.title},${item.price},${item.link}\n`,
            'utf8',
            (err) => { if (err) throw err; }
        );
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: true, userDataDir: './data' });
    const page = await browser.newPage();

    const userSearch = "jean femme taille haute coupe évasée";
    const options = {"color": 1, "size": 4};
    await page.goto(
        'https://www.vinted.fr/catalog?search_text=' + userSearch +
        "&disabled_personalization=true&" +
        "color_ids[]=" + options.color + "&" +
        "size_ids[]=" + options.size,
        { waitUntil: 'networkidle2' }
    );
    await page.waitForSelector('.feed-grid');

    const articles = await page.$$('.feed-grid > .feed-grid__item');
    const items = await retrieveItems(articles);
    if (fs.existsSync('result.csv')) fs.unlinkSync('result.csv');

    await storeItemsInFile(items);
    console.log("Done! Saved " + items.length + " articles into result.csv");
    await browser.close();
})();
