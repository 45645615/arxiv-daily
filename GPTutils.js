const axios = require("axios");
const { OPENAI_API_KEY, CATEGORIES_GROUPT_PREFIX, WEEKENDSELECTION_PREFIX, SELECTION_PREFIX} = require('./template');
const {parseJsonFromResponse} = require('./utils');

// Generate input string for selection by concatenating titles from the given title array
function generateInputForSelection(titleArray) {
    let input = "";
    let cnt = 0;
  
    for (let i = 0; i < titleArray.length; i++) {
      input += `\n ${cnt}. ${titleArray[i]} \n`;
      cnt += 1;
    }
  
    return input;
  }

async function callChatGPT(messages, maxRetries = 100, backoffSeconds = 2) {
const url = "https://api.openai.com/v1/chat/completions";

const headers = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
};

const data = {
    model: "gpt-3.5-turbo",
    messages,
};
// Retry logic for API requests
for (let i = 0; i < maxRetries; i++) {
    try {
    const response = await axios.post(url, data, { headers });

    if (response.status === 200) {
        return response.data;
    } else {
        console.log(
        `Request failed with status ${response.status} and message: ${response.statusText}`
        );
    }
    } catch (error) {
    console.log(`Request failed with error: ${error}`);
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, backoffSeconds * 1000));
    backoffSeconds *= 2;
}

throw new Error(`Request failed after ${maxRetries} retries.`);
}

// Limit the token count of an array of strings (titles) by randomly removing elements until the total token count is less than or equal to the specified maximum
function randomTokenLimit(titleArray, maxTokens = 4000) {
    function formatInput(array) {
      let input = "";
      for (let i = 0; i < array.length; i++) {
        input += `\n ${i}. ${array[i]} \n`;
      }
      return input;
    }
  
    const input = formatInput(titleArray);
    const totalTokens = input.length;
  
    if (totalTokens <= maxTokens) {
      return { newArray: titleArray, removedIndices: [] };
    }
  
    let newArray = [...titleArray];
    let removedIndices = [];
  
    while (formatInput(newArray).length > maxTokens) {
      const randomIndex = Math.floor(Math.random() * newArray.length);
      removedIndices.push(titleArray.indexOf(newArray[randomIndex]));
      newArray.splice(randomIndex, 1);
    }
  
    return { newArray, removedIndices };
  }

async function fetchAndParseResponse(input, MAX_RETRIES) {
  let attempts = 0;
  let responseObject = null;

  while (attempts < MAX_RETRIES) {
    try {
      const res2 = await callChatGPT([
        {
          role: "user",
          content: CATEGORIES_GROUPT_PREFIX + "\n" + input,
        },
      ]);
      const paragraphs2 = res2.choices.map((c) => c.message.content.trim());
      console.log(paragraphs2[0]);
      responseObject = parseJsonFromResponse(paragraphs2[0]);
      break;
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error);
      attempts++;
    }
  }

  if (!responseObject) {
    console.error("All attempts failed, could not fetch and parse the response");
  }

  return responseObject;
}

async function fetchSelectedPaperIndices(isWeekend, titleArray, MAX_RETRIES) {
  let attempts = 0;
  let indexArray = null;

  while (attempts < MAX_RETRIES) {
    try {
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
      indexArray = paragraphs[0].match(/\d+/g).map(Number);
      break;
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error);
      attempts++;
    }
  }

  if (!indexArray) {
    console.error("All attempts failed, could not fetch selected paper indices");
  }

  return indexArray;
}

module.exports = {
    generateInputForSelection,
    callChatGPT,
    randomTokenLimit,
    fetchAndParseResponse,
    fetchSelectedPaperIndices
  };