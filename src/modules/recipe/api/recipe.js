import { AI_API, API_BASE, RECIPE_API, SYS_INFO_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'

export const MEAL_TYPE_LABELS = {
  1: '早餐',
  2: '午餐',
  3: '晚餐',
  4: '夜宵',
}
export const DIFFICULTY_LABELS = {
  1: '简单',
  2: '中等',
  3: '困难',
}
function authHeaders(contentType = 'application/json') {
  const session = getAuthSession()
  const headers = contentType ? { 'Content-Type': contentType } : {}

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
  if (data && typeof data === 'object' && 'result' in data) return data.result
  return data
}

function normalizeImageId(id) {
  const value = String(id ?? '').trim()
  return /^\d+$/.test(value) ? value : null
}

function normalizeImageUrl(url) {
  const value = String(url ?? '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  return `${API_BASE}${value.startsWith('/') ? '' : '/'}${value}`
}

function normalizeImageVO(image, fallbackId) {
  if (typeof image === 'string') {
    const url = normalizeImageUrl(image)
    return fallbackId && url ? { id: fallbackId, url } : null
  }

  if (!image || typeof image !== 'object') return null
  const id = normalizeImageId(image.id ?? image.imageId ?? fallbackId)
  const url = normalizeImageUrl(image.url ?? image.imageUrl)
  if (!id || !url) return null
  return { id, url }
}

async function queryRecipeImageUrls(imageIds) {
  const normalizedIds = [...new Set(imageIds.map(normalizeImageId).filter(Boolean))]
  if (!normalizedIds.length) return []

  const images = await postJson(RECIPE_API.queryImageUrls, normalizedIds, '图片地址查询失败')

  if (Array.isArray(images)) {
    return images.map((image, index) => normalizeImageVO(image, normalizedIds[index])).filter(Boolean)
  }

  if (images && typeof images === 'object') {
    return Object.entries(images)
      .map(([id, url]) => normalizeImageVO({ id, url }))
      .filter(Boolean)
  }

  return []
}

async function attachRecipeImageUrls(page) {
  const imageIds = page.records.map((recipe) => recipe.imageId)

  try {
    const images = await queryRecipeImageUrls(imageIds)
    const imageMap = new Map(images.map((image) => [String(image.id), image.url]))
    if (!imageMap.size) return page

    return {
      ...page,
      records: page.records.map((recipe) => {
        const imageId = normalizeImageId(recipe.imageId)
        const imageUrl = imageId ? imageMap.get(imageId) : ''
        if (!imageUrl) return recipe

        return {
          ...recipe,
          imageUrl,
          coverImg: imageUrl,
          detail: {
            ...recipe.detail,
            heroImageUrl: imageUrl,
          },
        }
      }),
    }
  } catch (error) {
    console.error(error)
    return page
  }
}

async function postJson(url, body, fallback) {
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, fallback)
  return responseData(data)
}

async function getJson(url, fallback) {
  const res = await fetch(url, {
    method: 'GET',
    headers: authHeaders(null),
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, fallback)
  return responseData(data)
}

const toList = (value) => (Array.isArray(value) ? value : [])
const toPayloadList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.records)) return value.records
  if (Array.isArray(value?.list)) return value.list
  if (Array.isArray(value?.rows)) return value.rows
  return value ? [value] : []
}
const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function normalizeRecipeIconUrl(path) {
  const value = String(path ?? '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const normalized = value.replaceAll('\\', '/')
  const iconDirectoryIndex = normalized.toLowerCase().lastIndexOf('/icon/')
  const fileName = iconDirectoryIndex >= 0
    ? normalized.slice(iconDirectoryIndex + '/icon/'.length)
    : normalized.replace(/^\/?(?:file\/)?icon\//i, '').replace(/^\/+/, '')

  return fileName ? encodeURI(`${API_BASE}/file/icon/${fileName}`) : ''
}

function normalizeRecipeCategory(raw = {}, index = 0) {
  const id = raw.id ?? raw.categoryId ?? raw.value
  const categoryNum = raw.categoryNum ?? raw.categoryNo ?? raw.value ?? id
  const label = raw.categoryName ?? raw.label ?? raw.name ?? ''
  const iconId = raw.iconId ?? raw.iconID ?? raw.icon?.id ?? null
  const iconUrl = normalizeRecipeIconUrl(
    raw.iconUrl ?? raw.iconURL ?? raw.iconPath ?? raw.iconFileName ?? raw.fileName ?? raw.icon?.url ?? raw.icon?.iconUrl,
  )
  const icon = iconUrl || (raw.categoryIcon ?? raw.icon ?? '')

  return {
    ...raw,
    id,
    categoryNum,
    key: String(id ?? raw.key ?? `category_${index}`),
    label,
    icon,
    iconId,
    iconUrl,
    value: categoryNum,
    sort: Number(raw.sort ?? index + 1),
  }
}

function normalizeRecipeIcon(raw = {}, index = 0) {
  const id = raw.id ?? raw.iconId ?? raw.iconID ?? raw.value
  const iconUrl = normalizeRecipeIconUrl(
    raw.iconUrl ?? raw.iconURL ?? raw.url ?? raw.path ?? raw.iconPath ?? raw.iconFileName ?? raw.fileName,
  )
  const label = raw.iconName ?? raw.name ?? raw.label ?? raw.manuName ?? ''

  return {
    ...raw,
    id,
    iconId: id,
    label,
    iconUrl,
    icon: iconUrl || (raw.icon ?? raw.code ?? ''),
  }
}

function normalizeIngredient(ingredient, index) {
  if (typeof ingredient === 'string') {
    return { name: ingredient, quantity: '', amount: '', isMain: 0, sort: index + 1, checked: false }
  }

  const quantity = ingredient?.quantity ?? ingredient?.amount ?? ''
  return {
    name: ingredient?.name ?? '',
    quantity,
    amount: quantity,
    isMain: Number(ingredient?.isMain ?? 0),
    sort: Number(ingredient?.sort ?? index + 1),
    checked: Boolean(ingredient?.checked),
  }
}

function ingredientText(ingredient) {
  if (typeof ingredient === 'string') return ingredient
  return [ingredient?.name, ingredient?.quantity ?? ingredient?.amount].filter(Boolean).join(' ')
}

function normalizeStepObject(step, index) {
  if (typeof step === 'string') {
    return {
      stepNumber: index + 1,
      stepNum: index + 1,
      description: step.replace(/^\d+\.\s*/, ''),
      timerMin: 0,
      sort: index + 1,
    }
  }

  const stepNumber = Number(step?.stepNumber ?? step?.stepNum ?? index + 1)
  return {
    ...step,
    stepNumber,
    stepNum: stepNumber,
    description: step?.description ?? '',
    timerMin: Number(step?.timerMin ?? 0),
    sort: Number(step?.sort ?? stepNumber),
  }
}

function normalizeStep(step, index) {
  const normalized = normalizeStepObject(step, index)
  return `${normalized.stepNumber}. ${normalized.description}`.trim()
}

function normalizeInstruction(step, index) {
  const normalized = normalizeStepObject(step, index)
  return {
    title: `步骤 ${normalized.stepNumber}`,
    description: normalized.description,
  }
}

export function normalizeRecipe(raw = {}) {
  const ingredients = toList(raw.ingredients).map(normalizeIngredient)
  const rawSteps = toList(raw.rawSteps ?? raw.steps).map(normalizeStepObject)
  const cookingTime = Number(raw.cookingTime ?? 0)
  const difficulty = toNumberOrNull(raw.difficultyValue ?? raw.difficulty)
  const redHeart = Number(raw.redHeart ?? raw.isFavorite ?? 0) === 1 ? 1 : 0
  const coverImg = raw.coverImg || raw.imageUrl || raw.detail?.heroImageUrl || ''
  const imageId = raw.imageId ?? raw.imageID ?? ''
  const description = raw.description || raw.story || ''
  const categoryNum = raw.categoryNum ?? raw.category ?? null

  return {
    ...raw,
    id: raw.id ?? raw.recipeId,
    recipeId: raw.recipeId ?? raw.id,
    categoryNum,
    familyMember: raw.familyMember ?? null,
    cookWay: String(raw.cookWay ?? '').trim(),
    imageId,
    mealType: raw.mealTypeName ?? raw.mealTypeLabel ?? MEAL_TYPE_LABELS[raw.mealType] ?? raw.mealType ?? '',
    mealTypeValue: raw.mealType ?? raw.mealTypeValue ?? null,
    difficultyValue: raw.difficultyValue ?? difficulty,
    duration: cookingTime ? `${cookingTime} 分钟` : '未填写',
    title: raw.title ?? '',
    imageUrl: coverImg,
    coverImg,
    ingredients,
    rawSteps,
    steps: rawSteps.map(normalizeStep),
    redHeart,
    isFavorite: redHeart === 1,
    detail: {
      description,
      prepTime: raw.prepTime ? `${raw.prepTime} 分钟` : '未填写',
      cookTime: cookingTime ? `${cookingTime} 分钟` : '未填写',
      difficulty: raw.difficultyName ?? raw.difficultyLabel ?? DIFFICULTY_LABELS[difficulty] ?? '',
      familyMember: raw.familyMember ?? '未填写',
      heroImageUrl: coverImg,
      nutrition: toList(raw.nutrition),
      ingredients: ingredients.map(ingredientText).filter(Boolean),
      instructions: rawSteps.map(normalizeInstruction),
      category: raw.categoryName ?? categoryNum ?? '未分类',
      story: raw.story ?? '',
    },
  }
}

export function normalizeRecipePage(payload = {}) {
  const rawRecords = payload.records ?? payload.list ?? payload.rows
  const records = toList(rawRecords).map(normalizeRecipe)

  return {
    total: Number(payload.total ?? records.length),
    pageIndex: Number(payload.pageIndex ?? 1),
    pageSize: Number(payload.pageSize ?? records.length),
    records,
  }
}

export function createRecipeDTO(recipe = {}) {
  const ingredients = toList(recipe.ingredients).map((item, index) => ({
    name: typeof item === 'string' ? item : item?.name ?? '',
    quantity: typeof item === 'string' ? '' : item?.quantity ?? item?.amount ?? '',
    isMain: Number(typeof item === 'string' ? 0 : item?.isMain ?? 0),
    sort: index + 1,
  }))

  const steps = toList(recipe.steps).map((item, index) => ({
    stepNumber: index + 1,
    description:
      typeof item === 'string'
        ? item.replace(/^\d+\.\s*/, '')
        : item?.description ?? item?.title ?? '',
    timerMin: Number(typeof item === 'string' ? 0 : item?.timerMin ?? 0),
    sort: index + 1,
  }))

  return {
    authorId: recipe.authorId ?? null,
    recipeId: recipe.recipeId ?? null,
    title: recipe.title ?? '',
    imageId: String(recipe.imageId ?? '').trim(),
    description: recipe.description ?? recipe.detail?.description ?? '',
    categoryNum: toNumberOrNull(recipe.categoryNum),
    mealType: toNumberOrNull(recipe.mealTypeValue ?? recipe.mealType),
    difficulty: toNumberOrNull(recipe.difficultyValue ?? recipe.difficulty),
    cookingTime: toNumberOrNull(recipe.cookingTime),
    familyMember: toNumberOrNull(recipe.familyMember),
    cookWay: String(recipe.cookWay ?? '').trim(),
    redHeart: Number(recipe.redHeart) === 1 ? 1 : 0,
    story: recipe.story ?? recipe.detail?.story ?? '',
    ingredients,
    steps,
  }
}

export async function uploadRecipeImages(files) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }
  formData.append('code', '2000')

  const res = await fetch(RECIPE_API.uploadImages, {
    method: 'POST',
    headers: authHeaders(null),
    body: formData,
  })
  const data = parseApiPayload(await res.text())
  assertApiSuccess(res, data, '图片上传失败')

  const result = responseData(data)
  const ids = Array.isArray(result) ? result : [result]
  const imageIds = ids
    .map((item) => String(item?.id ?? item?.imageId ?? item ?? '').trim())
    .filter(Boolean)

  if (!imageIds.length) {
    throw new Error('图片上传成功，但没有返回图片ID')
  }

  return imageIds
}

