"use client";

import { startTransition, useActionState } from "react";

type State = { error?: string; ok?: string };

/**
 * Server action via onSubmit i.p.v. <form action>, zodat React het formulier niet automatisch leegt
 * wanneer de actie een foutmelding teruggeeft (ingevulde waarden blijven staan).
 */
export function useAdminForm(fn: (prev: State, form: FormData) => Promise<State>) {
  const [state, action, pending] = useActionState(fn, {});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => action(fd));
  };
  return { state, pending, onSubmit };
}
