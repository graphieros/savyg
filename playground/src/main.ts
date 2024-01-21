import { chartXy, arrow, chartDonut, chartGauge, clipPath, path, use, findArcMidpoint } from "savyg";

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

let gauge = chartGauge({
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

arrow({
  options: {
    x1: 10,
    y1: 10,
    x2: 60,
    y2: 100,
    marker: "both",
    stroke: "black",
    "stroke-linecap": "round",
    "stroke-width": 1,
    size: 12
  },
  parent: gauge.chart
})



let xy = chartXy({
  dataset: [
    {
      name: 'serie 1',
      values: [1, 2, 3, 5, 12, 100],
      type: "bar",
      rounding: 1,
      plotRadius: 0,
      gradientFrom: "#FF000033",
      gradientTo: "#0000FF33",
      rx: 3
    },
    // {
    //   name: 'serie 2 with a long name',
    //   values: [-10, 20, 125, null, 12, 5, 36, 56],
    //   type: "line",
    //   fill: "#FF000033"
    // },
  ],
  parent: div,
  options: {
    barSpacing: 2,
    showAxis: true,
    xAxisLabels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    title: "Title",
    zoomColor: "#0000FF10"
  }
})

let donut = chartDonut({
  dataset: [
    {
      name: "serie 1",
      value: 0.1,
    },
    {
      name: "serie 1.1",
      value: 0 / 1,
    },
    {
      name: "serie 1.3",
      value: 0.1,
    },
    {
      name: "serie 1.3",
      value: 0.1,
    },
    {
      name: "serie 1.3",
      value: 0.1,
    },
    {
      name: "serie 1.3",
      value: 0.1,
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
    {
      name: "serie 4",
      value: 20,
    },
  ],
  parent: div,
  options: {
    title: "Title",
    showDataLabels: true,
    donutRadiusRatio: 1,
    dataLabelsRoundingValue: 1,
    dataLabelsRoundingPercentage: 2
  }
})

console.log(findArcMidpoint(donut.arcs[0].pathElement))

const nuke = document.getElementById('nuke');

nuke?.addEventListener('click', () => {
  gauge = gauge.refresh(div)
  xy = xy.refresh(div)
  donut = donut.refresh(div)
})
