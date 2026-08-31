import type { Metadata } from "next";
import JobForm from "@/components/JobForm";
import { createJobAction } from "@/lib/actions";

export const metadata: Metadata = { title: "Add New Job", robots: { index: false, follow: false } };

export default function NewJobPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink-900">Add New Job</h1>
        <p className="text-sm text-ink-700/70 mt-1">
          Fill in the details below — checkboxes control eligibility filtering automatically.
        </p>
      </div>
      <JobForm action={createJobAction} submitLabel="Publish Job" />
    </div>
  );
}
