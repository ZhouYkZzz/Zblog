export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "red" | "gold" }) {
  const toneClass = {
    neutral: "border-line bg-white text-ink/70",
    green: "border-pine/20 bg-pine/10 text-pine",
    red: "border-coral/20 bg-coral/10 text-coral",
    gold: "border-gold/25 bg-gold/10 text-gold"
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-[8px] border px-2.5 py-1 text-xs font-bold ${toneClass}`}>
      {children}
    </span>
  );
}
