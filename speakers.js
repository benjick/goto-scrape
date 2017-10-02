const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('mz/fs');
const ora = require('ora');
const sleep = require('sleep-promise');
const uuid = require('uuid/v4');

const baseUrl = 'https://gotocph.com/';

const Cheerio = async url => {
  await sleep(parseInt(Math.random() * 100 * 2, 10));
  const result = await fetch(baseUrl + url);
  const html = await result.text();
  return cheerio.load(html);
};

const init = async () => {
  const spinner = ora('Fetching speakers').start();

  try {
    const $ = await Cheerio('2017/speakers');
    const speakers = $('.session-speaker')
      .map((i, el) => ({
        name: $(el)
          .find('.session-speaker__name')
          .text()
          .replace(/\s\s+/g, ' '),
        url: $(el)
          .find('.session-speaker__name a')
          .attr('href'),
        role: $(el)
          .find('.session-speaker__role')
          .text(),
        img: $(el)
          .find('.session-speaker__portrait')
          .attr('src'),
      }))
      .get();
    spinner.succeed('Fetched speakers!');
    for (const speaker of speakers) {
      spinner.start(`Fetching info for ${speaker.name}`);
      const $$ = await Cheerio(speaker.url);
      const description = $$('.session__description p')
        .map((i, el) => $$(el).text())
        .get()
        .join('\n\n');
      speaker.description = description;
      speaker.id = uuid();
      delete speaker.url;
      spinner.succeed(speaker.name);
    }
    const json = JSON.stringify(speakers, null, 2);
    await fs.writeFile('speakers.json', json);
    spinner.stop();
  } catch (e) {
    spinner.error('Oops!');
    spinner.stop();
  }
};

init();
