import React from "react";

export const TimePicker = ({ value, onChange, disabled = false, step = 60, className = "" }) => {
    const handleChange = (event) => {
        const nextValue = event.target.value; // format HH:mm
        if (onChange) onChange(nextValue);
    };

    return (
        <input
            type="time"
            value={value || ""}
            onChange={handleChange}
            disabled={disabled}
            step={step}
            className={className}
        />
    );
};

export default TimePicker;

