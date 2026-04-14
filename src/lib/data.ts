import type { BlogPost, Paper, RadarSummary, TechProject } from "./types";

export const researchKeywords = [
  "RAG",
  "retrieval augmented generation",
  "LLM agent",
  "multi-modal",
  "vector database",
  "embedding",
  "rerank",
  "AI application"
];

export const paperCategories = [
  "RAG",
  "Agent",
  "Multimodal",
  "Vector DB",
  "Evaluation",
  "LLM Application"
];

export const blogCategories = [
  "读研记录",
  "论文笔记",
  "技术实践",
  "项目复盘",
  "课程与实验"
];

export const blogPosts: BlogPost[] = [
  {
    slug: "graduate-research-operating-system",
    title: "把读研生活整理成一个研究操作系统",
    summary:
      "从课程、组会、论文、实验和项目五条线开始，把每天接触的信息变成能复用的资产。",
    content:
      "读研不是把资料越攒越多，而是让资料在关键时刻能被重新调用。第一阶段先把论文、项目、课程任务和实验日志固定到同一套节奏里：每周读论文，每周复盘项目，每次组会沉淀一份可复用材料。",
    coverImage:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    category: "读研记录",
    tags: ["研究生", "知识管理", "组会"],
    featured: true,
    publishedAt: "2026-04-13",
    readingMinutes: 4
  },
  {
    slug: "rag-reading-route",
    title: "RAG 入门阅读路线：从检索到评估",
    summary:
      "围绕 query rewriting、hybrid search、rerank、context compression 和 evaluation 建立第一条阅读主线。",
    content:
      "RAG 不是把向量数据库接到大模型前面这么简单。真正值得跟踪的是检索质量、上下文组织、引用可信度、评估指标和线上反馈闭环。第一轮阅读可以从经典 RAG、ColBERT、Self-RAG、RAGAS 和 GraphRAG 开始。",
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    category: "论文笔记",
    tags: ["RAG", "LLM", "Evaluation"],
    featured: true,
    publishedAt: "2026-04-11",
    readingMinutes: 6
  },
  {
    slug: "first-agent-project-plan",
    title: "第一个 Agent 项目应该验证什么",
    summary:
      "不要一开始追求复杂框架，先验证工具调用、记忆、任务分解、失败恢复和评价方法。",
    content:
      "Agent 项目的关键不是把流程画得很酷，而是证明它能稳定完成任务。建议先做一个小型研究助手：输入关键词，抓取论文，生成候选阅读清单，并保留每一步失败原因。",
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    category: "技术实践",
    tags: ["Agent", "工程实践", "项目"],
    featured: false,
    publishedAt: "2026-04-08",
    readingMinutes: 5
  }
];

