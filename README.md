# ZBlog

面向研究生阶段的个人博客与研究信息工作台，聚焦 AI 应用、RAG、Agent、向量数据库和多模态方向。

## 功能

- 首页：个人研究方向、近期文章、重点论文、技术项目。
- 博客：文章列表、分类、标签和详情页。
- 论文库：结构化论文笔记与分类筛选。
- 信息雷达：arXiv 论文与 GitHub 项目聚合，接口失败时自动回退本地数据。
- 工作台：文章管理、论文收藏、订阅源和组会草稿入口。
- 网页编辑：在 `/dashboard/blogs` 新增、编辑、删除博客，在 `/dashboard/meeting` 编辑本周组会草稿。
- 论文管理：在 `/papers` 收藏/取消收藏论文，在 `/dashboard/papers` 管理论文偏好。
- 论文笔记：在 `/papers` 或 `/dashboard/papers` 编辑论文笔记，也可以配置 OpenAI API 生成初稿。
- 首页管理：在 `/dashboard/home` 修改首页右侧三块提示内容。

## 开发

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

打开 `http://localhost:3000`。

## API

- `GET /api/blog`
- `POST /api/blog`
- `PATCH /api/blog/[slug]`
- `DELETE /api/blog/[slug]`
- `GET /api/weekly-draft`
- `PUT /api/weekly-draft`
- `GET /api/papers/library`
- `POST /api/papers/library`
- `PATCH /api/papers/library/[id]`
- `PUT /api/papers/library/[id]/note`
- `POST /api/papers/summarize`
- `GET /api/paper-preferences`
- `PUT /api/paper-preferences`
- `GET /api/home-focus`
- `PUT /api/home-focus`
- `GET /api/papers/arxiv`
- `GET /api/trends/github`
- `GET /api/radar/summary`

## 本地内容

- 博客文章保存在 `data/blog-posts.json`
- 本周组会草稿保存在 `data/weekly-draft.json`
- 论文收藏保存在 `data/papers.json`
- 论文偏好保存在 `data/paper-preferences.json`
- 首页三块内容保存在 `data/home-focus.json`

## AI 论文总结

复制 `.env.example` 为 `.env` 后，填入 OpenAI API Key：

```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4.1-mini"
```

没有配置 `OPENAI_API_KEY` 时，页面会提示无法调用 OpenAI API，并提供一个本地初稿占位，方便继续手动编辑。

## 数据库

默认使用 Prisma + SQLite。开发环境执行：

```bash
npm run prisma:push
```

如果当前机器的 Prisma schema engine 在 `db push` 阶段异常退出，可以使用已生成的初始化 SQL：

```bash
sqlite3 prisma/dev.db ".read prisma/migrations/20260413000000_init/migration.sql"
```
