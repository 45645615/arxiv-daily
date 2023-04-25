const axios = require("axios");
const { OPENAI_API_KEY} = require('./template');

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

  

module.exports = {
    generateInputForSelection,
    callChatGPT,
    randomTokenLimit
  };