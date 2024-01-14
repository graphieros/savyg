import { chartXy, radialGradient, svg, circle } from "savyg";

// const parent = document.getElementById("svg") as HTMLElement
const div = document.getElementById("div") as HTMLElement

const s = svg({
  options: {
    viewBox: '0 0 100 100',
    height: "200px",
    width: "200px",
  },
  parent: div
})

radialGradient({
  stops: [
    {
      offset: "0%",
      "stop-color": "#FF0000",
    },
    {
      offset: "100%",
      "stop-color": "#0000FF",
    },
  ],
  parent: s,
  fx: "40%",
  fy: "40%",
  spreadMethod: "repeat",
  gradientUnits: "userSpaceOnUse",
  id: "grad"
})

circle({
  options: {
    cx: 50,
    cy: 50,
    r: 40,
    fill: "url(#grad)"
  },
  parent: s
})

chartXy({
  dataset: [
    {
      name: 'serie 1',
      values: [-120.18, 0, 25, 0, 12, 25, 50, 102, 165, 220, 143, 212],
      type: "bar",
      rounding: 1,
      plotRadius: 0,
      gradientFrom: "#FF000033",
      gradientTo: "#0000FF33",
      rx: 3
    },
    {
      name: 'serie 2 with a long name',
      values: [-10, 20, 125, null, 12, 5, 36, 56],
      type: "line",
      fill: "#FF000033"
    },
  ],
  parent: div,
  options: {
    barSpacing: 2,
    showAxis: true,
    xAxisLabels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    title: "Title",
  }
})