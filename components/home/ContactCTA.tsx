import { Section } from "@/components/layout/Section"

export function ContactCTA() {
  return (
    <Section id="contact" className="pb-24">
      <div className="border-t border-border pt-5">
        <p className="font-mono text-xs uppercase text-muted">## Contact</p>
        <a
          href="mailto:hello@dafi.dev"
          className="mt-8 block break-words font-serif text-[clamp(3rem,11vw,9rem)] leading-none hover:text-muted"
        >
          hello@dafi.dev
        </a>
        <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted">
          <a href="https://github.com/dafinrmaulana" target="_blank" rel="noreferrer" className="hover:text-fg">GitHub</a>
          <a href="https://linkedin.com/in/dafinrmaulana" target="_blank" rel="noreferrer" className="hover:text-fg">LinkedIn</a>
          <a href="https://instagram.com/dafinrmaulana" target="_blank" rel="noreferrer" className="hover:text-fg">Instagram</a>
        </div>
      </div>
    </Section>
  )
}
