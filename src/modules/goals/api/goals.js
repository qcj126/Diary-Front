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

function getJson(url, fallback) {
  return requestJson(
    url,
    {
      method: 'GET',
      headers: authHeaders(),
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
  return Number(toNumber(value, fallback).toFixed(2))
}

function toCheckinHours(value, fallback = 0) {
  return Number(toNumber(value, fallback).toFixed(2))
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
    status: toNumber(sub.status),
    learnedHours: toHours(sub.learnedHours),
    estimatedHours: toHours(sub.estimatedHours),
    createdAt: sub.createTime ?? sub.createdAt ?? raw.createTime ?? '',
    ddl: sub.ddl ?? '',
    completedTime: sub.completedTime ?? '',
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
    status: toNumber(raw.status),
    learnedHours,
    estimatedHours,
    remainingHours: toHours(raw.remainingHours, Math.max(estimatedHours - learnedHours, 0)),
    progress,
    createdAt: raw.createTime ?? raw.createdAt ?? '',
    ddl: raw.ddl ?? '',
    completedTime: raw.completedTime ?? '',
    updatedAt: raw.updateTime ?? raw.updatedAt ?? '',
    daysSinceUpdate: toNumber(raw.daysSinceUpdate),
    subcategories,
  }
}

export function normalizeGoalCheckin(raw = {}) {
  return {
    ...raw,
    id: raw.id,
    requestId: raw.requestId ?? '',
    userId: raw.userId ?? null,
    stageGoalId: raw.stageGoalId ?? null,
    subGoalId: raw.subGoalId ?? null,
    checkinType: toNumber(raw.checkinType, 1),
    checkinTypeName: raw.checkinTypeName ?? '',
    spentHours: toCheckinHours(raw.spentHours),
    content: raw.content ?? '',
    evidenceUrls: toList(raw.evidenceUrls).map(String),
    checkinDate: raw.checkinDate ?? '',
    source: toNumber(raw.source, 1),
    createTime: raw.createTime ?? '',
    updateTime: raw.updateTime ?? '',
  }
}

export function createGoalCheckinDTO(checkin = {}) {
  return compactObject({
    id: checkin.id ?? null,
    requestId: checkin.requestId ?? '',
    stageGoalId: checkin.stageGoalId ?? null,
    subGoalId: checkin.subGoalId ?? null,
    checkinType: toNumber(checkin.checkinType, 1),
    spentHours: toCheckinHours(checkin.spentHours),
    content: String(checkin.content ?? '').trim(),
    evidenceUrls: toList(checkin.evidenceUrls).map((url) => String(url).trim()).filter(Boolean),
    checkinDate: checkin.checkinDate ?? '',
    source: toNumber(checkin.source, 1),
  })
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
  return postJson(GOAL_API.delete(goalId), {}, '删除阶段目标失败')
}

export function exportGoals(params = {}) {
  const query = new URLSearchParams({
    exportType: String(params.exportType ?? 1),
    lastDays: String(params.lastDays ?? 7),
    exportSize: String(params.exportSize ?? 10),
  })
  return requestJson(
    GOAL_API.export(query.toString()),
    {
      method: 'POST',
      headers: authHeaders(),
    },
    '导出阶段目标失败',
  )
}

export async function queryGoalCheckins(filters = {}) {
  const payload = await postJson(
    GOAL_API.checkin.query,
    compactObject({
      stageGoalId: filters.stageGoalId ?? null,
      subGoalId: filters.subGoalId ?? null,
      checkinType: filters.checkinType ?? null,
      startDate: filters.startDate ?? '',
      endDate: filters.endDate ?? '',
      pageNum: filters.pageNum ?? 0,
      pageSize: filters.pageSize ?? 100,
    }),
    '查询打卡记录失败',
  )
  return toList(payload).map(normalizeGoalCheckin)
}

export async function getGoalCheckin(checkinId) {
  const payload = await getJson(GOAL_API.checkin.detail(checkinId), '查询打卡详情失败')
  return normalizeGoalCheckin(payload)
}

export async function addGoalCheckin(checkin) {
  const payload = await postJson(GOAL_API.checkin.add, createGoalCheckinDTO(checkin), '新增打卡失败')
  return normalizeGoalCheckin(payload)
}

export async function updateGoalCheckin(checkin) {
  const payload = await postJson(GOAL_API.checkin.update, createGoalCheckinDTO(checkin), '修改打卡失败')
  return normalizeGoalCheckin(payload)
}

export function deleteGoalCheckin(checkinId) {
  return postJson(GOAL_API.checkin.delete(checkinId), {}, '删除打卡失败')
}
