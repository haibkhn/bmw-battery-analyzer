/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bmw: {
          blue: "#0066B1",
          darkBlue: "#003B6F",
          gray: "#6C6C6C",
          lightGray: "#E6E6E6",
        },
      },
    },
  },
  plugins: [],
};
