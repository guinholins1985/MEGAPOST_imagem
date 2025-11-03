export enum AssetCategory {
  // 1. Apresentação do Produto
  PRODUCT_PHOTO_4K_WHITE_BG = 'Foto 4K (Fundo Branco)',
  PRODUCT_PHOTO_4K_TRANSPARENT_BG = 'Foto 4K (Fundo Transparente)',
  PRODUCT_VIDEO_360 = 'Vídeo 360° do Produto',
  PRODUCT_PHOTO_ZOOM = 'Foto com Zoom em Detalhes',
  PRODUCT_PHOTO_IN_USE = 'Foto do Produto em Uso',

  // 2. Mockups e Contextualização
  MOCKUP_WITH_MODEL = 'Mockup com Modelo Humano',
  MOCKUP_LIFESTYLE = 'Mockup de Lifestyle',
  MOCKUP_PACKAGING = 'Mockup de Embalagem',
  MOCKUP_DIGITAL_DEVICE = 'Mockup em Dispositivo Digital',

  // 3. Redes Sociais e Engajamento
  SOCIAL_INSTAGRAM_POST = 'Post para Instagram (1:1)',
  SOCIAL_INSTAGRAM_STORY = 'Story para Instagram (9:16)',
  SOCIAL_REELS_THUMBNAIL = 'Capa para Reels/TikTok',
  SOCIAL_FACEBOOK_POST = 'Post para Facebook',
  SOCIAL_PROMO_GIF = 'GIF Promocional (5s)',

  // 4. Marketing e Publicidade
  AD_GOOGLE_BANNER = 'Banner para Google Ads (Retangular)',
  AD_FACEBOOK_BANNER = 'Banner para Anúncio (Facebook/Instagram)',
  AD_YOUTUBE_THUMBNAIL = 'Thumbnail para YouTube (16:9)',

  // 5. Efeitos e Edições Avançadas
  EFFECT_3D_SHADOW = 'Foto com Efeito de Sombra 3D',
  EFFECT_FLAT_DESIGN = 'Foto em Estilo Flat Design',
  EFFECT_VINTAGE = 'Foto em Estilo Vintage/Retrô',

  // 6. Plataformas e Marketplaces
  ECOMMERCE_MARKETPLACE_IMAGE = 'Imagem para Marketplace (Fundo Branco)',
  ECOMMERCE_WEBSITE_HERO = 'Imagem de Destaque para Site',

  // 8. Eventos e Lançamentos (simplified)
  EVENT_INVITE = 'Convite Digital para Evento',

  // 9. Aplicativos e Conteúdo Digital
  APP_ICON = 'Ícone para App (1024x1024)',
  APP_SPLASH_SCREEN = 'Splash Screen para App',

  // 10. Impressão e Materiais Físicos
  PRINT_TSHIRT = 'Arte para Camiseta',
  PRINT_STICKER = 'Adesivo Promocional',
}

export const AssetCategoryGroups: Record<string, AssetCategory[]> = {
  'Apresentação do Produto': [
    AssetCategory.PRODUCT_PHOTO_4K_WHITE_BG,
    AssetCategory.PRODUCT_PHOTO_4K_TRANSPARENT_BG,
    AssetCategory.PRODUCT_VIDEO_360,
    AssetCategory.PRODUCT_PHOTO_ZOOM,
    AssetCategory.PRODUCT_PHOTO_IN_USE,
  ],
  'Mockups e Contextualização': [
    AssetCategory.MOCKUP_WITH_MODEL,
    AssetCategory.MOCKUP_LIFESTYLE,
    AssetCategory.MOCKUP_PACKAGING,
    AssetCategory.MOCKUP_DIGITAL_DEVICE,
  ],
  'Redes Sociais e Engajamento': [
    AssetCategory.SOCIAL_INSTAGRAM_POST,
    AssetCategory.SOCIAL_INSTAGRAM_STORY,
    AssetCategory.SOCIAL_REELS_THUMBNAIL,
    AssetCategory.SOCIAL_FACEBOOK_POST,
    AssetCategory.SOCIAL_PROMO_GIF,
  ],
  'Marketing e Publicidade': [
    AssetCategory.AD_GOOGLE_BANNER,
    AssetCategory.AD_FACEBOOK_BANNER,
    AssetCategory.AD_YOUTUBE_THUMBNAIL,
  ],
  'Efeitos e Edições Avançadas': [
    AssetCategory.EFFECT_3D_SHADOW,
    AssetCategory.EFFECT_FLAT_DESIGN,
    AssetCategory.EFFECT_VINTAGE,
  ],
  'Plataformas e Marketplaces': [
    AssetCategory.ECOMMERCE_MARKETPLACE_IMAGE,
    AssetCategory.ECOMMERCE_WEBSITE_HERO,
  ],
  'Eventos e Lançamentos': [
    AssetCategory.EVENT_INVITE,
  ],
  'Aplicativos e Conteúdo Digital': [
    AssetCategory.APP_ICON,
    AssetCategory.APP_SPLASH_SCREEN,
  ],
  'Impressão e Materiais Físicos': [
    AssetCategory.PRINT_TSHIRT,
    AssetCategory.PRINT_STICKER,
  ],
};


export interface GeneratedAsset {
  title: AssetCategory;
  url: string;
  type: 'image' | 'video';
  prompt: string;
}

export interface GenerationResult {
  successfulAssets: GeneratedAsset[];
  failedAssetTitles: AssetCategory[];
}