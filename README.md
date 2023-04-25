# README

## Arxiv Paper Bot

This repository contains the Dockerfile for building an Arxiv Paper Bot that fetches relevant papers from Arxiv and posts them to a specified Slack channel using the GPT-3.5-turbo model from OpenAI.

### Installation

1. Clone the repository:

```
git clone https://github.com/45645615/arxiv-daily.git
cd arxiv-daily
```

2. Set your OpenAI API key (GPT_TOKEN) and Slack API key (SLACK_TOKEN) as environment variables:

```
export GPT_TOKEN=your_openai_api_key
export SLACK_TOKEN=your_slack_api_key
```

3. Build the Docker image:

```
docker build --build-arg GPT_TOKEN=$GPT_TOKEN --build-arg SLACK_TOKEN=$SLACK_TOKEN -t arxiv-daily .
```

4. Run the Docker container:

```
docker run -it --rm arxiv-daily
```


## Credits
Part of the code is based the following gist:
(https://gist.github.com/resnant/d42ae67315f0c073e3c244a913f6d408) 
by [Yuta Suzuki](https://github.com/resnant)
### License

This project is licensed under the MIT License.
