import { Response } from 'express';

// 成功响应
function success(res: Response, data: any, message: string = 'Success'): Response {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
}

// 错误响应
function error(res: Response, error: Error | string, status: number = 500): Response {
  const errorMessage = typeof error === 'string' ? error : error.message;
  return res.status(status).json({
    success: false,
    message: errorMessage,
    error: typeof error === 'string' ? error : error.message,
  });
}

// 分页响应
function paginated(
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number
): Response {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

// 创建响应
function created(res: Response, data: any, message: string = 'Created successfully'): Response {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
}

// 无内容响应
function noContent(res: Response, message: string = 'No content'): Response {
  return res.status(204).json({
    success: true,
    message,
  });
}

export {
  success,
  error,
  paginated,
  created,
  noContent,
};

export default {
  success,
  error,
  paginated,
  created,
  noContent,
};
