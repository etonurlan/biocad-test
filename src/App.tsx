import { useState } from "react";

import { AlignmentView } from "./components/AlignmentView";
import { allowedChars } from "./consts/allowedChars";

function App() {
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sanitizeInput = (value: string) => {
    return value
      .toUpperCase()
      .split("")
      .filter((char) => allowedChars.has(char))
      .join("");
  };

  const isSameLength =
    firstValue.length === secondValue.length && firstValue.length > 0;

  const handleSubmit = () => {
    if (!isSameLength) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setSubmitted(true);
  };

  const handleChange = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setValue(sanitizeInput(value));
    setShowError(false);
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col font-mono text-lg gap-2 w-[80%] md:w-[30%]">
      <input
        type="text"
        value={firstValue}
        onChange={(event) => handleChange(event.target.value, setFirstValue)}
        placeholder="Введите первую последовательность"
        className="border rounded-md outline-none px-2 py-1"
      />
      <input
        type="text"
        value={secondValue}
        onChange={(event) => handleChange(event.target.value, setSecondValue)}
        placeholder="Введите вторую последовательность"
        className="border rounded-md outline-none px-2 py-1"
      />
      <button
        onClick={handleSubmit}
        className="font-medium bg-[#80BFFF] hover:bg-[#BB99FF] cursor-pointer transition-colors duration-200 px-2 py-1 rounded-md"
      >
        Выровнять
      </button>
      {showError && (
        <p style={{ color: "red" }}>
          Длины последовательностей должны совпадать!
        </p>
      )}
      {submitted && (
        <AlignmentView firstValue={firstValue} secondValue={secondValue} />
      )}
    </div>
  );
}

export default App;
