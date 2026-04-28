/**
 * 📊 STATELESS METRICS ENGINE
 * Optimized for Vercel Serverless.
 * No global state, no EventEmitter, zero bootstrap side-effects.
 */
class MetricsEngine {
  increment(metric: string) {
    // In serverless, we emit metrics as structured logs for Sentry/Vercel
    console.log(`[METRIC:INCREMENT] ${metric}`)
  }

  setGauge(metric: string, value: number) {
    console.log(`[METRIC:GAUGE] ${metric}=${value}`)
  }

  recordLatency(ms: number) {
    if (ms > 1000) {
      console.warn(`🐢 [PERF] Latency: ${ms}ms`)
    }
  }

  getSnapshot() {
    return { status: 'stateless', timestamp: new Date().toISOString() }
  }

  getPrometheusFormat() {
    return '# Metrics are stateless in this architecture.'
  }
}
let metrics: any

export function getMetrics() {
  if (!metrics) {
    metrics = new MetricsEngine()
  }
  return metrics
}