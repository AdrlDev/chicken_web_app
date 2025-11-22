"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useTheme } from "@/components/themes/ThemeContext";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}: DropdownProps) {
  const { theme } = useTheme();
  const bg = theme === "dark" ? "bg-gray-700" : "bg-white";
  const text = theme === "dark" ? "text-gray-200" : "text-gray-800";
  const hoverBg = theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100";
  const border = theme === "dark" ? "border-gray-600" : "border-gray-300";

  return (
    <Menu as="div" className="relative inline-block w-full text-left">
      <MenuButton
        className={`flex w-full justify-between items-center gap-2 rounded-lg border ${border} ${bg} ${text} px-4 py-3 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200`}
      >
        {value || placeholder}
        <ChevronDownIcon className="h-6 w-6 text-gray-400" />
      </MenuButton>

      <MenuItems
        className={`absolute right-0 z-20 mt-2 w-full origin-top-right rounded-lg ${bg} shadow-lg ring-1 ring-black/5 focus:outline-none max-h-60 overflow-y-auto`}
      >
        <div className="py-1">
          {options.map((option) => (
            <MenuItem key={option}>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => onChange(option)}
                  className={`block w-full text-left px-4 py-3 text-base rounded-lg font-medium transition-colors duration-150 ${
                    active ? `${hoverBg} text-white` : text
                  }`}
                >
                  {option}
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
