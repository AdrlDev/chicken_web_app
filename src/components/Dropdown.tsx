import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

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
  return (
    <Menu as="div" className="relative inline-block w-full text-left">
      <MenuButton className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-gray-800 inset-ring-1 inset-ring-gray/5 hover:bg-white/20">
        {value || placeholder}
        <ChevronDownIcon
          aria-hidden="true"
          className="ml-2 h-5 w-5 text-gray-400"
        />
      </MenuButton>

      <MenuItems className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="py-1">
          {options.map((option) => (
            <MenuItem key={option}>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => onChange(option)}
                  className={`${
                    active
                      ? "bg-white/10 text-white"
                      : "text-gray-300"
                  } block w-full text-left px-4 py-2 text-sm`}
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
