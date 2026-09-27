import { request } from './api'

export type UserAccountStatus = 'pending_admin_approval' | 'pending_verification' | 'verified'

export interface UserAccountListItem {
  id: number
  name: string
  email: string
  status: UserAccountStatus
  approvedByName: string | null
  approvedAt: string | null
  verifiedAt: string | null
  createdAt: string
}

export const usersAdminApi = {
  list: (status?: UserAccountStatus) =>
    request<{ items: UserAccountListItem[] }>(`/admin/users${status ? `?status=${status}` : ''}`),
  approve: (id: number) => request<{ message: string }>(`/admin/users/${id}/approve`, { method: 'POST' }),
  resendCode: (id: number) => request<{ message: string }>(`/admin/users/${id}/resend-code`, { method: 'POST' }),
}
