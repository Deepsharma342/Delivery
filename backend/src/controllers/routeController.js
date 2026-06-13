import Stop from "../models/Stop.js";
import { getCoordinatesFromPostcode } from "../services/geocodeService.js";
import { optimizeRoute } from "../services/deepanshu.js";

export const optimizeStops = async (req, res) => {
  try {
    const { depotPostcode } = req.body;

    if (!depotPostcode) {
      return res.status(400).json({
        success: false,
        message: "Depot postcode required",
      });
    }

    // Geocode the depot
    const depotCoordinates = await getCoordinatesFromPostcode(depotPostcode);

    if (!depotCoordinates.latitude || !depotCoordinates.longitude) {
      return res.status(400).json({
        success: false,
        message: `Could not find coordinates for depot postcode: ${depotPostcode}`,
      });
    }

    // Fetch only incomplete stops
    const stops = await Stop.find({ completed: false });

    if (stops.length === 0) {
      return res.status(200).json({
        success: true,
        totalStops: 0,
        data: [],
      });
    }

    // Filter out any stops with missing coordinates
    const validStops = stops.filter(
      (stop) => stop.latitude != null && stop.longitude != null
    );

    const skippedStops = stops.length - validStops.length;
    if (skippedStops > 0) {
      console.warn(`Skipped ${skippedStops} stops with missing coordinates`);
    }

    // Run optimization
    const optimizedStops = optimizeRoute(
      {
        latitude: depotCoordinates.latitude,
        longitude: depotCoordinates.longitude,
      },
      validStops
    );

    res.status(200).json({
      success: true,
      totalStops: optimizedStops.length,
      skippedStops,
      data: optimizedStops, // ✅ array is here, frontend reads .data.data
    });

  } catch (error) {
    console.error("Optimize error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};