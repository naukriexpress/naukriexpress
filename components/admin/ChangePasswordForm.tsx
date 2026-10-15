"use client";

import { useState, type FormEvent } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 12) {
      setError("Use a password with at least 12 characters.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error || "Could not change the password. Please try again.");
        return;
      }

      // The server invalidates this session after a successful password change.
      window.location.assign("/admin/login?passwordChanged=1");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-semibold text-ink-900">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-sm font-semibold text-ink-900">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500"
          aria-describedby="password-help"
        />
        <p id="password-help" className="mt-1.5 text-xs text-ink-700/65">
          Use at least 12 characters. Avoid reusing a password from another site.
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-ink-900">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2.5 text-sm focus:border-brand-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {saving ? "Changing password…" : "Change Password"}
      </button>
    </form>
  );
}
