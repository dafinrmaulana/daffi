import { Section } from "@/components/layout/section"
import { SectionTitle } from "@/components/shared/section-title"

export function ContactCTA() {
  return (
    <Section id="contact" className="pb-24">
      <SectionTitle eyebrow="Contact" title="Available for frontend roles across web stacks, including mobile work with React Native." />
      <div>
        <a
          href="mailto:dafinmaulana18@gmail.com"
          className="mt-8 block break-words font-serif text-[clamp(3rem,11vw,9rem)] leading-none hover:text-muted"
        >
          Get In Touch
        </a>
        <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted">
          <a href="https://github.com/dafinrmaulana" target="_blank" rel="noreferrer" className="hover:text-fg">GitHub</a>
          <a href="https://www.linkedin.com/in/dafinmaulana/" target="_blank" rel="noreferrer" className="hover:text-fg">LinkedIn</a>
          <a href="https://instagram.com/dafi.nrm" target="_blank" rel="noreferrer" className="hover:text-fg">Instagram</a>
        </div>
      </div>
    </Section>
  )
}
