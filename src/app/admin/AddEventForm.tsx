"use client";

import { useActionState } from "react";
import { createEventAction, type CreateEventState } from "@/app/actions/admin";
import { button, errorBox, input } from "@/app/components/ui";

const initialState: CreateEventState = { error: null };

export default function AddEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-2 rounded-[10px] border border-line bg-panel p-4 text-sm">
      <p className="text-xs font-semibold text-ink-dim uppercase">Add an event</p>
      {state.error && <p className={errorBox}>{state.error}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          name="title"
          required
          placeholder="Title"
          className={`${input} mt-0`}
        />
        <input
          name="event_date"
          type="date"
          className={`${input} mt-0`}
        />
        <input
          name="location"
          placeholder="Location"
          className={`${input} mt-0`}
        />
      </div>
      <textarea
        name="description"
        placeholder="Description"
        className={`${input} mt-0`}
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
