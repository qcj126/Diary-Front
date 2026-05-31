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
        isFavorite: true
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
        isFavorite: false
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
        isFavorite: false
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
        isFavorite: false
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
