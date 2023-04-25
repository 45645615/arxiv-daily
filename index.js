const { getDateRange, getCategories, fetchPapers, deduplicateArrayWithIndices, extractScores, sortStringArrayByScore, removeElementsByIndices} = require('./utils');
const { generateInputForSelection, callChatGPT, randomTokenLimit} = require('./GPTutils');
const { formatOutput, generateSummaries, checkAndSendToSlack} = require('./slackUtils');
const { OPENAI_API_KEY, SLACK_TOKEN, WEEKENDSELECTION_PREFIX, SELECTION_PREFIX} = require('./template');

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
  let { titleArray, authorNamesArray, arxivUrlArray, abstractArray } = await fetchPapers(dateRange, categories);

  // Deduplicate the fetched papers
  const dedupResult = deduplicateArrayWithIndices(arxivUrlArray);
  arxivUrlArray = dedupResult.deduplicatedArray;
  titleArray = removeElementsByIndices(titleArray, dedupResult.duplicatedIndices);
  authorNamesArray = removeElementsByIndices(authorNamesArray, dedupResult.duplicatedIndices);
  abstractArray = removeElementsByIndices(abstractArray, dedupResult.duplicatedIndices);

  // Limit the number of tokens
  const tokenLimitResult = randomTokenLimit(titleArray, 16500);
  titleArray = removeElementsByIndices(titleArray, tokenLimitResult.removedIndices);
  authorNamesArray = removeElementsByIndices(authorNamesArray, tokenLimitResult.removedIndices);
  abstractArray = removeElementsByIndices(abstractArray, tokenLimitResult.removedIndices);
  arxivUrlArray = removeElementsByIndices(arxivUrlArray, tokenLimitResult.removedIndices);

  // Generate input for chatGPT based selection
  let input = generateInputForSelection(titleArray);
  console.log(input);

  // Call the chatGPT API with the generated input to get selected paper list
  const res = await callChatGPT([
    {
      role: "user",
      content: isWeekend ? WEEKENDSELECTION_PREFIX + "\n" + input : SELECTION_PREFIX + "\n" + input,
    },
  ]);

  // Extract the selected paper indices from chatGPT API response
  const paragraphs = res.choices.map((c) => c.message.content.trim());
  const indexArray = paragraphs[0].match(/\d+/g).map(Number);
  console.log(paragraphs)
  let selectedAuthorNamesArray = indexArray.map(index => authorNamesArray[index]);
  let selectedTitleArray = indexArray.map(index => titleArray[index]);
  let selectedArxivUrlArray = indexArray.map(index => arxivUrlArray[index]);
  let selectedAbstractArray = indexArray.map(index => abstractArray[index]);

  // Generate summaries for the selected papers
  let summaries = await generateSummaries(isWeekend, selectedTitleArray, selectedAbstractArray);

  // If it's not a weekend, sort the summaries and other arrays by scores
  if (!isWeekend) {
    const scores = extractScores(summaries);
    summaries = sortStringArrayByScore(summaries, scores);
    selectedAuthorNamesArray = sortStringArrayByScore(selectedAuthorNamesArray, scores);
    selectedTitleArray = sortStringArrayByScore(selectedTitleArray, scores);
    selectedArxivUrlArray = sortStringArrayByScore(selectedArxivUrlArray, scores);
  }

  // Format output for slack message
  output += formatOutput( selectedTitleArray, selectedAuthorNamesArray, summaries, selectedArxivUrlArray, categories);
  output = output.trim();
  console.log(output);
  console.log(output.length);

  await checkAndSendToSlack(output);
}

main().catch(error => console.error(error));
