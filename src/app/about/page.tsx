import { SectionHeading } from "@/components/section-heading";
import { Tag } from "@/components/tag";

const timeline = [
  {
    phase: "研一",
    text: "课程、论文阅读、方向探索、基础工程项目和组会表达。"
  },
  {
    phase: "研二",
    text: "确定课题、完成实验主线、争取论文投稿和开源项目沉淀。"
  },
  {
    phase: "研三",
    text: "毕业论文、作品集、实习求职或继续深造准备。"
  }
];

export default function AboutPage() {
  return (
    <main className="page-shell space-y-10 pt-10">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="About"
            title="面向计算机技术研究生阶段的长期主页"
            description="这里记录公开文章、研究方向、项目实践和论文阅读路线，也为之后的开题、投稿、实习和毕业论文保留上下文。"
          />
          <div className="flex flex-wrap gap-2">
            <Tag tone="green">杭州电子科技大学</Tag>
            <Tag tone="red">计算机技术</Tag>
            <Tag tone="gold">AI 应用 / RAG / Agent</Tag>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1100&q=80"
          alt=""
          className="h-[360px] w-full rounded-[8px] object-cover"
        />
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {timeline.map((item) => (
          <div key={item.phase} className="card p-6">
            <p className="text-sm font-black text-coral">{item.phase}</p>
            <p className="mt-3 text-sm leading-7 text-ink/72">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="card p-7">
        <h2 className="text-2xl font-black text-ink">研究方向地图</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-5">
          {["LLM 应用", "RAG", "向量数据库", "Rerank", "Evaluation"].map((item) => (
            <div key={item} className="rounded-[8px] border border-line bg-white p-4 text-center text-sm font-black text-ink/76">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
