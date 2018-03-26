var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1300 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// setup x 
var xValue = function(d) { 
        var hms = d.received_timestamp.substring(11, 19);
        var a = hms.split(':');
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
        return seconds;
    }, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues([0,2,4,6,8,10,12,14,16,18,20,22,24].map(function(d){
      return d*3600;
    })).tickFormat(function(d){
      return d/3600 + ":00";
    });

// setup y
var yValue = function(d) { 
        var dhms = d.dispatch_timestamp.substring(11, 19);
        var da = dhms.split(':');
        var dispatchSeconds = (+da[0]) * 60 * 60 + (+da[1]) * 60 + (+da[2]);

        var rhms = d.received_timestamp.substring(11, 19);
        var ra = rhms.split(':');
        var receivedSeconds = (+ra[0]) * 60 * 60 + (+ra[1]) * 60 + (+ra[2]);
        var secondsDifference = dispatchSeconds - receivedSeconds;

        var dday = d.dispatch_timestamp.substring(8, 10);
        var rday = d.received_timestamp.substring(8, 10);
        return ((+dday)-(+rday)) * 86400 + secondsDifference;
    }, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues([0,1,2,3,4,5,6].map(function(d){
      return d*240;
    })).tickFormat(function(d){
      return d/240 + ":00";
    });;

// setup fill color
var cValue = function(d) { return d.call_type;},
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom).call(d3.behavior.zoom().on("zoom", function () {
    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
  })).append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load data
d3.csv("/static/data/sfpd_dispatch_data_subset.csv", function(error, outliersInData) {

  asdf = outliersInData;
  data = outliersInData.filter(function(d){
    var dhms = d.dispatch_timestamp.substring(11, 19);
        var da = dhms.split(':');
        var dispatchSeconds = (+da[0]) * 60 * 60 + (+da[1]) * 60 + (+da[2]);

        var rhms = d.received_timestamp.substring(11, 19);
        var ra = rhms.split(':');
        var receivedSeconds = (+ra[0]) * 60 * 60 + (+ra[1]) * 60 + (+ra[2]);
        var secondsDifference = dispatchSeconds - receivedSeconds;

        var dday = d.dispatch_timestamp.substring(8, 10);
        var rday = d.received_timestamp.substring(8, 10);
        return ((+dday)-(+rday)) * 86400 + secondsDifference < 1500;
  });

  data.forEach(function(d) {
    d.battalion = +d.battalion.substring(2,3);
  });

  // add in buffer to data domain so dots do not overlap
  xScale.domain([d3.min(data, xValue)-75, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-75, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Time of Call");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Time to Dispatch (minutes)");




  // Define the div for the tooltip
  var div = d3.select("body").append("div") 
      .attr("class", "tooltip")       
      .style("opacity", 0);


  // draw dots
  var dots = svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      .on("mouseover", function(d) {
          div.transition()
               .duration(200)
               .style("opacity", 0.9);
          div.html(d["call_type"] + "<br/> Call received: " + d.received_timestamp.substring(11, 19) 
          + "<br/> Dispatch time: " + d.dispatch_timestamp.substring(11, 19))
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          div.transition()
               .duration(500)
               .style("opacity", 0);
      });
});
d3.select("body").attr("align","center");