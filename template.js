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

const SELECTION_PREFIX = `You are an expert in deep learning. Your PhD student is working on applying Deep Learning to Computer Vision, Medical Imaging, and Multimodal learning. Below is a list of paper titles from arXiv.
     Select the ${MAX_PAPER_COUNT} most interesting papers that you think will inspire your student in their research. Please provide the numbers corresponding to the papers you selected, separated by commas. For example: \"Title index, Title index, Title index, Title index, Title index, Title index, Title index, Title index, Title index, Title index\"`;

const PROMPT_PREFIX = `You are an expert in deep learning. Summarize the following paper for a PhD student working on medical imaging.
 Provide a sentence, no more than 10 words, describing the main purpose of the paper in TLDR. 
 Provide 3-4 key bullet points, with each no more than 20 words, in Summary. 
 Also, provide a relevance score in the format of <x/10>, a brief reason for the score, and 1-2 specific applications related to the PhD student's research interest (e.g., diagnostics, treatment planning, medical imaging).
 Keep it simple and concise. Replace words with easier-to-understand vocabulary when necessary.
 For example: 

 TLDR:
- Enhanced skin lesion segmentation using edge-body fusion.

 Summary:
- Separate branches for edge and body segmentation.
- Local cross-attention fusion (LCAF) module for feature fusion.
- Prior-guided multi-scale fusion (PGMF) module for integration.

Relevance score: 8/10 
Reason: Novel fusion techniques for accurate skin lesion segmentation.

Applications:
- Improved skin cancer diagnosis in medical imaging.
- Enhanced treatment planning based on precise lesion boundaries.`;

const WEEKENDSELECTION_PREFIX = `You are an expert in deep learning. Below is a list of paper titles from the topics of Mathematics, Statistics, Economics, and Q-Fin.
Select the 10 most interesting papers that you think will inspire your student in their research. Please provide the numbers corresponding to the papers you selected, separated by commas. For example: \"Title index, Title index, Title index, Title index, Title index, Title index, Title index, Title index, Title index, Title index"`;

const WEEKENDPROMPT_PREFIX = `You are an expert in deep learning and Mathematics. Your audience is a PhD student working on deep learning. 
 Please provide a TLDR sentence (no more than 10 words) describing the main purpose of the paper in TLDR.
 Please summarize the following Mathematics paper in a way that is accessible for someone with an undergraduate Mathematics background by providing 3-4 key bullet points in the Summary section. 
 Each bullet point should be no more than 20 words, and you may replace words with easier vocabulary when necessary.
 Suggest possible implementations of this paper for the student's research interests in deep learning in the Applications section. For example:

  TLDR:
- Analyzing hyperbolic surfaces' moduli spaces and mapping class group cohomology.

  Summary:
- Investigates moduli space Mg of hyperbolic surfaces.
- Focuses on surfaces with "enough" short geodesics.
- Discovers locus as classifying space of handlebody mapping class group.
- Top weight cohomology of Mg maps injectively to cohomology of handlebody mapping class group.

Applications:
- Use findings to improve topological data analysis for deep learning architectures.
- Enhance generative models by incorporating hyperbolic geometry and moduli spaces.
- Develop novel optimization algorithms inspired by handlebody mapping class groups.`

CATEGORIES_GROUPT_PREFIX = `You are an expert in deep learning. Below are the titles of deep learning papers from the arXiv. Group them into categories based on their similarity, using the format {category name: paper number}. You can use different category names than the example. If possible, avoid groups with only a single element. For example:
{
  "Medical Imaging": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices],
  "Category Name": [Title indices]
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