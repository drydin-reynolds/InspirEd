"use client";

import { useState } from "react";

export default function HomeTab() {
  // not connected to the database yet
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  // TODO: replace with tags from your database when you connect auth/DB.
  const tagOptions = [
    "videos",
    "documents",
    "images",
    "medicine",
    "sickness",
    "surgery",
    
  ];

  const filteredTagOptions = tagOptions.filter((t) =>
    t.toLowerCase().includes(tagQuery.trim().toLowerCase())
  );

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="p-8 bg-zinc-50 min-h-[calc(100vh-72px)]">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-zinc-200 p-10">
        <div className="flex gap-10 items-start">
          <div className="flex-1">
            <div className="h-[450px] rounded-[30px] border-4 border-dashed border-zinc-400 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#EAF6F7] flex items-center justify-center">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#4AA3A9]"
                >
                  <path
                    d="M12 3l4 4h-3v5h-2V7H8l4-4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 14v6h14v-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="text-center text-zinc-600 text-sm leading-6">
                Drop your files here or{" "}
                <span className="text-zinc-800 font-medium hover:text-[#4AA3A9] ">Browse</span>
              </div>

              <input
                type="file"
                className="hidden"
                id="upload-file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFileName(f ? f.name : null);
                }}
              />

              <label
                htmlFor="upload-file"
                className="mt-1 inline-flex items-center justify-center px-6 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-sm cursor-pointer hover:bg-zinc-100"
              >
                {fileName ? `Selected: ${fileName}` : "Select file"}
              </label>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border-2 border-zinc-600/60 px-4 py-3 outline-none"
                  placeholder="Title"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Tags
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTagsOpen((v) => !v)}
                    className="w-full rounded-xl border-2 border-zinc-600/60 px-4 py-3 outline-none text-left bg-white"
                    aria-expanded={tagsOpen}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedTags.length === 0 ? (
                        <span className="text-zinc-500">Select tags</span>
                      ) : (
                        selectedTags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-2 rounded-full bg-[#EAF6F7] border border-[#4AA3A9]/30 px-3 py-1 text-sm text-zinc-800"
                          >
                            {t}
                            <button
                              type="button"
                              className="text-zinc-600 hover:text-zinc-900"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleTag(t);
                              }}
                              aria-label={`Remove ${t}`}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </button>

                  {tagsOpen ? (
                    <div className="absolute z-10 mt-2 w-full rounded-xl border border-zinc-200 bg-white shadow-md overflow-hidden">
                      <div className="p-3 border-b border-zinc-100">
                        <input
                          value={tagQuery}
                          onChange={(e) => setTagQuery(e.target.value)}
                          placeholder="Search tags..."
                          className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none"
                        />
                      </div>

                      <div className="max-h-56 overflow-auto p-2">
                        {filteredTagOptions.length === 0 ? (
                          <div className="px-2 py-3 text-sm text-zinc-500">
                            No matching tags.
                          </div>
                        ) : (
                          filteredTagOptions.map((t) => {
                            const checked = selectedTags.includes(t);
                            return (
                              <label
                                key={t}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleTag(t)}
                                />
                                <span className="text-sm text-zinc-800">
                                  {t}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>

                      <div className="p-3 border-t border-zinc-100 flex justify-end gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-full border border-zinc-300 text-sm hover:bg-zinc-50"
                          onClick={() => {
                            setTagsOpen(false);
                            setTagQuery("");
                          }}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border-2 border-zinc-600/60 px-4 py-3 outline-none min-h-[100px] resize-none"
                  placeholder="Description"
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  className="bg-[#4AA3A9] hover:bg-[#379f4c] transition-colors text-white font-semibold rounded-full px-16 py-3"
                >
                  Upload
                </button>
              </div>

              <div className="text-xs text-zinc-500">
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
