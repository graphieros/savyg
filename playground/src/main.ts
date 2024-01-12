import { chartXy } from "savyg";

// const parent = document.getElementById("svg") as HTMLElement
const div = document.getElementById("div") as HTMLElement

chartXy({
  dataset: [
    {
      name: 'serie 1',
      values: [-120, 0, 25, 0, null, 25, 50, 102]
    }
  ],
  parent: div,
  options: {
    xAxisLabels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"]
  }
})