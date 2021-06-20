const puppeteer = require('puppeteer');
let page;

const sleep = (time) => {
    return new Promise((resolve, reject) => {
        return setTimeout(() => {
            return resolve(true);
        }, time * 1000);
    });
}

(async () => {
    const browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
    await page.goto('https://a.aliexpress.com/_mKQaMzf');
    const hrefElement = await page.$('#tabBarItem1');
    await hrefElement.click();
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    let pageList = await browser.pages();
    page = pageList[pageList.length - 1];
    let products = await page.$$('div[data-role="allProducts"]');
    let idList = [];
    for (let i = 0; i < products.length; i++) {
        let id = await page.evaluate(el => el.getAttribute('data-spmd'), products[i]);
        if (id) {
            id = id.split("_").slice(-1)[0];
            let item = {
                id: id,
                url: `https://www.aliexpress.com/item/${id}.html`,
                skuMap: {}
            };
            idList.push(item);
        }
    }
    for (let j = 0; j < idList.length; j++) {
        let item = idList[j];
        await page.goto(item.url);
        // await page.waitForNavigation();
        await sleep(j === 0 ? 5 : 3);
        // page = pageList[pageList.length - 1];
        // sku-property-image
        let previewImages = await page.$$('.sku-property-image > img');
        for (let k = 0; k < previewImages.length; k++) {
            let imgSrc = await page.evaluate(el => el.getAttribute('src'), previewImages[k]);
            let title = await page.evaluate(el => el.getAttribute('title'), previewImages[k]);
            item.skuMap = {
                img: imgSrc.replace("_50x50.jpg_.webp", "_640x640.jpg"),
                title: title
            }
            console.log(`"${item.id.replace(' ', '')}","${item.skuMap.title}","${item.skuMap.img}"`);
        }
    }

    await sleep(5);
    await browser.close();
    await sleep(2);
    process.exit();
})();

