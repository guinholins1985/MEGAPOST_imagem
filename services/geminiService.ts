import { GoogleGenAI } from "@google/genai";
import { GeneratedAsset, AssetCategory } from '../types';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const toDataUrl = (base64: string, mimeType: string) => `data:${mimeType};base64,${base64}`;

const generateVideoAsset = async (productDescription: string): Promise<GeneratedAsset> => {
  const ai = getAi();
  const prompt = `Um vídeo promocional curto, de 5 segundos, em loop, para ${productDescription}. Dinâmico, envolvente e chamativo, perfeito para redes sociais. Qualidade 4K.`;
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      // FIX: Changed aspectRatio to a supported value for video generation. '1:1' is not supported.
      aspectRatio: '9:16',
    },
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("A geração de vídeo falhou em retornar uma URI válida.");
  }

  const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
    throw new Error(`Falha ao buscar o arquivo de vídeo: ${videoResponse.statusText}`);
  }
  const videoBlob = await videoResponse.blob();
  const videoUrl = URL.createObjectURL(videoBlob);

  return {
    title: AssetCategory.PROMOTIONAL_VIDEO,
    url: videoUrl,
    type: 'video',
    prompt,
  };
};

const generateImageAsset = async (productDescription: string, category: AssetCategory): Promise<GeneratedAsset> => {
  const ai = getAi();
  let prompt = '';

  switch (category) {
    case AssetCategory.PRODUCT_PHOTO:
      prompt = `Fotografia de produto profissional 4K de ${productDescription}, iluminação de estúdio, em um fundo branco puro. Hiper-realista.`;
      break;
    case AssetCategory.LIFESTYLE_MOCKUP:
      prompt = `Uma fotografia de estilo de vida realista de uma pessoa usando feliz ${productDescription} em um ambiente doméstico claro e moderno. O foco está no produto.`;
      break;
    case AssetCategory.PROMOTIONAL_BANNER:
      prompt = `Um banner promocional vibrante e chamativo para ${productDescription}. Inclua o texto "20% OFF". Estética de design moderno para um site de e-commerce.`;
      break;
    case AssetCategory.INSTAGRAM_POST:
      prompt = `Um modelo de post estético para Instagram apresentando ${productDescription}. Design minimalista e limpo com espaço para texto. Adequado para uma marca de luxo.`;
      break;
    case AssetCategory.YOUTUBE_THUMBNAIL:
      prompt = `Uma thumbnail de YouTube atraente sobre ${productDescription}. Texto em negrito "NOVO LANÇAMENTO!" e cores de alto contraste para maximizar cliques.`;
      break;
    case AssetCategory.SHADOW_EFFECT:
      prompt = `Uma foto de estúdio dramática de ${productDescription} com uma sombra 3D longa e suave sobre um fundo de cor sólida. Minimalista e artístico.`;
      break;
    default:
      throw new Error("Categoria de imagem não suportada");
  }

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: { numberOfImages: 1, aspectRatio: '1:1' },
  });

  const generatedImage = response.generatedImages[0];
  if (!generatedImage || !generatedImage.image.imageBytes) {
      throw new Error(`A geração de imagem falhou para a categoria: ${category}`);
  }

  return {
    title: category,
    url: toDataUrl(generatedImage.image.imageBytes, "image/png"),
    type: 'image',
    prompt,
  };
};

export const generateMarketingAssets = async (base64Image: string, mimeType: string): Promise<GeneratedAsset[]> => {
  const ai = getAi();

  const analysisResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: "Analise esta imagem de produto e descreva o produto em uma frase curta e descritiva, adequada para um prompt de geração de imagem. Por exemplo: 'Um elegante fone de ouvido gamer vermelho e preto'." },
        { inlineData: { mimeType, data: base64Image } }
      ]
    }
  });
  const productDescription = analysisResponse.text.trim();

  const imageCategories: AssetCategory[] = [
    AssetCategory.PRODUCT_PHOTO,
    AssetCategory.LIFESTYLE_MOCKUP,
    AssetCategory.PROMOTIONAL_BANNER,
    AssetCategory.INSTAGRAM_POST,
    AssetCategory.YOUTUBE_THUMBNAIL,
    AssetCategory.SHADOW_EFFECT,
  ];

  const generationPromises: Promise<GeneratedAsset>[] = [
    ...imageCategories.map(category => generateImageAsset(productDescription, category)),
    generateVideoAsset(productDescription),
  ];

  const results = await Promise.all(generationPromises);
  
  // Prioritize video to appear first
  const sortedResults = results.sort((a, b) => {
    if (a.type === 'video') return -1;
    if (b.type === 'video') return 1;
    return 0;
  });

  return sortedResults;
};