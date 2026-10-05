"use client";

import { startTransition, useActionState, useRef, type FormEvent } from "react";
import { createServiceCentreAction, type CreateEventState } from "@/app/actions/admin";

const initialState: CreateEventState = { error: null };
const input =
  "rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white outline-none focus:border-amber-400";

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
    <form ref={form} onSubmit={submit} className="mt-4 space-y-2 rounded border border-zinc-800 bg-zinc-950 p-4 text-sm">
      <p className="text-xs font-semibold text-zinc-400 uppercase">Add a service centre</p>
      {state.error && <p className="rounded bg-red-950 px-2 py-1 text-xs text-red-400">{state.error}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input name="name" required placeholder="Name *" className={input} />
        <input name="town" required placeholder="Town *" className={input} />
        <input name="address" placeholder="Street address" className={input} />
        <input name="phone" type="tel" placeholder="Phone" className={input} />
        <input name="website" type="url" placeholder="Website (https://…)" className={input} />
        <input name="source_url" type="url" placeholder="Where these details came from" className={input} />
      </div>
      <input name="specialties" placeholder="Specialties, e.g. Official Honda service, tyres" className={`${input} w-full`} />
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input name="verified" type="checkbox" /> Confirmed by phone or visit
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add service centre"}
      </button>
    </form>
  );
}
