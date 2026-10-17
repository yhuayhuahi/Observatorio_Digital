import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessageUI, ChatCitation } from '../types/dashboard';

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard?.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      margin: 'var(--space-2) 0',
      borderRadius: 'var(--md-shape-sm)',
      overflow: 'hidden',
      border: '1px solid var(--md-sys-color-outline-variant)',
      backgroundColor: 'var(--md-sys-color-surface-container-lowest)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 10px',
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--md-sys-color-on-surface-variant)'
      }}>
        <span>{language ? language.toUpperCase() : 'CÓDIGO TÉCNICO'}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            color: copied ? 'var(--color-status-success)' : 'var(--md-sys-color-primary)',
            padding: '2px 6px',
            borderRadius: 'var(--md-shape-xs)'
          }}
          aria-label="Copiar código al portapapeles"
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: 'var(--space-3)',
        overflowX: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        lineHeight: '1.5'
      }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export interface AuditChatWidgetProps {
  apiEndpoint?: string;
  initialContextEntityId?: number;
  initialEntityName?: string;
  preloadedPrompts?: string[];
}

export default function AuditChatWidget({
  apiEndpoint = '/api/v1/chat',
  initialContextEntityId,
  initialEntityName,
  preloadedPrompts
}: AuditChatWidgetProps) {
  const defaultPrompts = preloadedPrompts || [
    '¿Cuáles son los 5 portales con peor LCP y cómo optimizarlos?',
    '¿Qué entidades tienen observaciones de accesibilidad según la directiva 2025?',
    '¿Cómo solucionar violaciones de contraste de color en botones según WCAG 2.1 AA?',
    'Generar informe de cumplimiento de SLA para Gobiernos Regionales'
  ];

  const [messages, setMessages] = useState<ChatMessageUI[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: initialEntityName
        ? `Hola. Soy el **Auditor Asistente de Calidad Digital** con IA RAG. He cargado el contexto técnico de **${initialEntityName}**. Puedes hacerme consultas sobre su telemetría en vivo, cumplimiento de SLA (99.5%), accesibilidad WCAG 2.1 AA o directivas técnicas de referencia.`
        : 'Hola. Soy el **Auditor Asistente de Calidad Digital** impulsado por IA con RAG (Retrieval-Augmented Generation). Puedo ayudarte a analizar la telemetría de 90 portales supervisados, contrastar con el marco normativo de referencia (D.L. 1412, D.S. 029-2021-PCM, R.SGTD 001-2025) y sugerir remediaciones técnicas de código.',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      status: 'complete'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTool]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'assistant-' + Date.now();

    const newMessages: ChatMessageUI[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: query,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        status: 'complete'
      },
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        status: 'streaming'
      }
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setActiveTool(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          message: query,
          entityId: initialContextEntityId
        })
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No se recibió cuerpo de respuesta por streaming.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const rawData = trimmed.replace(/^data:\s*/, '');
            if (rawData === '[DONE]') {
              setIsLoading(false);
              setActiveTool(null);
              break;
            }

            try {
              const parsed = JSON.parse(rawData);

              if (parsed.type === 'tool_start') {
                setActiveTool(parsed.tool || 'Ejecutando herramienta...');
              } else if (parsed.type === 'tool_end') {
                setActiveTool(null);
              } else if (parsed.type === 'token' || parsed.delta) {
                accumulatedContent += (parsed.token || parsed.delta || '');
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                  ...m,
                  content: accumulatedContent,
                  citations: parsed.citations || m.citations
                } : m));
              } else if (parsed.type === 'error') {
                accumulatedContent += `\n⚠️ *${parsed.message || 'Error en el procesamiento'}*`;
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m));
              }
            } catch {
              // Plain text chunk fallback
              accumulatedContent += rawData;
              setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m));
            }
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, status: 'complete' } : m));
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        content: `Lo sentimos, ocurrió un problema al conectar con el motor RAG: ${err?.message || 'Error de red'}.\n\nPor favor verifique que el servicio de backend en \`apps/api\` esté activo.`,
        status: 'error'
      } : m));
    } finally {
      setIsLoading(false);
      setActiveTool(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div
      className="audit-chat-container m3-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        maxHeight: 'calc(100vh - 210px)',
        minHeight: '480px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      {/* Chat Header */}
      <div style={{
        padding: 'var(--space-3) var(--space-5)',
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isLoading ? 'var(--color-status-warning)' : 'var(--color-status-success)'
          }}></div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface)' }}>
              Auditor IA Normativo y Prescriptivo (RAG)
            </span>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Base de conocimiento: D.L. 1412, D.S. 029-2021-PCM, R.SGTD 001-2025, WCAG 2.1 AA
            </span>
          </div>
        </div>

        <span className="m3-chip m3-chip-info" style={{ fontSize: '10px' }}>
          Gemini Flash-Lite
        </span>
      </div>

      {/* Suggested Prompts Pills */}
      <div style={{
        padding: 'var(--space-2) var(--space-4)',
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        display: 'flex',
        gap: 'var(--space-2)',
        overflowX: 'auto',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        scrollbarWidth: 'thin'
      }}>
        {defaultPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            className="m3-btn m3-btn-tonal"
            style={{
              minHeight: '26px',
              padding: '2px 10px',
              fontSize: '11px',
              borderRadius: 'var(--md-shape-full)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
            disabled={isLoading}
            onClick={() => handleSend(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        className="chat-messages-area"
        role="log"
        aria-live="polite"
        style={{
          flex: '1 1 0%',
          overflowY: 'auto',
          minHeight: 0,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {isUser ? 'Tú (Evaluador / Ciudadano)' : 'Auditor Asistente IA'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--md-sys-color-outline)' }}>
                  {msg.timestamp}
                </span>
              </div>

              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  backgroundColor: isUser ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-high)',
                  color: isUser ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: '1.6',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  boxShadow: 'var(--md-sys-elevation-1)',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }: any) {
                      const isMultiLine = String(children).includes('\n') || (className && className.startsWith('language-'));
                      if (isMultiLine) {
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                      }
                      return (
                        <code
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85em',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'var(--md-sys-color-surface-container-highest)',
                            color: 'inherit'
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p style={{ margin: '0 0 var(--space-2) 0', lineHeight: '1.6', color: 'inherit' }}>{children}</p>;
                    },
                    ul({ children }) {
                      return <ul style={{ margin: '0 0 var(--space-2) var(--space-4)', paddingLeft: 'var(--space-2)', color: 'inherit' }}>{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol style={{ margin: '0 0 var(--space-2) var(--space-4)', paddingLeft: 'var(--space-2)', color: 'inherit' }}>{children}</ol>;
                    },
                    li({ children }) {
                      return <li style={{ marginBottom: '4px', color: 'inherit' }}>{children}</li>;
                    },
                    h1({ children }) {
                      return <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 'var(--space-3) 0 var(--space-2)', color: 'inherit' }}>{children}</h3>;
                    },
                    h2({ children }) {
                      return <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 'var(--space-2) 0 var(--space-1)', color: 'inherit' }}>{children}</h4>;
                    },
                    h3({ children }) {
                      return <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 'var(--space-2) 0 var(--space-1)', color: 'inherit' }}>{children}</h5>;
                    },
                    table({ children }) {
                      return (
                        <div style={{ overflowX: 'auto', margin: 'var(--space-2) 0', maxWidth: '100%' }}>
                          <table className="m3-table" style={{ fontSize: '12px' }}>{children}</table>
                        </div>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote style={{
                          borderLeft: '3px solid var(--md-sys-color-primary)',
                          paddingLeft: 'var(--space-3)',
                          margin: 'var(--space-2) 0',
                          fontStyle: 'italic',
                          color: isUser ? '#FFFFFF' : 'var(--md-sys-color-on-surface-variant)'
                        }}>
                          {children}
                        </blockquote>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: isUser ? '#FFFFFF' : 'var(--md-sys-color-primary)',
                            textDecoration: 'underline',
                            fontWeight: 600
                          }}
                        >
                          {children}
                        </a>
                      );
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>

                {/* Citations Badges if any */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      Fundamento Normativo Verificado:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {msg.citations.map((c, idx) => (
                        <span key={idx} className="m3-chip m3-chip-info" style={{ fontSize: '10px' }}>
                          📜 {c.fuente} {c.articulo ? `• ${c.articulo}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Active Tool Execution Indicator */}
        {activeTool && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--md-shape-full)',
            backgroundColor: 'var(--md-sys-color-tertiary-container)',
            color: 'var(--md-sys-color-on-tertiary-container)',
            fontSize: '11px',
            fontWeight: 600,
            alignSelf: 'flex-start'
          }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
            <span>{activeTool}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'flex-end',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <textarea
          ref={textareaRef}
          className="m3-textarea"
          rows={2}
          placeholder="Escriba su consulta técnica o jurídica sobre portales del Estado... (Enter para enviar)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="Mensaje para el Auditor Inteligente"
          style={{ resize: 'none', minHeight: '44px', maxHeight: '100px', flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }}
        />

        <button
          type="button"
          className="m3-btn m3-btn-primary"
          style={{ minHeight: '44px', padding: '0 20px', flexShrink: 0 }}
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          aria-label="Enviar mensaje al auditor"
        >
          {isLoading ? (
            <span>Analizando...</span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Consultar</span>
              <span>➤</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
