export const RECIPE_DATA = {
  today: {
    date: '今天',
    isToday: true,
    recipes: [
      {
        id: 'demo-1',
        recipeId: null,
        mealType: '晚餐',
        mealTypeValue: 3,
        category: 0,
        difficulty: 2,
        difficultyValue: 2,
        cookingTime: 45,
        duration: '45 分钟',
        title: '番茄牛腩',
        coverImg: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
        description: '酸甜番茄和软烂牛腩，很适合下饭。',
        ingredients: [
          { name: '牛腩', amount: '500g', checked: false },
          { name: '番茄', amount: '3 个', checked: false },
          { name: '土豆', amount: '1 个', checked: false },
        ],
        steps: ['1. 牛腩焯水后冲净浮沫', '2. 番茄炒出汁后加入牛腩炖煮', '3. 放入土豆收汁调味'],
        isFavorite: true,
        detail: {
          description: '酸甜番茄和软烂牛腩，很适合下饭。',
          prepTime: '15 分钟',
          cookTime: '45 分钟',
          difficulty: '中等',
          servings: '2 人份',
          heroImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
          nutrition: [],
          ingredients: ['牛腩 500g', '番茄 3 个', '土豆 1 个'],
          instructions: [
            { title: '步骤 1', description: '牛腩焯水后冲净浮沫' },
            { title: '步骤 2', description: '番茄炒出汁后加入牛腩炖煮' },
            { title: '步骤 3', description: '放入土豆收汁调味' },
          ],
          category: '家常',
          story: '',
        },
      },
    ],
  },
  yesterday: {
    date: '昨天',
    isToday: false,
    recipes: [],
  },
}

export const RECIPE_CATEGORIES = [
  { key: 'all', label: '全部', icon: 'restaurant_menu', value: null },
  { key: 'home', label: '家常', icon: 'home', value: 0 },
  { key: 'western', label: '西餐', icon: 'local_pizza', value: 1 },
  { key: 'dessert', label: '甜点', icon: 'cake', value: 2 },
  { key: 'soup', label: '汤粥', icon: 'ramen_dining', value: 3 },
  { key: 'other', label: '其他', icon: 'more_horiz', value: 4 },
]

export const RECIPE_SETTINGS = {
  kitchenName: 'Diary Kitchen',
  ownerName: 'Lin',
  bio: '记录每日食谱、烹饪节奏和厨房偏好。',
  servingsPreset: '2 人份',
  theme: '暖调食谱簿',
  syncStatus: '已连接后端接口',
  lastBackup: '实时同步',
  stepSort: '按步骤顺序',
  workflowTip: '食材按“名称 数量”填写，步骤按行填写。',
  showNutrition: true,
  showCookingTime: true,
  stickyIngredients: true,
}
