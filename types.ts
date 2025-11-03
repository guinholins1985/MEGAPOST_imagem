export enum AssetCategory {
  PRODUCT_PHOTO = 'Foto do Produto (Fundo Branco)',
  LIFESTYLE_MOCKUP = 'Mockup de Estilo de Vida (com Modelo)',
  PROMOTIONAL_BANNER = 'Banner Promocional',
  INSTAGRAM_POST = 'Post para Instagram',
  YOUTUBE_THUMBNAIL = 'Thumbnail para YouTube',
  SHADOW_EFFECT = 'Efeito de Sombra 3D',
  PROMOTIONAL_VIDEO = 'Vídeo Promocional',
}

export interface GeneratedAsset {
  title: AssetCategory;
  url: string;
  type: 'image' | 'video';
  prompt: string;
}