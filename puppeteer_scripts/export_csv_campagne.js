const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({headless: (process.env.FRANCEAGRIMER_DEBUG != 2),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ]});
  const page = await browser.newPage();
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: process.argv[2]
  });
  try {
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("login cas");
      }
      await page.goto('https://cas.franceagrimer.fr/cas/login?service=http%3A%2F%2Fvitirestructuration.franceagrimer.fr%2Fdu-presentation%2Flogin%2Fcas');
      await page.click('#username');
      await page.keyboard.type(process.env.FRANCEAGRIMER_USERNAME);
      await page.click('#password');
      await page.keyboard.type(process.env.FRANCEAGRIMER_PASSWORD);
      await page.keyboard.press('Enter');
      await page.waitForNavigation();
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("recherche campagne");
      }
      await page.click("#accueil-form\\:id_panel_criteres\\:header");
      await page.focus('#accueil-form\\:selectCampagneCritere');
      await page.keyboard.type(process.argv[3]);
      await page.click('#accueil-form\\:boutonRechercher');
      await page.waitForSelector('#accueil-form\\:boutonExporter');
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("téléchargement");
      }
      await page.click("#accueil-form\\:boutonExporter");
      await page.waitForNavigation();
  } catch (e) {
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.error(e);
      }
  } finally {
      await browser.close();
  }
})();
