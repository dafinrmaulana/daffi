const skills = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Design Systems",
  "Performance",
  "MDX",
  "Product UI",
  "Accessibility",
]

export function SkillsTicker() {
  const items = [...skills, ...skills]

  return (
    <div className="overflow-hidden border-y border-border py-4">
      <div className="flex w-max animate-ticker gap-8 hover:[animation-play-state:paused]">
        {items.map((skill, index) => (
          <span key={`${skill}-${index}`} className="font-mono text-sm uppercase text-muted">
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}
