
import { GoogleGenAI } from "@google/genai";
import { GeneratedAsset, AssetCategory } from '../types';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const toDataUrl = (base64: string, mimeType: string) => `data:${mimeType};base64,${base64}`;

const generateVideoAsset = async (productDescription: string): Promise<GeneratedAsset> => {
  const ai = getAi();
  const prompt = `A short, 5-second, looping promotional video ad for ${productDescription}. Dynamic, engaging, and eye-catching, perfect for social media. 4K quality.`;
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '1:1',
    },
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("Video generation failed to return a valid URI.");
  }

  const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to fetch video file: ${videoResponse.statusText}`);
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
      prompt = `Professional 4K product photography of ${productDescription}, studio lighting, on a pure white background. Hyper-realistic.`;
      break;
    case AssetCategory.LIFESTYLE_MOCKUP:
      prompt = `A realistic lifestyle photograph of a person happily using ${productDescription} in a bright, modern home setting. The focus is on the product.`;
      break;
    case AssetCategory.PROMOTIONAL_BANNER:
      prompt = `A vibrant, eye-catching promotional banner for ${productDescription}. Include the text "20% OFF". Modern design aesthetic for an e-commerce website.`;
      break;
    case AssetCategory.INSTAGRAM_POST:
      prompt = `An aesthetic Instagram post template featuring ${productDescription}. Minimalist, clean design with space for text. Suitable for a high-end brand.`;
      break;
    case AssetCategory.YOUTUBE_THUMBNAIL:
      prompt = `A compelling YouTube thumbnail about ${productDescription}. Bold text "NEW RELEASE!" and high-contrast colors to maximize clicks.`;
      break;
    case AssetCategory.SHADOW_EFFECT:
      prompt = `A dramatic studio shot of ${productDescription} with a long, soft 3D shadow on a solid-colored background. Minimalist and artistic.`;
      break;
    default:
      throw new Error("Unsupported image category");
  }

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: { numberOfImages: 1, aspectRatio: '1:1' },
  });

  const generatedImage = response.generatedImages[0];
  if (!generatedImage || !generatedImage.image.imageBytes) {
      throw new Error(`Image generation failed for category: ${category}`);
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
        { text: "Analyze this product image and describe the product in a short, descriptive phrase suitable for an image generation prompt. For example: 'A stylish red and black gaming headset'." },
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
