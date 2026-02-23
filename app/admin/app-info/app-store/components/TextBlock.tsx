export function TextBlock({
  title,
  value,
  maxLen = 200,
}: {
  title: string;
  value: string;
  maxLen?: number;
}) {
  const truncated =
    value.length > maxLen ? `${value.slice(0, maxLen)}... (총 ${value.length}자)` : value;
  return (
    <div className="space-y-1">
      <span className="text-muted-foreground text-sm">{title}</span>
      <p className="whitespace-pre-wrap break-words rounded border bg-muted/30 p-2 text-sm">
        {truncated || '(비어 있음)'}
      </p>
    </div>
  );
}
