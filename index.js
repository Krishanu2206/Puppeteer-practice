import puppeteer from 'puppeteer'; 
import fs from 'fs';
import { convertArrayToCSV } from 'convert-array-to-csv';
import axios from 'axios';

const createDirectory = () => {
    if (!fs.existsSync('images')) {
        fs.mkdirSync('images', { recursive: true });
        console.log('Directory created successfully');
    } else {
        console.log('Directory already exists');
    }
};

createDirectory();

const downloadimage = async (url, path) => {
    try {
        const response = await axios({
            url,
            responseType: 'arraybuffer'
        });

        fs.writeFile(path, response.data, (err) => {
            if (err) throw err;
            console.log('Image downloaded successfully');
        });
    } catch (error) {
        console.error('Error downloading image:', error);
    }
};

async function examplefunc(){
// launch the browser and open a new blank page
const browser = await puppeteer.launch({
    headless : false, //opens the actual browser for a short while and shows the operations,
    defaultViewport : false, // adjust to the screen
    userDataDir : "./tmp"
});

const page = await browser.newPage();

// setting a User-Agent to mimic a real browser
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');


// Increase navigation timeout
// await page.setDefaultNavigationTimeout(60000); // 60 seconds

// Navigate the page to a URL.
await page.goto('https://www.amazon.com/s?k=gaming+chairs&_encoding=UTF8&content-id=amzn1.sym.12129333-2117-4490-9c17-6d31baf0582a&pd_rd_r=b0e30440-29a3-43ac-b4b4-075d0b89e72f&pd_rd_w=G3qdh&pd_rd_wg=7bJ7P&pf_rd_p=12129333-2117-4490-9c17-6d31baf0582a&pf_rd_r=HXV7T1RJT0R0DJ1SWYJA&ref=pd_hp_d_atf_unk'); //https://www.amazon.com/s?k=gaming+headsets&_encoding=UTF8&content-id=amzn1.sym.12129333-2117-4490-9c17-6d31baf0582a&pd_rd_r=b0e30440-29a3-43ac-b4b4-075d0b89e72f&pd_rd_w=G3qdh&pd_rd_wg=7bJ7P&pf_rd_p=12129333-2117-4490-9c17-6d31baf0582a&pf_rd_r=HXV7T1RJT0R0DJ1SWYJA&ref=pd_hp_d_atf_unk

//https://www.amazon.com/s?k=gaming+mouse&_encoding=UTF8&content-id=amzn1.sym.12129333-2117-4490-9c17-6d31baf0582a&pd_rd_r=10e45df7-ac71-495c-9425-bd4c7491406c&pd_rd_w=95CyI&pd_rd_wg=mkFeg&pf_rd_p=12129333-2117-4490-9c17-6d31baf0582a&pf_rd_r=DQE05V9JKVGZ2S4HJJZY&ref=pd_hp_d_atf_unk

let items = [];
let i=1;
let j=1;

let is_disabled = false;

while(!is_disabled){

let prodhandles = [];

//gathering all products info using css selector 
prodhandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item'); //can write the whole selector or only a part (the main part)

console.log(is_disabled);

for(const producthandle of prodhandles){

    let title = "Null";
    let price = "Null";
    let imageurl= "Null";

    try{
    //pass the single handle below
    title = await page.evaluate(el => el.querySelector("h2 > a > span").innerText,  producthandle);
    }catch(err){};

    try{
    price = await page.evaluate(el => el.querySelector('a > span > span.a-offscreen').innerText, producthandle);
    }catch(err){};

    try{
    imageurl = await page.evaluate(el => el.querySelector('div > span > a > div > img').src, producthandle);
    await downloadimage(imageurl, `./images/image--${j++}.jpg`);
    }catch(err){};

    if(title!== "Null"){
        items.push({title:title, price:price, imageurl:imageurl});
    }

    }
    console.log(items.length);

    console.log(`On Page ${i++}`);

    try{
    await page.waitForSelector("a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator", {visible:true});
    }catch(err){}

    is_disabled = await page.$('div > div > span > span.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;

    if(is_disabled == false){
    await page.click('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator');
    await page.waitForNavigation({waitUntil:"networkidle2"});
    }
}

const csvFromArrayOfObjects = convertArrayToCSV(items);

fs.appendFile('results.csv', csvFromArrayOfObjects + '\n', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  

console.log(items.length);
console.log(items);

};

examplefunc();

