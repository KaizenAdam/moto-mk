"use client";

import { useState } from "react";
import { towns } from "@/lib/listings";
import ListingPhoto from "./ListingPhoto";
import PricePlate from "./PricePlate";
import { RidingStyle, Town } from "@/lib/types";

const STYLES: RidingStyle[] = [
  "Enduro",
  "Sport",
  "Cruiser",
  "Scooter",
  "Touring",
  "Naked",
  "Adventure",
];

const initialState = {
  make: "",
  model: "",
  year: "",
  price: "",
  cc: "",
  engineType: "4-stroke",
  licenseCategory: "A2",
  ridingStyle: "Naked" as RidingStyle,
  town: towns[0] ?? "Skopje",
  mileage: "",
  description: "",
  sellerName: "",
  phone: "",
};

export default function SellForm() {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-pine/30 bg-pine/5 p-8 text-center max-w-xl mx-auto">
        <p className="font-data uppercase tracking-widest text-pine text-xs mb-2">
          Draft saved
        </p>
        <h2 className="font-display uppercase text-2xl mb-3">
          Your listing preview is ready
        </h2>
        <p className="text-sm text-steel-dark mb-6">
          This prototype doesn&rsquo;t publish live listings yet — but here&rsquo;s
          exactly how {form.make || "your bike"} would appear to buyers on VoziMoto.
        </p>
        <div className="max-w-sm mx-auto text-left rounded-xl overflow-hidden border border-tarmac-line/20 bg-paper">
          <ListingPhoto ridingStyle={form.ridingStyle} make={form.make || "Your"} model={form.model || "Bike"} />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display uppercase text-lg leading-tight">
                  {form.make || "Make"} {form.model || "Model"}
                </h3>
                <p className="text-sm text-steel-dark">{form.year || "Year"} · {form.town}</p>
              </div>
              {form.price && <PricePlate priceEur={Number(form.price)} size="sm" />}
            </div>
          </div>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-tarmac underline underline-offset-4 hover:text-rally"
        >
          ← Edit listing
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
      <div className="space-y-8">
        <FormSection title="The bike">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Make" required>
              <input
                required
                value={form.make}
                onChange={(e) => update("make", e.target.value)}
                placeholder="e.g. Yamaha"
                className="form-input"
              />
            </Field>
            <Field label="Model" required>
              <input
                required
                value={form.model}
                onChange={(e) => update("model", e.target.value)}
                placeholder="e.g. MT-07"
                className="form-input"
              />
            </Field>
            <Field label="Year" required>
              <input
                required
                type="number"
                min={1970}
                max={2026}
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
                placeholder="2021"
                className="form-input"
              />
            </Field>
            <Field label="Engine size (cc)" required>
              <input
                required
                type="number"
                min={0}
                value={form.cc}
                onChange={(e) => update("cc", e.target.value)}
                placeholder="689"
                className="form-input"
              />
            </Field>
            <Field label="Engine type">
              <select
                value={form.engineType}
                onChange={(e) => update("engineType", e.target.value)}
                className="form-input"
              >
                <option value="4-stroke">4-stroke</option>
                <option value="2-stroke">2-stroke</option>
                <option value="electric">Electric</option>
              </select>
            </Field>
            <Field label="Licence category">
              <select
                value={form.licenseCategory}
                onChange={(e) => update("licenseCategory", e.target.value)}
                className="form-input"
              >
                <option value="AM">AM — moped</option>
                <option value="A1">A1 — up to 125cc</option>
                <option value="A2">A2 — up to 35kW</option>
                <option value="A">A — unrestricted</option>
              </select>
            </Field>
            <Field label="Riding style">
              <select
                value={form.ridingStyle}
                onChange={(e) => update("ridingStyle", e.target.value as RidingStyle)}
                className="form-input"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Mileage (km)">
              <input
                type="number"
                min={0}
                value={form.mileage}
                onChange={(e) => update("mileage", e.target.value)}
                placeholder="14200"
                className="form-input"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Price & location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Price (EUR)" required>
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="6300"
                className="form-input"
              />
            </Field>
            <Field label="Town">
              <select
                value={form.town}
                onChange={(e) => update("town", e.target.value as Town)}
                className="form-input"
              >
                {towns.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Photos">
          <div className="border-2 border-dashed border-steel/40 rounded-xl p-8 text-center">
            <p className="text-sm text-steel-dark">
              Drag photos here or <span className="text-rally underline">browse files</span>
            </p>
            <p className="text-xs text-steel mt-1">
              JPG or PNG, up to 10 photos — upload is disabled in this preview
            </p>
          </div>
        </FormSection>

        <FormSection title="Description">
          <Field label="Tell buyers about the bike">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              placeholder="Service history, modifications, condition, reason for sale..."
              className="form-input resize-none"
            />
          </Field>
        </FormSection>

        <FormSection title="Contact details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Your name" required>
              <input
                required
                value={form.sellerName}
                onChange={(e) => update("sellerName", e.target.value)}
                placeholder="Aleksandar P."
                className="form-input"
              />
            </Field>
            <Field label="Phone number" required>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+389 70 123 456"
                className="form-input"
              />
            </Field>
          </div>
        </FormSection>

        <button
          type="submit"
          className="w-full sm:w-auto rounded-md bg-rally text-paper font-display uppercase tracking-wide px-8 py-3.5 hover:bg-amber hover:text-tarmac transition-colors"
        >
          Preview my listing
        </button>
      </div>

      <aside className="lg:sticky lg:top-20 h-fit">
        <p className="text-xs font-data uppercase tracking-widest text-steel-dark mb-3">
          Live preview
        </p>
        <div className="rounded-xl overflow-hidden border border-tarmac-line/20 bg-paper">
          <ListingPhoto
            ridingStyle={form.ridingStyle}
            make={form.make || "Make"}
            model={form.model || "Model"}
          />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display uppercase text-lg leading-tight truncate">
                  {form.make || "Make"} {form.model || "Model"}
                </h3>
                <p className="text-sm text-steel-dark">
                  {form.year || "Year"} · {form.town}
                </p>
              </div>
              <PricePlate priceEur={Number(form.price) || 0} size="sm" />
            </div>
            <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-data text-steel-dark">
              <dd>{form.cc || "0"} cc</dd>
              <dd className="text-amber-dim">{form.licenseCategory}</dd>
              <dd>{form.mileage || "0"} km</dd>
            </dl>
          </div>
        </div>
      </aside>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display uppercase text-lg mb-4 pb-2 border-b border-tarmac-line/15">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-data uppercase tracking-wide text-steel-dark mb-1.5">
        {label} {required && <span className="text-rally">*</span>}
      </span>
      {children}
    </label>
  );
}
