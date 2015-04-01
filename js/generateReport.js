var generateReport = function(reportType, event, category, beginInterval, endInterval) {
  xAxis.tickFormat(d3.time.format("%d/%m/%Y"));

  var nest = d3.nest()
        .key(function(d) { return d.datacompra; })
        .sortKeys(d3.ascending)
        .rollup(function(values) {
          return {
            totalQuantidade: d3.sum(values, function(d) { return d.quantidade }),
            totalValor: d3.sum(values, function(d) { return d.valorunitario * d.quantidade })
          };
        })
        .entries(REPORT_DATA);

  console.log(nest.filter(function(d) {return d.key < 20150318;}));

  // Set domain
  x.domain(nest.map(function (d) {
      return parseDate(d.key);
  }));

  y.domain([0, d3.max(nest, function (d) {
      return d.values.totalQuantidade + 10;
  })]);

  // Apply domain to Axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis)
    .selectAll("text")	
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
        return "rotate(-65)" 
      });

  svg.append("g")
    .attr("class", "axis")
    .call(yAxis)
    .append("text")
    //.attr("transform", "rotate(-90)")
    .attr("x", 130)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Quantidade de Ingressos");

  // Draw data
  svg.selectAll(".data")
      .data(nest)
      .enter()
      .append("g")
        .attr("class", "g")
        .attr("transform", function (d) {
          return "translate(" + x(parseDate(d.key)) + ",0)";
        })
      .append("rect")
        .attr('height', 0)
        .transition()
        .duration(1000)
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
          return y(d.values.totalQuantidade);
        })
        .attr("height", function (d) {
          return y(0) - y(d.values.totalQuantidade);
        })
        .style("fill","#e67e22")
        .style("opacity", 0.7)
      .append("title")
        .text(function(d) {return d.values.totalValor.format(2, 3, '.', ',');});

}