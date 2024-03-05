"use strict";

import {gpsDistanceBetween, fetch_geojson, fetch_buses, midpoint} from './utils.js'
import { OVERPASS_REQUEST, DPMP_APIKEY } from './constants.js'
import { Graph, GraphEntry } from './Graph.js'
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

function parse_geo(geo) {

  let nodes = []
  let edges = []

  // 1st stage - Loading the data from the JSON

  const features = geo.features;

  const points = features.filter(feature => feature.geometry.type === 'Point')
  const line_strings = features.filter(feature => feature.geometry.type === 'LineString')
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

    //console.log(coords)

    // Let's let Overpass do the filtering
    if (properties.highway) {
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

  // 2nd stage - Post processing our loaded data, so it
  // has some sort of connectivity

  console.log(`Items to process: ${edges.length * nodes.length}`)

  let itemsToProcess = edges.slice();
  let result_edges = [];
  //let newNodes = nodes.slice();
  const segmentLen = 3/1000; // in km

  while(itemsToProcess.length !== 0) {
    process.stdout.write(`\r${itemsToProcess.length}/${edges.length} (items:${itemsToProcess.length * nodes.length})`)
    let currentPath = itemsToProcess.pop()

    overlapping_pairs(currentPath.path).forEach(seg => {
      //console.log(seg)
      const dist = gpsDistanceBetween(seg[0].toReversed(), seg[1].toReversed())

      const segments = Math.floor(dist / segmentLen)

      const [startLon, startLat] = seg[0]
      const [endLon, endLat] = seg[1]

      const dSegLat = (endLat - startLat) / segments
      const dSegLon = (endLon - startLon) / segments

      //console.log(`${startLat} ${endLat} ${startLon} ${endLon} ${dSegLat} ${dSegLon}`)

      for (let i = 1; i < segments; i++) {
        const seg_start_lat = startLat + ((i - 1) * dSegLat)
        const seg_start_lon = startLon + ((i - 1) * dSegLon)

        const seg_end_lat = startLat + (i * dSegLat)
        const seg_end_lon = startLon + (i * dSegLon)

        const mid = midpoint(
            [seg_start_lat, seg_start_lon],
            [seg_end_lat, seg_end_lon]
        ).map(r => r * 180 / Math.PI) // convert back to deg

        // This figures out the minimum distance
        // between the mids of segments and closest node to
        // each one of those segments
        let min = 9999999999999;
        let minIdx = 0;
        for(let i = 0; i < nodes.length; i++) {
          const n = nodes[i]
          const dist = gpsDistanceBetween(mid, [n.lat, n.lon]) * 1000
          if(min > dist) {
            min = dist;
            minIdx = i;
          }
        }

        // if we're within 5m of an stop
        if (min < 5) {
          // This path is now finalized, connected to a node
          const newPath = currentPath.path.slice(0, minIdx)
          newPath.push([nodes[minIdx].lon, nodes[minIdx].lat])
          const newEdge = new Path(newPath, currentPath.meanOfStransport)

          result_edges.push(newEdge)

          // The remaining part of the edge
          const newPath2 = currentPath.path.slice(minIdx, -1)
          const newEdge2 = new Path(newPath2, currentPath.meanOfStransport)

          itemsToProcess.push(newEdge2)
        } else {
          // I guess let's create nodes at the edges?
          const lastIndex = currentPath.path.length-1

          const [beginLon, beginLat] = currentPath.path[0]
          const [endLon, endLat] = currentPath.path[lastIndex]

          const start = new Stop(beginLat, beginLon)
          const end = new Stop(endLat, endLon)

          nodes.push(start)
          nodes.push(end)

          // We don't need to do anything with the edge, so just keep it
          result_edges.push(currentPath)
        }
      }

    })

  }

  // 3rd (and final) stage - Loading the data into a graph.

  const graph = new Graph();

  for (const node of nodes) {
    graph.addNode(node)
  }

  for (const edge of result_edges) {
    const n1 = nodes.filter(n => n.lat === edge.path[0][0] && n.lon === edge.path[0][1])[0];
    const n2 = nodes.filter(n => n.lat === edge.path[edge.path.length-1][0] && n.lon === edge.path[edge.path.length-1][1])[0];

    if (edge.meanOfStransport === 'foot') {
      graph.addWayBothDirs(n1, n2, edge)
    } else {
      graph.addWaySingleDir(n1, n2, edge)
    }
  }

  return graph

}

// This is the main procedure.
fetch_geojson(OVERPASS_REQUEST, (geojson) => {

  const graph = parse_geo(geojson)
  //console.log(nodes, edges)

  const searcher = new PathSearch(graph, 5, [])

  const start = "Namesti republiky"
  const end = "Strossova"
  const path = searcher.search(start, end)
  //console.log(path)

})
