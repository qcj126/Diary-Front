export type ViewKey = 'timeline' | 'album' | 'map' | 'review' | 'settings'
export type RecordCategory = '约会' | '日常' | '旅行' | '纪念日'
export type Mood = '心动' | '开心' | '治愈' | '感动' | '平静' | '爆笑'

export interface GeoPoint {
  lat: number
  lng: number
  x: number
  y: number
}

export interface LoveRecord {
  id: string
  coupleId?: string
  creatorUserId?: string
  locationId?: string | null
  title: string
  date: string
  content: string
  images: string[]
  location: string
  point: GeoPoint
  moods: Mood[]
  tags: string[]
  category: RecordCategory
  important: boolean
  sort?: number
  imageRefs?: Array<{ relationId: string; imageId: string; url: string }>
  moodRefs?: Array<{ relationId: string; moodId: string; name: Mood }>
  tagRefs?: Array<{ relationId: string; tagId: string; name: string }>
}

export interface Anniversary {
  id: string
  coupleId?: string
  creatorUserId?: string
  name: string
  date: string
  repeatType?: number
  remindDays?: number
  pinned?: boolean
  sort?: number
}

export interface RelationshipInfo {
  id?: string
  ownerUserId?: string
  partnerUserId?: string | null
  startDate: string
  partnerName: string
  status?: number
  anniversaries: Anniversary[]
}

export interface LoveData {
  relationship: RelationshipInfo
  records: LoveRecord[]
}

export interface RecordDraft {
  id?: string
  title: string
  date: string
  content: string
  images: string[]
  location: string
  moods: Mood[]
  tags: string[]
  category: RecordCategory
  important: boolean
}
