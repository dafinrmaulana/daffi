type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function EmptyContent({ description, title, action }: Props) {
  return (
    <div className="flex min-h-72 flex-col items-start justify-end border border-border p-6 sm:p-8 w-full">
      <p className="font-serif text-4xl">{title}</p>
      <p className="mt-3 max-w-md text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
