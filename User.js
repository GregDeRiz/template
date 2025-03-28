import Data from "./auth.js"

export default class User {
    async loginToVinted(page) {
        await page.goto('https://www.vinted.fr/member/signup/select_type?ref_url=');

        const authButton = await page.$('span[data-testid="auth-select-type--register-switch"]');
        if (authButton) { await authButton.click(); }

        const loginButton = await page.waitForSelector('span[data-testid="auth-select-type--login-email"]');
        await loginButton.click();

        await page.waitForSelector('#username');
        const emailField = await page.$('#username');
        const passwordField = await page.$('#password');

        await emailField.type(await Data.getMail());
        await passwordField.type(await Data.getPassword());

        const submitButton = await page.$('button[type="submit"]');
        await submitButton.click();
    }

    async sendMessage(page, link, message) {
        await page.goto(link);
        await page.waitForNavigation();

        const messageButton = await page.waitForSelector('button[data-testid="ask-seller-button"]');
        messageButton.click();

        const textArea = await page.waitForSelector('#composerInput');
        await textArea.type(message);
        await page.keyboard.press('Enter');
    }

    async logout(page) {
        const profileButton = await page.waitForSelector('#user-menu-button');
        await profileButton.click();
        const logoutButton = await page.waitForSelector('button.nav-link');
        await logoutButton.click();
    }
}
