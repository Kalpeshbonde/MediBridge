import reviewModel from "../models/reviewModel.js";
import doctorModel from "../models/doctorModel.js";
import { assertObjectId, assertRequired } from "../utils/validators.js";

const addReview = async (req, res) => {
  try {
    const { userId } = req.body;
    const { docId } = req.params;
    const { rating, comment } = req.body;

    assertRequired({ userId, docId, rating });
    assertObjectId(userId, "userId");
    assertObjectId(docId, "docId");

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.error("Rating must be between 1 and 5.", 400);
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.error("Doctor not found.", 404);
    }

    await reviewModel.findOneAndUpdate(
      { userId, docId },
      { rating: numericRating, comment: comment || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const stats = await reviewModel.aggregate([
      { $match: { docId } },
      {
        $group: {
          _id: "$docId",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length) {
      const avg = Math.round(stats[0].avg * 10) / 10;
      await doctorModel.findByIdAndUpdate(docId, {
        ratingAvg: avg,
        ratingCount: stats[0].count,
      });
    } else {
      await doctorModel.findByIdAndUpdate(docId, { ratingAvg: 0, ratingCount: 0 });
    }

    return res.json({ success: true, message: "Review saved." });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const listReviews = async (req, res) => {
  try {
    const { docId } = req.params;
    assertObjectId(docId, "docId");
    const reviews = await reviewModel
      .find({ docId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

export { addReview, listReviews };
