import { chartXy } from "savyg";

// const parent = document.getElementById("svg") as HTMLElement
const div = document.getElementById("div") as HTMLElement

chartXy({
  dataset: [
    {
      name: 'serie 1',
      values: [-120.18, 0, 25, 0, 12, 25, 50, 102],
      type: "area",
      rounding: 1,
      plotRadius: 0,
      gradientFrom: "#FF000033",
      gradientTo: "#0000FF33"
    },
    {
      name: 'serie 2',
      values: [-10, 20, 125, 0, null, 5, 36, 56],
      type: "plot",
      fill: "#FF000033"
    },
  ],
  parent: div,
  options: {
    xAxisLabels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"]
  }
})