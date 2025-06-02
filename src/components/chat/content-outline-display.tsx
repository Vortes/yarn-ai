"use client";

import React, { useState } from "react";

export interface ContentOutline {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface ContentOutlineDisplayProps {
  outline: ContentOutline;
  onEdit: (editedOutline: ContentOutline) => void;
  onExport: (format: "pdf" | "txt" | "md") => void;
}

export function ContentOutlineDisplay({
  outline,
  onEdit,
  onExport,
}: ContentOutlineDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editOutline, setEditOutline] = useState<ContentOutline>(outline);

  // Keep local edit state in sync if outline changes
  React.useEffect(() => {
    setEditOutline(outline);
  }, [outline]);

  // Export logic
  const handleExport = (format: "pdf" | "txt" | "md") => {
    if (format === "pdf") {
      // Placeholder: just call onExport
      onExport("pdf");
      return;
    }
    let content = `# ${outline.title}\n\n`;
    outline.sections.forEach((section) => {
      content += `## ${section.heading}\n${section.content}\n\n`;
    });
    const blob = new Blob([content], {
      type: format === "md" ? "text/markdown" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      outline.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + `.${format}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    onExport(format);
  };

  // Editing logic
  const handleSectionChange = (
    idx: number,
    field: "heading" | "content",
    value: string,
  ) => {
    setEditOutline((prev) => {
      const sections = prev.sections.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s,
      );
      return { ...prev, sections };
    });
  };

  const handleTitleChange = (value: string) => {
    setEditOutline((prev) => ({ ...prev, title: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    onEdit(editOutline);
  };

  const handleCancel = () => {
    setEditOutline(outline);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <input
            className="border-b bg-transparent text-lg font-bold focus:outline-none"
            value={editOutline.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        ) : (
          <h2 className="text-lg font-bold">{outline.title}</h2>
        )}
        <div className="flex gap-2">
          <button
            className="text-xs underline"
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </button>
          <button
            className="text-xs underline"
            onClick={() => handleExport("txt")}
          >
            Export TXT
          </button>
          <button
            className="text-xs underline"
            onClick={() => handleExport("md")}
          >
            Export MD
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {(isEditing ? editOutline.sections : outline.sections).map(
          (section, idx) => (
            <div key={idx} className="space-y-1">
              {isEditing ? (
                <>
                  <input
                    className="w-full border-b bg-transparent font-medium focus:outline-none"
                    value={section.heading}
                    onChange={(e) =>
                      handleSectionChange(idx, "heading", e.target.value)
                    }
                  />
                  <textarea
                    className="mt-1 min-h-[40px] w-full rounded border p-1"
                    value={section.content}
                    onChange={(e) =>
                      handleSectionChange(idx, "content", e.target.value)
                    }
                  />
                </>
              ) : (
                <>
                  <h3 className="font-medium">{section.heading}</h3>
                  <p>{section.content}</p>
                </>
              )}
            </div>
          ),
        )}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        {isEditing ? (
          <>
            <button className="text-xs underline" onClick={handleSave}>
              Save
            </button>
            <button className="text-xs underline" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <button
            className="text-xs underline"
            onClick={() => setIsEditing(true)}
          >
            Edit Outline
          </button>
        )}
      </div>
    </div>
  );
}
