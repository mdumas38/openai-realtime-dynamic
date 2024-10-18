import React, { useState } from 'react';

interface ToggleProps {
  defaultValue?: boolean;
  values?: string[];
  labels?: string[];
  onChange?: (isEnabled: boolean, value: string) => void;
}

export function Toggle({
  defaultValue = false,
  values = [],
  labels = [],
  onChange = () => {},
}: ToggleProps) {
  const [isEnabled, setIsEnabled] = useState(defaultValue);

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onChange(newValue, values[newValue ? 1 : 0]);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm ${isEnabled ? 'text-gray-500' : 'font-medium'}`}>{labels[0]}</span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm ${isEnabled ? 'font-medium' : 'text-gray-500'}`}>{labels[1]}</span>
    </div>
  );
}
