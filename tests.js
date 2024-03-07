import {gpsDistanceBetween, midpoint, perpendicularDistance, perpendicularDistance2} from "./utils.js";

const lat1 = 50;
const lon1 = 15;

const lat2 = 0;
const lon2 = 0;

/*function test_midpoint() {
    let result;
    if((result = midpoint([lat1, lon1], [lat2, lon2])) !== [25.18, 5.860278]) {
        console.error("Midpoint is wrong!" + result.map(r => r * 180 / Math.PI))
    } else {
        console.info("Midpoint checks out")
    }
}*/

function test_distance() {
    let result;
    if(Math.round(result = gpsDistanceBetween([lat1, lon1], [lat2, lon2])) !== 5740) {
        console.error("Distance is wrong!" + result)
    } else {
        console.info("Distance checks out")
    }
}

function test_perpendicular() {
    console.log(perpendicularDistance2([50.25597207963554, 15.763214133314348], [50.257616844001774, 15.760182489620327], [50.256131816156056, 15.76751003525883]) * 1000)
}

/* MAIN */
//test_midpoint()
test_distance()
test_perpendicular()

// both Midpoint and Distance work as they should