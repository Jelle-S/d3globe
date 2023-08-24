const width = 250;
const height = 250;
const margin = 50;
let locations = [];

const svg = d3.select('svg').attr('width', width+margin).attr('height', height+margin);
const globeGroup = svg.append('g').attr('width', width).attr('height', height).attr('transform', 'translate(' + margin/2 + ', ' + margin/2 + ')');
const labelsGroup = svg.append('g').attr('width', width+margin).attr('height', height+margin).attr('transform', 'translate(' + margin/2 + ', ' + margin/2 + ')');
let projection, path, gCurrentLat, gCurrentLng;
//const projection = d3.geoOrthographic();
//const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];

const _countrySelect = document.getElementById('country');
_countrySelect.addEventListener('change', handleOnChange);

//let [gCurrentLat, gCurrentLng] = projection.invert(center);

drawGlobe();
drawGraticule();
loadCountries();

function drawGlobe() {
  d3.json('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')
    .then(worldData => {
      const featureCollection = topojson.feature(worldData, worldData.objects.countries);
      projection = d3.geoOrthographic().fitSize([width, height], featureCollection);
      path = d3.geoPath().projection(projection);
      [gCurrentLat, gCurrentLng] = projection.invert(center);
      globeGroup.selectAll(".segment")
        .data(featureCollection.features)
        .enter().append("path")
        .attr("class", "segment")
        .attr("d", path)
        .style("stroke", "darkgreen")
        .style("stroke-width", "1px")
        .style("fill", (d, i) => 'darkgreen');
    })
    .catch(error => console.error('Error loading world data:', error));
}

function drawGraticule() {
  globeGroup.append('circle').attr('cx', center[0]).attr('cy', center[1]).style('stroke', 'darkgreen').attr('r', center[0]).style('fill', 'white');
  svg.append('defs').append('circle').attr('cx', center[0]).attr('cy', center[1]).attr('r', center[0]+10).attr('id', 'labelspath');
}

function showCountry(lat, lng) {
  d3.transition()
    .duration(1000)
    .tween("rotate", () => {
      const r = d3.interpolate([-gCurrentLng, -gCurrentLat], [-lng, -lat]);
      return t => {
        projection.rotate(r(t));
        globeGroup.selectAll("path").attr("d", path);
      };
    })
    .on("end", () => {
      drawMarker(lat, lng);
      gCurrentLat = lat;
      gCurrentLng = lng;
    });
}

function drawMarker(lat, lng) {
  globeGroup.append("circle")
    .attr('cx', projection([lng, lat])[0])
    .attr('cy', projection([lng, lat])[1])
    .attr('fill', 'red')
    .attr('r', 3);
}

function loadCountries() {
  countries.every((country, index) => {
    const labels = labelsGroup.append("text").attr("fill", "black");
    const textPath = labels.append("textPath")
      .attr('xlink:href', '#labelspath')
      .attr('startOffset', 25*index + '%');
    textPath.append('a').attr('href', '#').text(country.name);
    return index < 3;
  });
}

function handleOnChange(e) {
  if (!e || !e.target || !e.target.value) {
    return;
  }

  const selectedCountry = countries.find(country => country.name === e.target.value);

  if (!selectedCountry) {
    alert('Country not found!');
  }

  showCountry(selectedCountry.latitude, selectedCountry.longitude);
}

