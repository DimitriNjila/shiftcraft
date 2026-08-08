import { apiClient } from './client';
import type {
  ShiftTemplateRecord,
  SaveShiftTemplatesRequest,
  ImportShiftTemplatesRequest,
  ImageParseResponse,
} from '@/lib/types/template';

export const templatesApi = {
  get: async (restaurantId: string): Promise<ShiftTemplateRecord> => {
    const { data } = await apiClient.get('/shift-templates', {
      params: { restaurant_id: restaurantId },
    });
    return data;
  },

  save: async (payload: SaveShiftTemplatesRequest): Promise<ShiftTemplateRecord> => {
    const { data } = await apiClient.put('/shift-templates', payload);
    return data;
  },

  /**
   * Append imported templates to whatever already exists for this restaurant.
   * Backend documented in the Stage 5/6 handoff:
   *   POST /shift-templates/import/confirm
   *   { restaurant_id, rows: ShiftTemplateEntry[] }
   *
   * NOTE: this is *merge*, not replace — the backend appends rows and does
   * no deduplication. Also — the key is `rows`, not `templates` (the save
   * endpoint uses `templates`; the import endpoint doesn't). Getting the
   * key wrong returns a 422.
   */
  importConfirm: async (
    payload: ImportShiftTemplatesRequest,
  ): Promise<ShiftTemplateRecord> => {
    const { data } = await apiClient.post(
      '/shift-templates/import/confirm',
      payload,
    );
    return data;
  },

  /**
   * Image import — hits `/shift-templates/import/image/parse` with a
   * multipart body. Returns each detected shift as {name, day, start, end,
   * role?} — the vision model doesn't guess roles unless the image
   * explicitly labels them, so the frontend joins name → employee to
   * derive the role (same as the CSV path).
   *
   * Errors of interest:
   *  - 503: `GROQ_API_KEY` misconfigured server-side
   *  - 502: the model returned unparseable output (offer retry / CSV fallback)
   *  - 400: file isn't an image type
   */
  parseImage: async (file: File): Promise<ImageParseResponse> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await apiClient.post(
      '/shift-templates/import/image/parse',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
