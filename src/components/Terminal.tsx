import { useEffect, useRef, useState } from 'react';

interface Props {
  title: string;
  greeting: string;
  unknown: string;
  commands: Record<string, string[]>;
}

type Entry = { cmd?: string; lines: string[] };

export default function Terminal({ title, greeting, unknown, commands }: Props) {
  const [history, setHistory] = useState<Entry[]>([{ lines: [greeting, ...commands.help] }]);
  const [value, setValue] = useState('');
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight });
  }, [history]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === 'clear') return setHistory([]);
    setHistory((h) => [...h, { cmd: raw.trim(), lines: commands[cmd] ?? [unknown.replace('{cmd}', raw.trim())] }]);
  };

  return (
    <div
      className="w-full max-w-md cursor-text overflow-hidden rounded-base border border-line bg-raised/60 font-mono text-sm"
      onClick={() => input.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2 text-muted">
        <span>{title}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="block size-2 rounded-full bg-line" />
          <i className="block size-2 rounded-full bg-line" />
          <i className="block size-2 rounded-full bg-line" />
        </span>
      </div>
      <div ref={body} className="h-64 overflow-y-auto px-3 py-3" aria-live="polite">
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.cmd && (
              <p>
                <span className="text-accent-text">$ </span>
                {entry.cmd}
              </p>
            )}
            {entry.lines.map((line, j) => (
              <p key={j} className="text-muted">{line}</p>
            ))}
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue('');
          }}
          className="flex items-center"
        >
          <span className="text-accent-text">$&nbsp;</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label={title}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{ outline: 'none' }}
            className="w-full bg-transparent text-base text-fg caret-accent sm:text-sm"
          />
        </form>
      </div>
    </div>
  );
}
