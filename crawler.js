


const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const fs = require('fs');
const download = require('image-downloader')

const baseUrl = 'https://www.goodreads.com'

// https://www.goodreads.com/list/show/7512.Best_Manga_of_All_Time

function grabLinks() {
  request("https://www.goodreads.com/book/show/873.Fullmetal_Alchemist_Vol_2", function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }
    console.log("Status code: " + response.statusCode);

    var $ = cheerio.load(body);

    // $('tr.athing:has(td.votelinks)').each(function( index ) {
    //   var title = $(this).find('td.title > a').text().trim();
    //   var link = $(this).find('td.title > a').attr('href');
    //   fs.appendFileSync('hackernews.txt', title + '\n' + link + '\n');
    // });

    // html for cover location
    // const cover = $('div.editionCover > img').attr('src');
    // fs.appendFileSync('fma.txt', cover);
    // const mSeries = $('h1.bookTitle');
    // options = {
    //   url: cover,
    //   dest: `./1.jpg`        // Save to /path/to/dest/photo.jpg
    // }

  // download.image(options)
  //   .then(({ filename, image }) => {
  //     console.log('File saved to', filename)
  //   }).catch((err) => {
  //     throw err
  //   })

    // $('h1.bookTitle').each(function( index ) {
    // this grabs the title of the comic (filter retains only the comic title)
      let title = $('h1.bookTitle').first().contents().filter(function() {
          return this.type === 'text';
      }).text();
      // let link = $(this).attr('href');
      fs.appendFileSync('fma.txt', title + '\n');
    // });

    // grab link to each comic in the series (and a few more)
    // can also grab all starting links in 'most popular series'
    // $('a.bookTitle').each(function( index ) {
    //   let title = $(this).find('a.bookTitle > span').text().trim();
    //   let link = $(this).attr('href');
    //   fs.appendFileSync('fma.txt', title + '\n' + baseUrl.concat(link) + '\n');
    // });

  });
}

grabLinks();
// request performs url requests
// cheerio parses html
// url parses urls
//
//
// // contains the list of the 100 most popular comic series
// const START_URL = "https://www.goodreads.com/list/show/7512.Best_Manga_of_All_Time";
// // const SEARCH_WORD = "stemming";
// const MAX_PAGES_TO_VISIT = 10;
//
// const pagesVisited = {};
// const numPagesVisited = 0;
// const pagesToVisit = [];
// const url = new URL(START_URL);
// const baseUrl = url.protocol + "//" + url.hostname;
//
// pagesToVisit.push(START_URL);
// // by invoking, we begin the crawl
// crawl();
//
// function crawl() {
//   if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
//     console.log("Reached max limit of number of pages to visit.");
//     return;
//   }
//   const nextPage = pagesToVisit.pop();
//   if (nextPage in pagesVisited) {
//     // We've already visited this page, so repeat the crawl
//     crawl();
//   } else {
//     // New page we haven't visited
//     visitPage(nextPage, crawl);
//   }
// }
//
// function visitPage(url, callback) {
//   // Add page to our set
//   pagesVisited[url] = true;
//   numPagesVisited++;
//
//   // Make the request
//   console.log("Visiting page " + url);
//   request(url, function(error, response, body) {
//      // Check status code (200 is HTTP OK)
//      console.log("Status code: " + response.statusCode);
//      if(response.statusCode !== 200) {
//        callback();
//        return;
//      }
//      // Parse the document body
//      const $ = cheerio.load(body);
//      const isWordFound = searchForWord($, SEARCH_WORD);
//      if(isWordFound) {
//        console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
//      } else {
//        collectInternalLinks($);
//        // In this short program, our callback is just calling crawl()
//        callback();
//      }
//   });
// }
//
// function searchForWord($, word) {
//   const bodyText = $('html > body').text().toLowerCase();
//   return(bodyText.indexOf(word.toLowerCase()) !== -1);
// }
//
// function collectInternalLinks($) {
//     const relativeLinks = $("a[href^='/']");
//     console.log("Found " + relativeLinks.length + " relative links on page");
//     relativeLinks.each(function() {
//         pagesToVisit.push(baseUrl + $(this).attr('href'));
//     });
// }
