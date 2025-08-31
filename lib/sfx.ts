let ctx: AudioContext | null = null
let enabled = true
let volume = 0.7
const cache = new Map<string, AudioBuffer>()

async function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (ctx.state === "suspended") await ctx.resume()
}

async function loadSfx(url: string) {
  if (cache.has(url)) return cache.get(url)!
  await ensureCtx()
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  const audio = await ctx!.decodeAudioData(buf)
  cache.set(url, audio)
  return audio
}

async function playSfx(url: string) {
  if (!enabled) return
  try {
    const buf = await loadSfx(url)
    const src = ctx!.createBufferSource()
    const gain = ctx!.createGain()
    gain.gain.value = volume
    src.buffer = buf
    src.connect(gain).connect(ctx!.destination)
    src.start(0)
  } catch (error) {
    console.warn("[v0] Sound effect failed to play:", error)
  }
}

export const sfx = {
  enable(v: boolean) {
    enabled = v
  },
  setVolume(v: number) {
    volume = Math.min(1, Math.max(0, v))
  },
  click() {
    playSfx("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-pgpeiKRqYu1FLyuHakrLugzFtkwn6q.mp3")
  },
  card() {
    playSfx("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hitcard-awlGXYGqDl8Z41duIkiPSFvlEC2JCH.mp3")
  },
}
