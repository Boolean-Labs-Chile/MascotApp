import type { AlertButton, AlertOptions } from "react-native";

export const Alert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) {
    const texto = [title, message].filter(Boolean).join("\n\n");
    if (!buttons || buttons.length <= 1) {
      window.alert(texto);
      buttons?.[0]?.onPress?.();
      return;
    }
    const accion = buttons.find((button) => button.style !== "cancel");
    if (window.confirm(texto)) accion?.onPress?.();
    else {
      buttons.find((button) => button.style === "cancel")?.onPress?.();
      options?.onDismiss?.();
    }
  },
};