export async function queryRecipes(params = {}) {
  const payload = await postJson(
    RECIPE_API.query,
    {
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 10,
      categoryNum: params.categoryNum ?? null,
      mealType: params.mealType ?? null,
      difficulty: params.difficulty ?? null,
      redHeart: params.redHeart ?? 0,
      keyword: params.keyword ?? '',
    },
    '查询食谱失败',
  )
  return attachRecipeImageUrls(normalizeRecipePage(payload))
}

export async function queryRecipeCategories() {
  const payload = await postJson(RECIPE_API.queryCategory, {}, '查询分类失败')
  return toPayloadList(payload)
    .map(normalizeRecipeCategory)
    .sort((a, b) => a.sort - b.sort)
}

export function addRecipeCategory(category) {
  return postJson(
    RECIPE_API.addCategory,
    {
      categoryName: category.categoryName,
      iconId: category.iconId,
    },
    '新增分类失败',
  )
}

export function updateRecipeCategory(category) {
  return postJson(
    RECIPE_API.updateCategory,
    {
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      iconId: category.iconId,
    },
    '修改分类失败',
  )
}

export async function queryRecipeIcons() {
  const payload = await postJson(RECIPE_API.queryIcons, {}, '查询图标失败')
  return toPayloadList(payload).map(normalizeRecipeIcon)
}

