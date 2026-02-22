"use client";

import { useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import { Input } from "../ui/input";

interface MultiSelectProps {
  placeholder: string;
  collections: CollectionType[];
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  placeholder,
  collections,
  value,
  onChange,
  onRemove,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => collections.filter((collection) => value.includes(collection._id)),
    [collections, value]
  );

  const selectables = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    return collections.filter(
      (collection) =>
        !value.includes(collection._id) &&
        (!q || collection.title.toLowerCase().includes(q))
    );
  }, [collections, inputValue, value]);

  return (
    <div className="relative">
      <div className="flex gap-1 flex-wrap border rounded-md p-1">
        {selected.map((collection) => (
          <Badge key={collection._id}>
            {collection.title}
            <button
              type="button"
              className="ml-1 hover:text-red-1"
              onClick={() => onRemove(collection._id)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // delay allows option click to run before closing list
            window.setTimeout(() => setOpen(false), 100);
          }}
          className="border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {open && selectables.length > 0 && (
        <div className="absolute z-30 mt-2 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-md">
          {selectables.map((collection) => (
            <button
              key={collection._id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(collection._id);
                setInputValue("");
                setOpen(true);
              }}
            >
              {collection.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
