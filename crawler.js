

const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const fs = require('fs');
const download = require('image-downloader')

const baseUrl = 'https://www.goodreads.com';

const url = "https://www.goodreads.com/book/show/870.Fullmetal_Alchemist_Vol_1";

let visitedUrls = {};

function grabComic(url) {
  request(url, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }

    var $ = cheerio.load(body);

    {/* grabs link to comic series list  */}
    let link = $('a.greyText').attr('href');


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

    // grab link to each comic in the series (and a few more)
    // can also grab all starting links in 'most popular series'
    //   fs.appendFileSync('fma.txt', title + '\n' + baseUrl.concat(link) + '\n');
    //   let title = $(this).find('a.bookTitle > span').text().trim();

  });
}

{/* grab all links in a set  */}
function grabLinks() {

  // const comicList = 'https://www.goodreads.com/list/show/7512.Best_Manga_of_All_Time';
  const comicList = 'https://www.goodreads.com/series/49276-fullmetal-alchemist'
  request(comicList, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }

    const $ = cheerio.load(body);

    let comicLinks = [];

    $('a.bookTitle').each(function( index ) {
      let link = $(this).attr('href');
      comicLinks.push(baseUrl.concat(link));
      // fs.appendFileSync('fma.txt', baseUrl.concat(link) + '\n');
    });

    comicLinks.map((comicUrl) => {
      grabComic(comicUrl)
    });
    // grabComic(comicLinks[0]);
    // from here, we will connect it with a function that grab the comic info
    // and then create a web grabbing all other comics in the series

    console.log("Status code: " + response.statusCode);
  });

}

grabLinks();
// grabComic(url);
