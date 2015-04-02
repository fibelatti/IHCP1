var zoom = d3.behavior.zoom();

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
var parseTime = d3.time.format("%H").parse;

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
    .attr("pointer-events", "all")
    .call(zoom.on("zoom", rescale))
    .on("dblclick.zoom", null)
    .on("dblclick.", null)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .append("g")
      .attr("id", "g-holder")
    .append("g")
      .attr("id", "g-main");
  
// reposition g
function rescale() {
  d3.select("#g-main").attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
}