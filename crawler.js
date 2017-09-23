

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
  Delete comics/elements:
  Reads R to L (Japanese Style) for teen plus audiences.

  consider fixing synopsis for Bakuman
  update synopsis for love hina
  create table for genres/tags for easier searching and grabbing books of genres
  - create list of genres based off of wikipiedia's recommendations


  #   cities = Manga.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
  The below sample is valid for creating an object in the db
  Bookshelf.create({user_id: 1, title: "Currently-Reading"})

  Have each comic sorted together as objects inside of arrays
  Iterate over each comic, thereby creating an object in the db, and then
  take that comics id, and add it to the appropriate genre categories table
  {
   title:"tester",
   author:"Akira Toriyama",
   synopsis:"tester2",
   release_date: "January 10, 1986",
   img_url:"nothing",
   genre: ["Adventure", "Martial arts", "Sci-Fi"]}

  Genres to Create:
  ['Action',
   'Adventure',
   'Science Fantasy'
  ]
  */}

// change to parens to quotes to avoid erros with seed synopsis

{/* Counter Closure */}
const comicUpdater = () => {
  let total = 1826;

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
    let date = $('nobr.greyText').text().trim();
    let noBrackets = date.replace(/[()]/g, '');
    let releaseDate = noBrackets.replace(/first published /g, '');
    if (releaseDate === '') return;

    {/* synopsis  */}
    {/* removes double quotes if there are any, and replaces them with ''; this is to prevent
        issues with the seed file later  */}
    let description = $('div#description > span').last().contents().filter(function() {
      return this.type === 'text';
    }).text();
    let descrip = description.replace(/"/g, '\'');
    if (descrip === '') return;


    let imgTitle = comicCounter();

    {/* place into an object  */}
    let mangaCreate = `{
      title: "${title}",
      author: "${authors[0]}",
      synopsis: "${descrip}",
      release_date: "${releaseDate}",
      img_url: "http://res.cloudinary.com/ddbfkqb9m/image/upload/c_scale,h_350,w_233/covers/${imgTitle}.jpg"},`


    {/* append to the file  */}
    fs.appendFileSync('allComics.txt', mangaCreate + '\n' + '\n');

    {/* cover image  */}
    const cover = $('div.editionCover > img').attr('src');

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
    fs.appendFileSync('allComics.txt', '[' + '\n');
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
});
