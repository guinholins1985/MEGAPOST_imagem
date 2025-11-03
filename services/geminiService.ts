import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedAsset, AssetCategory } from '../types';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const toDataUrl = (base64: string, mimeType: string) => `data:${mimeType};base64,${base64}`;

const getRelevantAssetCategories = async (productDescription: string): Promise<AssetCategory[]> => {
  const ai = getAi();
  const allCategories = Object.keys(AssetCategory) as AssetCategory[];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Com base na descrição do produto: "${productDescription}", determine quais das seguintes categorias de materiais de marketing são as mais relevantes. Retorne no máximo 12 categorias. Se o produto for físico, inclua mockups e fotos de produto. Se for digital (app/software), inclua mockups de dispositivo e ícones de app.

Categorias disponíveis:
${allCategories.join('\n')}

Responda com um array JSON contendo apenas as chaves das categorias relevantes.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          enum: allCategories,
        },
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    if (jsonText.startsWith('[') && jsonText.endsWith(']')) {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => allCategories.includes(item as AssetCategory));
      }
    }
    return [];
  } catch (e) {
    console.error("Falha ao analisar o JSON de categorias relevantes:", e);
    return [
      AssetCategory.PRODUCT_PHOTO_4K_WHITE_BG,
      AssetCategory.MOCKUP_LIFESTYLE,
      AssetCategory.SOCIAL_INSTAGRAM_POST,
      AssetCategory.AD_YOUTUBE_THUMBNAIL
    ];
  }
};


const generateVideoAsset = async (productDescription: string, category: AssetCategory): Promise<GeneratedAsset> => {
    const ai = getAi();
    let prompt = '';
    let aspectRatio: '16:9' | '9:16' = '16:9';

    switch (category) {
        case AssetCategory.PRODUCT_VIDEO_360:
            prompt = `Um vídeo de 360 graus em loop do produto, ${productDescription}, girando lentamente sobre um fundo de estúdio neutro e limpo. Iluminação profissional, qualidade 4K.`;
            aspectRatio = '16:9';
            break;
        case AssetCategory.SOCIAL_PROMO_GIF:
            prompt = `Um GIF promocional de 5 segundos, energético e moderno, para ${productDescription}. Loop perfeito. Sem texto, com espaço para sobreposição de gráficos. Cores vibrantes.`;
            aspectRatio = '9:16';
            break;
        default:
             throw new Error(`Categoria de vídeo não suportada: ${category}`);
    }
  
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        },
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
        throw new Error(`A geração de vídeo falhou para a categoria: ${category}`);
    }

    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Falha ao buscar o arquivo de vídeo: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);

    return {
        title: category,
        url: videoUrl,
        type: 'video',
        prompt,
    };
};

