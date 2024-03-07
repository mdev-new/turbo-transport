"use strict";

import {
  gpsDistanceBetween,
  fetch_geojson,
  fetch_buses,
  midpoint,
  findClosestNode,
  isNodeAt,
  overlapping_pairs, perpendicularDistance2
} from './utils.js'
import { OVERPASS_REQUEST, DPMP_APIKEY } from './constants.js'
import { Graph } from './Graph.js'
import { PathSearch } from './PathSearch.js'
import {Path, Stop} from "./DataStructures.js";

/*
TODO:
 - Path splitting and joining
 - Search
*/

function parse_geo(geo) {

  let nodes = []
  let edges = []

  // 1st stage - Loading the data from the JSON

  const features = geo.features;

  const points = features.filter(feature => feature.geometry.type === 'Point')
  const line_strings = features.filter(feature => feature.geometry.type === 'LineString')
  const multiline_strings = features.filter(feature => feature.geometry.type === 'MultiLineString')

  for (const point of points) {
    const coords = point.geometry.coordinates

    if(point.properties.public_transport === 'platform') {
      nodes.push(new Stop(coords[1], coords[0], point.properties.name))
    }
  }

  for (const ls of line_strings) {
    const properties = ls.properties
    const coords = ls.geometry.coordinates

    // Let's let Overpass do the filtering
    if (properties.highway) {
      const edge = new Path(coords, 'foot')
      edges.push(edge)

      if(!isNodeAt(nodes, edge.path[0].toReversed())) {
        nodes.push(new Stop(...edge.path[0].toReversed()))
      }

      if(!isNodeAt(nodes, edge.path[edge.path.length-1].toReversed())) {
        nodes.push(new Stop(...edge.path[edge.path.length-1].toReversed()))
      }

    }
  }

  for(const mls of multiline_strings) {
    const properties = mls.properties
    const coords = mls.geometry.coordinates

    if(properties.type === 'route' || properties.route !== undefined) {

      for(const set of coords) {
        edges.push(new Path(set, 'public', [properties.ref]))
      }

    }
  }

  console.log(edges.length, nodes.length)

  // 2nd stage - Post processing our loaded data, so it
  // has some sort of connectivity

  const edge_to_node_map = new Map()

  let brk = false;
  for (const edge of edges) {
    edge_to_node_map.set(edge, new Set())

    for (const [p1, p2] of overlapping_pairs(edge.path)) {
      for (const node of nodes) {
        const distanceToNode = perpendicularDistance2([node.lat, node.lon], p1.toReversed(), p2.toReversed()) * 1000
        if(distanceToNode < 10) {
          edge_to_node_map.get(edge).add(node)
          //console.log(`Near node: ${node.name} (${distanceToNode}m) - Edge len:${edge.length} transport:${edge.meanOfStransport}`)
          brk = true;
        }
        if(brk) break;
      }
      if(brk) break;
    }
    brk = false;
  }

  //console.log(edge_to_node_map)

  //console.log(edge_to_node_map.entries())

  // Stage 3 - The graph
  let graph = new Graph();

  for(const [edge, nodes] of edge_to_node_map.entries()) {
    const nodesArr = Array.from(nodes)

    for(let i = 0; i < nodesArr.length; i++) {
      for(let j = 0; j < nodesArr.length; j++) {
        if (i === j) continue;

        const n1 = nodesArr[i]
        const n2 = nodesArr[j]

        if(edge.meanOfStransport === 'foot') {
          graph.addWayBothDirs(n1, n2, edge)
        } else {
          //console.log('Adding: ', n1, n2, edge)
          graph.addWaySingleDir(n1, n2, edge)
        }
      }
    }
  }

  return graph

}

// This is the main procedure.
fetch_geojson(OVERPASS_REQUEST, (geojson) => {

  const graph = parse_geo(geojson)
  console.log(graph.length)
  graph.print()
  //console.log(nodes, edges)
  const searcher = new PathSearch(graph)

  //fetch_buses(DPMP_APIKEY, (buses) => {

    const start = "Namesti republiky"
    const end = "Strossova"
    const path = searcher.search(start, end, 5, [])
    //console.log(path)
  //})

})
