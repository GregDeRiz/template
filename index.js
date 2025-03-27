import fs from 'fs';
import puppeteer from 'puppeteer';

async function loginToVinted(page, email, password) {
    await page.goto('https://www.vinted.fr/member/signup/select_type?ref_url=');

    const authButton = await page.$('span[data-testid="auth-select-type--register-switch"]');
    if (authButton) { await authButton.click(); }

    const loginButton = await page.waitForSelector('span[data-testid="auth-select-type--login-email"]');
    await loginButton.click();

    await page.waitForSelector('#username');
    const emailField = await page.$('#username');
    const passwordField = await page.$('#password');

    await emailField.type(email);
    await passwordField.type(password);

    const submitButton = await page.$('button[type="submit"]');
    await submitButton.click();
}

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

async function sendMessage(page, link, message) {
    await page.goto(link);
    await page.waitForNavigation();

    const messageButton = await page.waitForSelector('button[data-testid="ask-seller-button"]');
    messageButton.click();

    const textArea = await page.waitForSelector('#composerInput');
    await textArea.type(message);
    await page.keyboard.press('Enter');
}

async function searchForArticle() {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './data',
        defaultViewport: null
    });
    const page = await browser.newPage();
    await loginToVinted(page, "", "");
    await page.waitForNavigation();

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

    await sendMessage(page, "https://www.vinted.fr/items/6042875807-t-shirt-vert", "");
    const profileButton = await page.waitForSelector('#user-menu-button');
    await profileButton.click();
    const logoutButton = await page.waitForSelector('button.nav-link');
    await logoutButton.click();
    await browser.close();
}

await searchForArticle();
