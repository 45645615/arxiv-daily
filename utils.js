const axios = require("axios");
const xml2js = require("xml2js");
const {
  ARXIV_TERM,
  SUNARXIV_QUERY,
  SATARXIV_QUERY,
  ARXIV_QUERY,
  MAX_PAPER_COUNT,
} = require("./template");

function getDateRange(isWeekend, dayOfWeek) {
  let startDate, endDate;

  // If it's a weekend, set the date range for the last 7 days
  if (isWeekend) {
    console.log("Today is weekend");
    endDate = new Date();
    endDate.setDate(endDate.getDate() - 7);
    startDate = new Date();
  } else {
    // If it's a weekday, set the date range based on the day of the week (yesterday for tuesday to friday, last weeks friday for monday)
    console.log("Today is weekday");
    startDate = new Date();
    if (dayOfWeek === 1) {
      startDate.setDate(startDate.getDate() - ARXIV_TERM - 2);
    } else {
      startDate.setDate(startDate.getDate() - ARXIV_TERM);
    }
    endDate = new Date(startDate);
  }

  startDate = startDate.toISOString().split("T")[0].replace(/-/g, "");
  endDate = endDate.toISOString().split("T")[0].replace(/-/g, "");
  // Return date range
  return `${endDate}0000+TO+${startDate}2359`;
}

// Get query based on the day of the week
function getCategories(dayOfWeek) {
  if (dayOfWeek === 0) {
    return SUNARXIV_QUERY;
  } else if (dayOfWeek === 6) {
    return SATARXIV_QUERY;
  } else {
    return ARXIV_QUERY;
  }
}

// Fetch papers from arXiv API based on the date range and categories
async function fetchPapers(dateRange, categories) {
  let authorNamesArray = [];
  let titleArray = [];
  let arxivUrlArray = [];
  let abstractArray = [];
  let commentArray = [];
  // Iterate through categories and fetch entries
  for (const category of categories) {
    const entries = await getEntriesOn(dateRange, category);

    for (const entry of entries.entries) {
      const arxivUrl = entry.id;
      let title = entry.title;
      title = title.replace(/\n/g, "");
      let authors = entry.author;
      let authorNames =
        authors.length > 0
          ? authors.map((author) => author.name).join(", ")
          : authors["name"];
      const summary = entry.summary;
      const comment = entry["arxiv:comment"];

      titleArray.push(title);
      authorNamesArray.push(authorNames);
      arxivUrlArray.push(arxivUrl);
      abstractArray.push(summary);
      commentArray.push(comment);
    }
  }

  return {
    authorNamesArray,
    titleArray,
    arxivUrlArray,
    abstractArray,
    commentArray,
  };
}

// Fetch entries from arXiv API based on the date and query
async function getEntriesOn(date, query) {
  const baseURL = "http://export.arxiv.org/api/query?";
  const searchQuery = `submittedDate:[${date}]`;
  // const url = `${baseURL}?search_query=${searchQuery}&sortBy=submittedDate&sortOrder=descending&start=0&max_results=${MAX_PAPER_COUNT}&start=0&start=0&submitted_date[from]=${toYYYYMMDD(date)}&submitted_date[to]=${toYYYYMMDD(date)}`;
  const url = `${baseURL}search_query=${searchQuery}+AND+${query}&sortBy=submittedDate&sortOrder=descending&start=0&max_results=${MAX_PAPER_COUNT}`;
  const response = await axios.get(url);
  const xml = response.data;
  const parser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true,
    emptyTag: null,
  });
  const result = await parser.parseStringPromise(xml);
  if (result.feed.hasOwnProperty("entry")) {
    const entries = result.feed.entry;
    return { entries };
  } else {
    console.log("No entries!!!");
    return { response };
  }
}

// Deduplicate the given array and return an object containing the deduplicated array and the indices of duplicated elements
function deduplicateArrayWithIndices(array) {
  const deduplicatedArray = [];
  const duplicatedIndices = [];

  array.forEach((element, index) => {
    if (deduplicatedArray.includes(element)) {
      duplicatedIndices.push(index);
    } else {
      deduplicatedArray.push(element);
    }
  });

  return { deduplicatedArray, duplicatedIndices };
}

// Extract scores based on summaries
function extractScores(summaries) {
  let scores = [];

  for (let summary of summaries) {
    let scoreArray = extractNumbersFromString(summary);
    let score = -1;

    if (scoreArray.length !== 0) {
      score = scoreArray[0][0];
    }

    scores.push(score);
  }

  return scores;
}

function extractNumbersFromString(str) {
  var regex = /(\d+)\/(\d+)/g;
  var matches = [];
  var match;

  while ((match = regex.exec(str)) !== null) {
    var x = parseInt(match[1]);
    var y = parseInt(match[2]);
    matches.push([x, y]);
  }

  return matches;
}

function sortStringArrayByScore(stringArray, scoreArray) {
  var sortedArray = stringArray.slice();

  function compare(a, b) {
    return (
      scoreArray[stringArray.indexOf(a)] - scoreArray[stringArray.indexOf(b)]
    );
  }

  sortedArray.sort(compare);

  return sortedArray;
}

function removeElementsByIndices(array, indices) {
  return array.filter((_, index) => !indices.includes(index));
}

function parseJsonFromResponse(response) {
  // Regular expression to match a JSON object
  const jsonRegex = /{[\s\S]*}/;

  // Extract the JSON string from the response using the regex
  const jsonString = response.match(jsonRegex)[0];

  // Parse the JSON string and return the JavaScript object
  return JSON.parse(jsonString);
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

module.exports = {
  getDateRange,
  getCategories,
  fetchPapers,
  deduplicateArrayWithIndices,
  extractScores,
  sortStringArrayByScore,
  removeElementsByIndices,
  parseJsonFromResponse,
  formatDate,
};
