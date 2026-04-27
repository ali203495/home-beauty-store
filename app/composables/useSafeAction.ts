export const useSafeAction = () => {
  const isPending = ref(false)
  const lastActionAt = ref(0)
  const COOLDOWN = 500 // 500ms between actions

  const runSafe = async (action: () => Promise<void>) => {
    const now = Date.now()
    if (isPending.value || now - lastActionAt.value < COOLDOWN) return
    
    isPending.value = true
    try {
      await action()
      lastActionAt.value = Date.now()
    } catch (e) {
      console.error('Action Failed:', e)
    } finally {
      isPending.value = false
    }
  }

  return { isPending, runSafe }
}
