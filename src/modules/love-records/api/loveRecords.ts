import { LOVE_DASHBOARD_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'
import type {
  Anniversary,
  LoveData,
  LoveRecord,
  Mood,
  RecordCategory,
  RecordDraft,
  RelationshipInfo,
} from '../types/records'

type ApiObject = Record<string, any>

class ApiRequestError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
  }
}

const CATEGORY_TO_CODE: Record<RecordCategory, string> = {
  约会: 'DATE',
  日常: 'DAILY',
  旅行: 'TRAVEL',
  纪念日: 'ANNIVERSARY',
}

const CODE_TO_CATEGORY: Record<string, RecordCategory> = {
  DATE: '约会',
  DAILY: '日常',
  TRAVEL: '旅行',
  ANNIVERSARY: '纪念日',
}

const DEFAULT_USER_ID = '10000'

function parseApiPayload(text: string): any {
  if (!text) return null
  try {
    // 后端 Snowflake ID 超过 JavaScript 安全整数时先转为字符串，避免 JSON.parse 丢失精度。
    const safeText = text.replace(/(:\s*|\[\s*|,\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
    return JSON.parse(safeText)
  } catch {
    return text
  }
}

function authHeaders(json = true): Record<string, string> {
  const session = getAuthSession()
  const headers: Record<string, string> = {}
  if (json) headers['Content-Type'] = 'application/json'
  if (session?.accessToken) {
    headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }
  return headers
}

async function requestJson(url: string, options: RequestInit, fallback: string): Promise<any> {
  const response = await fetch(url, options)
  const payload = parseApiPayload(await response.text())
  const code = payload && typeof payload === 'object' ? String(payload.code ?? '') : ''
  if (!response.ok || (code && code !== '200' && code !== '0')) {
    const message = payload && typeof payload === 'object'
      ? String(payload.message || payload.msg || payload.error || fallback)
      : fallback
    throw new ApiRequestError(message, code || String(response.status))
  }
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
}

function postJson(url: string, body: unknown, fallback: string): Promise<any> {
  return requestJson(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  }, fallback)
}

function getJson(url: string, fallback: string): Promise<any> {
  return requestJson(url, { method: 'GET', headers: authHeaders(false) }, fallback)
}

function postDelete(url: string, fallback: string): Promise<any> {
  return postJson(url, {}, fallback)
}

type LoveId = string | number

/**
 * 与 DiaryLoveController 一一对应的前端 API 门面。
 * 页面业务应通过这里调用后端，避免在组件或业务编排代码中散落 URL 和 HTTP 方法。
 */
export const diaryLoveControllerApi = {
  couples: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.couples.add, dto, '创建情侣关系失败'),
    query: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.couples.query, dto, '查询情侣关系失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.couples.update, dto, '修改情侣关系失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.couples.delete(id), '删除情侣关系失败'),
  },
  anniversaries: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.anniversaries.add, dto, '新增纪念日失败'),
    query: (coupleId: LoveId) => getJson(LOVE_DASHBOARD_API.anniversaries.query(coupleId), '查询纪念日失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.anniversaries.update, dto, '修改纪念日失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.anniversaries.delete(id), '删除纪念日失败'),
  },
  locations: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.locations.add, dto, '新增地点失败'),
    query: (coupleId: LoveId) => getJson(LOVE_DASHBOARD_API.locations.query(coupleId), '查询地点失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.locations.update, dto, '修改地点失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.locations.delete(id), '删除地点失败'),
  },
  records: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.records.add, dto, '新增恋爱记录失败'),
    query: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.records.query, dto, '查询恋爱记录失败'),
    detail: (id: LoveId) => getJson(LOVE_DASHBOARD_API.records.detail(id), '查询恋爱记录详情失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.records.update, dto, '修改恋爱记录失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.records.delete(id), '删除恋爱记录失败'),
  },
  recordImages: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.recordImages.add, dto, '新增记录图片关联失败'),
    query: (recordId: LoveId) => getJson(LOVE_DASHBOARD_API.recordImages.query(recordId), '查询记录图片失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.recordImages.update, dto, '修改记录图片关联失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.recordImages.delete(id), '删除记录图片关联失败'),
  },
  moods: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.moods.add, dto, '新增心情失败'),
    query: (enabled?: boolean) => getJson(
      enabled == null ? LOVE_DASHBOARD_API.moods.query : `${LOVE_DASHBOARD_API.moods.query}?enabled=${enabled}`,
      '查询心情失败',
    ),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.moods.update, dto, '修改心情失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.moods.delete(id), '删除心情失败'),
  },
  recordMoods: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.recordMoods.add, dto, '新增记录心情关联失败'),
    query: (recordId: LoveId) => getJson(LOVE_DASHBOARD_API.recordMoods.query(recordId), '查询记录心情失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.recordMoods.update, dto, '修改记录心情关联失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.recordMoods.delete(id), '删除记录心情关联失败'),
  },
  tags: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.tags.add, dto, '新增标签失败'),
    query: (coupleId: LoveId) => getJson(LOVE_DASHBOARD_API.tags.query(coupleId), '查询标签失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.tags.update, dto, '修改标签失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.tags.delete(id), '删除标签失败'),
  },
  recordTags: {
    add: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.recordTags.add, dto, '新增记录标签关联失败'),
    query: (recordId: LoveId) => getJson(LOVE_DASHBOARD_API.recordTags.query(recordId), '查询记录标签失败'),
    update: (dto: ApiObject) => postJson(LOVE_DASHBOARD_API.recordTags.update, dto, '修改记录标签关联失败'),
    delete: (id: LoveId) => postDelete(LOVE_DASHBOARD_API.recordTags.delete(id), '删除记录标签关联失败'),
  },
}

