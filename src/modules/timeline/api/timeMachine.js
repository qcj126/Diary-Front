import { TIMELINE_API } from '../../../api/index.js'
import { GLOBAL_USER_ID } from '../constants/imageTypes.js'

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

async function postJson(url, body, fallback) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, fallback)
  return responseData(data)
}

export function createCategoryDTO(category = {}) {
  return {
    id: category.id ?? null,
    userId: category.userId ?? GLOBAL_USER_ID,
    categoryName: category.categoryName ?? category.label ?? category.name ?? '',
    iconId: category.iconId ?? null,
    icon: category.icon ?? category.iconUrl ?? '',
    deleted: category.deleted ?? 0,
    sort: category.sort ?? 0,
  }
}

export function createCategoryQueryDTO(category = {}) {
  return {
    id: category.id ?? null,
    userId: category.userId ?? GLOBAL_USER_ID,
    categoryName: category.categoryName ?? category.label ?? category.name ?? '',
    sort: category.sort ?? null,
    iconName: category.iconName ?? '',
    iconPath: category.iconPath ?? category.icon ?? category.iconUrl ?? '',
  }
}

export function createCardDTO(card = {}) {
  return {
    id: card.id ?? card.rawId ?? null,
    userId: card.userId ?? GLOBAL_USER_ID,
    imageId: card.imageId ?? null,
    categoryId: card.categoryId ?? null,
    cardTitle: card.cardTitle ?? card.title ?? '',
    cardContent: card.cardContent ?? card.content ?? '',
    recordTime: card.recordTime ?? card.date ?? new Date().toISOString(),
    deleted: card.deleted ?? 0,
    pageIndex: card.pageIndex ?? 1,
    pageSize: card.pageSize ?? 25,
    daysAgo: card.daysAgo ?? null,
    exactDate: card.exactDate ?? '',
  }
}

export function addTimeCategory(categoryDTO) {
  return postJson(TIMELINE_API.categoryAdd, createCategoryDTO(categoryDTO), 'Add category failed.')
}

export function updateTimeCategory(categoryDTO) {
  return postJson(TIMELINE_API.categoryUpdate, createCategoryDTO(categoryDTO), 'Update category failed.')
}

export function deleteTimeCategory(categoryDTO) {
  return postJson(
    TIMELINE_API.categoryDelete,
    createCategoryDTO({ ...categoryDTO, deleted: categoryDTO?.deleted ?? 1 }),
    'Delete category failed.',
  )
}

export function queryTimeCategories(categoryDTO = {}) {
  return postJson(TIMELINE_API.categoryQuery, createCategoryQueryDTO(categoryDTO), 'Query categories failed.')
}

export function addTimeCard(cardDTO) {
  return postJson(TIMELINE_API.cardAdd, createCardDTO(cardDTO), 'Add card failed.')
}

export function updateTimeCard(cardDTO) {
  return postJson(TIMELINE_API.cardUpdate, createCardDTO(cardDTO), 'Update card failed.')
}

export function deleteTimeCard(cardDTO) {
  return postJson(
    TIMELINE_API.cardDelete,
    createCardDTO({ ...cardDTO, deleted: cardDTO?.deleted ?? 1 }),
    'Delete card failed.',
  )
}

export function queryTimeCards(cardDTO = {}) {
  return postJson(TIMELINE_API.cardQuery, createCardDTO(cardDTO), 'Query cards failed.')
}
