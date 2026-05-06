import { Section } from "@/components/layout/Section"

export function ContactCTA() {
  return (
    <Section id="contact" className="pb-24">
      <div className="border-t border-border pt-5">
        <p className="font-mono text-xs uppercase text-muted">## Contact</p>
        <a
          href="mailto:hello@daffi.dev"
          className="mt-8 block break-words font-serif text-[clamp(3rem,11vw,9rem)] leading-none hover:text-muted"
        >
          hello@daffi.dev
        </a>
        <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted">
          <a href="https://github.com" className="hover:text-fg">GitHub</a>
          <a href="https://linkedin.com" className="hover:text-fg">LinkedIn</a>
          <a href="https://x.com" className="hover:text-fg">X / Twitter</a>
        </div>
      </div>
    </Section>
  )
}
