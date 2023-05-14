const axios = require("axios");
const { WebClient } = require("@slack/web-api");
const { callChatGPT } = require("./GPTutils");
const {
  WEEKENDPROMPT_PREFIX,
  PROMPT_PREFIX,
  SLACK_TOKEN,
  CHANNEL,
} = require("./template");
const web = new WebClient(SLACK_TOKEN);

function formatMainMsg(category, categoryTitleArray) {
  let output = "\n\n{ " + category + " }\n\n";

  // Iterate through the summaries and append each paper's information to the output
  for (let i = 0; i < categoryTitleArray.length; i++) {
    output += `${i + 1}: ${categoryTitleArray[i]}\n`;
  }
  return output.trim();
}

function formatOutput(
  titleArray,
  authorNamesArray,
  summaries,
  arxivUrlArray,
  categories,
  categoryCommentArray
) {
  let output = "";

  // Iterate through the summaries and append each paper's information to the output
  for (let i = 0; i < titleArray.length; i++) {
    output += `Paper ${i + 1}\nTitle: ${titleArray[i]}\nAuthors: ${
      authorNamesArray[i]
    }`;
    if (categoryCommentArray[i]) {
      output += `\nComment: ${categoryCommentArray[i]}`;
    }
    output += `\n\n${summaries[i]}\n\n${arxivUrlArray[i]}\n------------------------\n\n\n`;
  }
  return output.trim();
}

// Generate summaries for the selected papers using the GPT model
async function generateSummaries(
  isWeekend,
  selectedTitleArray,
  selectedAbstractArray
) {
  let summaries = [];

  // Iterate through the selected papers and generate a summary for each
  for (let i = 0; i < selectedTitleArray.length; i++) {
    const input = `\n title: ${selectedTitleArray[i]}\n summary: ${selectedAbstractArray[i]}`;
    const res = await callChatGPT([
      {
        role: "user",
        content:
          (isWeekend ? WEEKENDPROMPT_PREFIX : PROMPT_PREFIX) + "\n" + input,
      },
    ]);
    console.log(res);
    const paragraphs = res.choices.map((c) => c.message.content.trim());
    summaries.push(paragraphs[0]);
  }

  return summaries;
}

async function sendSlack(body) {
  const url = "https://slack.com/api/chat.postMessage";

  const options = {
    method: "post",
    headers: {
      authorization: `Bearer ${SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: {
      channel: CHANNEL,
      unfurl_links: false,
      unfurl_media: false,
      text: body,
    },
    url,
  };

  const res = await axios(options);
  console.log("Done", res.data);
}

// Split a string into chunks of a specified size
function splitIntoChunks(str, chunkSize) {
  var chunks = [];
  var length = str.length;
  for (var i = 0; i < length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks;
}

// Check if the message needs to be split into chunks and send to Slack
async function checkAndSendToSlack(str) {
  if (str.length > 35000) {
    var chunks = splitIntoChunks(str, 35000);
    for (var i = 0; i < chunks.length; i++) {
      await sendSlack(chunks[i]);
    }
  } else {
    await sendSlack(str);
  }
}

async function sendMessage(text) {
  try {
    const result = await web.chat.postMessage({
      channel: CHANNEL,
      text: text,
      unfurl_links: false,
      unfurl_media: false,
    });

    return { ts: result.ts, channel: result.channel };
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function sendThreadReply(channel, text, thread_ts) {
  async function sendSlack(text) {
    try {
      await web.chat.postMessage({
        channel: channel,
        text: text,
        thread_ts: thread_ts,
        unfurl_links: false,
        unfurl_media: false,
      });
    } catch (error) {
      console.error("Error sending threaded reply:", error);
    }
  }

  if (text.length > 35000) {
    const chunks = splitIntoChunks(text, 35000);
    for (let i = 0; i < chunks.length; i++) {
      await sendSlack(chunks[i]);
    }
  } else {
    await sendSlack(text);
  }
}
module.exports = {
  formatMainMsg,
  formatOutput,
  generateSummaries,
  checkAndSendToSlack,
  sendMessage,
  sendThreadReply,
};
