/**
 * 分页工具函数
 * @param {Object} options - 分页选项
 * @param {number} options.page - 当前页码 (从 1 开始)
 * @param {number} options.limit - 每页数量
 * @param {number} options.total - 总记录数
 * @returns {Object} 分页信息对象
 */
function getPaginationMeta({ page = 1, limit = 20, total = 0 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const totalNum = Math.max(0, parseInt(total, 10) || 0);
  const totalPages = Math.ceil(totalNum / limitNum);
  const offset = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    total: totalNum,
    totalPages,
    hasNext: pageNum < totalPages,
    hasPrev: pageNum > 1,
    offset,
  };
}

/**
 * 解析分页参数
 * @param {Object} query - Express query 对象
 * @returns {Object} { page, limit, offset, ...rest }
 */
function parsePaginationParams(query) {
  const { page = '1', limit = '20', sort, order, ...filters } = query;

  const meta = getPaginationMeta({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return {
    ...meta,
    sort: sort || 'created_at',
    order: order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    filters,
  };
}

/**
 * 构建分页响应
 * @param {Array} data - 数据数组
 * @param {Object} meta - 分页元信息
 * @returns {Object} 标准分页响应格式
 */
function paginatedResponse(data, meta) {
  return {
    data,
    pagination: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: meta.totalPages,
      hasNext: meta.hasNext,
      hasPrev: meta.hasPrev,
    },
  };
}

/**
 * Express 中间件：自动处理分页
 * @param {Object} options - 选项
 * @param {string} options.defaultLimit - 默认每页数量
 * @param {string} options.maxLimit - 最大每页数量
 */
function paginationMiddleware(options = {}) {
  const { defaultLimit = 20, maxLimit = 100 } = options;

  return (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(
      maxLimit,
      parseInt(req.query.limit, 10) || defaultLimit
    );
    const offset = (page - 1) * limit;

    req.pagination = {
      page,
      limit,
      offset,
      sort: req.query.sort || 'created_at',
      order: req.query.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    };

    next();
  };
}

module.exports = {
  getPaginationMeta,
  parsePaginationParams,
  paginatedResponse,
  paginationMiddleware,
};