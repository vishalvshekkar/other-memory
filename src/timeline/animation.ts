/**
 * Animation utilities for smooth zoom and pan transitions.
 */

import type { CameraState } from "@/types";

/** Ease-out cubic: starts fast, decelerates */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Animate camera from current to target over duration ms */
export function animateCamera(
  from: CameraState,
  to: CameraState,
  duration: number,
  onFrame: (camera: CameraState) => void,
  onComplete?: () => void,
): () => void {
  const startTime = performance.now();
  let rafId: number;

  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(progress);

    const current: CameraState = {
      center: from.center + (to.center - from.center) * eased,
      pixels_per_year:
        from.pixels_per_year +
        (to.pixels_per_year - from.pixels_per_year) * eased,
    };

    onFrame(current);

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  }

  rafId = requestAnimationFrame(tick);

  // Return cancel function
  return () => cancelAnimationFrame(rafId);
}

/**
 * Momentum pan — tracks velocity from pointer movements and applies
 * deceleration after release.
 */
export class MomentumTracker {
  private velocities: { dx: number; time: number }[] = [];
  private rafId: number = 0;

  /** Record a pointer movement */
  push(dx: number) {
    const now = performance.now();
    this.velocities.push({ dx, time: now });

    // Keep only last 100ms of samples
    const cutoff = now - 100;
    this.velocities = this.velocities.filter((v) => v.time >= cutoff);
  }

  /** Get the current velocity in pixels/ms */
  getVelocity(): number {
    if (this.velocities.length < 2) return 0;

    const first = this.velocities[0];
    const last = this.velocities[this.velocities.length - 1];
    const dt = last.time - first.time;
    if (dt === 0) return 0;

    let totalDx = 0;
    for (const v of this.velocities) {
      totalDx += v.dx;
    }

    return totalDx / dt;
  }

  /** Start momentum animation, returns cancel function */
  startMomentum(onPan: (deltaPixels: number) => void): () => void {
    const velocity = this.getVelocity();
    this.velocities = [];

    // Minimum velocity threshold
    if (Math.abs(velocity) < 0.1) return () => {};

    let currentVelocity = velocity;
    const friction = 0.95;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      currentVelocity *= friction;
      const dx = currentVelocity * dt;

      if (Math.abs(currentVelocity) < 0.01) return;

      onPan(dx);
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(this.rafId);
  }

  cancel() {
    cancelAnimationFrame(this.rafId);
    this.velocities = [];
  }
}
