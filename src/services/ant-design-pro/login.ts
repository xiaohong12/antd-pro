// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
/** 发送验证码 POST /api/login/captcha */
export async function getFakeCaptcha(
  options?: { [key: string]: any },
) {
  return request<API.FakeCaptcha>('/server/api/admin/captcha', {
    method: 'GET',  ...(options || {}),
  });
}
