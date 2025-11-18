const PlacementRecord = require('../../models/reports.model');

// GET /admin/placement-report
// Aggregates placement records by company to return company-wise totals,
// overall total and top company.
const getPlacementReport = async (req, res) => {
  try {
    const { year } = req.query;

    // Build aggregation pipeline: group by company+year, then lookup company info correctly
    const pipeline = [
      ...(year ? [{ $match: { year: parseInt(year) } }] : []),
      { $group: { _id: { company: '$company', year: '$year' }, totalPlaced: { $sum: '$totalPlaced' } } },
      // expose companyId and year at root so $lookup can reference it
      { $addFields: { companyId: '$_id.company', year: '$_id.year' } },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, companyId: 1, companyName: { $ifNull: ['$company.companyName', null] }, totalPlaced: 1, year: 1 } },
      { $sort: { totalPlaced: -1 } }
    ];

    const results = await PlacementRecord.aggregate(pipeline);

    // Also return list of available years in the collection so frontend can build a dynamic dropdown
    const years = await PlacementRecord.distinct('year');
    years.sort((a, b) => b - a);

    const overallTotal = results.reduce((acc, r) => acc + (r.totalPlaced || 0), 0);
    const topCompany = results.length > 0 ? results[0] : null;

    return res.json({ placementReport: results, overallTotal, topCompany, years });
  } catch (error) {
    console.error('placement.controller =>', error);
    return res.status(500).json({ msg: 'Internal Server Error' });
  }
}

module.exports = {
  getPlacementReport,
};
