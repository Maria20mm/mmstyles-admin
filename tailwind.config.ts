
import type { Config } from "tailwindcss";


const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      "heading1-bold": [
        "50px",
        {
          lineHeight: "100%",
          fontWeight: "700",
        },
      ],
      "heading2-bold": [
        "30px",
        {
          lineHeight: "100%",
          fontWeight: "700",
        },
      ],
      "heading3-bold": [
        "24px",
        {
          lineHeight: "100%",
          fontWeight: "700",
        },
      ],
      "heading4-bold": [
        "20px",
        {
          lineHeight: "100%",
          fontWeight: "700",
        },
      ],
      "body-bold": [
        "18px",
        {
          lineHeight: "100%",
          fontWeight: "700",
        },
      ],
      "body-semibold": [
        "18px",
        {
          lineHeight: "100%",
          fontWeight: "600",
        },
      ],
      "body-medium": [
        "18px",
        {
          lineHeight: "100%",
          fontWeight: "500",
        },
      ],
      "base-bold": [
        "16px",
        {
          lineHeight: "100%",
          fontWeight: "600",
        },
      ],
      "base-medium": [
        "16px",
        {
          lineHeight: "100%",
          fontWeight: "500",
        },
      ],
    },
    extend: {
      
      
      colors: {
        "white-1": "#F8F8F8",
        "grey-1": "#616161",
        "grey-2": "#E5E7EB",
        "blue-1": "#005EBE",
        "blue-2": "#E9F5FE",
        "blue-3": "#F5F7F9",
        "red-1": "#FF0000",
        "green-1": "#00FF00", // Lime Green
        "green-2": "#2ecc71", // Emerald Green
        "green-3": "#3498db", // Sky Blue
        "orange-1": "#FFA500", // Orange
        "orange-2": "#FF6347", // Tomato
        "purple-1": "#800080", // Purple
        "purple-2": "#6A5ACD", // Slate Blue
        "yellow-1": "#FFFF00", // Yellow
        "yellow-2": "#FFD700", // Gold
        "pink-1": "#FFC0CB", // Pink
        "pink-2": "#FF69B4", // Hot Pink
        "maroon-1": "#800000", // Maroon
        "brown-1": "#8B4513", // Saddle Brown
        "brown-2": "#A0522D", // Sienna
        "brown-3": "#D2691E", // Chocolate
      },
    },
    
  },
  plugins: [],

};
export default config;