function toList(value: any): ApiObject[] {
  return Array.isArray(value) ? value : []
}

function toKey(value: unknown): string {
  return String(value ?? '').trim()
}

function currentUserId(): string {
  // 登录功能暂时屏蔽时使用开发用户；会话中已有 userId 后自动改用真实用户。
  return toKey(getAuthSession()?.userId) || DEFAULT_USER_ID
}

function isBackendId(value: unknown): boolean {
  return /^\d+$/.test(toKey(value))
}

function compareIdDesc(left: unknown, right: unknown): number {
  const leftId = toKey(left)
  const rightId = toKey(right)
  try {
    const leftBigInt = BigInt(leftId)
    const rightBigInt = BigInt(rightId)
    return leftBigInt === rightBigInt ? 0 : leftBigInt > rightBigInt ? -1 : 1
  } catch {
    return rightId.localeCompare(leftId)
  }
}

function emptyLoveData(): LoveData {
  return {
    relationship: {
      startDate: new Date().toISOString().slice(0, 10),
      partnerName: '未命名',
      anniversaries: [],
    },
    records: [],
  }
}

async function queryCouple(userId = currentUserId()): Promise<ApiObject | null> {
  try {
    return await diaryLoveControllerApi.couples.query({ ownerUserId: userId, status: 1 })
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === '293') return null
    throw error
  }
}

function mapRelationship(couple: ApiObject, anniversaries: Anniversary[]): RelationshipInfo {
  return {
    id: toKey(couple.id),
    ownerUserId: toKey(couple.ownerUserId),
    partnerUserId: couple.partnerUserId == null ? null : toKey(couple.partnerUserId),
    startDate: String(couple.startDate ?? '').slice(0, 10),
    partnerName: String(couple.partnerName ?? '未命名'),
    status: Number(couple.status ?? 1),
    anniversaries,
  }
}

function mapAnniversary(raw: ApiObject): Anniversary {
  return {
    id: toKey(raw.id),
    coupleId: toKey(raw.coupleId),
    creatorUserId: toKey(raw.creatorUserId),
    name: String(raw.name ?? ''),
    date: String(raw.eventDate ?? raw.date ?? '').slice(0, 10),
    repeatType: Number(raw.repeatType ?? 1),
    remindDays: Number(raw.remindDays ?? 7),
    pinned: Boolean(raw.pinned),
    sort: Number(raw.sort ?? 0),
  }
}

