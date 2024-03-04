import { AStar } from './AStar-generic.js'
import {gpsDistanceBetween, fetch_geojson, fetch_buses, midpoint} from './utils.js'
import { OVERPASS_REQUEST, DPMP_APIKEY } from './constants.js'
import { Graph, GraphEntry } from './Graph.js'
import { PathSearch } from './PathSearch.js'

// overlapping pairs
// [1, 2, 3, 4] -> [[1, 2], [2, 3], [3, 4]]
function overlapping_pairs(arr) {
  return arr.map((_, i, array) => [array[i], array[i+1]])
}

/*
TODO:
 - Path splitting and joining
 - Search
*/

// This is the "Node"
class Stop {
  lat = 0.0;
  lon = 0.0;
  name = "";

  constructor(lat, lon, name) {
    this.lat = lat;
    this.lon = lon;
    this.name = name;
  }
}

// This is the "edge"
class Path {
  path = [];
  pubtran_lines = [];
  meanOfStransport = "";
  length = 0.0;

  constructor(path, meanOfStransport, lines = []) {
    this.meanOfStransport = meanOfStransport;
    this.path = path;
    this.pubtran_lines = lines;

    // Sum the distance of the path segments.
    const sumDistance = (accum, current) =>
      accum + gpsDistanceBetween(current[0].toReversed(), current[1].toReversed())

    this.length = overlapping_pairs(path).reduce(sumDistance, 0)
  }
}


// I need to track the current time somehow - i don't
// the current time is just start_time+sum(taken_edges.map(e => e.cost))

function parse_geo(geo) {

  let nodes = []
  let edges = []

  const features = geo.features;

  const points = features.filter(feature => feature.geometry.type === 'Point')
  const line_strings = features.filter(feature => feature.geometry.type === 'Point')
  const multiline_strings = features.filter(feature => feature.geometry.type === 'MultiLineString')

  nodes = points.map(point => {
    const coords = point.geometry.coordinates

    if(point.properties.public_transport === 'platform') {
      return new Stop(coords[1], coords[0], point.properties.name)
    }

    return null
  }).filter(n => n !== null)


  edges = line_strings.map(linestring => {
    const properties = linestring.properties
    const coords = linestring.geometry.coordinates

    if (
      ['footway', 'pedestrian', 'path', 'steps', 'sidewalk', 'cycleway', 'service', 'residential', 'living_street']
        .includes(properties.highway)
    ) {
      return new Path(coords, 'foot')
    }

    return null
  }).filter(n => n !== null)

  //     case 'MultiLineString': {
  //       if(properties.type === 'route' || properties.route !== undefined) {
  //         const edge = new Path(/* todo coords */[], 'public', [properties.ref])
  //         edges.push(edge)
  //       }

  //       break;
  //     }


  let itemsToProcess = edges;
  const segmentLen = 5/1000;

  while(itemsToProcess.length !== 0) {
    let currentPath = itemsToProcess.pop()

    overlapping_pairs(currentPath.path).forEach(seg => {
      const dist = gpsDistanceBetween(seg[0].toReversed(), seg[1].toReversed())

      const segments = Math.floor(dist / segmentLen)

      const startLat = seg[0][0]
      const endLat = seg[1][0]

      const startLon = seg[0][1]
      const endLon = seg[1][1]

      const dSegLat = (endLat - startLat) / segments
      const dSegLon = (endLon - startLon) / segments

      for (let i = 1; i < segments; i++) {
        const seg_start_lat = startLat + ((i - 1) * dSegLat)
        const seg_start_lon = startLon + ((i - 1) * dSegLon)

        const seg_end_lat = startLat + (i * dSegLat)
        const seg_end_lon = startLon + (i * dSegLon)

        const [mLat, mLon] = midpoint(
            [seg_start_lat, seg_start_lon],
            [seg_end_lat, seg_end_lon]
        )
      }

    })

  }

  return nodes

}

// This is the main procedure.
fetch_geojson(OVERPASS_REQUEST, (geojson) => {

  const nodes = parse_geo(geojson)
  //console.log(nodes, edges)

  const searcher = new PathSearch(nodes)

  const start = "Namesti republiky"
  const end = "Strossova"
  const path = searcher.search(start, end)
  //console.log(path)

})
