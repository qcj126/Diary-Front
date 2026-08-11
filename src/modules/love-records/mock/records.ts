import type { LoveData, LoveRecord, Mood, RecordCategory } from '../types/records'

const photos = {
  night: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=82',
  cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=82',
  movie: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=82',
  hotpot: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=82',
  sea: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=82',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=82',
  picnic: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=82',
  flower: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=82',
  train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1000&q=82',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=82',
  home: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=82',
  dinner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=82',
  street: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=82',
  museum: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=1000&q=82',
  sunrise: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1000&q=82',
  snow: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1000&q=82',
}

const points = {
  // lat/lng 用于 Leaflet；x/y 用于在线地图加载失败后的静态足迹降级视图。
  nanshan: { lat: 29.55, lng: 106.59, x: 67, y: 36 },
  cafe: { lat: 29.57, lng: 106.55, x: 46, y: 47 },
  cinema: { lat: 29.54, lng: 106.52, x: 30, y: 65 },
  sea: { lat: 22.51, lng: 113.94, x: 77, y: 76 },
  home: { lat: 29.56, lng: 106.57, x: 57, y: 55 },
  museum: { lat: 29.53, lng: 106.58, x: 61, y: 69 },
  city: { lat: 30.66, lng: 104.06, x: 20, y: 28 },
}

function record(id: string, title: string, date: string, content: string, images: string[], location: string, point: LoveRecord['point'], moods: Mood[], tags: string[], category: RecordCategory, important = false): LoveRecord {
  return { id, title, date, content, images, location, point, moods, tags, category, important }
}

export const initialLoveData: LoveData = {
  relationship: {
    startDate: '2025-03-10',
    partnerName: '小雨',
    anniversaries: [
      { id: 'a1', name: '恋爱纪念日', date: '2025-03-10' },
      { id: 'a2', name: '第一次见面', date: '2024-09-17' },
      { id: 'a3', name: '第一次旅行', date: '2025-10-03' },
      { id: 'a4', name: '小雨的生日', date: '2000-11-22' },
    ],
  },
  records: [
    record('r01', '周末咖啡馆', '2026-08-10', '她点了燕麦拿铁，我点了手冲。窗外下着很小的雨，我们把最近想做的事情写满了两页纸。', [photos.cafe, photos.flower], '小森林咖啡', points.cafe, ['治愈', '开心'], ['日常', '咖啡'], '日常', true),
    record('r02', '电影之夜', '2026-08-08', '重看了我们第一次约会时看的电影。散场后沿着街慢慢走，发现喜欢的对白还是同一句。', [photos.movie], '万象影城', points.cinema, ['感动'], ['约会', '电影'], '约会'),
    record('r03', '火锅探店', '2026-08-05', '重庆老火锅果然没有让人失望，点菜点多了，最后两个人扶着墙走出店门。', [photos.hotpot, photos.dinner], '渝味晓宇', points.home, ['爆笑', '开心'], ['美食', '约会'], '约会'),
    record('r04', '海边散步', '2026-08-01', '黄昏的海边风很大，我们脱了鞋踩水，约好下次要带一块野餐垫来。', [photos.sea, photos.sunrise], '深圳湾公园', points.sea, ['心动', '治愈'], ['旅行', '海边'], '旅行', true),
    record('r05', '她的生日惊喜', '2026-07-28', '偷偷准备了一周的蛋糕和花，关灯后她真的完全没有猜到。希望每一岁的愿望都有我参与。', [photos.cake, photos.flower], '家里', points.home, ['感动', '心动'], ['生日', '纪念日', '惊喜'], '纪念日', true),
    record('r06', '山顶看夜景', '2026-07-20', '第一次在山顶吹着风看夜景，她说这是今年最浪漫的一次约会。我们约定秋天再来。', [photos.night, photos.street], '南山一棵树', points.nanshan, ['心动', '开心'], ['约会', '夜景'], '约会', true),
    record('r07', '周日野餐', '2026-07-12', '带了三明治和西瓜，在树荫下躺了一整个下午。什么都不赶的日子特别珍贵。', [photos.picnic], '中央公园', points.museum, ['平静', '治愈'], ['日常', '野餐'], '日常'),
    record('r08', '雨后的花店', '2026-06-26', '路过花店时她盯着向日葵看了很久，于是买了一束。回家找遍柜子才找到合适的瓶子。', [photos.flower], '山茶花店', points.cafe, ['开心'], ['日常', '花'], '日常'),
    record('r09', '坐火车去成都', '2026-06-18', '带着一只箱子就出发了。一路分享耳机、零食和窗外的云，抵达时刚好天晴。', [photos.train, photos.street], '成都东站', points.city, ['开心', '心动'], ['旅行', '火车'], '旅行'),
    record('r10', '美术馆下午', '2026-06-03', '她认真看画时我偷偷拍了张照片。我们对同一幅画有完全不同的理解，却聊得很开心。', [photos.museum], '当代美术馆', points.museum, ['平静'], ['约会', '展览'], '约会'),
    record('r11', '第一次一起爬山', '2026-05-24', '出发时信心满满，半程就开始互相打气。站上山顶的风和那瓶冰水都格外甜。', [photos.mountain, photos.sunrise], '缙云山', points.nanshan, ['开心', '爆笑'], ['旅行', '户外'], '旅行'),
    record('r12', '居家整理日', '2026-05-09', '一起整理了照片、书和旧车票，原来随手留下的小东西已经装满一个盒子。', [photos.home], '家里', points.home, ['治愈'], ['日常', '整理'], '日常'),
    record('r13', '周年晚餐', '2026-03-10', '在一起一周年。没有复杂的安排，只是认真吃饭、交换手写信，然后走回我们第一次牵手的路口。', [photos.dinner, photos.night], '江畔餐厅', points.cafe, ['感动', '心动'], ['纪念日', '周年'], '纪念日', true),
    record('r14', '雪地里的合照', '2026-02-14', '赶上城市难得的大雪，手都冻红了还在反复自拍。最后那张有点糊，却是最喜欢的一张。', [photos.snow, photos.cafe], '仙女山', points.nanshan, ['爆笑', '心动'], ['旅行', '冬天'], '旅行'),
    record('r15', '新年第一顿饭', '2026-01-01', '把去年想说的感谢都说完，再一起写下今年的愿望。我们决定每个月至少认真约会一次。', [photos.hotpot], '家里', points.home, ['感动', '开心'], ['日常', '新年'], '日常'),
    record('r16', '初见的街角', '2025-09-17', '又走到第一次见面的街角，店铺换了招牌，但那天紧张又期待的感觉还记得很清楚。', [photos.street, photos.cafe], '解放碑', points.city, ['心动', '平静'], ['纪念日', '初见'], '纪念日', true),
  ],
}
