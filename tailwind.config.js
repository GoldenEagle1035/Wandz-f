/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    // screens:{
    //   xl: {"max":"1600px"}
    // },
    extend: {
      fontFamily: {
        twist: ["twisted", "sans-serif"],
        superLagendBoy:["SuperLegendBoy","sans-serif"],
        roboto: ["roboto", "sans-serif"],
      },
      animation: {
        text: "text 5s ease infinite",
      },
      keyframes: {
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "top center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "bottom center",
          },
        },
      },

    },
  },
  plugins: [],
}

