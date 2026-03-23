"use client";

export default function HistoryTab() {
  return (
    <div className="p-8 bg-zinc-50 min-h-[calc(100vh-72px)]">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-zinc-200 p-10">
        <h2 className="text-2xl font-semibold text-zinc-800 mb-2">
          History
        </h2>
        <p className="text-sm text-zinc-600">
        previously uploaded/tagged content.
        </p>
      </div>
    </div>
  );
}
