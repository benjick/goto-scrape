const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('mz/fs');

const init = async () => {
  try {
    const result = await fetch('https://gotocph.com/2017/schedule');
    const html = await result.text();
    const $ = cheerio.load(html);
    const data = $('#schedule').data();
    delete data.workshops;
    delete data.events;
    delete data.alltags;
    const json = JSON.stringify(data, null, 4);
    await fs.writeFile('talks.json', json);
    console.log('All good!');
  } catch (e) {
    console.log('Oops!');
    console.log(e);
  }
};

init();
