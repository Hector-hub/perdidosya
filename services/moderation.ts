import { Mistral } from "@mistralai/mistralai";

const apiKey = "pIPYUMDUAEwK16Oyz4pk3GvYBwZmS1Pu";
const client = new Mistral({ apiKey });

export interface ModerationResult {
  isAppropriate: boolean;
  categories: {
    sexual: boolean;
    hate_and_discrimination: boolean;
    violence_and_threats: boolean;
    dangerous_and_criminal_content: boolean;
    selfharm: boolean;
    health: boolean;
    financial: boolean;
    law: boolean;
    pii: boolean;
  };
  categoryScores: {
    sexual: number;
    hate_and_discrimination: number;
    violence_and_threats: number;
    dangerous_and_criminal_content: number;
    selfharm: number;
    health: number;
    financial: number;
    law: number;
    pii: number;
  };
}
const inappropriateWords = [
  "MMG",
  "MRD",
  "CTM",
  "PTM",
  "LPM",
  "KBRN",
  "VLP",
  "CAC",
  "PGR",
  "LMQ",
  "SUP",
  "CHP",
  "DCT",
  "CQP",
  "JBL",
  "mmñ",
  "RTM",
  "Rapa tu madre",
  "Singa",
  "Singar",
  "Chingada",
  "Boludo",
  "Pelotudo",
  "Forro",
  "Ganso",
  "Weón",
  "Gil",
  "Huevón",
  "Pendejo",
  "Chingado",
  "Mamón",
  "Joto",
  "Cabronazo",
  "Culero",
  "Malandro",
  "Choto",
  "Chambón",
  "Zángano",
  "Bobo",
  "Tarado",
  "Baboso",
  "Caradura",
  "Come mierda",
  "Chismoso",
  "Mierda seca",
  "Hijo de puta",
  "Cabrón",
  "Patán",
  "Vago",
  "Sapo",
  "Mosca muerta",
  "Desgraciado",
  "Infeliz",
  "Tonto",
  "Idiota",
  "Imbécil",
  "Estúpido",
  "Lambón",
  "Lambiscón",
  "Chanta",
  "Careverga",
  "Carepalo",
  "Caraculo",
  "Cochino",
  "Haragán",
  "Güevón",
  "Ñoño",
  "Zopenco",
  "Bestia",
  "Sopenco",
  "Patanegra",
  "Mamaguevo",
  "Singao",
  "Mamañema",
  "Pájaro",
  "Penco",
  "Mama burro",
  "Malparío",
  "Suape",
  "Pariguayo",
  "Chopo",
  "Tíguere raso",
  "Boca de piano",
  "Jablador",
  "Cacón",
  "Caco e machete",
  "Cacú",
  "Desacatao",
  "Matraca",
  "Cocotu",
  "Caco e pollo",
  "Mocoso",
  "Guaremate",
  "Jevón",
  "Bacalao",
  "Baboso",
  "Mala fe",
  "Aburrao",
  "Ladrónazo",
  "Ñame",
  "Terrorista",
  "Trepador",
  "Desgraciao",
  "Vende patria",
  "Lengua larga",
  "Caco e ñame",
  "Animal",
  "Singa su madre",
  "Pechú",
  "Loco e tranca",
  "Boca e chivo",
  "Jíbaro",
  "Lambeculo",
  "Lengua e mime",
  "Come mierda",
  "Come solo",
  "Quedao",
  "Sucio",
  "Arrastrao",
  "Mata hambre",
];
export class ContentModerationService {
  private static instance: ContentModerationService;
  private readonly client: Mistral;

  private constructor() {
    this.client = new Mistral({ apiKey });
  }

  public static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }
  private checkInappropriateWithMistral = async (text: string) => {
    // Construir el prompt con instrucciones específicas
    const systemPrompt = `Eres un filtro de contenido. Analiza el texto del usuario y determina si contiene:
  1. Palabras de esta lista: ${inappropriateWords.join(", ")}
  2. Variaciones creativas (ej: "s1ng4", "m4m4g3v0")
  3. Insultos similares no listados
  4. Cualquier contenido ofensivo o inapropiado.
  
  Responde SOLO con un JSON válido: 
  { "isAppropriate": boolean } 
  donde false = contenido inapropiado detectado, true = texto limpio.`;

    const chatResponse: any = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      responseFormat: { type: "json_object" }, // Forzar formato JSON
    });

    try {
      const response = JSON.parse(chatResponse?.choices[0].message.content);
      return response.isAppropriate; // Convertir a flag de inapropiado
    } catch (e) {
      console.error("Error parsing response:", e);
      return false; // Por defecto seguro si hay error
    }
  };
  private async moderateContent(content: string): Promise<ModerationResult> {
    try {
      const response = await this.client.classifiers.moderateChat({
        model: "mistral-moderation-latest",
        inputs: [{ role: "user", content }],
      });

      if (!response.results?.[0]) {
        throw new Error("No moderation results received");
      }

      const result = response.results[0];
      if (!result.categories || !result.categoryScores) {
        throw new Error("Invalid moderation result format");
      }

      const categories = result.categories as ModerationResult["categories"];
      const categoryScores =
        result.categoryScores as ModerationResult["categoryScores"];

      // Consider content inappropriate if any category is flagged
      const isAppropriate = !Object.values(categories).some((value) => value);

      return {
        isAppropriate,
        categories,
        categoryScores,
      };
    } catch (error) {
      console.error("Error in content moderation:", error);
      throw new Error("Failed to moderate content");
    }
  }

  public async validateContent(content: string): Promise<{
    isValid: boolean;
    message?: string;
  }> {
    try {
      // const result = await this.moderateContent(content);
      const isAppropriateLatin = await this.checkInappropriateWithMistral(
        content
      );
      // console.log(isAppropriateLatin);
      if (!isAppropriateLatin) {
        // Determine which categories were flagged
        // const flaggedCategories = Object.entries(result.categories)
        //   .filter(([_, value]) => value)
        //   .map(([key]) => key);
        return {
          isValid: false,
          message: `El contenido contiene material inapropiado.`,
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("Error validating content:", error);
      return {
        isValid: false,
        message:
          "Error al validar el contenido. Por favor, intente nuevamente.",
      };
    }
  }
}
