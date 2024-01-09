import LogModel from '../model/log.model.js';

const getLogs = async (req, res) => {
  const { page } = req.query;

  try {
    const LIMIT = 10;
    const startIndex = (Number(page) - 1) * LIMIT || 1;

    const total = await LogModel.countDocuments({});
    const logs = await LogModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          user_id: '$user.name',
          created_at: 1,
          event_type: 1,
          code:1,
          request_url: 1,
        },
      },
    ]).sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        res.status(404).json({ message: error.message });
      });
    res.json({
      data: logs,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export { getLogs };
