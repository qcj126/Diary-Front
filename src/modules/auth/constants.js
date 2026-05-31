export const API_BASE = 'http://localhost:10000'

export const API = {
  login: `${API_BASE}/user/login`,
  register: `${API_BASE}/user/register`,
  resetPw: `${API_BASE}/user/resetPw`,
  verifyCode: `${API_BASE}/user/verifycode`,
}
