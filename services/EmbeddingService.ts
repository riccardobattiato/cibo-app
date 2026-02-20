import { TextEmbeddingsModule } from 'react-native-executorch';
import modelSource from '@/assets/model/all-MiniLM-L6-v2_xnnpack.pte';
import tokenizerSource from '@/assets/model/tokenizer.json';

export class EmbeddingService {
  private module: TextEmbeddingsModule | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  async loadModel(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        this.module = new TextEmbeddingsModule();
        await this.module.load({
          modelSource,
          tokenizerSource,
        });
        this.isLoaded = true;
      } catch (error) {
        this.loadPromise = null; // Allow retry on failure
        throw error;
      }
    })();

    return this.loadPromise;
  }

  async getEmbedding(text: string): Promise<Float32Array> {
    if (!this.isLoaded || !this.module) {
      await this.loadModel();
    }

    // Model execution lock to prevent parallel forward passes
    return this.withLock(async () => {
      return this.module!.forward(text);
    });
  }

  private isExecuting = false;
  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    while (this.isExecuting) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.isExecuting = true;
    try {
      return await fn();
    } finally {
      this.isExecuting = false;
    }
  }
}

export const embeddingService = new EmbeddingService();
