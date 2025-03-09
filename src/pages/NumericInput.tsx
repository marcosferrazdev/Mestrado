import { useEffect, useState } from "react";

interface NumericInputProps {
  initialValue: string;
  onCommit: (newValue: string) => void;
  className?: string;
}

export function NumericInput({ initialValue, onCommit, className }: NumericInputProps) {
  const [localValue, setLocalValue] = useState(initialValue);

  // Atualiza o estado local se o valor inicial mudar (por exemplo, via props)
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  // No onBlur, substituímos todas as vírgulas por pontos antes de enviar
  const handleBlur = () => {
    const convertedValue = localValue.replace(/,/g, '.');
    onCommit(convertedValue);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className={className}
    />
  );
}
