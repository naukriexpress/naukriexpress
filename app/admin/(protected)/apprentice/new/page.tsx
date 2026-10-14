import ApprenticePostForm from "@/components/ApprenticePostForm";

export const metadata = {
  title: "Add Apprentice",
  robots: { index: false, follow: false },
};

export default function AddApprenticePage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Add Apprentice
        </h1>
        <p className="mt-1 text-sm text-ink-700/70">
          Create an apprentice recruitment post with trade-wise vacancies.
        </p>
      </div>
      <ApprenticePostForm />
    </div>
  );
}
