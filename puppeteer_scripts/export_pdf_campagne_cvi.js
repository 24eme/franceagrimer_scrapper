const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true,
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
          console.log("recherche");
      }
      await page.click("#accueil-form\\:id_panel_criteres\\:header");
      await page.focus('#accueil-form\\:selectCampagneCritere');
      await page.keyboard.type(process.argv[3]);
      await page.focus('#accueil-form\\:numeroDu');
      await page.keyboard.type(process.argv[4]);
      await page.click('#accueil-form\\:boutonRechercher');
      await page.waitForSelector('td.rf-dt-c a');
      await page.waitForTimeout(500);
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("fiche");
      }
      await page.click('td.rf-dt-c a');
      await page.waitForSelector('img.lienFichier');
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("PDF dispo");
      }
      await page.click('img.lienFichier');
      await page.waitForTimeout(60000);
      await page.goto('https://vitirestructuration.franceagrimer.fr/du-presentation/');
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log('fin téléchargement');
      }
  } catch (e) {
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.error(e);
      }
  } finally {
      await browser.close();
  }
})();
