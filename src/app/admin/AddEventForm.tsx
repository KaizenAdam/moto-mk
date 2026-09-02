"use client";

import { useActionState } from "react";
import { createEventAction, type CreateEventState } from "@/app/actions/admin";

const initialState: CreateEventState = { error: null };

export default function AddEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-2 rounded border border-zinc-800 bg-zinc-950 p-4 text-sm">
      {state.error && <p className="rounded bg-red-950 px-2 py-1 text-xs text-red-400">{state.error}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          name="title"
          required
          placeholder="Title"
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white outline-none focus:border-amber-400"
        />
        <input
          name="event_date"
          type="date"
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white outline-none focus:border-amber-400"
        />
        <input
          name="location"
          placeholder="Location"
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white outline-none focus:border-amber-400"
        />
      </div>
      <textarea
        name="description"
        placeholder="Description"
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-white outline-none focus:border-amber-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add event"}
      </button>
    </form>
  );
}
