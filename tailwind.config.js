// tailwind.config.js
import {heroui} from "@heroui/react";
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./node_modules/@heroui/theme/dist/components/(button|card|divider|input|ripple|spinner|form).js"
// ],
//   theme: {
//     extend: {},
//   },
//   darkMode: "class",
//   plugins: [heroui()],
// };


// tailwind.config.js


/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    // ...
    // make sure it's pointing to the ROOT node_module
    "./node_modules/@heroui/theme/dist/components/(button|card|divider|input|ripple|spinner|form).js"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()]
}

export default config;