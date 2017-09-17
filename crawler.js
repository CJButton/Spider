

const request = require('request').defaults({ family: 4 });
const cheerio = require('cheerio');
const URL = require('url-parse');
const fs = require('fs');
const download = require('image-downloader')

const startUrl = 'http://www.goodreads.com';
const url = new URL(startUrl);
const baseUrl = url.protocol + "//" + url.hostname;

const mangaList = require('./comicList');

{/* testing links and one offs */}
// const testUrl = 'https://www.goodreads.com/book/show/870.Fullmetal_Alchemist_Vol_1';
// const testUrl = 'https://www.goodreads.com/book/show/1725523.PLUTO';
// grabComic(testUrl);

// not all ranma covers have an entry in comics.txt
// in cloudinary, (,) turn into (_)
// might consider deleting the ranma 1/2 (2-in-1 editions)
{/*
  simplify cloudinary imgage linking by using a closure and giving each
  comic a number; looks like we can set the url as we wish using prefixes
  http://cloudinary.com/documentation/fetch_remote_images
  Image versions are not needed? This might be the best way to go about
  uploading then
  http://cloudinary.com/documentation/upload_images
  http://res.cloudinary.com/ddbfkqb9m/image/upload/c_scale,h_350,w_233/v1478851605/manga%20covers/dragonball2.jpg
  http://res.cloudinary.com/ddbfkqb9m/image/upload/c_scale,h_350,w_233/manga%20covers/dragonball2.jpg

  New plan:
  We will perform a test
  1. One set of comics will be spidered
  2. We will set their img_url here
  3. The img file name will be numbered
  4. We won't use the /v versions of the urls
  5. Upload the img files to cloudinary
  6. Check if the file names are retained and we can reach that file

  Steps:
  Write a closure to keep track of how many comics have been added
  Start at 1000
  Update the files that are written to

  Delete comics/elements:
  Reads R to L (Japanese Style) for teen plus audiences.
  The art of

  // consider fixing synopsis for Bakuman
  // update synopsis for love hina
  */}

{/* Counter Closure */}
const comicUpdater = () => {
  let total = 1397;

  return(
    adder = () => {
      return total += 1;
    }
  );
}

let comicCounter = comicUpdater();

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
    // let imgTitle = title.replace(/[/\s]/g,'');
    let imgTitle = comicCounter();

    {/* place into an object  */}
    let mangaCreate = `Manga.create(
      title: '${title}',
      author: '${authors[0]}',
      synopsis: '${descrip}',
      release_date: '${releaseDate}',
      img_url: 'http://res.cloudinary.com/ddbfkqb9m/image/upload/c_scale,h_350,w_233/covers/${imgTitle}.jpg')`


    {/* append to the file  */}
    fs.appendFileSync('allComics.txt', mangaCreate + '\n' + '\n');

    {/* cover image  */}
    const cover = $('div.editionCover > img').attr('src');

    // updated for tests
    options = {
      url: cover,
      dest: `./newImages/${imgTitle}.jpg`
    }

    download.image(options)
      .then(({ filename, image }) => {
      }).catch((err) => {
        throw err
    });
  });
}

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
//
// {/* grabs link to comic series list  */}
// // let link = $('a.greyText').attr('href');
// // fs.appendFileSync('comicList.txt', baseUrl.concat(link) + '\n');
