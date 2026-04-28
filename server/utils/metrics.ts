// server/utils/metrics.ts
import { EventEmitter } from 'events'

class MetricsEngine extends EventEmitter {
  private counters: Record<string, number> = {
    checkout_success: 0,
    checkout_failed: 0,
    fulfillment_success: 0,
    fulfillment_failed: 0,
    dlq_quarantine: 0
  }

  private gauges: Record<string, number> = {
    queue_depth_fulfillment: 0,
    avg_latency_ms: 0
  }

  private latencySamples: number[] = []
  private MAX_SAMPLES = 100

  increment(metric: keyof typeof this.counters) {
    this.counters[metric]++
    this.emit('update', { metric, value: this.counters[metric] })
  }

  setGauge(metric: keyof typeof this.gauges, value: number) {
    this.gauges[metric] = value
    this.emit('update', { metric, value })
  }

  recordLatency(ms: number) {
    this.latencySamples.push(ms)
    if (this.latencySamples.length > this.MAX_SAMPLES) {
      this.latencySamples.shift()
    }
    const sum = this.latencySamples.reduce((a, b) => a + b, 0)
    this.gauges.avg_latency_ms = Math.round(sum / this.latencySamples.length)
  }

  getSnapshot() {
    return {
      counters: { ...this.counters },
      gauges: { ...this.gauges },
      timestamp: new Date().toISOString()
    }
  }

  getPrometheusFormat() {
    let output = ''
    for (const [key, val] of Object.entries(this.counters)) {
      output += `# TYPE ${key} counter\n${key} ${val}\n`
    }
    for (const [key, val] of Object.entries(this.gauges)) {
      output += `# TYPE ${key} gauge\n${key} ${val}\n`
    }
    return output
  }
}

export const metrics = new MetricsEngine()
