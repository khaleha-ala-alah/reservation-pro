/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // name must match the actual font family: "Inter Variable"
        sans: ['"Inter Variable"', "Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
