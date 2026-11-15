self.addEventListener('message', async (event) => {
  try {
    const file = event.data
    if (!(file instanceof Blob)) throw new TypeError('缺少待计算的文件')

    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
    self.postMessage({ sha256 })
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : '文件摘要计算失败' })
  }
})
