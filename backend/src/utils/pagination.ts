/**
 * 计算分页偏移量
 * @param page - 当前页码
 * @param limit - 每页数量
 * @returns 偏移量和限制
 */
function calculateOffset(page: number, limit: number): { offset: number; limit: number } {
  const offset: number = (page - 1) * limit;
  return { offset, limit };
}

/**
 * 从查询参数获取分页参数
 * @param query - Express 查询对象
 * @returns 分页参数
 */
function getPaginationParams(query: any): { page: number; limit: number; offset: number } {
  const page: number = parseInt(query.page || '1', 10);
  const limit: number = parseInt(query.limit || '10', 10);

  // 限制每页最大数量
  const maxLimit: number = 100;
  const finalLimit: number = Math.min(limit, maxLimit);

  return {
    page: Math.max(1, page),
    limit: finalLimit,
    offset: calculateOffset(page, finalLimit).offset,
  };
}

/**
 * 创建分页元数据
 * @param total - 总数量
 * @param page - 当前页
 * @param limit - 每页数量
 * @returns 分页元数据
 */
function createMeta(total: number, page: number, limit: number) {
  const totalPages: number = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export {
  calculateOffset,
  getPaginationParams,
  createMeta,
};

export default {
  calculateOffset,
  getPaginationParams,
  createMeta,
};
