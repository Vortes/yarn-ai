"use client";

import React from "react";

export interface ContentOutline {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface AIResponse {
  summary?: string;
  questions?: string[];
  outline?: ContentOutline;
}

export interface AIResponseRendererProps {
  response: AIResponse;
  onQuestionSelect?: (question: string) => void;
}

export function AIResponseRenderer({
  response,
  onQuestionSelect,
}: AIResponseRendererProps) {
  return (
    <div className="space-y-4">
      {response.summary && (
        <div className="bg-card rounded-lg p-4">
          <h3 className="mb-2 font-medium">Summary</h3>
          <p className="text-card-foreground">{response.summary}</p>
        </div>
      )}
      {response.questions && response.questions.length > 0 && (
        <div className="bg-card rounded-lg p-4">
          <h3 className="mb-2 font-medium">Questions</h3>
          <ol className="ml-5 list-decimal space-y-2">
            {response.questions.map((question, index) => (
              <li key={index} className="text-card-foreground">
                {onQuestionSelect ? (
                  <button
                    className="hover:text-primary underline"
                    onClick={() => onQuestionSelect(question)}
                  >
                    {question}
                  </button>
                ) : (
                  question
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      {response.outline && (
        <div className="bg-card rounded-lg p-4">
          <h3 className="mb-2 font-medium">{response.outline.title}</h3>
          <div className="space-y-3">
            {response.outline.sections.map((section, index) => (
              <div key={index}>
                <h4 className="font-medium">{section.heading}</h4>
                <p className="text-card-foreground">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
