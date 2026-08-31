import { ReactNode } from 'react';

/**
 * One question as a heading, with its answer under it.
 *
 * A heading rather than a sentence inside a paragraph, because a question people
 * actually type is the unit that gets retrieved: Google reports "Is there anything
 * better than When2meet?" and "Which is better, Doodle or When2meet?" as related
 * questions on the queries these pages target, and the page that answers one under its
 * own heading is the page that can be quoted answering it. Rallly's page - the first
 * source Google's AI Overview cites for "when2meet alternative" - is six question
 * headings and little else.
 *
 * Visible, in the served bytes, and the same text a person reads. Nothing here is for
 * a crawler alone; hiding it would be cloaking, and an accordion would only make it
 * harder to extract for no reader's benefit.
 */
export const QuestionAnswer = ({
  question,
  children,
}: {
  question: string;
  children: ReactNode;
}) => (
  <div>
    <h3 className="text-lg font-display font-semibold mb-1">{question}</h3>
    <div className="space-y-3 leading-relaxed">{children}</div>
  </div>
);
