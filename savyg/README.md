# savyg

A savvy library to create svg elements and charts with ease.
![npm](https://img.shields.io/npm/v/savyg)

SVG is awesome. But writing SVG on a low level can be tedious. This library is designed to make SVG coding more declarative and enjoyable.

This Typescript library also comes with built-in charts, you can tailor to your needs. It is lowely opinionated.

[documentation](https://savyg.graphieros.com)

This project just started.
The basic blocks are there. Many more charts are on the cards.


## Installation

npm install savyg

yarn add savyg

pnpm add savyg

bun add savyg


## charts

Making charts is easy. Here is how you can create a progression chart, with lines, bars and plots:

```
import { chartXy } from "savyg";

    chartXy({
        dataset: [
            {
                name: 'serie 1',
                values: [0, -1, -1, -2, -3, -5, -8.13, -13.54, -21, -34, -55, -89],
                type: "bar",
                rounding: 1,
                plotRadius: 0,
                gradientFrom: "#FF000033",
                gradientTo: "#0000FF33",
                rx: 3
            },
            {
                name: 'serie 2',
                values: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
                type: "line",
                fill: "#FF000033"
            },
            {
                name: 'serie 3',
                values: [89, 55, 34, 21],
                type: "plot",
                plotRadius: 3
            },
        ],
        // The HTML element where the chart will be inserted:
        parent: document.querySelector('#myDiv'),
        options: {
            barSpacing: 2,
            showAxis: true,
            xAxisLabels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
            title: "Title",
        }
    })

```
[check the docs](https://savyg.graphieros.com/docs#charts)


## SVG api

If you need to write SVG close to the metal but want to spare the hassle, this api is for you.

Need a circle ?

```
import { circle } from "savyg";

circle({
    options: {
        x: 10,
        y: 10,
        r: 5,
        fill: "red"
    },
    parent: document.querySelector('#myDiv')
})

```
[check the docs for the SVG api](https://savyg.graphieros.com/docs#svgapi)