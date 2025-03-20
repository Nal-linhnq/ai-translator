import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-sm md:prose-lg lg:prose-xl break-words max-w-full">
      <ReactMarkdown
        remarkPlugins={[remarkBreaks, remarkGfm, remarkEmoji]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              className="text-blue-600 underline break-all hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.children}
            </a>
          ),
          ul: ({ ...props }) => <ul className="list-disc pl-5" {...props} />, // Unordered List
          ol: ({ ...props }) => <ol className="list-decimal pl-5" {...props} />, // Ordered List
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-gray-400 pl-4 italic break-words"
              {...props}
            />
          ),
          code({ children, ...props }) {
            return (
              <code
                className="bg-gray-50   text-red-500 px-1 py-1 rounded text-sm  whitespace-break-spaces break-words"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
