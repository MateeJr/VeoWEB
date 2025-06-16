import React, { useEffect, useState } from 'react';

interface StreamingTextProps {
  /** Text being streamed from the API (may grow over time) */
  text: string;
  /** Whether the message is currently streaming. If false, the full text is shown immediately without replaying the animation. */
  isStreaming?: boolean;
}

/**
 * StreamingText reveals new words with a fade-in animation while a message is
 * still streaming. Once streaming stops (or for historical messages) the text
 * shows instantly, preventing the animation replay after a page reload.
 */
const StreamingText: React.FC<StreamingTextProps> = ({ text, isStreaming = false }) => {
  // Break the text into tokens while preserving whitespace.
  const tokens = React.useMemo(() => text.split(/(\s+)/), [text]);

  // When streaming, we progressively unveil tokens. Otherwise, show them all.
  const [visibleCount, setVisibleCount] = useState<number>(isStreaming ? 0 : tokens.length);

  // Keep visibleCount in sync with the incoming token length.
  useEffect(() => {
    if (!isStreaming) {
      // Show everything immediately for non-streaming messages.
      setVisibleCount(tokens.length);
      return;
    }

    // For streaming messages, reveal any newly added tokens right away so the
    // fade-in follows the real-time API output speed.
    if (tokens.length > visibleCount) {
      setVisibleCount(tokens.length);
    }
  }, [tokens.length, isStreaming, visibleCount]);

  // Render only the visible tokens.
  const content = tokens.slice(0, visibleCount).map((token, idx) => {
    if (token === '\n') return <br key={idx} />;
    const spanClass = isStreaming ? 'streaming-word' : undefined;
    return (
      <span key={idx} className={spanClass}>
        {token}
      </span>
    );
  });

  return <div className="whitespace-pre-wrap break-words leading-relaxed">{content}</div>;
};

export default StreamingText; 