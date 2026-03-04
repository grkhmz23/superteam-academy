import type { CourseContentService } from './content';
import { ContentLocalService } from './content-local';
import { ContentSanityService } from './content-sanity';
import { isSanityConfigured } from '@/lib/cms/sanity-client';

let contentServiceSingleton: CourseContentService | null = null;

export function getContentService(): CourseContentService {
  if (contentServiceSingleton) {
    return contentServiceSingleton;
  }

  const contentSource = process.env.CONTENT_SOURCE;

  switch (contentSource) {
    case 'sanity':
      if (isSanityConfigured()) {
        contentServiceSingleton = new ContentSanityService();
        return contentServiceSingleton;
      }
      contentServiceSingleton = new ContentLocalService();
      return contentServiceSingleton;
    case 'local':
    case undefined:
    default:
      contentServiceSingleton = new ContentLocalService();
      return contentServiceSingleton;
  }
}

export function resetContentService(): void {
  contentServiceSingleton = null;
}
