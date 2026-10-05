"use client";

import { startTransition, useActionState, useRef, type FormEvent } from "react";
import { createServiceCentreAction, type CreateEventState } from "@/app/actions/admin";
import { button, errorBox } from "@/app/components/ui";

const initialState: CreateEventState = { error: null };
const input =
  "rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink outline-none placeholder:text-[#6f6f76] focus:border-gold";

export default function AddServiceCentreForm() {
  const form = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: CreateEventState, data: FormData) => {
    const result = await createServiceCentreAction(prev, data);
    if (!result.error) form.current?.reset(); // only clear once it's actually saved
    return result;
  }, initialState);

  // Submit via a transition, not <form action>: React would reset the form
  // even when the server sends back a validation error.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form ref={form} onSubmit={submit} className="mt-4 space-y-2 rounded-[10px] border border-line bg-panel p-4 text-sm">
      <p className="text-xs font-semibold text-ink-dim uppercase">Add a service centre</p>
      {state.error && <p className={errorBox}>{state.error}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input name="name" required placeholder="Name *" className={input} />
        <input name="town" required placeholder="Town *" className={input} />
        <input name="address" placeholder="Street address" className={input} />
        <input name="phone" type="tel" placeholder="Phone" className={input} />
        <input name="website" type="url" placeholder="Website (https://…)" className={input} />
        <input name="source_url" type="url" placeholder="Where these details came from" className={input} />
      </div>
      <input name="specialties" placeholder="Specialties, e.g. Official Honda service, tyres" className={`${input} w-full`} />
      <label className="flex items-center gap-2 text-xs text-ink-dim">
        <input name="verified" type="checkbox" /> Confirmed by phone or visit
      </label>
      <button
        type="submit"
        disabled={pending}
        className={button("primary", "sm")}
      >
        {pending ? "Adding…" : "Add service centre"}
      </button>
    </form>
  );
}
