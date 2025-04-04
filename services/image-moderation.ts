import { Mistral } from "@mistralai/mistralai";
import { z } from "zod";

const apiKey = "pIPYUMDUAEwK16Oyz4pk3GvYBwZmS1Pu";

// Define the schema for the moderation response
const ImageModerationSchema = z.object({
  isAppropriate: z.boolean(),
  categories: z.object({
    sexual: z.boolean(),
    violence: z.boolean(),
    hate: z.boolean(),
    drugs: z.boolean(),
    weapons: z.boolean(),
    nudity: z.boolean(),
    gore: z.boolean(),
    spam: z.boolean(),
    other: z.boolean(),
  }),
  confidence: z.number(),
  description: z.string(),
});

type ImageModerationResult = z.infer<typeof ImageModerationSchema>;

export class ImageModerationService {
  private static instance: ImageModerationService;
  private readonly client: Mistral;

  private constructor() {
    this.client = new Mistral({ apiKey });
  }

  public static getInstance(): ImageModerationService {
    if (!ImageModerationService.instance) {
      ImageModerationService.instance = new ImageModerationService();
    }
    return ImageModerationService.instance;
  }

  private async encodeImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = base64String.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public async validateImage(
    file: File,
    isPost: boolean = true
  ): Promise<{
    isValid: boolean;
    message?: string;
  }> {
    try {
      // Convert image to base64
      const base64Image = await this.encodeImageToBase64(file);

      // Create the moderation request
      const response = await this.client.chat.parse({
        model: "pixtral-large-latest",
        messages: [
          {
            role: "system",
            content: `
            You are an image moderation system. Analyze the provided image and return a structured response indicating whether the image is appropriate for a PerdidosYa! platform. 
            ${
              isPost
                ? `The platform is a place where people can find lost and found items.
            The images should be of items that are lost and found.
            The images should not be of people or pets.
            The images should not be of violence or gore.
            The images should not be of hate speech or discriminatory content.
            The images should not be of drug-related content.
            The images should not be of weapons or dangerous items.
            The images should not be of promotional content.
            The images should not be of other inappropriate content.`
                : ""
            }

            Consider the following categories:
            - sexual: Contains sexually explicit or suggestive content
            - violence: Contains violent or disturbing content
            - hate: Contains hate speech or discriminatory content
            - drugs: Contains drug-related content
            - weapons: Contains weapons or dangerous items
            - nudity: Contains nudity or revealing clothing
            - gore: Contains gore or graphic content
            - spam: Contains spam or promotional content
            - other: Contains other inappropriate content
            
            Return a JSON object with the following structure:
            {
              "isAppropriate": boolean,
              "categories": {
                "sexual": boolean,
                "violence": boolean,
                "hate": boolean,
                "drugs": boolean,
                "weapons": boolean,
                "nudity": boolean,
                "gore": boolean,
                "spam": boolean,
                "other": boolean
              },
              "confidence": number (0-1),
              "description": string (brief description of why the image is inappropriate if any category is true)
            }`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image for inappropriate content.",
              },
              {
                type: "image_url",
                imageUrl: `data:image/jpeg;base64,${base64Image}`,
              },
            ],
          },
        ],
        responseFormat: ImageModerationSchema,
        temperature: 0,
      });

      if (!response.choices?.[0]?.message?.parsed) {
        throw new Error("Invalid response from image moderation service");
      }

      const result = response.choices[0].message
        .parsed as ImageModerationResult;

      if (!result.isAppropriate) {
        const flaggedCategories = Object.entries(result.categories)
          .filter(([_, value]) => value)
          .map(([key]) => key);

        return {
          isValid: false,
          message: `La imagen contiene contenido inapropiado: La imagen infringe los términos de uso de la plataforma.`,
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("Error in image moderation:", error);
      return {
        isValid: false,
        message: "Error al validar la imagen. Por favor, intente nuevamente.",
      };
    }
  }
}
