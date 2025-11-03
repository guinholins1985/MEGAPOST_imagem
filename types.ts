
export enum AssetCategory {
  PRODUCT_PHOTO = 'Product Photo (White Background)',
  LIFESTYLE_MOCKUP = 'Lifestyle Mockup (with Model)',
  PROMOTIONAL_BANNER = 'Promotional Banner',
  INSTAGRAM_POST = 'Instagram Post',
  YOUTUBE_THUMBNAIL = 'YouTube Thumbnail',
  SHADOW_EFFECT = '3D Shadow Effect',
  PROMOTIONAL_VIDEO = 'Promotional Video',
}

export interface GeneratedAsset {
  title: AssetCategory;
  url: string;
  type: 'image' | 'video';
  prompt: string;
}