export const savedPapers: Paper[] = [
  {
    id: "rag-2020",
    externalId: "2005.11401",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    authors: ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus"],
    abstract:
      "将参数化生成模型与非参数化检索记忆结合，为开放域问答和知识密集型任务提供可更新的外部知识来源。",
    url: "https://arxiv.org/abs/2005.11401",
    pdfUrl: "https://arxiv.org/pdf/2005.11401",
    source: "arXiv",
    category: "RAG",
    tags: ["RAG", "retrieval", "generation"],
    year: 2020,
    publishedAt: "2020-05-22",
    isFavorite: true,
    note: {
      researchQuestion: "如何让生成模型使用可更新的外部知识，而不是完全依赖参数记忆？",
      method: "把检索器返回的文档作为生成器条件，比较不同 token 级与 sequence 级融合方式。",
      result: "知识密集型任务上优于单纯生成模型，并能通过替换文档库更新知识。",
      reproducibleCode: "可从 Hugging Face Transformers 和相关实现开始复现。",
      takeaway: "后续做 RAG 系统时，检索质量和生成约束必须一起评估。"
    }
  },
  {
    id: "react-2022",
    externalId: "2210.03629",
    title: "ReAct: Synergizing Reasoning and Acting in Language Models",
    authors: ["Shunyu Yao", "Jeffrey Zhao", "Dian Yu"],
    abstract:
      "让语言模型交替生成推理轨迹与行动步骤，使模型能够调用外部工具并在观察结果后继续推理。",
    url: "https://arxiv.org/abs/2210.03629",
    pdfUrl: "https://arxiv.org/pdf/2210.03629",
    source: "arXiv",
    category: "Agent",
    tags: ["Agent", "reasoning", "tool use"],
    year: 2022,
    publishedAt: "2022-10-06",
    isFavorite: true,
    note: {
      researchQuestion: "语言模型如何在复杂任务中同时推理和使用外部工具？",
      method: "用 Thought、Action、Observation 的轨迹组织任务执行过程。",
      result: "在问答和交互式任务中提升可解释性与成功率。",
      reproducibleCode: "可用搜索 API 或本地工具函数构造最小 ReAct 循环。",
      takeaway: "适合用作研究助手项目的第一套 Agent 执行范式。"
    }
  },
  {
    id: "self-rag-2023",
    externalId: "2310.11511",
    title: "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection",
    authors: ["Akari Asai", "Zexuan Zhong", "Danqi Chen"],
    abstract:
      "通过自反思 token 控制检索时机、生成内容和批判过程，让模型在需要时检索并判断答案质量。",
    url: "https://arxiv.org/abs/2310.11511",
    pdfUrl: "https://arxiv.org/pdf/2310.11511",
    source: "arXiv",
    category: "RAG",
    tags: ["Self-RAG", "reflection", "evaluation"],
    year: 2023,
    publishedAt: "2023-10-17",
    isFavorite: false,
    note: {
      researchQuestion: "RAG 系统是否应该每次都检索，还是由模型判断何时检索？",
      method: "引入反思标记，训练模型决定检索、生成和批判步骤。",
      result: "在事实性和开放域任务中减少无效检索并提升答案质量。",
      reproducibleCode: "优先复现推理流程，再考虑训练部分。",
      takeaway: "可以作为信息雷达摘要质量控制的后续方向。"
    }
  }
];

export const fallbackProjects: TechProject[] = [
  {
    id: "langchain-ai/langchain",
    name: "langchain",
    fullName: "langchain-ai/langchain",
    description: "Build context-aware reasoning applications with language models.",
    url: "https://github.com/langchain-ai/langchain",
    stars: 100000,
    language: "Python",
    topics: ["agent", "rag", "llm"],
    updatedAt: "2026-04-01T00:00:00Z",
    source: "GitHub"
  },
  {
    id: "run-llama/llama_index",
    name: "llama_index",
    fullName: "run-llama/llama_index",
    description: "Data framework for LLM applications and retrieval workflows.",
    url: "https://github.com/run-llama/llama_index",
    stars: 40000,
    language: "Python",
    topics: ["rag", "data", "llm"],
    updatedAt: "2026-04-01T00:00:00Z",
    source: "GitHub"
  },
  {
    id: "milvus-io/milvus",
    name: "milvus",
    fullName: "milvus-io/milvus",
    description: "Open-source vector database built for scalable similarity search.",
    url: "https://github.com/milvus-io/milvus",
    stars: 35000,
    language: "Go",
    topics: ["vector-database", "embedding", "search"],
    updatedAt: "2026-04-01T00:00:00Z",
    source: "GitHub"
  },
  {
    id: "explodinggradients/ragas",
    name: "ragas",
    fullName: "explodinggradients/ragas",
    description: "Evaluation framework for retrieval augmented generation pipelines.",
    url: "https://github.com/explodinggradients/ragas",
    stars: 8000,
    language: "Python",
    topics: ["evaluation", "rag", "metrics"],
    updatedAt: "2026-04-01T00:00:00Z",
    source: "GitHub"
  }
];

export const fallbackRadarSummary: RadarSummary = {
  generatedAt: new Date().toISOString(),
  papers: savedPapers,
  projects: fallbackProjects,
  signals: [
    "RAG 方向继续从“能检索”转向“可评估、可引用、可反馈”。",
    "Agent 项目更关注工具调用稳定性、观察结果处理和失败恢复。",
    "向量数据库和 rerank 模型适合作为研一阶段的工程实践入口。"
  ],
  hackerNews: [],
  sourceHealth: {
    arxiv: "fallback",
    github: "fallback",
    semanticScholar: "fallback",
    hackerNews: "fallback"
  }
};

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getFeaturedPosts() {
  return blogPosts.filter((post) => post.featured);
}

export function getFavoritePapers() {
  return savedPapers.filter((paper) => paper.isFavorite);
}
