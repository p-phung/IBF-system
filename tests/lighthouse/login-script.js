const IBF_LOGIN_PATH = process.env.IBF_LOGIN_PATH;
const LOGIN_USER = process.env.LOGIN_USER;
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD;

const locators = {
    inputLoginEmail: "[data-test='input-user'] input",
    inputLoginPassword: "[data-test='input-password'] input",
    loginButton: "[data-test='login-button']",
};

module.exports = async (browser, context) => {
    if (context.url.includes(IBF_LOGIN_PATH)) {
        console.log(
            `Skip '${context.options.puppeteerScript}' for '${context.url}'`
        );
    } else {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(context.url + IBF_LOGIN_PATH);
        await page.waitForSelector(locators.inputLoginEmail, { visible: true });

        // Fill in and submit login form.
        const emailInput = await page.$(locators.inputLoginEmail);
        await emailInput.type(LOGIN_USER);
        const passwordInput = await page.$(locators.inputLoginPassword);
        await passwordInput.type(LOGIN_PASSWORD);
        await Promise.all([
            page.$eval(locators.loginButton, button => button.click()),
            page.waitForNavigation({ waitUntil: "networkidle0", timeout: 0 }),
        ]).catch(error => {
            console.log("Login Failed\n\n", error);
            process.exit(1);
        });

        await page.close();
    }
};
