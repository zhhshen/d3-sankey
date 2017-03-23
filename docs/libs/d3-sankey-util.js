// https://github.com/d3/d3
// depend on this plugin  https://github.com/d3/d3-sankey
/**
 * [renderSankey description]
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */
function renderSankey (opts) {
  // var el = opts.el + '-' + Math.random().toString(36).substring(2);
  var el = opts.el;
  var width = opts.layoutStyle.width || 600;
  var height = opts.layoutStyle.height || 400;
  var margin = opts.layoutStyle.margin || {top: 1, right: 1, bottom: 1, left: 1};
  var dataNodes = opts.data.nodes || [];
  var dataLinks = opts.data.links || [];
  // set color formate
  var formatNumber = d3.format(",.0f"),   //decimal places
  format = function(d) { return formatNumber(d) + ""; },
  color = d3.scaleOrdinal(d3.schemeCategory20);
  d3.select("#"+el).append('div').attr("class", "tooltip")
  //  set svg container
  var svg = d3.select("#"+el).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // use d3-sankey
  var sankey = d3.sankey()
  .nodeWidth(20)
  .nodePadding(10)
  .size([width, height]);

  var path = sankey.link();
  var toolTips = d3.select("#"+el).select(".tooltip");
  console.log(toolTips);
  sankey.nodes(dataNodes)
      .links(dataLinks)
      .layout(32);

  // set link
  var link = svg.append("g").selectAll(".link")
      .data(dataLinks)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) {
        return b.dy - a.dy;
      })
      .on('mouseover', function (d) {
          var coordinates = [0, 0];
          coordinates = d3.mouse(this);
          var x = coordinates[0];
          var y = coordinates[1];
          toolTips.html(function () {
            return d.source.name + "->" + d.target.name + "<br/>" + format(d.value);
          })
          toolTips.style("display", "block")
          toolTips.style("top", (y + 100) + "px")
          toolTips.style("left", (x + 50) + "px")
      })
      .on('mousemove', function (d) {
        var coordinates = [0, 0];
        coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];
        toolTips.html(function () {
          return d.source.name + "->" + d.target.name + "<br/>" + format(d.value);
        })
        toolTips.style("display", "block")
        toolTips.style("top", (y + 100) + "px")
        toolTips.style("left", (x + 50) + "px")
      })
      .on('mouseout', function (d, e) {
        var evt = window.event || e;
        mouseHas = false
        var obj=evt.toElement||evt.relatedTarget;
        var pa=this;
        if(pa.contains(obj)) return false;
        toolTips.style("display", "none")
      })
  // set node
  var node = svg.append("g").selectAll(".node")
      .data(dataNodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.drag()
      .subject(function(d) {
        return d;
      })
      .on("start", function() {
        this.parentNode.appendChild(this);
      })
      .on("drag", dragmove));

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.split("|")[0]); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .style("fill", "#666")
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
  function dragmove (d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
}
