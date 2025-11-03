
import { GoogleGenAI, Modality } from "@google/genai";
import { AssetCategory, GenerationResult, GeneratedAsset } from '../types';

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const getPromptForCategory = (category: AssetCategory): string => {
  switch (category) {
    // Apresentação do Produto
    case AssetCategory.PRODUCT_PHOTO_4K_WHITE_BG:
      return 'Crie uma foto 4K de alta qualidade deste produto sobre um fundo branco puro e limpo, com iluminação de estúdio profissional.';
    case AssetCategory.PRODUCT_PHOTO_4K_TRANSPARENT_BG:
      return 'Gere uma imagem 4K de alta qualidade deste produto com um fundo transparente (PNG).';
    case AssetCategory.PRODUCT_VIDEO_360:
      return 'Crie um vídeo de 5 segundos mostrando uma rotação suave de 360 graus deste produto sobre um fundo neutro.';
    case AssetCategory.PRODUCT_PHOTO_ZOOM:
      return 'Crie uma foto macro de alta resolução destacando um detalhe importante ou a textura deste produto.';
    case AssetCategory.PRODUCT_PHOTO_IN_USE:
      return 'Gere uma foto realista mostrando este produto sendo usado em um cenário cotidiano apropriado.';

    // Mockups e Contextualização
    case AssetCategory.MOCKUP_WITH_MODEL:
      return 'Crie um mockup com um modelo humano (rosto não visível ou genérico) interagindo ou usando este produto de forma natural.';
    case AssetCategory.MOCKUP_LIFESTYLE:
      return 'Gere um mockup de lifestyle, mostrando este produto em um ambiente bem decorado e aspiracional que combine com a marca.';
    case AssetCategory.MOCKUP_PACKAGING:
      return 'Se este produto tiver uma embalagem, crie um mockup 3D da embalagem do produto. Se não, imagine e crie uma embalagem de luxo para ele.';
    case AssetCategory.MOCKUP_DIGITAL_DEVICE:
      return 'Crie um mockup mostrando o site ou o app relacionado a este produto na tela de um dispositivo digital moderno (laptop ou smartphone).';

    // Redes Sociais e Engajamento
    case AssetCategory.SOCIAL_INSTAGRAM_POST:
      return 'Crie um post para o feed do Instagram (formato 1:1) vibrante e chamativo com este produto como estrela principal.';
    case AssetCategory.SOCIAL_INSTAGRAM_STORY:
      return 'Gere um Story para Instagram (formato 9:16) criativo e vertical, com espaço para adicionar texto ou stickers, usando este produto.';
    case AssetCategory.SOCIAL_REELS_THUMBNAIL:
       return 'Crie uma imagem de capa (thumbnail) atraente para um vídeo do Reels ou TikTok (formato 9:16) sobre este produto.';
    case AssetCategory.SOCIAL_FACEBOOK_POST:
      return 'Gere uma imagem para um post de Facebook (formato paisagem 1.91:1) que incentive o engajamento, mostrando este produto.';
    case AssetCategory.SOCIAL_PROMO_GIF:
      return 'Crie um vídeo curto (3-5 segundos) em loop, como um GIF, mostrando uma animação simples e divertida com este produto (ex: stop-motion, brilho sutil).';

    // Marketing e Publicidade
    case AssetCategory.AD_GOOGLE_BANNER:
      return 'Crie um banner retangular (300x250 pixels) para Google Ads, com uma chamada para ação clara, usando este produto.';
    case AssetCategory.AD_FACEBOOK_BANNER:
      return 'Gere um banner de anúncio para Facebook (1200x628 pixels) visualmente impactante, focado na principal vantagem deste produto.';
    case AssetCategory.AD_YOUTUBE_THUMBNAIL:
      return 'Crie uma thumbnail para um vídeo do YouTube (16:9) com cores fortes, texto mínimo e o produto em destaque para maximizar cliques.';

    // Efeitos e Edições Avançadas
    case AssetCategory.EFFECT_3D_SHADOW:
      return 'Gere uma imagem deste produto com uma sombra 3D realista projetada em uma superfície colorida que complemente o produto.';
    case AssetCategory.EFFECT_FLAT_DESIGN:
      return 'Crie uma ilustração estilizada em flat design deste produto, usando uma paleta de cores limitada e formas geométricas.';
    case AssetCategory.EFFECT_VINTAGE:
      return 'Aplique um filtro de estilo vintage/retrô nesta imagem de produto, com granulação, cores desbotadas e um toque nostálgico.';
      
    // Plataformas e Marketplaces
    case AssetCategory.ECOMMERCE_MARKETPLACE_IMAGE:
        return 'Gere uma imagem otimizada para marketplaces como Amazon ou Mercado Livre: fundo branco puro, sem adereços, produto bem iluminado e preenchendo o quadro.';
    case AssetCategory.ECOMMERCE_WEBSITE_HERO:
        return 'Crie uma imagem "hero" de alta qualidade para a página inicial de um site, mostrando o produto em um contexto inspirador e de alta qualidade.';

    // Eventos e Lançamentos
    case AssetCategory.EVENT_INVITE:
        return 'Crie uma imagem para um convite digital para um evento de lançamento online deste produto.';

    // Aplicativos e Conteúdo Digital
    case AssetCategory.APP_ICON:
        return 'Crie um ícone de aplicativo (1024x1024) moderno e minimalista baseado neste produto.';
    case AssetCategory.APP_SPLASH_SCREEN:
        return 'Crie uma tela de splash (splash screen) para um aplicativo, apresentando este produto de forma elegante e limpa.';

    // Impressão e Materiais Físicos
    case AssetCategory.PRINT_TSHIRT:
        return 'Crie uma arte gráfica estilizada deste produto para ser estampada em uma camiseta.';
    case AssetCategory.PRINT_STICKER:
        return 'Crie o design de um adesivo (sticker) circular ou de formato personalizado baseado neste produto, pronto para impressão.';
    default:
      return `Uma imagem de marketing para ${category} com este produto.`;
  }
};


