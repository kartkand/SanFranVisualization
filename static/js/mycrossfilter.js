d3.csv("/static/data/sfpd_dispatch_data_subset.csv", function(error, incidents) {
  // Formatters.
  var formatNumber = d3.format(",d"),
      formatChange = d3.format(",d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");
  // For grouping the incident list.
  var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.date); });
  // CSV coercion
  incidents.forEach(function(d, i) {
    d.index = i;
    d.date = parseDate(d.received_timestamp);
    d.dispatch_timestamp = parseDate(d.dispatch_timestamp);
    d.delay = findDelay(d);
    d.distance = +d.zipcode_of_incident;
  });
  // Create the crossfilter for the relevant dimensions and groups.
  var incident = crossfilter(incidents),
      all = incident.groupAll(),
      date = incident.dimension(function(d) { return d.date; }),
      dates = date.group(d3.time.day),
      hour = incident.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
      hours = hour.group(Math.floor),
      delay = incident.dimension(function(d) { return d.delay; }),
      delays = delay.group(Math.floor),
      distance = incident.dimension(function(d) { return d.distance; }),
      distances = distance.group(Math.floor);
  var charts = [
    barChart(0)
        .dimension(hour)
        .group(hours)
      .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, 10 * 24])),
    barChart(0)
        .dimension(delay)
        .group(delays)
      .x(d3.scale.linear()
        .domain([0, 15])
        .rangeRound([0, 10 * 21])),
    barChart(1)
        .dimension(distance)
        .group(distances)
      .x(d3.scale.linear()
        .domain([94102, 94160])
        .rangeRound([0, 10 * 40])),
    barChart(0)
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([new Date(2018, 0, 1), new Date(2018, 1, 1)])
        .rangeRound([0, 10 * 90]))
        .filter([new Date(2018, 0, 1), new Date(2018, 1, 1)])
  ];

  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });
  // Render the initial lists.
  var list = d3.selectAll(".list")
      .data([incidentList]);
  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(incident.size()));
  renderAll();
  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }
  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    list.each(render);
    d3.select("#active").text(formatNumber(all.value()));
  }

  function parseDate(d) {
    return new Date(d.substring(0,4),
        d.substring(5, 7) - 1,
        d.substring(8, 10),
        d.substring(11, 13),
        d.substring(14, 16),
        d.substring(17, 19));
  }
  function findDelay(d) {
    var diffMs = d.dispatch_timestamp.getTime() - d.date.getTime(); // ms difference
    return Math.round(diffMs / 60000); // minutes
  }
  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };
  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };
  function incidentList(div) {
    var incidentsByDate = nestByDate.entries(date.top(40));
    div.each(function() {
      var date = d3.select(this).selectAll(".date")
          .data(incidentsByDate, function(d) { return d.key; });
      date.enter().append("div")
          .attr("class", "date")
        .append("div")
          .attr("class", "day")
          .text(function(d) { return formatDate(d.values[0].date); });
      date.exit().remove();
      var incident = date.order().selectAll(".incident")
          .data(function(d) { return d.values; }, function(d) { return d.index; });
      var incidentEnter = incident.enter().append("div")
          .attr("class", "incident");
      incidentEnter.append("div")
          .attr("class", "time")
          .text(function(d) { return formatTime(d.date); });
      incidentEnter.append("div")
          .attr("class", "origin")
          .text(function(d) { return d.origin; });
      incidentEnter.append("div")
          .attr("class", "destination")
          .text(function(d) { return d.destination; });
      incidentEnter.append("div")
          .attr("class", "distance")
          .text(function(d) { return (d.distance); });
      incidentEnter.append("div")
          .attr("class", "delay")
          .classed("early", function(d) { return d.delay < 0; })
          .text(function(d) { return formatChange(d.delay) + " min."; });
      incident.exit().remove();
      incident.order();
    });
  }
  function barChart(tick) {
    if (!barChart.id) barChart.id = 0;
    if (tick) {
      var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom").tickFormat(d3.format("d")),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;
    } else {
      var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;
    }
    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];
      y.domain([0, group.top(1)[0].value]);
      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");
        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".title").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");
          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);
          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());
          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");
          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }
        g.selectAll(".bar").attr("d", barPath);
      });
      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }
      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }
    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });
    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });
    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });
    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };
    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };
    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };
    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };
    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };
    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };
    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };
    return d3.rebind(chart, brush, "on");
  }
});