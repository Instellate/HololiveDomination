import type { CheckedState } from '@radix-ui/react-checkbox';
import { Checkbox } from './ui/checkbox';

type FormCheckboxProps = {
  checked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  children: JSX.Element[] | JSX.Element | string;
  id: string;
};

export default function FormCheckbox({
  checked,
  onCheckedChange,
  children,
  id,
}: FormCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <label
        htmlFor={id}
        className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {children}
      </label>
    </div>
  );
}
