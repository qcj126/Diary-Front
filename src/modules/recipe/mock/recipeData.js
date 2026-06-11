export const RECIPE_DATA = {
  today: {
    date: '10月24日，周一',
    isToday: true,
    recipes: [
      {
        id: 1,
        mealType: '早餐',
        duration: '25 分钟',
        title: '蓬松蓝莓松饼',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtXYH9xfoIEE4JfHWiJ0cSC5d1eK5OsEtmLhebQnUj-unKOHSnbe_D3ghaevpbWOdK4454nkXsfFeSt-5au3iJ33i-0-c01NWUncb-8R8w3Y4FrXlgN7OKm4RRRAb7IaphfD-cHrql7M-D4VwFrv0rtxiI3JFl5fLPudfOZ_bZjLg2rVHukuOkH4nS9yn5iwzTt9rQVw4PqGvJtNMHPJekypA7Ac82VH8LV7a5U84rkHm-7J45TrhIuptTCTtrXatR1rK3O9ZbJJE',
        ingredients: [
          { name: '通用面粉', checked: false },
          { name: '新鲜鸡蛋', checked: false },
          { name: '新鲜蓝莓', checked: false }
        ],
        steps: [
          '1. 搅拌干性材料。',
          '2. 轻轻拌入蓝莓。'
        ],
        isFavorite: true,
        detail: {
          description: '这款松饼口感轻盈如云朵，新鲜蓝莓在热气中爆浆，每一口都是清晨的治愈时刻。',
          prepTime: '10 分钟',
          cookTime: '15 分钟',
          difficulty: '简单',
          servings: '2 人份',
          heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBzOddlEjrMl_AH_Pqf_MotogS5difnAcx7D2GGRCxbNT7vTCwqcumKf-jkpC-gGA9Z0jgXkSKZihunPUVsMzV2654sGFjGufU5L-OLkd_-47Zkua89BJwnTXcU9JouSktTnc8B_funfEowwXuueml9cRa7XONbHf68-dJaHjpDdS2ukBlxaNgVrxiEnve8d3swQT6rPk_owsqI8yH81eW4rU-kdmA4waVuBic-1806styY2Y-EMkTJlAgpDlQy4uKOTEGoDi7cXc',
          nutrition: [
            { label: '卡路里', value: '320' },
            { label: '蛋白质', value: '8g' },
            { label: '碳水', value: '45g' },
            { label: '脂肪', value: '12g' }
          ],
          ingredients: [
            '通用面粉 200g',
            '新鲜鸡蛋 2个',
            '新鲜蓝莓 100g',
            '牛奶 250ml',
            '融化黄油 30g',
            '泡打粉 5g',
            '枫糖浆 适量'
          ],
          instructions: [
            {
              title: '混合干粉',
              description: '在一个大碗中搅拌面粉、糖和泡打粉，确保泡打粉分布均匀。'
            },
            {
              title: '混合湿料',
              description: '加入鸡蛋、牛奶和融化的黄油。轻轻搅拌至无明显干粉颗粒。'
            },
            {
              title: '拌入蓝莓',
              description: '轻轻翻拌入新鲜蓝莓，避免面糊过度搅拌。'
            },
            {
              title: '煎烤',
              description: '中火预热平底锅，倒入面糊煎至两面金黄。'
            }
          ]
        }
      },
      {
        id: 2,
        mealType: '午餐',
        duration: '15 分钟',
        title: '水波蛋牛油果吐司',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCktEdb-c2er3eVqhUN9Spj9w06mH8cM2fSmEsSyb8h-5pRuCCfd8mKLidFuVa_1TbpCbm2SbQljf5TNbM8wfVumjNmAm5QiZYjZx3yRcxGi90FO6hvTypDn73Ydj8LSUWA0kTYP2mkPMfJLf9DksDMulSchRVpDUus92w4F-wvbgo2z53dzGsLpzSkJ-VAFW1RaAl-Cc53D7SUUambV7IbqXO5Tawem2t1C6An_PR9jAyvNITqA3Cc6hBRKUeFPLElLZXP9HIgVUg',
        ingredients: [
          { name: '酸面包', checked: false },
          { name: '熟透的牛油果', checked: false }
        ],
        steps: [
          '1. 将酸面包烤至金黄。',
          '2. 加入青柠汁将牛油果捣碎。'
        ],
        isFavorite: false,
        detail: {
          description: '水波蛋搭配牛油果吐司，是一款简单但富含营养的早午餐选择。',
          prepTime: '8 分钟',
          cookTime: '12 分钟',
          difficulty: '简单',
          servings: '1-2 人份',
          heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCktEdb-c2er3eVqhUN9Spj9w06mH8cM2fSmEsSyb8h-5pRuCCfd8mKLidFuVa_1TbpCbm2SbQljf5TNbM8wfVumjNmAm5QiZYjZx3yRcxGi90FO6hvTypDn73Ydj8LSUWA0kTYP2mkPMfJLf9DksDMulSchRVpDUus92w4F-wvbgo2z53dzGsLpzSkJ-VAFW1RaAl-Cc53D7SUUambV7IbqXO5Tawem2t1C6An_PR9jAyvNITqA3Cc6hBRKUeFPLElLZXP9HIgVUg',
          nutrition: [
            { label: '卡路里', value: '280' },
            { label: '蛋白质', value: '10g' },
            { label: '碳水', value: '30g' },
            { label: '脂肪', value: '14g' }
          ],
          ingredients: [
            '酸面包 2 片',
            '熟透牛油果 1 个',
            '鸡蛋 2 个',
            '盐与黑胡椒 适量',
            '青柠汁 1 茶匙'
          ],
          instructions: [
            { title: '烤制吐司', description: '将酸面包两面烤至金黄酥脆。' },
            { title: '处理牛油果', description: '将牛油果去皮去核，加入青柠汁捣成泥。' },
            { title: '水波蛋制作', description: '将水煮蛋煮至蛋白凝固、蛋黄微流质。' },
            { title: '组合呈盘', description: '在吐司上铺牛油果泥，放上水波蛋，撒上黑胡椒。' }
          ]
        }
      },
      {
        id: 3,
        mealType: '晚餐',
        duration: '35 分钟',
        title: '蜜汁煎三文鱼',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLnhW5uWOpQ9p17juTmRietCONzofRF2DnRFOTZze4APcH2yGZB-NFOOcCjv-etLeZrrU-FsaOjmXzHOtsC6WQAFl2syT63mKl63wxjU-kwOYQEkoCnk5bFG_b3Jg5c8jwtFJ27k9zWEWcAcMMZFBjwL7crsmXCxEe0EbHRBggwvi8rBKVFgjf-fGQP6HcMeG-QYufxnAcpbDz6wuCQSM2NMOkwXtQjm_D4H8v7htw96ZDECkfNFkX6yY6E4JxmgYvftGT8L06whk',
        ingredients: [
          { name: '大西洋三文鱼', checked: false },
          { name: '野花蜂蜜', checked: false }
        ],
        steps: [
          '1. 先煎三文鱼带皮一侧。',
          '2. 刷上蜜汁并简短烘烤。'
        ],
        isFavorite: false,
        detail: {
          description: '这道蜜汁煎三文鱼外皮焦香，内里鲜嫩多汁，适合作为家庭晚餐主菜。',
          prepTime: '10 分钟',
          cookTime: '25 分钟',
          difficulty: '中等',
          servings: '2 人份',
          heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLnhW5uWOpQ9p17juTmRietCONzofRF2DnRFOTZze4APcH2yGZB-NFOOcCjv-etLeZrrU-FsaOjmXzHOtsC6WQAFl2syT63mKl63wxjU-kwOYQEkoCnk5bFG_b3Jg5c8jwtFJ27k9zWEWcAcMMZFBjwL7crsmXCxEe0EbHRBggwvi8rBKVFgjf-fGQP6HcMeG-QYufxnAcpbDz6wuCQSM2NMOkwXtQjm_D4H8v7htw96ZDECkfNFkX6yY6E4JxmgYvftGT8L06whk',
          nutrition: [
            { label: '卡路里', value: '420' },
            { label: '蛋白质', value: '28g' },
            { label: '碳水', value: '5g' },
            { label: '脂肪', value: '32g' }
          ],
          ingredients: [
            '大西洋三文鱼 2 片',
            '野花蜂蜜 2 汤匙',
            '酱油 1 汤匙',
            '橄榄油 1 汤匙',
            '盐与黑胡椒 适量'
          ],
          instructions: [
            { title: '腌制三文鱼', description: '将三文鱼与蜂蜜、酱油和少许橄榄油拌匀，腌制 10 分钟。' },
            { title: '煎制', description: '中火煎三文鱼皮面 4-5 分钟，翻面后继续煎 3-4 分钟。' },
            { title: '刷蜜汁', description: '将剩余蜂蜜酱汁刷在鱼身上，快速收汁。' },
            { title: '装盘', description: '撒上黑胡椒和香草，即可上桌。' }
          ]
        }
      },
      {
        id: 4,
        mealType: '甜点',
        duration: '20 分钟',
        title: '熔岩黑巧克力蛋糕',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHZBi9j7i1fzGUzGmlZs5oJ3UyJo0vbdRS0mlIn1QaeGNNuk0XjDaiMifuxD0Gb8aU2U5qrECseeq08nhlamMrcJIfOJNBkmM52sIktFdw_JSdkSFHgjRSH5wt4G7eqwjmDb82zCru_6Jyk6iH7XY4UaUVEz0P0BngJGMtruQispeMvmOa-GLgifPlx5JzLGuOC5gVjCowXvI1KZQzN4TkKcjRlxnWGb22guDVmCIyWy6Od9oaODlANRCNBg32VPOXxayv4PgmdKA',
        ingredients: [
          { name: '70% 黑巧克力', checked: false },
          { name: '有机黄油', checked: false }
        ],
        steps: [
          '1. 融化黄油和巧克力。',
          '2. 烘烤至边缘成型。'
        ],
        isFavorite: false,
        detail: {
          description: '这个熔岩巧克力蛋糕外层香浓，内芯流心，适合在特别时刻与家人分享。',
          prepTime: '15 分钟',
          cookTime: '12 分钟',
          difficulty: '中等',
          servings: '2-3 人份',
          heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHZBi9j7i1fzGUzGmlZs5oJ3UyJo0vbdRS0mlIn1QaeGNNuk0XjDaiMifuxD0Gb8aU2U5qrECseeq08nhlamMrcJIfOJNBkmM52sIktFdw_JSdkSFHgjRSH5wt4G7eqwjmDb82zCru_6Jyk6iH7XY4UaUVEz0P0BngJGMtruQispeMvmOa-GLgifPlx5JzLGuOC5gVjCowXvI1KZQzN4TkKcjRlxnWGb22guDVmCIyWy6Od9oaODlANRCNBg32VPOXxayv4PgmdKA',
          nutrition: [
            { label: '卡路里', value: '450' },
            { label: '蛋白质', value: '6g' },
            { label: '碳水', value: '38g' },
            { label: '脂肪', value: '30g' }
          ],
          ingredients: [
            '70% 黑巧克力 100g',
            '有机黄油 100g',
            '鸡蛋 3 个',
            '细砂糖 70g',
            '低筋面粉 30g'
          ],
          instructions: [
            { title: '准备材料', description: '将巧克力和黄油切块，鸡蛋室温放置。' },
            { title: '混合食材', description: '融化巧克力黄油后加入蛋液和糖，再筛入面粉。' },
            { title: '烘烤', description: '倒入模具 200℃ 烘烤 10-12 分钟。' },
            { title: '静置与装盘', description: '稍微冷却后倒扣，搭配鲜果食用。' }
          ]
        }
      }
    ]
  },
  yesterday: {
    date: '10月23日，周日',
    isToday: false,
    recipes: []
  }
}

export const RECIPE_CATEGORIES = [
  { key: 'breakfast', label: '早餐', icon: 'free_breakfast' },
  { key: 'lunch', label: '午餐', icon: 'lunch_dining' },
  { key: 'dinner', label: '晚餐', icon: 'dinner_dining' },
  { key: 'dessert', label: '甜点', icon: 'cake' },
  { key: 'drink', label: '饮品', icon: 'local_cafe' }
]

export const RECIPE_SETTINGS = {
  kitchenName: 'Heirloom Kitchen',
  ownerName: 'Lin',
  bio: '把每日食谱、烹饪节奏和厨房偏好整理成一本带有杂志气质的数字食谱册。',
  servingsPreset: '2 人份',
  theme: '暖调食谱簿',
  syncStatus: '已连接云端备份',
  lastBackup: '2026-06-02 10:40',
  stepSort: '手动排序优先',
  workflowTip: '记录步骤时优先写出火候变化、食材状态和出锅判断点，方便之后复刻。',
  showNutrition: true,
  showCookingTime: true,
  stickyIngredients: true
}
