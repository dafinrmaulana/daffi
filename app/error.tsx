"use client";

import { useEffect } from "react";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section>
      <div className="border border-border p-8 sm:p-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Something went wrong
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-none sm:text-6xl">
          This page could not be loaded.
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-muted">
          The content may be temporarily unavailable. Try loading it again.
        </p>
        <Button className="mt-7" type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </Section>
  );
}
