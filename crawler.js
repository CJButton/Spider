

const request = require('request').defaults({ family: 4 });
const cheerio = require('cheerio');
const URL = require('url-parse');
const fs = require('fs');
const download = require('image-downloader')

const startUrl = 'http://www.goodreads.com';
const url = new URL(startUrl);
const baseUrl = url.protocol + "//" + url.hostname;

const mangaList = require('./comicList');

// const testUrl = 'https://www.goodreads.com/book/show/870.Fullmetal_Alchemist_Vol_1';
// const testUrl = 'https://www.goodreads.com/book/show/1315744.Doraemon_Vol_01'
// const testUrl = 'https://www.goodreads.com/book/show/1725523.PLUTO';
// grabComic(testUrl);

function grabComic(url) {
  request(url, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }

    var $ = cheerio.load(body);

    {/* check if correct language and return if not English or none given*/}
    let lang = $('div[itemprop = "inLanguage"]').text().trim();
    if (lang !== 'English') return;

    {/* title  */}
    let title = $('h1.bookTitle').first().contents().filter(function() {
      return this.type === 'text';
    }).text().trim();

    {/* authors  */}
    let authors = [];
    $('a.authorName > span').each(function( index ) {
      authors.push($(this).text());
    });

    {/* releaseDate  */}
    let releaseDate = $('nobr.greyText').text().trim();

    {/* synopsis  */}
    let descrip = $('div#description > span').last().contents().filter(function() {
      return this.type === 'text';
    }).text();

    {/* compressed title for images  */}
    let imgTitle = title.replace(/\s/g,'');

    {/* place into an object  */}
    let mangaCreate = `Manga.create(
      title: '${title}',
      author: '${authors[0]}'
      synopsis: '${descrip}',
      release_date: '${releaseDate}')`

    {/* append to the file  */}
    fs.appendFileSync('comics.txt', mangaCreate + '\n');

    {/* cover image  */}
    const cover = $('div.editionCover > img').attr('src');

    options = {
      url: cover,
      dest: `./images/${imgTitle}.jpg`
    }

    download.image(options)
      .then(({ filename, image }) => {
      }).catch((err) => {
        throw err
    });

    {/* grabs link to comic series list  */}
    // let link = $('a.greyText').attr('href');
    // fs.appendFileSync('comicList.txt', baseUrl.concat(link) + '\n');

    // console.log(!(baseUrl.concat(link)));
    // if (!(baseUrl.concat(link) in visitedUrls)) {
    //   grabLinks(baseUrl.concat(link));
    // }

  });
}

// const comicList = 'http://www.goodreads.com/list/show/7512.Best_Manga_of_All_Time';
// const comicList = 'https://www.goodreads.com/series/49276-fullmetal-alchemist'

{/* grab all links in a set  */}
function grabLinks(comicList) {
  request(comicList, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }

    const $ = cheerio.load(body);
    let total = 0;
    $('a.bookTitle').each(function( index ) {
      let link = $(this).attr('href');
      total += 1;
      console.log(total);
      grabComic(baseUrl.concat(link));
    });
    console.log("Status code: " + response.statusCode);
  });
}

const comicList = mangaList;

comicList.map((list) => {
  grabLinks(list);
})
