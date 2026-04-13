import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18211f",
        field: "#f3faf5",
        line: "#d8e4dd",
        pine: "#116149",
        teal: "#0e827b",
        coral: "#d84d3f",
        gold: "#b98316",
        cloud: "#f8fbf9"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(24, 33, 31, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
