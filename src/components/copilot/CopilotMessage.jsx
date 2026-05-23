/**
 * CopilotMessage — single message bubble for Civic Copilot chat
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Bot, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function ToolCallChip({ toolCall }) {
  const status = toolCall?.status || 'pending';
  const name = (toolCall?.name || '').split('.').pop() || 'tool';
  const running = status === 'running' || status === 'in_progress' || status === 'pending';
  const error = status === 'failed' || status === 'error';
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {running && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
      {!running && !error && <CheckCircle2 className="w-3 h-3 text-green-400" />}
      {error && <AlertCircle className="w-3 h-3 text-destructive" />}
      <span className="text-slate-400">{name}</span>
    </div>
  );
}

export default function CopilotMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 glow-blue">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        {message.content && (
          <div className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? 'bg-primary text-white'
              : 'bg-white/[0.04] border border-white/8 text-slate-100'
          }`}>
            {isUser ? (
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-200">{children}</li>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{children}</a>,
                  code: ({ children }) => <code className="px-1 py-0.5 rounded bg-white/10 text-accent text-[11px]">{children}</code>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {message.tool_calls?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.tool_calls.map((tc, i) => <ToolCallChip key={i} toolCall={tc} />)}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </motion.div>
  );
}