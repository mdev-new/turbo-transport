"use strict";

import {
  gpsDistanceBetween,
  fetch_geojson,
  fetch_buses,
  midpoint,
  findClosestNode,
  isNodeAt
} from './utils.js'
import { OVERPASS_REQUEST, DPMP_APIKEY } from './constants.js'
import { Graph } from './Graph.js'
import { PathSearch } from './PathSearch.js'

// overlapping pairs
// [1, 2, 3, 4] -> [[1, 2], [2, 3], [3, 4]]
function overlapping_pairs(arr) {
  let result = []
  for (let i = 1; i < arr.length; i++) {
    result.push([arr[i-1], arr[i]])
  }

  return result
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

  constructor(path, meanOftransport, lines = []) {
    this.meanOfStransport = meanOftransport;
    this.path = path;
    this.pubtran_lines = lines;

    // Sum the distance of the path segments.
    const sumDistance = (accum, current) =>
      accum + gpsDistanceBetween(current[0].toReversed(), current[1].toReversed())

    this.length = overlapping_pairs(path).reduce(sumDistance, 0)
  }
}

function parse_geo(geo) {

  let nodes = []
  let edges = []

  // 1st stage - Loading the data from the JSON

  const features = geo.features;

  const points = features.filter(feature => feature.geometry.type === 'Point')
  const line_strings = features.filter(feature => feature.geometry.type === 'LineString')
  const multiline_strings = features.filter(feature => feature.geometry.type === 'MultiLineString')

  //console.dir(multiline_strings.map(s => s.geometry.coordinates), {depth: null})

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

    // Let's let Overpass do the filtering
    if (properties.highway) {
      return new Path(coords, 'foot')
    }

    return null
  }).filter(n => n !== null)

  const resultSets = multiline_strings.map(mls => {
    const properties = mls.properties
    const coords = mls.geometry.coordinates

    if(properties.type === 'route' || properties.route !== undefined) {

      const results = []

      for(const set of coords) {
        results.push(new Path(set, 'public', [properties.ref]))
      }

      return results
    }

    return [];
  })

  for(const r of resultSets) {
    for (const j of r) {
      edges.push(j)
    }
  }

  console.log(edges.length, nodes.length)

  // 2nd stage - Post processing our loaded data, so it
  // has some sort of connectivity

  console.log(`Items to process: ${edges.length * nodes.length}`)

  let itemsToProcess = edges.slice();
  const segmentLen = 3/1000; // in km

  while(itemsToProcess.length !== 0) {
    process.stderr.write(`\r${itemsToProcess.length}/${edges.length} (iters:${itemsToProcess.length * nodes.length})`)
    let currentEdge = itemsToProcess.pop()

    // This iterates over the straight-line segments of the path
    overlapping_pairs(currentEdge.path).forEach((seg, segno) => {
      //console.log(seg)
      const segLength = gpsDistanceBetween(seg[0].toReversed(), seg[1].toReversed())

      const segments = Math.floor(segLength / segmentLen)

      const [startLon, startLat] = seg[0]
      const [endLon, endLat] = seg[1]

      const dSegLat = (endLat - startLat) / segments
      const dSegLon = (endLon - startLon) / segments

      // For each sub-segment, compute the midpoint and its distance from
      // the nearest node
      for (let i = 1; i < segments; i++) {
        const seg_start_lat = startLat + ((i - 1) * dSegLat)
        const seg_start_lon = startLon + ((i - 1) * dSegLon)

        const seg_end_lat = startLat + (i * dSegLat)
        const seg_end_lon = startLon + (i * dSegLon)

        const mid = midpoint(
          [seg_start_lat, seg_start_lon],
          [seg_end_lat, seg_end_lon]
        )

        const [closestN, minDist] = findClosestNode(nodes, mid)

        if(minDist < 5 && segno !== 0) {

          edges = edges.filter(item => item !== currentEdge)

          let newPath = currentEdge.path.slice(0, segno)
          newPath.push([closestN.lon, closestN.lat])
          edges.push(new Path(newPath, currentEdge.meanOfStransport))

          let newPath2 = currentEdge.path.slice(segno+1, currentEdge.path.length)
          newPath2.unshift([closestN.lon, closestN.lat])
          itemsToProcess.push(new Path(newPath2, currentEdge.meanOfStransport))

          return;
        }
      }

      /* else { // this doesn't make any sense
        // I guess let's create nodes at the edges?
        const lastIndex = currentEdge.path.length-1

        const [beginLon, beginLat] = currentEdge.path[0]
        const [endLon, endLat] = currentEdge.path[lastIndex]

        const start = new Stop(beginLat, beginLon)
        const end = new Stop(endLat, endLon)

        nodes.push(start)
        nodes.push(end)
      }*/

    })

  }

  // 3rd (and final) stage - Loading the data into a graph.

  //console.log(nodes)
  //console.dir(edges, {depth: null})
  //process.stdout.write(JSON.stringify(edges))

  const graph = new Graph();

  for (const edge of edges) {
    const n1 = isNodeAt(nodes, edge.path[0].toReversed());
    const n2 = isNodeAt(nodes, edge.path[edge.path.length-1].toReversed());

    if (n1 !== null && n2 !== null) {
      if (edge.meanOfStransport === 'foot') {
        graph.addWayBothDirs(n1, n2, edge)
      } else {
        graph.addWaySingleDir(n1, n2, edge)
      }
    }
  }

  return graph

}

// This is the main procedure.
fetch_geojson(OVERPASS_REQUEST, (geojson) => {

  const graph = parse_geo(geojson)
  graph.print()
  //console.log(nodes, edges)
  const searcher = new PathSearch(graph)

  fetch_buses(DPMP_APIKEY, (buses) => {

    const start = "Namesti republiky"
    const end = "Strossova"
    const path = searcher.search(start, end, 5, buses)
    //console.log(path)
  })

})
