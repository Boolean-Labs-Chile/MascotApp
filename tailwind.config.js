/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/index.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#cbfbf1",
        "button-dark": "#46ecd5",
        "button-light": "#f0fdfa",
        text: "#022f2e",
      },
      fontFamily: {
        sans: ["Nunito-Regular"],
        "sans-bold": ["Nunito-Bold"],
        "sans-semibold": ["Nunito-SemiBold"],
      },
    },
  },
  plugins: [],
};
