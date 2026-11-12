/**
 * 认证相关接口
 * 官方路由来源：backend/router/api-router.go
 *
 * 官方认证模型（读 controller/user.go 得出）：
 *   登录 → data.access_token（放 Authorization: Bearer）
 *   令牌过期 → POST /api/user/auth/refresh，靠 HttpOnly 的 refresh cookie 换新令牌
 */

import { ApiError, http, request, setAccessToken, setRefreshHandler } from './client';
import type { LoginInput, LoginResponse, SelfUser } from '@portal/types';

/**
 * 用 refresh cookie 换新 access token，返回新令牌；换不到返回 null
 *
 * 并发去重：页面同时发多个请求时都会 401，只能触发一次刷新，
 * 否则后端的「刷新竞态保护」会返回 409。
 */
let pendingRefresh: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (pendingRefresh) return pendingRefresh;

  pendingRefresh = (async () => {
    try {
      // skipAuthRefresh：续期请求自己不能再触发续期，否则自己等自己、永远 pending
      const data = await request<{
        access_token?: string;
        token_type?: string;
      }>('/api/user/auth/refresh', { method: 'POST', skipAuthRefresh: true });
      if (data?.access_token) {
        setAccessToken(data.access_token);
        return data.access_token;
      }
      return null;
    } catch (error) {
      // 只有「明确的没有有效会话」才算掉登录。
      // 限流（429）、服务端错误（5xx）、网络异常都不能判定为掉登录——
      // 否则用户明明还登着，会因为一次限流被踢回登录页，等于被动退出登录。
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setAccessToken(null);
        return null;
      }
      throw error;
    } finally {
      pendingRefresh = null;
    }
  })();

  return pendingRefresh;
}

// 注入到请求层：任何接口遇到 401 都会先尝试续期一次
setRefreshHandler(refreshAccessToken);

/** POST /api/user/login —— 成功后保存令牌 */
export async function login(input: LoginInput): Promise<LoginResponse> {
  const data = await http.post<LoginResponse>('/api/user/login', input);
  if (data?.access_token) {
    setAccessToken(data.access_token);
  }
  return data;
}

/**
 * POST /api/user/auth/logout —— 作废当前会话，并清掉 refresh / 提示两个 cookie
 *
 * 必须是 POST 且路径带 /auth：refresh cookie 的 Path 就是 /api/user/auth，
 * 只有请求落在这个前缀下，浏览器才会把它带上，后端的「清 cookie」分支才有机会执行。
 * 旧写法 GET /api/user/logout 这条路由根本不存在，会落到别的处理上返回 403——
 * 结果就是本地令牌清了、服务端会话还在，回到官网仍显示已登录。
 */
export async function logout(): Promise<null> {
  try {
    return await http.post<null>('/api/user/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

/** POST /api/user/register */
export function register(input: {
  username: string;
  password: string;
  password2: string;
  email?: string;
  verification_code?: string;
  aff_code?: string;
}) {
  return http.post<null>('/api/user/register', input);
}

/** GET /api/user/self —— 当前登录用户（含余额、已用额度、请求次数） */
export function getSelf() {
  return http.get<SelfUser>('/api/user/self');
}

/** GET /api/status —— 站点公开配置（站点名、是否允许注册等） */
export function getStatus() {
  return http.get<Record<string, unknown>>('/api/status');
}

/**
 * GET /api/reset_password?email= —— 发送重置邮件
 *
 * 官方行为（controller/misc.go）：
 *   邮箱存在就发信、不存在也返回 success（防账号枚举），所以前端一律按"已发送"处理。
 *   邮件里的链接形如 {ServerAddress}/user/reset?email=..&token=..，
 *   控制台必须有 /user/reset 这个路径，否则用户点进去会 404。
 *   发不出信（未配邮件服务）后端只记日志、仍回 success —— 所以页面要提示"没收到就联系管理员"。
 */
export function sendPasswordResetEmail(email: string) {
  return http.get<null>('/api/reset_password', { email });
}

/**
 * POST /api/user/reset —— 用邮件里的 token 重置密码
 *
 * 官方不是让用户自己填新密码，而是**生成一个随机密码直接返回**（data 字段）。
 * 页面必须把它明确展示给用户，并让用户登录后立即修改。
 */
export function resetPassword(input: { email: string; token: string }) {
  return http.post<string>('/api/user/reset', input);
}

/**
 * 确保有可用登录态：
 * 页面刷新后内存里的令牌没了，但 refresh cookie 还在，用它静默续期。
 */
export async function ensureSession(): Promise<boolean> {
  const token = await refreshAccessToken();
  return Boolean(token);
}
