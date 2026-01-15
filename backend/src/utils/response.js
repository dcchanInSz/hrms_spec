/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {Object} res - Express 响应对象
 * @param {Object} data - 响应数据
 * @param {string} message - 可选消息
 */
function success(res, data = null, message = '操作成功') {
  const response = {
    success: true,
    message,
    ...(data && { data }),
  };
  return res.json(response);
}

/**
 * 分页列表响应
 * @param {Object} res - Express 响应对象
 * @param {Array} items - 数据列表
 * @param {Object} pagination - 分页信息
 * @param {number} pagination.total - 总数
 * @param {number} pagination.page - 当前页
 * @param {number} pagination.limit - 每页数量
 */
function paginated(res, items, { total, page, limit }) {
  const totalPages = Math.ceil(total / limit);
  return res.json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

/**
 * 创建成功响应 (201)
 * @param {Object} res - Express 响应对象
 * @param {Object} data - 创建的资源数据
 * @param {string} message - 可选消息
 */
function created(res, data = null, message = '创建成功') {
  return res.status(201).json({
    success: true,
    message,
    ...(data && { data }),
  });
}

/**
 * 无内容响应 (204)
 * @param {Object} res - Express 响应对象
 */
function noContent(res) {
  return res.status(204).send();
}

module.exports = {
  success,
  paginated,
  created,
  noContent,
};
