export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-2">
      <p className="text-sm font-black uppercase text-coral">{eyebrow}</p>
      <h1 className="text-3xl font-black leading-tight text-ink md:text-4xl">{title}</h1>
      <p className="text-base leading-7 text-ink/68">{description}</p>
    </div>
  );
}
