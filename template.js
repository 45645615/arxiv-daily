// place for prompts

const OPENAI_API_KEY = process.env.GPT_TOKEN;
const SLACK_TOKEN = process.env.SLACK_TOKEN;

const ARXIV_QUERY = ["cat:cs.cv", "cat:cs.AI", "cat:cs.LG", "cat:cs.CL"];
const SATARXIV_QUERY = ["cat:math.*", "cat:stat.*"];
const SUNARXIV_QUERY = ["cat:econ.*", "cat:q-fin.*"];

const MAX_PAPER_COUNT = 50;
const ARXIV_TERM = 1;

// const CHANNEL = '#daily-dose-of-arxiv'
const CHANNEL = '#arxiv-debug'

const SELECTION_PREFIX = `You are an expert in deep learning. Your PhD student studies on applying Deep Learning onto Computer Vision, Medical Imaging, and Surgical Vision.\
     Below is a list of paper title from arxiv.\
     Select ${MAX_PAPER_COUNT} most interesting paper that you think will inspire your student in thier research. Please provide the numbers corresponding to the papers you selected, separated by commas. For example: \"1, 5, 10, 15, 20, 25, 30, 35, 40, 45\"`;

const PROMPT_PREFIX = `You are an expert in deep learning. Summarize the following \
 paper for a PhD student working on medical imaging. \
 Provide a sectence no more than 10 words discribing the main purpose of the paper in TLDR. \
 Provide 3-7 key bullet points with each no more than 20 words in Summary, also provide relevance score in the format of {x/10}, a brief reason for \
 the score, and 1-2 specific applications related to the audience's \
 research interest (e.g., diagnostics, treatment planning, medical imaging). \
 Keep it simple and concise, you can replace words with vocabulary easier to \
 understand when necessary. For example: 

 TLDR:
- This paper introduces a new approach to regularize deep neural networks using phantom embeddings.

 Summary:
- Deep neural networks tend to memorize training data, leading to poor performance on test data.
- Existing regularization techniques such as L1, L2, and dropout have limitations and require hyperparameter tuning.
- This paper proposes using phantom embeddings from a subset of homogenous samples to reduce inter-class similarity in the latent embedding space.
- The resulting models generalize better and require less hyperparameter tuning.
- The method is evaluated on CIFAR and FashionMNIST datasets, outperforming standard baselines.

Relevance score: 8/10. Regularization is a fundamental technique in deep learning and is particularly relevant to medical imaging applications, where overfitting can lead to misdiagnosis or inaccurate treatment planning. The paper's proposed approach could potentially improve the accuracy of deep learning models in medical imaging.

Applications:
- Improving the accuracy of deep learning models for medical image classification and segmentation.
- Improving the performance of deep learning models for medical image registration and reconstruction.`;

const WEEKENDSELECTION_PREFIX = "You are an expert in deep learning.\
     Below is a list of paper title from topics of Mathematics, Statistics and Economics. \
     Select 5 most interesting paper that you think will inspire your student in thier research. Please provide the numbers corresponding to the papers you selected, separated by commas. For example: \"1, 5, 10, 15, 20, 25, 30, 35, 40, 45\"";

const WEEKENDPROMPT_PREFIX = `You are an expert in deep learning and Mathematics. \
Your audience is a PhD student working on deep learning.\
 Please provide a sectence no more than 10 words discribing the main purpose of the paper in TLDR.
 Please summarize the following Mathematics paper in a way that is accessible for someone \
 without a Mathematics PhD by providing 3-7 key bullet points in Summary, each no more than 20 words, you can replace words with vocabulary easier to \
 understand when necessary.\
  Suggest possible implementations of this paper for the student's research\
  interests in deep learning in Applications. For example:

  TLDR:
- This paper proposes a method for testing independence between graphs in social network analysis and neuroscience.

  Summary:
- The paper studies independence testing for inhomogeneous Erdős-Rényi random graphs on the same vertex set.
- The authors formulate a notion of pairwise correlations between the edges of these graphs and derive a necessary condition for their detectability.
- The authors show that there can be a statistical vs. computational tradeoff for detecting correlations in these graphs.
- The paper proposes an asymptotically valid and consistent test procedure for correlation testing when the graphs are sampled from a latent space model (graphon).

Applications:
- The proposed method could be useful in social network analysis and neuroscience to test for independence between graphs.
- Understanding the statistical vs. computational tradeoff could be relevant for developing more efficient algorithms for graph analysis.
- The study of latent space models could have implications for modeling certain types of data in deep learning, such as generating synthetic data for training neural networks.`

CATEGORIES_GROUPT_PREFIX = `Below are title of deep learning paper from arxiv, group them into categories based on their similarity, in format of {category name: paper number}, you can use different category name than example. For example:
{
  "Agriculture & Remote Sensing": [0],
  "Bias & Fairness": [1, 43],
  "Self-supervised Learning": [2, 6, 16, 29],
  "Image Segmentation & Parsing": [3, 8, 22, 33, 35, 36, 40, 44],
  "Medical Imaging": [9, 10, 21, 28, 32, 34, 42],
  "Control & Robotics": [5, 11],
  "Image Generation & Manipulation": [12, 14, 17, 19, 26, 31, 37, 41],
  "Vision & Recognition": [7, 13, 18, 23, 27, 38, 39],
  "Information Extraction & Retrieval": [24, 30, 49, 50],
  "Adversarial Learning & Explainability": [4, 15, 20, 25, 45, 46, 47, 48]
  }:`


module.exports = {
    OPENAI_API_KEY,
    SLACK_TOKEN,
    ARXIV_QUERY,
    SATARXIV_QUERY,
    SUNARXIV_QUERY ,
    MAX_PAPER_COUNT,
    ARXIV_TERM,
    CHANNEL,
    SELECTION_PREFIX,
    PROMPT_PREFIX,
    WEEKENDSELECTION_PREFIX,
    WEEKENDPROMPT_PREFIX,
    CATEGORIES_GROUPT_PREFIX
  };