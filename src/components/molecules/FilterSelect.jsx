import { cn } from "@/utils/cn";
import Label from "@/components/atoms/Label";

const FilterSelect = ({ 
  label,
  options,
  value,
  onChange,
  placeholder = "Select option",
  className,
  ...props
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label>{label}</Label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;