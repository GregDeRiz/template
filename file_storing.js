import fs from "fs";

export default class FileStoring {
    static async storeItemsInFile(items) {
        for (const item of items) {
            fs.appendFile(
                'result.csv',
                `${item.title},${item.price},${item.link}\n`,
                'utf8',
                (err) => { if (err) throw err; }
            );
        }
    }

    static parseCSV = (csv) => {
        const rows = csv.split('\n');
        const headers = ["title", "price", "link"];
        return rows.slice(1).map(row => {
            const values = row.split(',');
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            return obj;
        });
    }
}
