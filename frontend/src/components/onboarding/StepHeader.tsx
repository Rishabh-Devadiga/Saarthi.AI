type StepHeaderProps = {
  description: string;
  title: string;
};

export function StepHeader({ description, title }: StepHeaderProps) {
  return (
    <header>
      <h1 className="text-2xl sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-lg text-ink-2">{description}</p>
    </header>
  );
}