export function addRecipe(recipe) {
  return postJson(RECIPE_API.add, createRecipeDTO(recipe), '新增食谱失败')
}

export function updateRecipe(recipe) {
  return postJson(RECIPE_API.update, createRecipeDTO(recipe), '修改食谱失败')
}

export function deleteRecipe(recipeId) {
  return postJson(RECIPE_API.delete, { recipeId }, '删除食谱失败')
}

export function deleteRecipeCategories(ids) {
  return postJson(RECIPE_API.deleteCategory, { ids }, '删除分类失败')
}

export async function queryIngredientCategories(isMain) {
  const params = new URLSearchParams()
  const normalizedIsMain = toNumberOrNull(isMain)
  if (normalizedIsMain !== null) params.set('isMain', String(normalizedIsMain))

  const payload = await getJson(
    `${SYS_INFO_API.ingredientCategories}?${params.toString()}`,
    '查询食材分类失败',
  )
  return toPayloadList(payload).map((item, index) => ({
    ...item,
    id: item?.id ?? item?.category ?? index,
    category: String(item?.category ?? '').trim(),
    categoryName: String(item?.categoryName ?? item?.name ?? '').trim(),
  }))
}

export async function queryIngredients({ category, isMain } = {}) {
  const payload = await postJson(
    SYS_INFO_API.ingredients,
    {
      category: String(category ?? '').trim(),
      isMain: toNumberOrNull(isMain),
    },
    '查询食材失败',
  )

  return toPayloadList(payload).map((item, index) => ({
    ...item,
    id: item?.id ?? `${category}_${index}`,
    name: String(item?.name ?? '').trim(),
    category: String(item?.category ?? category ?? '').trim(),
    categoryName: String(item?.categoryName ?? '').trim(),
    isMain: Number(item?.isMain ?? isMain ?? 0),
    iconUrl: normalizeRecipeIconUrl(item?.iconPath ?? item?.iconFileName ?? item?.iconName),
  }))
}

export async function queryCookWays() {
  const payload = await getJson(SYS_INFO_API.cookWays, '查询烹饪方式失败')
  return toPayloadList(payload).map((item, index) => ({
    ...item,
    id: item?.id ?? item?.name ?? index,
    name: String(item?.name ?? '').trim(),
    description: String(item?.description ?? '').trim(),
  }))
}

export function submitNutritionAnalysis(payload) {
  return postJson(AI_API.tasks, payload, '营养分析任务提交失败')
}
