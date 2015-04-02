/**
  *
  * @param {Const} reportType: VG_REPORT_TYPE
  * @param {String} event:
  * @param {String} category: 
  * @param {String} beginInterval:
  * @param {String} endInterval:
  */
var generateReport = function(reportType, event, category, beginInterval, endInterval) {
  var filteredData = REPORT_DATA;
  var nest = null;
  
  var color = d3.scale.ordinal()
    .range(["#e67e22", "#4D4D4D", "#F15854", "#DECF3F", "#5DA5DA"]);
  
  $('#id-svg > g > g > g').empty();
  
  // Aplica filtro de evento
  if (event != null) {
    filteredData = filteredData.filter(function (d) {return d.evento == event;})
  }
  
  if (reportType == VG_REPORT_TYPE.VENDAS_PERIODO) {
    xAxis.tickFormat(d3.time.format("%d/%m/%Y"));
    
    // Aplica filtros particulares
    if (beginInterval != null) {
      filteredData = filteredData.filter(function (d) {return d.datacompra >= beginInterval;})
    }
    
    if (endInterval != null) {
      filteredData = filteredData.filter(function (d) {return d.datacompra <= endInterval;})
    }
    
    // Agrega os valores
    nest = d3.nest()
        .key(function(d) { return d.datacompra; })
        .sortKeys(d3.ascending)
        .rollup(function(values) {
          return {
            totalQuantidade: d3.sum(values, function(d) { return d.quantidade }),
            totalValor: d3.sum(values, function(d) { return d.valorunitario * d.quantidade })
          };
        })
        .entries(filteredData);
    
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
          .attr('width', 0)
          .style("fill","#e67e22")
        .transition()
        .duration(1000)
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
          return y(d.values.totalQuantidade);
        })
        .attr("height", function (d) {
          return y(0) - y(d.values.totalQuantidade);
        })
        .style("opacity", 0.7);
        
        /*
        .append("title")
          .text(function(d) {return d.values.totalValor.format(2, 3, '.', ',');})
          */
    
  } else if (reportType == VG_REPORT_TYPE.VENDAS_DIA_CATEGORIA) {
    xAxis.tickFormat(d3.time.format("%d/%m/%Y"));
    
    var xsub = d3.scale.ordinal();

    // Aplica filtros particulares
    if (category != null) {
      filteredData = filteredData.filter(function (d) {return d.categoria == category;})
    }
    
    if (beginInterval != null) {
      filteredData = filteredData.filter(function (d) {return d.datacompra >= beginInterval;})
    }
    
    if (endInterval != null) {
      filteredData = filteredData.filter(function (d) {return d.datacompra <= endInterval;})
    }
    
    // Agrega os valores
    nest = d3.nest()
        .key(function(d) { return d.datacompra; })
          .sortKeys(d3.ascending)
        .key(function(d) { return d.categoria; })
        .rollup(function(leaves) {
          return {
            totalQuantidade: d3.sum(leaves, function(d) { return d.quantidade }),
            totalValor: d3.sum(leaves, function(d) { return d.valorunitario * d.quantidade })
          };
        })
        .entries(filteredData);
    
    // Set domain
    x.domain(nest.map(function (d) {
        return parseDate(d.key);
    }));
    
    console.log(d3.set(nest.map(function (d) {
      return d3.set(d.values.map(function (d) {return d.key;})).values() })).values());
    
    var categoryNames = ["cadeira", "camarote", "poltrona"];
    xsub.domain(categoryNames).rangeRoundBands([0, x.rangeBand()]);
    
    y.domain([0, d3.max(nest, function (d) {
      return d3.max(d.values, function (d) { return d.values.totalQuantidade + 10; });
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
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function (d) {
          return "translate(" + x(parseDate(d.key)) + ",0)";
        })
      .selectAll("rect")
        .data(function (d) { return d.values })
      .enter().append("rect")
        .attr('width', 0)
        .style("fill", function(d) { return color(d.key); })
      .transition()
      .duration(1000)
      .attr("width", xsub.rangeBand())
      .attr("x", function(d) { return xsub(d.key); })
      .attr("y", function (d) {
        return y(d.values.totalQuantidade);
      })
      .attr("height", function (d) {
        return y(0) - y(d.values.totalQuantidade);
      })
      .style("opacity", 0.7);
    
  var legend = svg.selectAll(".legend")
      .data(categoryNames.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
    
  } else if (reportType == VG_REPORT_TYPE.VENDAS_CATEGORIA_HORARIO) {
    xAxis.tickFormat(d3.time.format("%H:%M"));
    
    var xsub = d3.scale.ordinal();
    
    // Aplica filtros particulares
    if (category != null) {
      filteredData = filteredData.filter(function (d) {return d.categoria == category;})
    }
    
    if (beginInterval != null) {
      filteredData = filteredData.filter(function (d) {return d.horacompra >= beginInterval;})
    }
    
    if (endInterval != null) {
      filteredData = filteredData.filter(function (d) {return d.horacompra <= endInterval;})
    }
    
    // Agrega os valores
    nest = d3.nest()
        .key(function(d) { return d.horacompra.substr(0, 2); })
          .sortKeys(d3.ascending)
        .key(function(d) { return d.categoria; })
        .rollup(function(leaves) {
          return {
            totalQuantidade: d3.sum(leaves, function(d) { return d.quantidade }),
            totalValor: d3.sum(leaves, function(d) { return d.valorunitario * d.quantidade })
          };
        })
        .entries(filteredData);
    
    // Set domain
    x.domain(nest.map(function (d) {
        return parseTime(d.key);
    }));
    
    var categoryNames = ["cadeira", "camarote", "poltrona"];
    xsub.domain(categoryNames).rangeRoundBands([0, x.rangeBand()]);
    
    y.domain([0, d3.max(nest, function (d) {
      return d3.max(d.values, function (d) { return d.values.totalQuantidade + 10; });
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
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function (d) {
          return "translate(" + x(parseTime(d.key)) + ",0)";
        })
      .selectAll("rect")
        .data(function (d) { return d.values })
      .enter().append("rect")
        .attr('width', 0)
        .style("fill", function(d) { return color(d.key); })
      .transition()
      .duration(1000)
      .attr("width", xsub.rangeBand())
      .attr("x", function(d) { return xsub(d.key); })
      .attr("y", function (d) {
        return y(d.values.totalQuantidade);
      })
      .attr("height", function (d) {
        return y(0) - y(d.values.totalQuantidade);
      })
      .style("opacity", 0.7);
    
  var legend = svg.selectAll(".legend")
      .data(categoryNames.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
  }
  
  console.log(nest);
}