const generateImageAsset = async (productDescription: string, category: AssetCategory): Promise<GeneratedAsset> => {
  const ai = getAi();
  let prompt = '';
  let aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' = '1:1';

  switch (category) {
    case AssetCategory.PRODUCT_PHOTO_4K_WHITE_BG:
      prompt = `Fotografia de produto profissional 4K de ${productDescription}, iluminação de estúdio, em um fundo branco puro. Hiper-realista, sombras suaves.`;
      break;
    case AssetCategory.PRODUCT_PHOTO_4K_TRANSPARENT_BG:
      prompt = `Fotografia de produto profissional 4K de ${productDescription}, iluminação de estúdio, em um fundo transparente (PNG). Hiper-realista.`;
      break;
    case AssetCategory.PRODUCT_PHOTO_ZOOM:
      prompt = `Fotografia macro de um detalhe importante de ${productDescription}. Foco nítido na textura e material, fundo desfocado. Qualidade 4K.`;
      break;
    case AssetCategory.PRODUCT_PHOTO_IN_USE:
       prompt = `Fotografia de ${productDescription} sendo utilizado em um contexto real e autêntico. Ação congelada, iluminação natural, foco no produto.`;
       break;
    case AssetCategory.MOCKUP_WITH_MODEL:
      prompt = `Uma fotografia de estilo de vida realista de uma pessoa diversa e feliz usando ${productDescription} em um ambiente moderno. O foco está no produto.`;
      break;
    case AssetCategory.MOCKUP_LIFESTYLE:
      prompt = `Cena de lifestyle mostrando ${productDescription} em um ambiente cotidiano bem arrumado, como uma mesa de escritório ou uma bancada de cozinha. Sem pessoas. Iluminação suave e natural.`;
      break;
    case AssetCategory.MOCKUP_PACKAGING:
      prompt = `Mockup 3D da embalagem de ${productDescription} ao lado do produto. Design limpo, fundo neutro, iluminação de estúdio.`;
      break;
    case AssetCategory.MOCKUP_DIGITAL_DEVICE:
      prompt = `Mockup de ${productDescription} (se for um app ou site) sendo exibido na tela de um smartphone ou laptop moderno. O dispositivo está em uma mesa de trabalho estilosa.`;
      break;
    case AssetCategory.SOCIAL_INSTAGRAM_POST:
      prompt = `Um template de post para Instagram (feed) para ${productDescription}. Design minimalista e elegante, com amplo espaço negativo para adicionar texto. Cores da marca suaves.`;
      aspectRatio = '1:1';
      break;
    case AssetCategory.SOCIAL_INSTAGRAM_STORY:
      prompt = `Um fundo de story para Instagram, visualmente atraente e relacionado a ${productDescription}. Design vertical (9:16) com espaço livre na parte superior e inferior para texto e stickers.`;
      aspectRatio = '9:16';
      break;
    case AssetCategory.SOCIAL_REELS_THUMBNAIL:
        prompt = `Uma thumbnail vibrante e chamativa para um vídeo de Reels/TikTok sobre ${productDescription}. Cores de alto contraste, foco centralizado no produto, estilo energético.`;
        aspectRatio = '9:16';
        break;
    case AssetCategory.SOCIAL_FACEBOOK_POST:
        prompt = `Uma imagem para post no Facebook sobre ${productDescription}. Formato paisagem, visual limpo e profissional, adequado para um link de postagem.`;
        aspectRatio = '4:3';
        break;
    case AssetCategory.AD_GOOGLE_BANNER:
        prompt = `Banner para Google Ads (formato retangular) promovendo ${productDescription}. Design limpo, focado no produto, com uma chamada para ação visual clara, sem texto.`;
        aspectRatio = '16:9';
        break;
    case AssetCategory.AD_FACEBOOK_BANNER:
        prompt = `Banner para anúncio no Facebook/Instagram promovendo ${productDescription}. Imagem quadrada, vibrante e que prende a atenção. Foco no apelo visual do produto.`;
        aspectRatio = '1:1';
        break;
    case AssetCategory.AD_YOUTUBE_THUMBNAIL:
      prompt = `Uma thumbnail de YouTube atraente sobre ${productDescription}. Cores de alto contraste para maximizar cliques, com um close-up dramático do produto e espaço para texto em negrito.`;
      aspectRatio = '16:9';
      break;
    case AssetCategory.EFFECT_3D_SHADOW:
      prompt = `Uma foto de estúdio dramática de ${productDescription} com uma sombra 3D longa e suave sobre um fundo de cor sólida. Minimalista e artístico.`;
      break;
    case AssetCategory.EFFECT_FLAT_DESIGN:
        prompt = `Uma ilustração em estilo flat design de ${productDescription}. Cores chapadas, formas geométricas simples, minimalista e moderno.`;
        break;
    case AssetCategory.EFFECT_VINTAGE:
        prompt = `Uma fotografia de ${productDescription} com um filtro e estilo vintage/retrô. Cores desbotadas, grão sutil, como uma foto antiga.`;
        break;
    case AssetCategory.ECOMMERCE_MARKETPLACE_IMAGE:
      prompt = `Fotografia de produto de alta qualidade para marketplaces como Amazon ou Mercado Livre. Fundo perfeitamente branco, iluminação clara e uniforme, mostrando ${productDescription} de frente.`;
      break;
    case AssetCategory.ECOMMERCE_WEBSITE_HERO:
        prompt = `Uma imagem de herói (hero image) para a página principal de um e-commerce, apresentando ${productDescription}. Composição cinematográfica, alta qualidade, com espaço para texto e botões de CTA.`;
        aspectRatio = '16:9';
        break;
    case AssetCategory.EVENT_INVITE:
        prompt = `Um design de fundo elegante para um convite digital de um evento de lançamento de ${productDescription}. Abstrato e sofisticado, com espaço para detalhes do evento.`;
        aspectRatio = '4:3';
        break;
    case AssetCategory.APP_ICON:
        prompt = `Um ícone de aplicativo (app icon) para ${productDescription}. Estilo moderno, simples e reconhecível. Design vetorial, fundo sólido, formato quadrado.`;
        break;
    case AssetCategory.APP_SPLASH_SCREEN:
        prompt = `Uma splash screen (tela de abertura) para um aplicativo sobre ${productDescription}. Design vertical, minimalista, com o logo ou uma representação estilizada do produto no centro.`;
        aspectRatio = '9:16';
        break;
    case AssetCategory.PRINT_TSHIRT:
        prompt = `Um design gráfico estiloso para uma camiseta, inspirado em ${productDescription}. Arte vetorial, adequada para serigrafia, em um fundo transparente.`;
        break;
    case AssetCategory.PRINT_STICKER:
        prompt = `Um adesivo (sticker) divertido e colecionável de ${productDescription}. Estilo de ilustração, contorno branco grosso, perfeito para impressão e recorte.`;
        break;
    default:
      throw new Error(`Categoria de imagem não suportada: ${category}`);
  }

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: { numberOfImages: 1, aspectRatio },
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

  const relevantCategories = await getRelevantAssetCategories(productDescription);

  if (relevantCategories.length === 0) {
      throw new Error("Não foi possível determinar categorias de materiais relevantes para o produto. Tente uma imagem diferente.");
  }

  const generationPromises: Promise<GeneratedAsset>[] = [];

  for (const category of relevantCategories) {
      if (category === AssetCategory.PRODUCT_VIDEO_360 || category === AssetCategory.SOCIAL_PROMO_GIF) {
          generationPromises.push(generateVideoAsset(productDescription, category));
      } else {
          generationPromises.push(generateImageAsset(productDescription, category));
      }
  }
  
  const results = await Promise.allSettled(generationPromises);
  
  const successfulResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<GeneratedAsset>).value);
  
  results.forEach((result, index) => {
      if(result.status === 'rejected') {
          console.error(`Falha ao gerar o material para a categoria ${relevantCategories[index]}:`, result.reason);
      }
  });

  if (successfulResults.length === 0) {
      throw new Error("Todos os processos de geração de materiais falharam. Verifique os prompts, sua chave de API e a disponibilidade do serviço.");
  }

  successfulResults.sort((a, b) => {
      if (a.type === 'video' && b.type !== 'video') return -1;
      if (b.type === 'video' && a.type !== 'video') return 1;
      return 0;
  });

  return successfulResults;
};