export async function loadLoveData(): Promise<LoveData> {
  const couple = await queryCouple()
  if (!couple) return emptyLoveData()

  const coupleId = toKey(couple.id)
  const [anniversaryRows, locationRows, recordRows, moodRows, tagRows] = await Promise.all([
    diaryLoveControllerApi.anniversaries.query(coupleId),
    diaryLoveControllerApi.locations.query(coupleId),
    diaryLoveControllerApi.records.query({ coupleId }),
    diaryLoveControllerApi.moods.query(true),
    diaryLoveControllerApi.tags.query(coupleId),
  ])

  const rawRecords = toList(recordRows)
  // TODO 后端补充“记录详情批量聚合”接口后替换这里的 3N 次关联查询，避免记录数量增长时请求过多。
  const relationGroups = await Promise.all(rawRecords.map(async (record) => {
    const recordId = toKey(record.id)
    const [images, moods, tags] = await Promise.all([
      diaryLoveControllerApi.recordImages.query(recordId),
      diaryLoveControllerApi.recordMoods.query(recordId),
      diaryLoveControllerApi.recordTags.query(recordId),
    ])
    return { recordId, images: toList(images), moods: toList(moods), tags: toList(tags) }
  }))

  const imageIds = [...new Set(relationGroups.flatMap((group) => group.images.map((item) => toKey(item.imageId))).filter(Boolean))]
  const imageRows = imageIds.length
    ? toList(await postJson(LOVE_DASHBOARD_API.files.queryImageUrls, imageIds, '查询图片地址失败'))
    : []

  const locations = new Map(toList(locationRows).map((item) => [toKey(item.id), item]))
  const moodDictionary = new Map(toList(moodRows).map((item) => [toKey(item.id), item]))
  const tagDictionary = new Map(toList(tagRows).map((item) => [toKey(item.id), item]))
  const imageUrls = new Map(imageRows.map((item) => [toKey(item.id ?? item.imageId), String(item.url ?? item.imageUrl ?? '')]))
  const relations = new Map(relationGroups.map((item) => [item.recordId, item]))

  const records: LoveRecord[] = rawRecords.map((raw) => {
    const recordId = toKey(raw.id)
    const location = locations.get(toKey(raw.locationId))
    const group = relations.get(recordId) ?? { images: [], moods: [], tags: [] }
    const imageRefs = group.images.map((item) => ({
      relationId: toKey(item.id),
      imageId: toKey(item.imageId),
      url: imageUrls.get(toKey(item.imageId)) ?? '',
    })).filter((item) => item.imageId && item.url)
    const moodRefs = group.moods.map((item) => {
      const mood = moodDictionary.get(toKey(item.moodId))
      return {
        relationId: toKey(item.id),
        moodId: toKey(item.moodId),
        name: String(mood?.moodName ?? '') as Mood,
      }
    }).filter((item) => item.moodId && item.name)
    const tagRefs = group.tags.map((item) => {
      const tag = tagDictionary.get(toKey(item.tagId))
      return {
        relationId: toKey(item.id),
        tagId: toKey(item.tagId),
        name: String(tag?.tagName ?? ''),
      }
    }).filter((item) => item.tagId && item.name)

    const latitude = Number(location?.latitude)
    const longitude = Number(location?.longitude)
    return {
      id: recordId,
      coupleId,
      creatorUserId: toKey(raw.creatorUserId),
      locationId: raw.locationId == null ? null : toKey(raw.locationId),
      title: String(raw.title ?? ''),
      date: String(raw.recordDate ?? '').slice(0, 10),
      content: String(raw.content ?? ''),
      images: imageRefs.map((item) => item.url),
      location: String(location?.name ?? ''),
      point: {
        lat: Number.isFinite(latitude) ? latitude : 29.56,
        lng: Number.isFinite(longitude) ? longitude : 106.57,
        x: 52,
        y: 52,
      },
      moods: moodRefs.map((item) => item.name),
      tags: tagRefs.map((item) => item.name),
      category: CODE_TO_CATEGORY[String(raw.categoryCode)] ?? '日常',
      important: Boolean(raw.important),
      sort: Number(raw.sort ?? 0),
      imageRefs,
      moodRefs,
      tagRefs,
    }
  })

  return {
    relationship: mapRelationship(couple, toList(anniversaryRows).map(mapAnniversary)),
    records,
  }
}

export async function saveRelationshipApi(
  relationship: RelationshipInfo,
  startDate: string,
  partnerName: string,
): Promise<RelationshipInfo> {
  const userId = currentUserId()
  const body = {
    id: relationship.id || undefined,
    ownerUserId: relationship.ownerUserId || userId,
    partnerUserId: relationship.partnerUserId || null,
    partnerName: partnerName.trim() || '未命名',
    startDate,
    status: relationship.status ?? 1,
  }
  if (relationship.id) {
    await diaryLoveControllerApi.couples.update(body)
  } else {
    await diaryLoveControllerApi.couples.add(body)
  }
  const couple = await queryCouple(userId)
  if (!couple) throw new Error('情侣关系保存成功，但重新查询失败')
  return mapRelationship(couple, relationship.anniversaries)
}

async function ensureRelationship(relationship: RelationshipInfo): Promise<RelationshipInfo> {
  if (relationship.id) return relationship
  return saveRelationshipApi(relationship, relationship.startDate, relationship.partnerName)
}

