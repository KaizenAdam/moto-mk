"use client";

import { useActionState } from "react";
import { createEventAction, type CreateEventState } from "@/app/actions/admin";
import { button, errorBox } from "@/app/components/ui";

const initialState: CreateEventState = { error: null };

export default function AddEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-2 rounded-[10px] border border-line bg-panel p-4 text-sm">
      {state.error && <p className={errorBox}>{state.error}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          name="title"
          required
          placeholder="Title"
          className="rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink outline-none placeholder:text-[#6f6f76] focus:border-gold"
        />
        <input
          name="event_date"
          type="date"
          className="rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink outline-none placeholder:text-[#6f6f76] focus:border-gold"
        />
        <input
          name="location"
          placeholder="Location"
          className="rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink outline-none placeholder:text-[#6f6f76] focus:border-gold"
        />
      </div>
      <textarea
        name="description"
        placeholder="Description"
        className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink outline-none placeholder:text-[#6f6f76] focus:border-gold"
      />
      <button
        type="submit"
        disabled={pending}
        className={button("primary", "sm")}
      >
        {pending ? "Adding…" : "Add event"}
      </button>
    </form>
  );
}
