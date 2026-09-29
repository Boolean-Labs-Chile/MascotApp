import type { ComponentProps } from "react";
import type NativePicker from "@react-native-community/datetimepicker";

export default function SelectorFecha({
  value,
  onChange,
}: ComponentProps<typeof NativePicker>) {
  const fecha = [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
  return (
    <input
      aria-label="Seleccionar fecha"
      type="date"
      value={fecha}
      style={{
        font: "inherit",
        color: "#022f2e",
        padding: 12,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "white",
      }}
      onChange={(event) => {
        if (!event.target.value) return;
        const seleccion = new Date(event.target.value + "T12:00:00");
        onChange?.(
          {
            type: "set",
            nativeEvent: {
              timestamp: seleccion.getTime(),
              utcOffset: -seleccion.getTimezoneOffset(),
            },
          },
          seleccion,
        );
      }}
    />
  );
}
