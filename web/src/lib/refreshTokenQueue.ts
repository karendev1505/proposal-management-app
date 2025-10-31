type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

class RefreshTokenQueue {
  private isRefreshing = false;
  private queue: QueueItem[] = [];

  get refreshing() {
    return this.isRefreshing;
  }

  set refreshing(value: boolean) {
    this.isRefreshing = value;
  }

  enqueue(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  resolveQueue(token: string) {
    this.queue.forEach((item) => item.resolve(token));
    this.queue = [];
  }

  rejectQueue(error: any) {
    this.queue.forEach((item) => item.reject(error));
    this.queue = [];
  }
}

export const refreshTokenQueue = new RefreshTokenQueue();
