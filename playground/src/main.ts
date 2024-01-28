import { chartXy, arrow, chartDonut, text, chartGauge, clipPath, path, use, findArcMidpoint, ChartXyDatasetItem } from "savyg";

// const parent = document.getElementById("svg") as HTMLElement
const div = document.getElementById("div") as HTMLElement

const gaugeDs = {
  value: "4.56",
  segments: [
    {
      from: "0",
      to: "1"
    },
    {
      from: "1",
      to: "2"
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
}

let gauge1 = chartGauge({
  dataset: gaugeDs,
  options: {
    title: "Title",
    valueRounding: 1,
    pointerSize: 1,
    pointerWidth: 12
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

function xyCb(item: any) {
  // console.log(item)
}

const xyDataset = [
  {
    name: 'serie 1',
    values: [1, 2, 3, 5, 12, 100],
    type: "bar",
    rounding: 1,
    plotRadius: 0,
    gradientFrom: "#FF000033",
    gradientTo: "#0000FF33",
    rx: 3,
    dataLabelsColor: "red"
  }
] as ChartXyDatasetItem[]

let xy = chartXy({
  dataset: xyDataset,
  parent: div,
  options: {
    axisColor: "#000000",
    backgroundColor: "#FFFFFF",
    fontFamily: "inherit",
    barSpacing: 2,
    xAxisLabels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    zoomColor: "#0000FF10",
    gridColor: "#CCCCCC",
    interactive: true,
    legendColor: "#000000",
    legendFontSize: 10,
    paddingBottom: 48,
    paddingLeft: 48,
    paddingRight: 24,
    paddingTop: 48,
    selectorColor: "#FF000010",
    "shape-rendering": "auto",
    showAxis: true,
    showGrid: true,
    showLegend: true,
    title: "Title",
    titleColor: "#000000",
    titleFontSize: 18,
    titlePosition: "start",
    tooltipBackgroundColor: "#FFFFFF",
    tooltipColor: "#000000",
    viewBox: "0 0 512 341"
  },
  callbacks: {
    onClickLegend: xyCb,
    // onHoverLegend: xyCb,
    onClickPeriod: xyCb,
    // onHoverPeriod: xyCb,
  }
})

function getArc(arc: any) {
  console.log(arc)
}

function getLegend(legend: any) {
  // console.log(legend)
}

let donut = chartDonut({
  dataset: [
    {
      name: "serie 1",
      value: "12",
    },
    {
      name: "serie 1.1",
      value: 12,
    },
  ],
  parent: div,
  options: {
    title: "Title",
    showDataLabels: true,
    donutRadiusRatio: 1,
    dataLabelsRoundingValue: 1,
    dataLabelsRoundingPercentage: 2,
    dataLabelsAsDivs: false
  },
  callbacks: {
    onClickArc: getArc,
    onClickLegend: getLegend,
    onHoverArc: getArc,
    onHoverLegend: getLegend
  }
})


const nuke = document.getElementById('nuke');

nuke?.addEventListener('click', () => {
  gauge = gauge.refresh(div)
  xy = xy.refresh(div)
  donut = donut.refresh(div)
})


function makeRandomDonutDataset() {
  const arr = [];
  for (let i = 0; i < 5; i += 1) {
    arr.push({
      name: `Serie ${i + 1}`,
      value: Math.random() * 100
    })
  }
  return arr
}

function makeRandomGaugeDataset() {
  gaugeDs.value = Math.random() * 5
  return gaugeDs
}

function makeRandomXyDataset() {
  const arr = []
  for (let i = 0; i < 12; i += 1) {
    arr.push(Math.random() * 100)
  }
  xyDataset[0].values = arr
  return xyDataset
}

const genDs = document.getElementById('genDs')

genDs?.addEventListener('click', () => {
  donut = donut.updateData(makeRandomDonutDataset())
  xy = xy.updateData(makeRandomXyDataset())
  gauge1 = gauge1.updateData(makeRandomGaugeDataset())
})