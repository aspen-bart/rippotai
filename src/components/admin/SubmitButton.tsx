"use client";

import { useFormStatus } from "react-dom";

/** Verzendknop met laadstatus en optionele bevestigingsvraag. */
export function SubmitButton({
  children,
  className = "btn-primary",
  confirm,
  pendingText,
  name,
  value,
  title,
  pending: pendingProp,
}: {
  children: React.ReactNode;
  className?: string;
  confirm?: string;
  pendingText?: string;
  name?: string;
  value?: string;
  title?: string;
  /** Laadstatus van buitenaf (bij formulieren met onSubmit i.p.v. action). */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button
      type="submit"
      name={name}
      value={value}
      title={title}
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