export async function saveAnniversariesApi(
  relationship: RelationshipInfo,
  items: Anniversary[],
): Promise<RelationshipInfo> {
  const ensured = await ensureRelationship(relationship)
  const coupleId = toKey(ensured.id)
  const userId = currentUserId()
  const currentById = new Map(ensured.anniversaries.filter((item) => isBackendId(item.id)).map((item) => [item.id, item]))
  const desiredIds = new Set(items.filter((item) => isBackendId(item.id)).map((item) => item.id))

  for (const current of currentById.values()) {
    if (!desiredIds.has(current.id)) {
      await diaryLoveControllerApi.anniversaries.delete(current.id)
    }
  }

  for (const [index, item] of items.entries()) {
    const body = {
      id: isBackendId(item.id) ? item.id : undefined,
      coupleId,
      creatorUserId: item.creatorUserId || userId,
      name: item.name.trim(),
      eventDate: item.date,
      repeatType: item.repeatType ?? 1,
      remindDays: item.remindDays ?? 7,
      pinned: item.pinned ?? false,
      sort: item.sort ?? index,
    }
    if (body.id && currentById.has(body.id)) {
      await diaryLoveControllerApi.anniversaries.update(body)
    } else {
      await diaryLoveControllerApi.anniversaries.add(body)
    }
  }

  const rows = await diaryLoveControllerApi.anniversaries.query(coupleId)
  return { ...ensured, anniversaries: toList(rows).map(mapAnniversary) }
}

async function ensureLocation(coupleId: string, name: string, current?: LoveRecord | null): Promise<string | null> {
  const locationName = name.trim()
  if (!locationName) return null
  const rows = toList(await diaryLoveControllerApi.locations.query(coupleId))
  const existing = rows.find((item) => String(item.name ?? '').trim() === locationName)
  if (existing) return toKey(existing.id)

  await diaryLoveControllerApi.locations.add({
    coupleId,
    name: locationName,
    longitude: current?.point?.lng,
    latitude: current?.point?.lat,
  })
  const refreshed = toList(await diaryLoveControllerApi.locations.query(coupleId))
  return toKey(refreshed.find((item) => String(item.name ?? '').trim() === locationName)?.id) || null
}

function recordToDTO(
  draft: RecordDraft,
  coupleId: string,
  locationId: string | null,
  current?: LoveRecord | null,
): ApiObject {
  return {
    id: current?.id,
    coupleId,
    creatorUserId: current?.creatorUserId || currentUserId(),
    locationId,
    title: draft.title.trim(),
    content: draft.content,
    recordDate: draft.date,
    categoryCode: CATEGORY_TO_CODE[draft.category],
    important: draft.important,
    sort: current?.sort ?? 0,
  }
}

async function findCreatedRecordId(dto: ApiObject): Promise<string> {
  const rows = toList(await diaryLoveControllerApi.records.query({
    coupleId: dto.coupleId,
    creatorUserId: dto.creatorUserId,
    title: dto.title,
    recordDate: dto.recordDate,
  }))
  const record = rows
    .filter((item) => String(item.title ?? '') === dto.title && String(item.recordDate ?? '').slice(0, 10) === dto.recordDate)
    .sort((left, right) => compareIdDesc(left.id, right.id))[0]
  const recordId = toKey(record?.id)
  if (!recordId) throw new Error('恋爱记录已提交，但没有查询到新记录 ID')
  return recordId
}

async function imageUrlToFile(url: string, index: number): Promise<File> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('读取待上传图片失败')
  const blob = await response.blob()
  const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  return new File([blob], `love-record-${Date.now()}-${index}.${extension}`, { type: blob.type || 'image/jpeg' })
}

async function uploadImages(urls: string[]): Promise<string[]> {
  if (!urls.length) return []
  const files = await Promise.all(urls.map(imageUrlToFile))
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file, file.name))
  formData.append('code', '1000')
  const ids = await requestJson(LOVE_DASHBOARD_API.files.uploadImages, {
    method: 'POST',
    headers: authHeaders(false),
    body: formData,
  }, '上传恋爱记录图片失败')
  return Array.isArray(ids) ? ids.map(toKey).filter(Boolean) : []
}

async function syncRecordImages(recordId: string, images: string[], current?: LoveRecord | null): Promise<void> {
  const currentRefs = current?.imageRefs ?? []
  const desired = new Set(images)
  for (const ref of currentRefs) {
    if (!desired.has(ref.url)) {
      await diaryLoveControllerApi.recordImages.delete(ref.relationId)
    }
  }

  const existingUrls = new Set(currentRefs.map((item) => item.url))
  const newUrls = images.filter((url) => url && !existingUrls.has(url))
  const imageIds = await uploadImages(newUrls)
  for (const [index, imageId] of imageIds.entries()) {
    await diaryLoveControllerApi.recordImages.add({
      recordId,
      imageId,
      isCover: images.indexOf(newUrls[index]) === 0,
      sort: images.indexOf(newUrls[index]),
    })
  }
}

