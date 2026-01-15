const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { success, paginated } = require('../utils/response');
const PayStubService = require('../services/payStubService');

/**
 * GET /api/paystubs
 * 获取我的工资单列表
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { year, page, limit } = req.query;

    const result = await PayStubService.getMyPayStubs(req.user.id, {
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    paginated(res, result.data, {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/paystubs/:id
 * 获取工资单详情
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const paystub = await PayStubService.getMyPayStub(req.params.id, req.user.id);
    success(res, paystub);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/paystubs/summary/:year
 * 获取年度工资汇总
 */
router.get('/summary/:year', authMiddleware, async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    const summary = await PayStubService.getYearSummary(req.user.id, year);
    success(res, summary);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/paystubs/latest
 * 获取最新工资单
 */
router.get('/latest', authMiddleware, async (req, res, next) => {
  try {
    const latest = await PayStubService.getLatest(req.user.id);
    success(res, latest);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
