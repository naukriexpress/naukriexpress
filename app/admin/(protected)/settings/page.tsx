import type { Metadata } from "next";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Change Admin Password",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Change Password</h1>
        <p className="mt-1 text-sm text-ink-700/70">
          Update your admin password. You will need to sign in again after it changes.
        </p>
      </div>

      <section className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl" aria-hidden="true">
            🔐
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink-900">Admin account security</h2>
            <p className="mt-1 text-sm text-ink-700/70">
              Your current password is required before a new one can be saved.
            </p>
          </div>
        </div>

        <ChangePasswordForm />
      </section>
    </div>
  );
}