async function syncRecordMoods(recordId: string, moods: Mood[], current?: LoveRecord | null): Promise<void> {
  const dictionary = toList(await diaryLoveControllerApi.moods.query(true))
  const moodByName = new Map(dictionary.map((item) => [String(item.moodName ?? ''), toKey(item.id)]))
  const desiredIds = new Set<string>(
    moods.map((name) => moodByName.get(name)).filter((value): value is string => Boolean(value)),
  )
  const currentRefs = current?.moodRefs ?? []

  for (const ref of currentRefs) {
    if (!desiredIds.has(ref.moodId)) {
      await diaryLoveControllerApi.recordMoods.delete(ref.relationId)
    }
  }
  const currentIds = new Set(currentRefs.map((item) => item.moodId))
  let sort = 0
  for (const moodId of desiredIds) {
    if (!currentIds.has(moodId)) {
      await diaryLoveControllerApi.recordMoods.add({ recordId, moodId, sort })
    }
    sort += 1
  }
}

async function syncRecordTags(recordId: string, tags: string[], coupleId: string, current?: LoveRecord | null): Promise<void> {
  const userId = currentUserId()
  let dictionary = toList(await diaryLoveControllerApi.tags.query(coupleId))
  const existingNames = new Set(dictionary.map((item) => String(item.tagName ?? '').trim()))
  for (const tagName of tags) {
    if (!existingNames.has(tagName)) {
      await diaryLoveControllerApi.tags.add({
        coupleId,
        creatorUserId: userId,
        tagName,
        useCount: 0,
      })
      existingNames.add(tagName)
    }
  }
  dictionary = toList(await diaryLoveControllerApi.tags.query(coupleId))
  const tagByName = new Map(dictionary.map((item) => [String(item.tagName ?? '').trim(), toKey(item.id)]))
  const desiredIds = new Set<string>(
    tags.map((name) => tagByName.get(name)).filter((value): value is string => Boolean(value)),
  )
  const currentRefs = current?.tagRefs ?? []

  for (const ref of currentRefs) {
    if (!desiredIds.has(ref.tagId)) {
      await diaryLoveControllerApi.recordTags.delete(ref.relationId)
    }
  }
  const currentIds = new Set(currentRefs.map((item) => item.tagId))
  let sort = 0
  for (const tagId of desiredIds) {
    if (!currentIds.has(tagId)) {
      await diaryLoveControllerApi.recordTags.add({ recordId, tagId, sort })
    }
    sort += 1
  }
}

export async function saveRecordApi(
  relationship: RelationshipInfo,
  draft: RecordDraft,
  current?: LoveRecord | null,
): Promise<void> {
  const ensured = await ensureRelationship(relationship)
  const coupleId = toKey(ensured.id)
  const locationId = await ensureLocation(coupleId, draft.location, current)
  const dto = recordToDTO(draft, coupleId, locationId, current)
  let recordId = toKey(current?.id)

  if (recordId) {
    await diaryLoveControllerApi.records.update(dto)
  } else {
    await diaryLoveControllerApi.records.add(dto)
    recordId = await findCreatedRecordId(dto)
  }

  // 后端当前提供的是基础表 CRUD，因此这里按关联表逐项保存；后续应由后端提供一个聚合事务接口替代这些请求。
  await syncRecordImages(recordId, draft.images, current)
  await syncRecordMoods(recordId, draft.moods, current)
  await syncRecordTags(recordId, draft.tags, coupleId, current)
}

export function deleteRecordApi(id: string): Promise<any> {
  return diaryLoveControllerApi.records.delete(id)
}

export async function clearRecordsApi(records: LoveRecord[]): Promise<void> {
  for (const record of records) {
    await deleteRecordApi(record.id)
  }
}

export async function replaceLoveDataApi(current: LoveData, next: LoveData): Promise<void> {
  const relationship = await saveRelationshipApi(
    current.relationship,
    next.relationship.startDate,
    next.relationship.partnerName,
  )
  await saveAnniversariesApi(relationship, next.relationship.anniversaries)
  await clearRecordsApi(current.records)
  for (const record of next.records) {
    await saveRecordApi(relationship, record, null)
  }
}
