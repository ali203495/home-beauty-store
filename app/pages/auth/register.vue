<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value }
    })
    await refreshSession()
    navigateTo('/') 
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page container section-padding">
    <div class="auth-card card fade-in-up">
      <h1 class="title-md">Create Account</h1>
      <p>Join EL-WALI SHOP to track your orders and get personal recommendations.</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div v-if="error" class="error-badge">{{ error }}</div>
        
        <div class="input-group">
          <label>Full Name</label>
          <input type="text" v-model="name" required placeholder="John Doe" />
        </div>

        <div class="input-group">
          <label>Email Address</label>
          <input type="email" v-model="email" required placeholder="name@example.com" />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input type="password" v-model="password" required placeholder="Min. 8 characters" />
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>

        <div class="divider">OR</div>

        <a href="/api/auth/google" class="btn-google">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" />
           Sign up with Google
        </a>
      </form>

      <div class="auth-footer">
        <span>Already have an account? </span>
        <NuxtLink to="/auth/login">Login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
.auth-card { width: 100%; max-width: 450px; text-align: center; padding: 3rem 2.5rem; }
.auth-card p { color: var(--text-muted); margin: 0.5rem 0 2rem; font-size: 0.95rem; }
.auth-form { text-align: left; }
.input-group { margin-bottom: 1.5rem; }
.input-group label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--secondary); }
.input-group input { width: 100%; padding: 0.85rem; border: 1px solid var(--border); border-radius: var(--radius-sm); outline: none; transition: 0.2s; }
.input-group input:focus { border-color: var(--primary); }

.error-badge { background: #fef2f2; color: #ef4444; padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 2rem; font-size: 0.9rem; font-weight: 700; border: 1px solid #fee2e2; }

.divider { text-align: center; margin: 1.5rem 0; font-size: 0.8rem; color: #94a3b8; font-weight: 800; position: relative; }
.divider::before, .divider::after { content: ''; position: absolute; top: 50%; width: 35%; height: 1px; background: #e2e8f0; }
.divider::before { left: 0; } .divider::after { right: 0; }

.btn-google {
  display: flex; align-items: center; justify-content: center; gap: 1rem; width: 100%; padding: 0.85rem;
  background: white; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); font-weight: 700;
  color: #1e293b; text-decoration: none; transition: 0.2s;
}
.btn-google:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-google img { width: 20px; height: 20px; }

.auth-footer { margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted); }
.auth-footer a { color: var(--primary); font-weight: 700; }
.w-full { width: 100%; border-radius: 50px; padding: 1rem; }
</style>
