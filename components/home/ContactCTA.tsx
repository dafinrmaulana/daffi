import { Section } from "@/components/layout/Section"
import { AnimatedReveal } from "@/components/shared/AnimatedReveal"
import { SectionTitle } from "@/components/shared/SectionTitle"

export function ContactCTA() {
  return (
    <Section id="contact" className="pb-24">
      <AnimatedReveal>
        <SectionTitle eyebrow="Contact" title="Available for frontend roles across web stacks, including mobile work with React Native." />
      </AnimatedReveal>
      <AnimatedReveal delay={0.06}>
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
      </AnimatedReveal>
    </Section>
  )
}
