class Timer {
  private startTime!: number;
  private endTime!: number;

  Timer() {
    this.startTime = 0;
    this.endTime = 0;
  }

  start(): void {
    this.startTime = Date.now();
  }

  stop(): void {
    if (this.startTime === 0) throw new Error("Timer is not started");
    this.endTime = Date.now();
  }

  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
  }

  getElapsedTime(): number {
    return this.endTime - this.startTime;
  }
}

export default Timer;
