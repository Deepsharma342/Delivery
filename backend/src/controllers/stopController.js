import Stop from "../models/Stop.js";
import { getCoordinatesFromPostcode } from "../services/geocodeService.js";

export const createStop = async (req, res) => {
  try {
    const { postcode } = req.body;

    if (!postcode) {
      return res.status(400).json({
        success: false,
        message: "Postcode is required",
      });
    }

    const coordinates = await getCoordinatesFromPostcode(postcode);

    const stop = await Stop.create({
      postcode: postcode.trim().toUpperCase(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });

    res.status(201).json({
      success: true,
      data: stop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStops = async (req, res) => {
  try {
    const stops = await Stop.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stops.length,
      data: stops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    await stop.deleteOne();

    res.status(200).json({
      success: true,
      message: "Stop deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ NEW — deletes every stop in the DB
export const deleteAllStops = async (req, res) => {
  try {
    const result = await Stop.deleteMany({});

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} stops`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkCreateStops = async (req, res) => {
  try {
    const { postcodes } = req.body;

    if (!postcodes || !Array.isArray(postcodes)) {
      return res.status(400).json({
        success: false,
        message: "Postcodes array required",
      });
    }

    const stops = [];

    for (const postcode of postcodes) {
      const cleanPostcode = postcode.trim().toUpperCase();
      const coordinates = await getCoordinatesFromPostcode(cleanPostcode);

      stops.push({
        postcode: cleanPostcode,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
    }

    const createdStops = await Stop.insertMany(stops);

    res.status(201).json({
      success: true,
      count: createdStops.length,
      data: createdStops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    stop.completed = true;
    await stop.save();

    res.status(200).json({
      success: true,
      data: stop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};