import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        userDataDir: './data',
    });
    const page = await browser.newPage();
    await page.goto('https://www.vinted.fr/catalog/183-jeans?time=1742402313', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.feed-grid');

    const articles = await page.$$('.feed-grid > .feed-grid__item');
    let items = [];
    for (const article of articles) {
        let title = "Null";
        let price = "Null";

        title = await article.$eval('a', el => el.title);
        try {
            price = title.match(/\d{1,3},\d{2}\s€/)[0];
        } catch (error) { }

        title = title.substring(0, title.indexOf(',')).trim();
        if (title.length > 0) items.push({ title, price });
    }

    console.log(items);
    await browser.close();
})();
