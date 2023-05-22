const {
  getDateRange,
  getCategories,
  fetchPapers,
  deduplicateArrayWithIndices,
  extractScores,
  sortStringArrayByScore,
  removeElementsByIndices,
  formatDate,
} = require("./utils");
const {
  generateInputForSelection,
  callChatGPT,
  randomTokenLimit,
  fetchAndParseResponse,
  fetchSelectedPaperIndices,
} = require("./GPTutils");
const {
  formatMainMsg,
  formatOutput,
  generateSummaries,
  checkAndSendToSlack,
  sendMessage,
  sendThreadReply,
} = require("./slackUtils");
const {
  OPENAI_API_KEY,
  SLACK_TOKEN,
  MAX_PAPER_COUNT,
  WEEKENDSELECTION_PREFIX,
  SELECTION_PREFIX,
  CATEGORIES_GROUPT_PREFIX,
  PDF_CACHE,
} = require("./template");
const { downloadPDF } = require("./pdf");

async function main() {
  if (!OPENAI_API_KEY | !SLACK_TOKEN) {
    console.log("No API keys");
    return;
  }

  let output = "";
  const dayOfWeek = new Date().getDay();
  // const dayOfWeek = 1
  // Check if it's a weekend
  let isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  let dateRange = getDateRange(isWeekend, dayOfWeek);

  let categories = getCategories(dayOfWeek);

  // Fetch papers based on the date range and categories
  let {
    titleArray,
    authorNamesArray,
    arxivUrlArray,
    abstractArray,
    commentArray,
  } = await fetchPapers(dateRange, categories);

  // Deduplicate the fetched papers
  const dedupResult = deduplicateArrayWithIndices(arxivUrlArray);
  arxivUrlArray = dedupResult.deduplicatedArray;
  titleArray = removeElementsByIndices(
    titleArray,
    dedupResult.duplicatedIndices
  );
  authorNamesArray = removeElementsByIndices(
    authorNamesArray,
    dedupResult.duplicatedIndices
  );
  abstractArray = removeElementsByIndices(
    abstractArray,
    dedupResult.duplicatedIndices
  );
  commentArray = removeElementsByIndices(
    commentArray,
    dedupResult.duplicatedIndices
  );

  // Limit the number of tokens
  const tokenLimitResult = randomTokenLimit(titleArray, 16500);
  titleArray = removeElementsByIndices(
    titleArray,
    tokenLimitResult.removedIndices
  );
  authorNamesArray = removeElementsByIndices(
    authorNamesArray,
    tokenLimitResult.removedIndices
  );
  abstractArray = removeElementsByIndices(
    abstractArray,
    tokenLimitResult.removedIndices
  );
  arxivUrlArray = removeElementsByIndices(
    arxivUrlArray,
    tokenLimitResult.removedIndices
  );
  commentArray = removeElementsByIndices(
    commentArray,
    tokenLimitResult.removedIndices
  );

  // Generate input for chatGPT based selection
  const indexArray = await fetchSelectedPaperIndices(isWeekend, titleArray, 30);

  let selectedAuthorNamesArray = indexArray.map(
    (index) => authorNamesArray[index]
  );
  let selectedTitleArray = indexArray.map((index) => titleArray[index]);
  let selectedArxivUrlArray = indexArray.map((index) => arxivUrlArray[index]);
  let selectedAbstractArray = indexArray.map((index) => abstractArray[index]);
  let selectedCommentArray = indexArray.map((index) => commentArray[index]);

  await sendMessage(
    "===============================" +
      formatDate(new Date()) +
      "===============================\n\n"
  );

  if (isWeekend) {
    let summaries = await generateSummaries(
      isWeekend,
      selectedTitleArray,
      selectedAbstractArray
    );
    category_msg = dayOfWeek === 6 ? "Maths and Stats" : "Economics and Q-Fin";
    let main_msg = formatMainMsg(category_msg, selectedTitleArray);
    const mainMessage = await sendMessage(main_msg);
    let output = formatOutput(
      selectedTitleArray,
      selectedAuthorNamesArray,
      summaries,
      selectedArxivUrlArray,
      categories,
      selectedCommentArray
    );
    await sendThreadReply(mainMessage.channel, output, mainMessage.ts);
  } else {
    // Put title into different categories
    console.log(selectedTitleArray);
    input = generateInputForSelection(selectedTitleArray);
    const responseObject = await fetchAndParseResponse(input, 30);
    console.log(responseObject);
    categoriedIndex = [];

    for (const category in responseObject) {
      let indexA = responseObject[category];
      Array.prototype.push.apply(categoriedIndex, indexA);
    }
    // Find missing elements in the new array
    let missingElements = [];
    for (let i = 0; i < selectedTitleArray.length; i++) {
      if (!categoriedIndex.includes(i)) {
        missingElements.push(i);
      }
    }

    let categoryAuthorNamesArray,
      categoryTitleArray,
      categoryArxivUrlArray,
      categoryAbstractArray,
      categoryCommentArray,
      summaries,
      main_msg,
      mainMessage,
      output;
    console.log("missing elements:" + missingElements.length);
    while (missingElements.length > 5) {
      // Recategorize elements if missingElements has more than 5 elements
      input = generateInputForSelection(
        missingElements.map((index) => selectedTitleArray[index])
      );
      let categoriesString =
        " if possible, allocate them into categories of:\n{\n";
      categoriesString += Object.entries(responseObject)
        .map(([key, value]) => `  "${key}": [index]`)
        .join(",\n");
      categoriesString += "\n}";
      input += categoriesString;
      console.log("input: " + input);

      const newResponseObject = await fetchAndParseResponse(input, 30);
      console.log("re category: " + newResponseObject);
      for (const category in newResponseObject) {
        let newCategoriedIndex = newResponseObject[category];
        newCategoriedIndex = newCategoriedIndex.filter(
          (index) => index >= 0 && index < missingElements.length
        );
        // Map newCategoriedIndex back to original selectedTitleArray index
        newCategoriedIndex = newCategoriedIndex.map(
          (index) => missingElements[index]
        );
        if (responseObject[category]) {
          // If the category already exists, append the new indexes to it
          responseObject[category].push(...newCategoriedIndex);
        } else {
          // If the category does not exist, create it
          responseObject[category] = newCategoriedIndex;
        }
      }

      for (const category in responseObject) {
        let indexA = responseObject[category];
        Array.prototype.push.apply(categoriedIndex, indexA);
      }
      // Find missing elements in the new array
      missingElements = [];
      for (let i = 0; i < selectedTitleArray.length; i++) {
        if (!categoriedIndex.includes(i)) {
          missingElements.push(i);
        }
      }
    }

    for (const category in responseObject) {
      let indexA = responseObject[category];
      categoryAuthorNamesArray = indexA.map(
        (index) => selectedAuthorNamesArray[index]
      );
      categoryTitleArray = indexA.map((index) => selectedTitleArray[index]);
      categoryArxivUrlArray = indexA.map(
        (index) => selectedArxivUrlArray[index]
      );
      categoryAbstractArray = indexA.map(
        (index) => selectedAbstractArray[index]
      );
      categoryCommentArray = indexA.map((index) => selectedCommentArray[index]);
      summaries = await generateSummaries(
        isWeekend,
        categoryTitleArray,
        categoryAbstractArray
      );
      main_msg = formatMainMsg(category, categoryTitleArray);
      mainMessage = await sendMessage(main_msg);
      let oo = 0
      for (let i = 0; i < categoryTitleArray.length; i++) {
        // Extract figure from pdf
        await downloadPDF(categoryArxivUrlArray[i], `/${oo}.pdf`)
        let output = formatOutput(
          i,
          categoryTitleArray[i],
          categoryAuthorNamesArray[i],
          summaries[i],
          categoryArxivUrlArray[i],
          categories[i],
          categoryCommentArray[i]
        );
        await sendThreadReply(mainMessage.channel, output, mainMessage.ts);
      }
    }
  }
  let cat = "";
  cat = categories.join(", ");
  let end_msg =
    `Categories fetched: [${cat}]` +
    "\n" +
    "===============================" +
    formatDate(new Date()) +
    "===============================";
  await sendMessage(end_msg);
}

main().catch((error) => console.error(error));
