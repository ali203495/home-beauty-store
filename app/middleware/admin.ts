export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value || user.value?.role !== 'admin') {
    return navigateTo('/auth/login?redirect=' + to.fullPath)
  }
})
