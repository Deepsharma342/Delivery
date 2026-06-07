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

    const depotCoordinates =
      await getCoordinatesFromPostcode(depotPostcode);

    const stops = await Stop.find({
      completed: false,
    });

    const optimizedStops = optimizeRoute(
      {
        latitude: depotCoordinates.latitude,
        longitude: depotCoordinates.longitude,
      },
      stops
    );

    res.status(200).json({
      success: true,
      totalStops: optimizedStops.length,
      data: optimizedStops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};