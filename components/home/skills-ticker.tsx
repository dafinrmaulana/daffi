import { skills } from "@/lib/constants/main-contents";

export function SkillsTicker() {
  return (
    <div className="overflow-hidden border-y border-border py-4">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center gap-8 pr-8">
            {skills.map((skill) => (
              <span key={`${group}-${skill}`} className="whitespace-nowrap font-mono text-sm uppercase text-muted">
                {skill}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
