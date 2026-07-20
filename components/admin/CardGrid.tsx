export function CardGrid({
  children,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  children: React.ReactNode
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  emptyAction?: React.ReactNode
}) {
  if (isEmpty) {
    return (
      <div className="flex min-h-72 flex-col items-start justify-end border border-border p-6 sm:p-8">
        <p className="font-serif text-4xl">{emptyTitle}</p>
        <p className="mt-3 max-w-md text-muted">{emptyDescription}</p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    )
  }

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}
