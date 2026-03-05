import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface MarkdownProps {
  content: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function MarkdownRenderer({ content }: MarkdownProps) {
  return (
    <div className="prose-custom text-slate-200 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            const isBlock = match || code.includes('\n');

            if (isBlock) {
              return (
                <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700">
                  {match && (
                    <div className="flex items-center justify-between bg-slate-800 px-4 py-1.5 border-b border-slate-700">
                      <span className="text-xs text-slate-400 font-mono">{match[1]}</span>
                      <CopyButton code={code} />
                    </div>
                  )}
                  {!match && (
                    <div className="absolute top-2 right-2">
                      <CopyButton code={code} />
                    </div>
                  )}
                  <SyntaxHighlighter
                    style={vscDarkPlus as Record<string, React.CSSProperties>}
                    language={match?.[1] ?? 'text'}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      background: 'transparent',
                      fontSize: '0.78rem',
                      padding: '1rem',
                    }}
                    codeTagProps={{ style: { fontFamily: 'inherit' } }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code
                className="bg-slate-700/60 text-violet-300 rounded px-1.5 py-0.5 text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }: { children?: ReactNode }) {
            return <p className="mb-3 last:mb-0">{children}</p>;
          },
          ul({ children }: { children?: ReactNode }) {
            return <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>;
          },
          ol({ children }: { children?: ReactNode }) {
            return <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>;
          },
          li({ children }: { children?: ReactNode }) {
            return <li className="text-slate-200">{children}</li>;
          },
          h1({ children }: { children?: ReactNode }) {
            return <h1 className="text-xl font-bold text-white mb-2 mt-4">{children}</h1>;
          },
          h2({ children }: { children?: ReactNode }) {
            return <h2 className="text-lg font-bold text-white mb-2 mt-4">{children}</h2>;
          },
          h3({ children }: { children?: ReactNode }) {
            return <h3 className="text-base font-bold text-white mb-2 mt-3">{children}</h3>;
          },
          blockquote({ children }: { children?: ReactNode }) {
            return (
              <blockquote className="border-l-4 border-violet-500 pl-4 italic my-3 text-slate-400">
                {children}
              </blockquote>
            );
          },
          table({ children }: { children?: ReactNode }) {
            return (
              <div className="overflow-x-auto my-3">
                <table className="w-full border-collapse text-sm">{children}</table>
              </div>
            );
          },
          th({ children }: { children?: ReactNode }) {
            return (
              <th className="border border-slate-600 bg-slate-700/60 px-3 py-2 text-left font-semibold text-white">
                {children}
              </th>
            );
          },
          td({ children }: { children?: ReactNode }) {
            return (
              <td className="border border-slate-600 px-3 py-2 text-slate-300">
                {children}
              </td>
            );
          },
          a({ children, href }: { children?: ReactNode; href?: string }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline"
              >
                {children}
              </a>
            );
          },
          strong({ children }: { children?: ReactNode }) {
            return <strong className="font-semibold text-white">{children}</strong>;
          },
          hr() {
            return <hr className="border-slate-700 my-4" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
