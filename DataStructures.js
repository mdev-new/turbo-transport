
// This is the "Node"
import {gpsDistanceBetween, overlapping_pairs} from "./utils.js";

export class Stop {
  lat = 0.0;
  lon = 0.0;
  name = "";

  constructor(lat, lon, name) {
    this.lat = lat;
    this.lon = lon;
    if(name) {
      this.name = name;
    }
  }
}

// This is the "edge"
export class Path {
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