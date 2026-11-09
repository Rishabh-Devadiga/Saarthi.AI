type MentorSuggestionsProps = {
  disabled: boolean;
  onSelect: (suggestion: string) => void;
  suggestions: string[];
};

export function MentorSuggestions({
  disabled,
  onSelect,
  suggestions,
}: MentorSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="ml-12 flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          className="rounded-full border border-rule-2 bg-paper px-3 py-1.5 text-left text-xs text-ink-2 transition-colors hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
