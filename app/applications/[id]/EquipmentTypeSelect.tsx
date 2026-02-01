"use client";

import ReactSelect from "react-select";

export type EquipmentOption = { value: string; label: string };

type EquipmentTypeSelectProps = {
  label: string;
  options: EquipmentOption[];
  value: string;
  disabled?: boolean;
  className?: string;
};

export function EquipmentTypeSelect({
  label,
  options,
  value,
  disabled = false,
  className,
}: EquipmentTypeSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value) ?? null;

  return (
    <div className={className ? `w-full ${className}` : "w-full"}>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <ReactSelect<EquipmentOption>
        options={options}
        value={selectedOption}
        isDisabled={disabled}
        isClearable={false}
        menuPortalTarget={typeof document === "undefined" ? null : document.body}
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 50 }),
          control: (base) => ({
            ...base,
            minWidth: "100%",
            border: "1px solid var(--border-color)",
            borderRadius: "0.5rem",
          }),
        }}
        classNamePrefix="react-select"
        className="w-full"
        classNames={{
          control: () =>
            "min-h-9 w-full rounded-lg border border-border bg-transparent text-sm text-foreground",
          singleValue: () => "text-foreground",
          menu: () => "rounded-lg border border-border bg-background shadow-lg",
          option: (state) =>
            state.isFocused
              ? "bg-muted/70 text-foreground"
              : "bg-transparent text-foreground",
        }}
      />
    </div>
  );
}
