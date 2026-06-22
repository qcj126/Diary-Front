export const GLOBAL_USER_ID = 10000

export const IMAGE_TYPES = [
  { key: 'DIET', code: 1000, label: '美食图片', categoryKeys: ['food'] },
  { key: 'RECIPE', code: 2000, label: '食谱图片', categoryKeys: ['recipe'] },
  { key: 'INGREDIENT', code: 3000, label: '食材图片', categoryKeys: ['ingredient'] },
  { key: 'BEAN_MATCHING', code: 4000, label: '拼豆图片', categoryKeys: ['bead_art', 'bean_matching'] },
  { key: 'GIFT', code: 5000, label: '礼物图片', categoryKeys: ['gift'] },
  { key: 'SNACK', code: 6000, label: '零食图片', categoryKeys: ['snack'] },
  { key: 'TEA', code: 7000, label: '奶茶图片', categoryKeys: ['milk_tea', 'tea'] },
  { key: 'TRAVEL', code: 8000, label: '旅行图片', categoryKeys: ['travel'] },
  { key: 'DAILY', code: 9000, label: '日常图片', categoryKeys: ['daily_life', 'daily'] },
  { key: 'EXERCISE', code: 10000, label: '锻炼图片', categoryKeys: ['exercise'] },
  { key: 'WALK', code: 11000, label: '散步图片', categoryKeys: ['walk'] },
]

const IMAGE_TYPE_BY_CATEGORY_KEY = new Map(
  IMAGE_TYPES.flatMap((type) => type.categoryKeys.map((categoryKey) => [categoryKey, type])),
)

export function getImageTypeByCategoryKey(categoryKey) {
  return IMAGE_TYPE_BY_CATEGORY_KEY.get(categoryKey) || IMAGE_TYPES.find((type) => type.key === 'DAILY')
}
