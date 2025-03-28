import FileStoring from "./file_storing.js";

export default class Articles {
    static async storing(article, message) {
        let option = "Null";
        try { option = article }
        catch (error) { console.log(message + ": " + error); }
        return option;
    }

    static async retrieveItems(articles) {
        const items = [];
        for (const article of articles) {
            if (items.length >= 10) break;

            let index = articles.indexOf(article);
            let title = await Articles.storing(article.$eval('a', el => el.title), "Cannot found title from article " + index);
            let link = await Articles.storing(article.$eval('a', el => el.href), "Cannot found link from article " + index);
            let price = "Null";

            try { price = title.match(/\d{1,3},\d{2}\s€/)[0]; }
            catch (error) { console.log("Cannot found price from article " + index + ": " + error); }

            title = title.substring(0, title.indexOf(',')).trim();
            price = price.replace(',', '.');
            if (!link.includes("member") && title !== "Null" || price !== "Null") items.push({ title, price, link });
        }
        return items;
    }

    static async searchForArticle(page) {
        const userSearch = "jean femme taille haute coupe évasée";
        const options = {"color": 1, "size": 4};
        await page.goto(
            'https://www.vinted.fr/catalog?search_text=' + userSearch +
            "&disabled_personalization=true&" +
            "color_ids[]=" + options.color + "&" +
            "size_ids[]=" + options.size
        );
        await page.waitForSelector('.feed-grid > .feed-grid__item');

        const articles = await page.$$('.feed-grid > .feed-grid__item');
        const items = await Articles.retrieveItems(articles);

        await FileStoring.storeItemsInFile(items);
        console.log("Done! Saved " + items.length + " articles into result.csv");
    }
}
