import React from 'react';

interface KeypadProps {
  onPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const Keypad: React.FC<KeypadProps> = ({ onPress, onDelete, onSubmit, onClear, disabled }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => onPress(k)}
            disabled={disabled}
            className="h-16 bg-white rounded-lg shadow-md text-2xl font-semibold text-neutral active:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {k}
          </button>
        ))}
        <button
          onClick={onClear}
          disabled={disabled}
          className="h-16 bg-red-100 rounded-lg shadow-md text-lg font-semibold text-error active:bg-red-200 disabled:opacity-50 transition-colors"
        >
          BORRAR
        </button>
        <button
          onClick={() => onPress('0')}
          disabled={disabled}
          className="h-16 bg-white rounded-lg shadow-md text-2xl font-semibold text-neutral active:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          0
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          className="h-16 bg-gray-200 rounded-lg shadow-md flex items-center justify-center text-neutral active:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12l-2.25 2.25m-2.25-2.25-2.25 2.25m0 0-2.25-2.25m2.25 2.25 2.25-2.25M6.75 20.25h10.5a2.25 2.25 0 0 0 2.25-2.25V9.375c0-.621-.504-1.125-1.125-1.125H17.25c-1.242 0-2.25-1.008-2.25-2.25V2.625c0-.621-.504-1.125-1.125-1.125H6.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.75 20.25Z" />
          </svg>
        </button>
      </div>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="w-full h-16 bg-primary rounded-lg shadow-lg text-xl font-bold text-white uppercase tracking-wide hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 transition-colors"
      >
        CONFIRMAR
      </button>
    </div>
  );
};

export default Keypad;