const isVideoCategory = (category: AssetCategory): boolean => {
  return [AssetCategory.PRODUCT_VIDEO_360, AssetCategory.SOCIAL_PROMO_GIF].includes(category);
};

const getAspectRatioForCategory = (category: AssetCategory): "1:1" | "9:16" | "16:9" => {
    switch (category) {
        case AssetCategory.SOCIAL_INSTAGRAM_STORY:
        case AssetCategory.SOCIAL_REELS_THUMBNAIL:
             return "9:16";
        case AssetCategory.AD_YOUTUBE_THUMBNAIL:
        case AssetCategory.ECOMMERCE_WEBSITE_HERO:
        case AssetCategory.SOCIAL_FACEBOOK_POST:
            return "16:9";
        default:
            return "1:1"; // Default for most others
    }
}


export const generateMarketingAssets = async (
  image: { data: string; mimeType: string }
): Promise<GenerationResult> => {
  const successfulAssets: GeneratedAsset[] = [];
  const failedAssetTitles: AssetCategory[] = [];

  const allCategories = Object.values(AssetCategory);

  const generationPromises = allCategories.map(async (category) => {
    const prompt = getPromptForCategory(category);
    
    try {
      if (isVideoCategory(category)) {
        // Video Generation
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt,
          image: {
            imageBytes: image.data,
            mimeType: image.mimeType,
          },
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: getAspectRatioForCategory(category),
          }
        });
        
        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({operation: operation});
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
          throw new Error('Video generation failed to produce a URI.');
        }

        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        return {
          title: category,
          url: videoUrl,
          type: 'video',
          prompt: prompt,
        } as GeneratedAsset;

      } else {
        // Image Generation
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: image.data,
                    mimeType: image.mimeType,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
              return {
                  title: category,
                  url: imageUrl,
                  type: 'image',
                  prompt: prompt,
              } as GeneratedAsset;
            }
          }
        throw new Error('No image data returned from API.');
      }
    } catch (error) {
      console.error(`Failed to generate asset for category: ${category}`, error);
      // Return category title on failure, to be caught by Promise.allSettled
      throw new Error(category);
    }
  });

  const results = await Promise.allSettled(generationPromises);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
        successfulAssets.push(result.value as GeneratedAsset);
    } else {
      failedAssetTitles.push(allCategories[index]);
      if (result.status === 'rejected') {
        console.error(`Promise rejected for ${allCategories[index]}:`, result.reason);
      }
    }
  });

  return { successfulAssets, failedAssetTitles };
};
