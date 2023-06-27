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
      await page.waitForTimeout(500);

      await page.click("#accueil-form\\:id_panel_criteres\\:header");
      await page.click("#accueil-form\\:id_panel_resultats\\:header");
      await page.focus('#accueil-form\\:selectCampagne');
      await page.keyboard.type(process.argv[3]);
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("campagne 1: DONE");
      }
      await page.waitForTimeout(3000);

      await page.waitForSelector('#accueil-form\\:id_panel_resultats\\:header .rf-cp-ico-colps');
      await page.waitForTimeout(500);

      await page.click("#accueil-form\\:id_panel_criteres\\:header");
      await page.click("#accueil-form\\:id_panel_resultats\\:header");
      await page.waitForSelector('#accueil-form\\:id_panel_resultats\\:header .rf-cp-ico-colps');
      await page.waitForTimeout(500);
      await page.waitForSelector('#waitModal_container');
      await page.waitForSelector('#waitModal_container', {hidden: true});
      const acordeon = await page.$$('.rf-cp-lbl-colps');
      await acordeon[0].click();
      await page.waitForSelector('#accueil-form\\:boutonRechercher');
      await page.focus('#accueil-form\\:numeroDu');
      await page.keyboard.type(process.argv[4]);
      await page.focus('#accueil-form\\:selectCampagneCritere');
      await page.keyboard.type(process.argv[3]);
      await page.waitForTimeout(200);
      await page.click('#accueil-form\\:boutonRechercher');
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("fiche");
      }
      await page.waitForSelector('#waitModal_container');
      await page.waitForSelector('#waitModal_container', {hidden: true});
      await page.waitForSelector('#accueil-form\\:boutonExporter');
      await page.waitForTimeout(1000);
      await page.waitForSelector('.rf-dt-c img');
      await page.click('.rf-dt-c img');
      await page.waitForTimeout(1000);
      await page.waitForSelector('img.lienFichier');
      await page.click('img.lienFichier');
      if (process.env.FRANCEAGRIMER_DEBUG != 0) {
          console.log("PDF dispo");
      }
      await page.waitForResponse((response) => {
          if (response.status() === 200) {
              filename = response.headers()['content-disposition'];
              filename = filename.replace('attachment;filename=', '');
              if (filename.match('pdf')) {
                  return true;
              }
          }
          return false;
      });
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
