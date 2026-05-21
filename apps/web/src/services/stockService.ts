import { api } from './api';
import type { StockEntry, PaginatedResponse, ListParams } from '../types';

export const stockService = {
  async list(params?: ListParams & { itemId?: number; variationId?: number; itemName?: string }): Promise<PaginatedResponse<StockEntry>> {
    const { data } = await api.get<PaginatedResponse<StockEntry>>('/stock', { params });
    return data;
  },

  async listLow(params?: ListParams & { itemName?: string }): Promise<PaginatedResponse<StockEntry>> {
    const { data } = await api.get<PaginatedResponse<StockEntry>>('/stock/low', { params });
    return data;
  },

  async updateMinimum(itemId: number, variationId: number, size: string, minimum: number): Promise<StockEntry> {
    const { data } = await api.patch<StockEntry>(
      `/stock/${itemId}/${variationId}/${encodeURIComponent(size)}/minimum`,
      { minimum },
    );
    return data;
  },
};
