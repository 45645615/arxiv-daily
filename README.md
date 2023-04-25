# README

## Arxiv Paper Bot

This repository contains the Dockerfile for building an Arxiv Paper Bot that fetches relevant papers from Arxiv and posts them to a specified Slack channel using the GPT-3.5-turbo model from OpenAI.

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/arxiv-paper-bot.git
cd arxiv-paper-bot
```

2. Set your OpenAI API key (GPT_TOKEN) and Slack API key (SLACK_TOKEN) as environment variables:

```
export GPT_TOKEN=your_openai_api_key
export SLACK_TOKEN=your_slack_api_key
```

3. Build the Docker image:

```
docker build --build-arg GPT_TOKEN=$GPT_TOKEN --build-arg SLACK_TOKEN=$SLACK_TOKEN -t arxiv-paper-bot .
```

4. Run the Docker container:

```
docker run -it --rm arxiv-paper-bot
```

The Arxiv Paper Bot will now fetch relevant papers from Arxiv and post them to the specified Slack channel.





### License

This project is licensed under the MIT License.
