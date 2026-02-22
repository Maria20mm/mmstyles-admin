"use client";

import { useState } from "react";

import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

import { X } from "lucide-react";

interface MultiTextProps {
  placeholder: string;
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

const MultiText: React.FC<MultiTextProps> = ({
  placeholder,
  value,
  onChange,
  onRemove,
}) => {
  const [inputValue, setInputValue] = useState("");

  const addValues = (raw: string) => {
    const items = raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length === 0) {
      setInputValue("");
      return;
    }

    for (const item of items) {
      if (!value.includes(item)) {
        onChange(item);
      }
    }
    setInputValue("");
  };

  return (
    <>
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addValues(inputValue);
          }
          if (e.key === ",") {
            e.preventDefault();
            addValues(inputValue);
          }
        }}
        onBlur={() => addValues(inputValue)}
      />

      <div className="flex gap-1 flex-wrap mt-4">
        {value.map((item, index) => (
          <Badge key={index} className="bg-black text-white">
            {item}
            <button
              className="ml-1 rounded-full outline-none hover:bg-black"
              onClick={() => onRemove(item)}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </>
  );
};

export default MultiText;
