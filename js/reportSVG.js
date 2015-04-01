var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementById('panel-report'),
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

// Set margins
var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 60
},
width = (x - margin.left - margin.right) * 0.5,
height = (y - margin.top - margin.bottom) * 0.4;

var parseDate = d3.time.format("%Y%m%d").parse;

// Set x scale
var x = d3.scale.ordinal().rangeRoundBands([0, width], .2);

// Set y scale
var y = d3.scale.linear().rangeRound([height, 0]);

// Set axis
var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

// Add chart
var svg = d3.select("#viz")
  .append("svg")
    .attr("id", "id-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");