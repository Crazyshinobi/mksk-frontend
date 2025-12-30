import { useState, useEffect } from "react";

interface SwitchProps {
  label?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray" | "green-red"; // Added green-red option
}

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  checked,
  disabled = false,
  onChange,
  color = "blue",
}) => {
  const isControlled = checked !== undefined;
  const [isChecked, setIsChecked] = useState(isControlled ? checked : defaultChecked);

  useEffect(() => {
    if (isControlled) {
      setIsChecked(checked);
    }
  }, [checked, isControlled]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    const nextState = !isChecked;
    if (!isControlled) {
      setIsChecked(nextState);
    }
    if (onChange) {
      onChange(nextState);
    }
  };

  // Define colors based on the 'color' prop
  const getColors = () => {
    if (color === "green-red") {
      return {
        background: isChecked
          ? "bg-green-500"
          : "bg-red-500", // Green when Active, Red when Inactive
        knob: isChecked ? "translate-x-5 bg-white" : "translate-x-0 bg-white",
      };
    }

    if (color === "gray") {
      return {
        background: isChecked ? "bg-gray-800 dark:bg-white/10" : "bg-gray-200 dark:bg-white/10",
        knob: isChecked ? "translate-x-5 bg-white" : "translate-x-0 bg-white",
      };
    }

    // Default Blue
    return {
      background: isChecked ? "bg-brand-500" : "bg-gray-200 dark:bg-white/10",
      knob: isChecked ? "translate-x-5 bg-white" : "translate-x-0 bg-white",
    };
  };

  const switchColors = getColors();

  return (
    <div
      className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-400"
        }`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block transition duration-200 ease-in-out h-6 w-11 rounded-full ${disabled
              ? "bg-gray-100 pointer-events-none dark:bg-gray-800"
              : switchColors.background
            }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-md transition-transform duration-200 ease-in-out ${switchColors.knob}`}
        ></div>
      </div>
      {label && <span>{label}</span>}
    </div>
  );
};

export default Switch;