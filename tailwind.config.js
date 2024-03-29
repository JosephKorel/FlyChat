const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        skyblue: {
          DEFAULT: "#2A6FDB",
          50: "#C7D9F6",
          100: "#B6CDF3",
          200: "#93B6ED",
          300: "#709EE7",
          400: "#4D87E1",
          500: "#2A6FDB",
          600: "#1E56AF",
          700: "#163F7F",
          800: "#0D274F",
          900: "#050F1F",
        },
        lime: {
          DEFAULT: "#AFFC41",
          50: "#FBFFF6",
          100: "#F3FFE2",
          200: "#E2FEB9",
          300: "#D1FD91",
          400: "#C0FD69",
          500: "#AFFC41",
          600: "#98FB0A",
          700: "#78CA03",
          800: "#579202",
          900: "#365B01",
        },
        dark: {
          DEFAULT: "#272727",
          50: "#838383",
          100: "#797979",
          200: "#646464",
          300: "#505050",
          400: "#3B3B3B",
          500: "#272727",
          600: "#0B0B0B",
          700: "#000000",
          800: "#000000",
          900: "#000000",
        },
        deepblue: {
          DEFAULT: "#122C91",
          50: "#6E88ED",
          100: "#5B79EB",
          200: "#375BE6",
          300: "#1B42DA",
          400: "#1737B5",
          500: "#122C91",
          600: "#0C1D5F",
          700: "#060E2D",
          800: "#000000",
          900: "#000000",
        },
        diamond: {
          DEFAULT: "#48D6D2",
          50: "#DEF8F7",
          100: "#CDF4F3",
          200: "#ACECEB",
          300: "#8BE5E2",
          400: "#69DDDA",
          500: "#48D6D2",
          600: "#2ABCB8",
          700: "#208E8B",
          800: "#16605E",
          900: "#0B3231",
        },
        water: {
          DEFAULT: "#81E9E6",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#E9FBFB",
          300: "#C6F5F4",
          400: "#A4EFED",
          500: "#81E9E6",
          600: "#51E1DD",
          700: "#25D5D0",
          800: "#1DA5A1",
          900: "#147572",
        },
        paleyellow: {
          DEFAULT: "#FEFCBF",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#FFFFFF",
          300: "#FFFFFF",
          400: "#FFFEE7",
          500: "#FEFCBF",
          600: "#FDF988",
          700: "#FCF751",
          800: "#FBF419",
          900: "#D9D203",
        },
      },
      fontFamily: {
        sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
        title: ["Oswald"],
        dancing: ["Dancing Script"],
      },
    },
  },
  plugins: [],
};
