var width = 1100,
    height = 650,
    centered;

// Define color scale
var color = d3.scale.linear()
  .domain([1, 20])
  .clamp(true)
  .range(['#fff', '#409A99']);

var projection = d3.geo.mercator()
  .scale(200000)
  // Center the Map in Colombia
  .center([-122.4, 37.77])
  .translate([width / 2, height / 2]);

var path = d3.geo.path()
  .projection(projection);

// Set svg width & height
var svg = d3.select('svg')
  .attr('width', width)
  .attr('height', height);

// Add background
svg.append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height)
  .on('click', clicked);

var g = svg.append('g');

var effectLayer = g.append('g')
  .classed('effect-layer', true);

var mapLayer = g.append('g')
  .classed('map-layer', true);

var dummyText = g.append('text')
  .classed('dummy-text', true)
  .attr('x', 10)
  .attr('y', 30)
  .style('opacity', 0);

var bigText = g.append('text')
  .classed('big-text', true)
  .attr('x', 20)
  .attr('y', 45);

// Load map data
d3.json('/static/data/Neighborhoods.geo.json', function(error, mapData) {
  var features = mapData.features;

  // Update color scale domain based on data
  color.domain([0, d3.max(features, nameLength)]);

  // Draw each neighborhood as a path
  mapLayer.selectAll('path')
      .data(features)
    .enter().append('path')
      .attr('d', path)
      .attr('vector-effect', 'non-scaling-stroke')
      .style('fill', fillFn)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('click', clicked);
});

// Get neighborhood name
function nameFn(d){
  return d && d.properties ? d.properties.nhood : null;
}

// Get neighborhood name length
function nameLength(d){
  var n = nameFn(d);
  return n ? n.length : 0;
}

// Get neighborhood color
function fillFn(d){
  return color(nameLength(d));
}

// When clicked, zoom in
function clicked(d) {
  var x, y, k;

  // Compute centroid of the selected path
  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  // Highlight the clicked neighborhood
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : fillFn(d);});

  // Zoom
  g.transition()
    .duration(750)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
}

function mouseover(d){
  // Highlight hovered neighborhood
  d3.select(this).style('fill', 'orange');

  // Draw effects
  textArt(nameFn(d));
}

function mouseout(d){
  // Reset neighborhood color
  mapLayer.selectAll('path')
    .style('fill', function(d){return centered && d===centered ? '#D5708B' : fillFn(d);});

  // Remove effect text
  effectLayer.selectAll('text').transition()
    .style('opacity', 0)
    .remove();

  // Clear neighborhood name
  bigText.text('');
}

var BASE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

var FONT = [
  "Open Sans"
];

function textArt(text){
  var fontFamily = FONT[0] + ', ' + BASE_FONT;

  bigText
    .style('font-family', fontFamily)
    .text(text);
}
d3.csv("/static/data/sfpd_dispatch_data_subset.csv", function(error, coordinates) {
    // add circles to svg
    g.selectAll("circle")
    .data(coordinates).enter()
    .append("circle")
    .attr("cx", function (d) { 
      coord = [Number(d.longitude), Number(d.latitude)];
      return projection(coord)[0]; 
    })
    .attr("cy", function (d) { 
      coord = [Number(d.longitude), Number(d.latitude)];
      return projection(coord)[1]; 
    })
    //.attr("r", "1px")
    .attr("r", function(d) {
      final = +d.final_priority
      if(final === 2) {
        return "1px";
      } else {
        return "0.4px";
      }
    })
    .attr("fill", "red")
});