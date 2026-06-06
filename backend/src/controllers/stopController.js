import Stop from "../models/Stop.js";

export const createStop = async (req, res) => {
  try {
    const { postcode } = req.body;

    if (!postcode) {
      return res.status(400).json({
        success: false,
        message: "Postcode is required",
      });
    }

    const stop = await Stop.create({
      postcode,
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