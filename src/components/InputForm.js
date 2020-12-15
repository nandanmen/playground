import React from "react";

import ErrorPopup from "./ErrorPopup";
import styles from "./styles/InputForm.module.css";

export default function InputForm({ inputs, onSubmit, className }) {
  const [errors, setErrors] = React.useState({});

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const entries = [...new FormData(evt.target).entries()];
    if (entries.every(validate)) {
      onSubmit(entries.map(([name, value]) => [name, JSON.parse(value)]));
    }
  };

  const validate = ([name, value]) => {
    try {
      JSON.parse(value);
      setErrors({ ...errors, [name]: null });
      return true;
    } catch (err) {
      setErrors({ ...errors, [name]: err.message });
      return false;
    }
  };

  return (
    <form className={`${styles.form} ${className}`} onSubmit={handleSubmit}>
      {inputs.map(([name, value]) => (
        <label key={name} className={styles.field}>
          <input
            name={name}
            className="w-full p-2 rounded-md bg-gray-700"
            type="text"
            defaultValue={JSON.stringify(value)}
            onBlur={(evt) => validate([name, evt.target.value])}
          />
          <span className="block">{name}</span>
          <ErrorPopup
            error={errors[name]}
            className="absolute top-full text-xs w-3/4"
          />
        </label>
      ))}
      <button className={styles.submit} type="submit">
        Run
      </button>
    </form>
  );
}
