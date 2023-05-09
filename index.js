const { getDateRange, getCategories, fetchPapers, deduplicateArrayWithIndices, extractScores, sortStringArrayByScore, removeElementsByIndices, formatDate} = require('./utils');
const { generateInputForSelection, callChatGPT, randomTokenLimit, fetchAndParseResponse, fetchSelectedPaperIndices} = require('./GPTutils');
const { formatMainMsg, formatOutput, generateSummaries, checkAndSendToSlack, sendMessage, sendThreadReply} = require('./slackUtils');
const { OPENAI_API_KEY, SLACK_TOKEN, MAX_PAPER_COUNT, WEEKENDSELECTION_PREFIX, SELECTION_PREFIX, CATEGORIES_GROUPT_PREFIX} = require('./template');

async function main() {
  if (!OPENAI_API_KEY | !SLACK_TOKEN) {
    console.log("No API keys");
    return;
  }

  let output = "";
  const dayOfWeek = new Date().getDay();

  // Check if it's a weekend
  let isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  let dateRange = getDateRange(isWeekend, dayOfWeek);
  let categories = getCategories(dayOfWeek);

  // Fetch papers based on the date range and categories  
  let { titleArray, authorNamesArray, arxivUrlArray, abstractArray, commentArray } = await fetchPapers(dateRange, categories);
  
  // Deduplicate the fetched papers
  const dedupResult = deduplicateArrayWithIndices(arxivUrlArray);
  arxivUrlArray = dedupResult.deduplicatedArray;
  titleArray = removeElementsByIndices(titleArray, dedupResult.duplicatedIndices);
  authorNamesArray = removeElementsByIndices(authorNamesArray, dedupResult.duplicatedIndices);
  abstractArray = removeElementsByIndices(abstractArray, dedupResult.duplicatedIndices);
  commentArray = removeElementsByIndices(commentArray, dedupResult.duplicatedIndices);

  // Limit the number of tokens
  const tokenLimitResult = randomTokenLimit(titleArray, 16500);
  titleArray = removeElementsByIndices(titleArray, tokenLimitResult.removedIndices);
  authorNamesArray = removeElementsByIndices(authorNamesArray, tokenLimitResult.removedIndices);
  abstractArray = removeElementsByIndices(abstractArray, tokenLimitResult.removedIndices);
  arxivUrlArray = removeElementsByIndices(arxivUrlArray, tokenLimitResult.removedIndices);
  commentArray = removeElementsByIndices(commentArray, tokenLimitResult.removedIndices);

  // Generate input for chatGPT based selection
  const indexArray = await fetchSelectedPaperIndices(isWeekend, titleArray, 30);

  let selectedAuthorNamesArray = indexArray.map(index => authorNamesArray[index]);
  let selectedTitleArray = indexArray.map(index => titleArray[index]);
  let selectedArxivUrlArray = indexArray.map(index => arxivUrlArray[index]);
  let selectedAbstractArray = indexArray.map(index => abstractArray[index]);
  let selectedCommentArray = indexArray.map(index => commentArray[index]);

  await sendMessage("==============================="+formatDate((new Date()))+"===============================\n\n");

  if (isWeekend){
    let summaries = await generateSummaries(isWeekend, selectedTitleArray, selectedAbstractArray);
    category_msg = dayOfWeek === 6 ? "Maths and Stats" : "Economics and Q-Fin"
    let main_msg = formatMainMsg(category_msg, selectedTitleArray)
    const mainMessage = await sendMessage(main_msg);
    let output = formatOutput( selectedTitleArray, selectedAuthorNamesArray, summaries, selectedArxivUrlArray, categories, selectedCommentArray);
    await sendThreadReply(mainMessage.channel, output, mainMessage.ts);
  }
  else {
    // Put title into different categories
    console.log(selectedTitleArray);
    input = generateInputForSelection(selectedTitleArray);
    const responseObject = await fetchAndParseResponse(input, 30);
    console.log(responseObject);
    categoriedIndex = [];
    for (const category in responseObject) {
      let indexA = responseObject[category];
      indexA = indexA.filter(index => index >= 0 && index < selectedAuthorNamesArray.length)
      Array.prototype.push.apply(categoriedIndex, indexA);
      let categoryAuthorNamesArray = indexA.map(index => selectedAuthorNamesArray[index]);
      let categoryTitleArray = indexA.map(index => selectedTitleArray[index]);
      let categoryArxivUrlArray = indexA.map(index => selectedArxivUrlArray[index]);
      let categoryAbstractArray = indexA.map(index => selectedAbstractArray[index]);
      let categoryCommentArray = indexA.map(index => selectedCommentArray[index]);
      
      // Generate summaries for the selected papers
      let summaries = await generateSummaries(isWeekend, categoryTitleArray, categoryAbstractArray);
      let main_msg = formatMainMsg(category, categoryTitleArray)
      const mainMessage = await sendMessage(main_msg);
      let output = formatOutput( categoryTitleArray, categoryAuthorNamesArray, summaries, categoryArxivUrlArray, categories, categoryCommentArray);
      await sendThreadReply(mainMessage.channel, output, mainMessage.ts);
    }
    // Find missing elements in the new array
    const missingElements = [];
    for (let i = 0; i < selectedTitleArray.length; i++) {
      if (!categoriedIndex.includes(i)) {
        missingElements.push(i);
      }
    }
    if (missingElements.length > 0){
      const category = "Miscellaneous"
      let categoryAuthorNamesArray = missingElements.map(index => selectedAuthorNamesArray[index]);
      let categoryTitleArray = missingElements.map(index => selectedTitleArray[index]);
      let categoryArxivUrlArray = missingElements.map(index => selectedArxivUrlArray[index]);
      let categoryAbstractArray = missingElements.map(index => selectedAbstractArray[index]);
      let categoryCommentArray = missingElements.map(index => selectedCommentArray[index]);
      let summaries = await generateSummaries(isWeekend, categoryTitleArray, categoryAbstractArray);
      let main_msg = formatMainMsg(category, categoryTitleArray)
      const mainMessage = await sendMessage(main_msg);
      let output = formatOutput( categoryTitleArray, categoryAuthorNamesArray, summaries, categoryArxivUrlArray, categories, categoryCommentArray);
      await sendThreadReply(mainMessage.channel, output, mainMessage.ts);
    }

  }
  let cat = '';
  cat = categories.join(', ');
  let end_msg = `Categories fetched: [${cat}]` + "\n" + "==============================="+ formatDate(new Date())+"===============================";
  await sendMessage(end_msg);

}

main().catch(error => console.error(error));

