import { RECIPE_API } from '../../../api/index.js'
import { getAuthSession } from '../../auth/session.js'

const CATEGORY_LABELS = ['家常', '西餐', '甜点', '汤粥', '其他']
const MEAL_TYPE_LABELS = {
  1: '早餐',
  2: '午餐',
  3: '晚餐',
  4: '夜宵',
}
const DIFFICULTY_LABELS = {
  1: '简单',
  2: '中等',
  3: '困难',
}

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

function toList(value) {
  return Array.isArray(value) ? value : []
}

function normalizeIngredient(ingredient) {
  if (typeof ingredient === 'string') return { name: ingredient, checked: false }
  return {
    name: ingredient?.name ?? '',
    amount: ingredient?.amount ?? '',
    checked: Boolean(ingredient?.checked),
  }
}

function ingredientText(ingredient) {
  if (typeof ingredient === 'string') return ingredient
  return [ingredient?.name, ingredient?.amount].filter(Boolean).join(' ')
}

function normalizeStep(step, index) {
  if (typeof step === 'string') return step
  const stepNum = step?.stepNum ?? index + 1
  return `${stepNum}. ${step?.description ?? ''}`.trim()
}

function normalizeInstruction(step, index) {
  if (typeof step === 'string') return { title: `步骤 ${index + 1}`, description: step.replace(/^\d+\.\s*/, '') }
  return {
    title: `步骤 ${step?.stepNum ?? index + 1}`,
    description: step?.description ?? '',
  }
}

export function normalizeRecipe(raw = {}) {
  const ingredients = toList(raw.ingredients).map(normalizeIngredient)
  const steps = toList(raw.steps)
  const cookingTime = raw.cookingTime ?? 0
  const difficulty = raw.difficulty ?? 1
  const coverImg = raw.coverImg || raw.imageUrl || '/stitch_timeline_glow.png'
  const description = raw.description || raw.story || ''

  return {
    ...raw,
    id: raw.id ?? raw.recipeId,
    recipeId: raw.recipeId ?? raw.id,
    mealType: MEAL_TYPE_LABELS[raw.mealType] ?? raw.mealType ?? '未分类',
    duration: cookingTime ? `${cookingTime} 分钟` : '未填写',
    title: raw.title ?? '未命名食谱',
    imageUrl: coverImg,
    ingredients,
    steps: steps.map(normalizeStep),
    isFavorite: Boolean(raw.isFavorite),
    detail: {
      description,
      prepTime: raw.prepTime ? `${raw.prepTime} 分钟` : '未填写',
      cookTime: cookingTime ? `${cookingTime} 分钟` : '未填写',
      difficulty: DIFFICULTY_LABELS[difficulty] ?? String(difficulty),
      servings: raw.servings ?? '未填写',
      heroImageUrl: coverImg,
      nutrition: toList(raw.nutrition),
      ingredients: ingredients.map(ingredientText).filter(Boolean),
      instructions: steps.map(normalizeInstruction),
      category: CATEGORY_LABELS[raw.category] ?? raw.category,
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
  return {
    authorId: recipe.authorId ?? null,
    recipeId: recipe.recipeId ?? recipe.id ?? null,
    title: recipe.title ?? '',
    coverImg: recipe.coverImg ?? recipe.imageUrl ?? '',
    description: recipe.description ?? recipe.detail?.description ?? '',
    category: recipe.category ?? null,
    mealType: recipe.mealType ?? null,
    difficulty: recipe.difficulty ?? null,
    cookingTime: recipe.cookingTime ?? null,
    story: recipe.story ?? recipe.detail?.story ?? '',
    isAnniversary: recipe.isAnniversary ?? 0,
    anniversaryDate: recipe.anniversaryDate ?? null,
    status: recipe.status ?? 1,
    ingredients: toList(recipe.ingredients).map((item) =>
      typeof item === 'string'
        ? { name: item, amount: '' }
        : {
            name: item?.name ?? '',
            amount: item?.amount ?? '',
          },
    ),
    steps: toList(recipe.steps).map((item, index) => ({
      stepNum: item?.stepNum ?? index + 1,
      description:
        typeof item === 'string'
          ? item.replace(/^\d+\.\s*/, '')
          : item?.description ?? '',
    })),
  }
}

export async function queryRecipes(params = {}) {
  const payload = await postJson(
    RECIPE_API.query,
    {
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 10,
      category: params.category ?? null,
      mealType: params.mealType ?? null,
      difficulty: params.difficulty ?? null,
      isAnniversary: params.isAnniversary ?? null,
      keyword: params.keyword ?? '',
    },
    '查询食谱失败',
  )
  return normalizeRecipePage(payload)
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
