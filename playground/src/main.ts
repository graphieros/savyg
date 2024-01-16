import { chartXy, radialGradient, svg, circle, chartDonut, chartGauge } from "savyg";

// const parent = document.getElementById("svg") as HTMLElement
const div = document.getElementById("div") as HTMLElement

chartGauge({
  dataset: {
    value: 4.56,
    segments: [
      {
        from: 0,
        to: 1
      },
      {
        from: 1,
        to: 2
      },
      {
        from: 2,
        to: 3
      },
      {
        from: 3,
        to: 4
      },
      {
        from: 4,
        to: 5
      }
    ]
  },
  options: {
    title: "Title",
    valueRounding: 1,
  },
  parent: div
})
chartGauge({
  dataset: {
    value: 4.56,
    segments: [
      {
        from: -100,
        to: 0
      },
      {
        from: 0,
        to: 100
      },
    ]
  },
  options: {
    title: "Title",
    valueRounding: 1,
    arcThickness: 12,
    pointerSize: 0.8,
    dataLabelsOffset: 1.2
  },
  parent: div
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

chartDonut({
  dataset: [
    {
      name: "serie 1",
      value: 20,
    },
    {
      name: "serie 2",
      value: 10,
    },
    {
      name: "serie 3",
      value: 10,
    },
    {
      name: "serie 4",
      value: 20,
    },
  ],
  parent: div,
  options: {
    title: "Title",
  }
})