import { GOAL_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'

function authHeaders() {
  const session = getAuthSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }
  return headers
}

function parseApiPayload(text) {
  if (!text) return null
  try {
    const safeText = text.replace(/(:\s*|\[\s*|,\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
    return JSON.parse(safeText)
  } catch {
    return text
  }
}

function assertApiSuccess(res, data, fallback) {
  const code = data && typeof data === 'object' ? data.code : undefined
  const okCode = code === undefined || String(code) === '200' || String(code) === '0'
  if (res.ok && okCode) return

  const message =
    (data && typeof data === 'object' && (data.message || data.msg || data.error)) ||
    fallback
  throw new Error(message)
}

function responseData(data) {
  if (data && typeof data === 'object' && 'data' in data) return data.data
  return data
}

async function requestJson(url, options, fallback) {
  const res = await fetch(url, options)
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, fallback)
  return responseData(data)
}

function postJson(url, body, fallback) {
  return requestJson(
    url,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    },
    fallback,
  )
}

function toList(value) {
  return Array.isArray(value) ? value : []
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toHours(value, fallback = 0) {
  return Number(toNumber(value, fallback).toFixed(1))
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

function sessionDefaults() {
  const session = getAuthSession()
  return {
    userId: session?.userId ?? null,
    creator: session?.username ?? '',
  }
}

export function normalizeGoal(raw = {}) {
  const subcategories = toList(raw.subGoals ?? raw.subcategories).map((sub) => ({
    id: sub.id ?? null,
    stageId: sub.stageId ?? sub.stageGoalId ?? raw.id ?? null,
    name: sub.title ?? sub.name ?? '',
    content: sub.content ?? '',
    learnedHours: toHours(sub.learnedHours),
    estimatedHours: toHours(sub.estimatedHours),
    createdAt: sub.createTime ?? sub.createdAt ?? raw.createTime ?? '',
    ddl: sub.ddl ?? '',
    updatedAt: sub.updateTime ?? sub.updatedAt ?? raw.updateTime ?? '',
    daysSinceUpdate: toNumber(sub.daysSinceUpdate ?? raw.daysSinceUpdate),
  }))
  const learnedHours = toHours(raw.learnedHours, subcategories.reduce((sum, sub) => sum + sub.learnedHours, 0))
  const estimatedHours = toHours(raw.estimatedHours, subcategories.reduce((sum, sub) => sum + sub.estimatedHours, 0))
  const progress = toNumber(
    raw.progress,
    estimatedHours ? Math.min(Math.round((learnedHours / estimatedHours) * 100), 100) : 0,
  )

  return {
    ...raw,
    id: raw.id,
    userId: raw.userId ?? null,
    creator: raw.creator ?? '',
    category: raw.category ?? '技术',
    title: raw.title ?? '',
    content: raw.description ?? raw.content ?? '',
    learnedHours,
    estimatedHours,
    remainingHours: toHours(raw.remainingHours, Math.max(estimatedHours - learnedHours, 0)),
    progress,
    createdAt: raw.createTime ?? raw.createdAt ?? '',
    ddl: raw.ddl ?? '',
    updatedAt: raw.updateTime ?? raw.updatedAt ?? '',
    daysSinceUpdate: toNumber(raw.daysSinceUpdate),
    subcategories,
  }
}

export function createGoalDTO(goal = {}) {
  const defaults = sessionDefaults()
  return compactObject({
    id: goal.id ?? null,
    userId: goal.userId ?? defaults.userId,
    creator: goal.creator ?? defaults.creator,
    category: goal.category ?? '',
    title: goal.title ?? '',
    description: goal.content ?? goal.description ?? '',
    subGoals: toList(goal.subcategories ?? goal.subGoals).map((sub) =>
      compactObject({
        id: sub.id ?? null,
        stageId: sub.stageId ?? sub.stageGoalId ?? goal.id ?? null,
        title: sub.name ?? sub.title ?? '',
        content: sub.content ?? '',
        learnedHours: toHours(sub.learnedHours),
        estimatedHours: toHours(sub.estimatedHours),
      }),
    ),
  })
}

export async function queryGoals(filters = {}) {
  const payload = await postJson(
    GOAL_API.query,
    compactObject({
      userId: filters.userId ?? null,
      creator: filters.creator ?? '',
      category: filters.category ?? '',
      title: filters.title ?? '',
      recentDays: filters.recentDays ?? null,
      exactDate: filters.exactDate ?? '',
      ddl: filters.ddl ?? null,
    }),
    '查询阶段目标失败',
  )
  return toList(payload).map(normalizeGoal)
}

export function addGoal(goal) {
  return postJson(GOAL_API.add, createGoalDTO(goal), '新增阶段目标失败')
}

export function batchAddSubGoals(stageId, subGoals = []) {
  const defaults = sessionDefaults()
  const payload = toList(subGoals).map((sub) =>
    compactObject({
      stageId,
      userId: defaults.userId,
      title: String(sub.title ?? '').trim(),
      content: String(sub.content ?? '').trim(),
      learnedHours: toHours(sub.learnedHours),
      estimatedHours: toHours(sub.estimatedHours),
    }),
  )
  return postJson(GOAL_API.batchAddSubGoal, payload, '批量新增小目标失败')
}

export function updateGoal(goal) {
  return postJson(GOAL_API.update, createGoalDTO(goal), '修改阶段目标失败')
}

export function deleteGoal(goalId) {
  return postJson(`${GOAL_API.delete}/${goalId}`, {}, '删除阶段目标失败')
}

export function exportGoals(params = {}) {
  const query = new URLSearchParams({
    exportType: String(params.exportType ?? 1),
    lastDays: String(params.lastDays ?? 7),
    exportSize: String(params.exportSize ?? 10),
  })
  return requestJson(
    `${GOAL_API.export}?${query.toString()}`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
    '导出阶段目标失败',
  )
}
