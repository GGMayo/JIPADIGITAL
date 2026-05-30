import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// We check the API key in the route to manage missing setups gracefully
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `Eres el Agente JIPA Digital, el bot de IA interactivo de la plataforma "JIPA Digital".
Tu objetivo es dar una demostración en vivo de cómo nuestro bot integrado puede calificar leads y ayudar a agendar reuniones con clientes reales mientras interactúan con un sitio web.

Compórtate de forma profesional, tecnológica, elegante y sumamente atenta.
Explica que JIPA Digital diseña páginas web inmersivas con un bot de IA de última generación (como tú mismo) que responde 24/7, califica los prospectos enviándolos a un CRM de inmediato, y permite agendar citas en un calendario sin intervención humana.

Haz lo siguiente durante la conversación:
1. Responde a la pregunta del usuario sobre nuestros servicios de forma concisa pero con estilo premium.
2. Trata amigablemente de obtener sus datos para la "demostración": su nombre, su correo, y qué tipo de negocio tiene para calificar el lead.
3. Si el usuario te da su nombre, correo o detalles de negocio, reconócelo con elegancia.
4. Intenta guiarlo para agendar una consultoría de demostración.

Usa siempre el esquema JSON de respuesta para devolver el texto ("text") y cualquier metadato que logres extraer del usuario ("metadata") en tiempo real. 
No repitas los metadatos en un formato de código dentro del texto de conversación. Sé natural.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Prepare messages for chat history
    let prompt = "";
    if (messages && messages.length > 0) {
      // Re-create the conversation flow
      const latestMessage = messages[messages.length - 1];
      prompt = latestMessage.content;
    } else {
      prompt = "Hola";
    }

    if (!ai) {
      // Fallback with a mock smart response if API key is not configured
      // We will parse messages to extract information if any
      let name: string | null = null;
      let email: string | null = null;
      let company: string | null = null;
      let needs: string | null = null;
      let interestLevel: "low" | "medium" | "high" | null = null;
      let action: "general" | "qualify" | "schedule" = "general";

      // Simple heuristic extraction from history
      messages.forEach((msg: any) => {
        const text = msg.content.toLowerCase();
        if (text.includes("me llamo ") || text.includes("mi nombre es ")) {
          const parts = text.split(/me llamo |mi nombre es /);
          if (parts[1]) name = parts[1].split(/[ ,.]/)[0];
        }
        if (text.includes("@") && text.includes(".")) {
          const words = text.split(/\s+/);
          const emailWord = words.find((w: string) => w.includes("@"));
          if (emailWord) email = emailWord.replace(/[.,:;()]/g, "");
        }
        if (text.includes("empresa") || text.includes("compañia") || text.includes("negocio")) {
          company = "Negocio Detectado";
        }
        if (text.includes("quiero") || text.includes("necesito") || text.includes("servicio")) {
          needs = "Servicio Web Inteligente";
        }
      });

      if (name && email) {
        interestLevel = "high";
        action = "qualify";
      } else if (name || email) {
        interestLevel = "medium";
        action = "qualify";
      }

      let textReply = "¡Hola! Bienvenido a JIPA Digital. Soy tu asistente de demostración. Conmigo, tus clientes tendrán soporte inmediato 24/7 y agendamiento automático. Para probar cómo funciona el CRM en tiempo real, facilítame tu nombre y correo, y verás cómo el panel inferior se actualiza mágicamente.";
      
      const lastText = prompt.toLowerCase();
      if (lastText.includes("hola") || lastText.includes("buenos") || lastText.includes("buenas")) {
        textReply = "¿Qué tal? Soy el Bot de JIPA Digital. Te ayudaré a experimentar cómo capturamos leads y agendamos llamadas en tiempo real. ¿Cómo te llamas y a qué se dedica tu negocio?";
      } else if (lastText.includes("precio") || lastText.includes("costo") || lastText.includes("plan")) {
        textReply = "Ofrecemos tres planes premium: Pro Builder, Enterprise Nexus y Custom. Todos incluyen Bot de IA personalizado, CRM integrado con panel analítico, y hosting escalable. Si me dejas tu correo, puedo enviarte el catálogo.";
      } else if (lastText.includes("@")) {
        textReply = "¡Excelente! Acabo de registrar tu correo de contacto de forma automática. Observa el panel del CRM abajo en esta pantalla, ¡tu lead está siendo calificado en la lista! ¿Quieres que agendemos una consultoría breve?";
        interestLevel = "high";
        action = "qualify";
      } else if (lastText.length > 2) {
        textReply = `Excelente información. Un sitio de JIPA Digital captura estos detalles y califica el contacto al instante. Intenta escribir tu nombre y un correo electrónico de prueba (ej: juan@empresa.com) para presenciar el registro automático en el CRM.`;
      }

      return NextResponse.json({
        text: textReply,
        metadata: {
          name,
          email,
          company,
          needs,
          interestLevel,
          action,
        },
      });
    }

    // Prepare contents array for Gemini generateContent
    // Translate the message history into compatible roles (user, model)
    const contents: any[] = [];
    if (messages && messages.length > 1) {
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    // Call Gemini API with schema configuration
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "La respuesta conversacional natural redactada en español.",
            },
            metadata: {
              type: Type.OBJECT,
              description: "Detalles del lead extraídos de toda la conversación.",
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Nombre del usuario si lo mencionó, sino null.",
                },
                email: {
                  type: Type.STRING,
                  description: "Correo electrónico del usuario si lo mencionó, sino null.",
                },
                company: {
                  type: Type.STRING,
                  description: "Nombre de su empresa o rubro de negocio si lo mencionó, sino null.",
                },
                needs: {
                  type: Type.STRING,
                  description: "Necesidades específicas especificadas por el prospecto, sino null.",
                },
                interestLevel: {
                  type: Type.STRING,
                  description: "Nivel de interés estimado: 'low', 'medium', o 'high'.",
                },
                action: {
                  type: Type.STRING,
                  description: "Tipo de acción actual: 'general', 'qualify' (si dio datos de contacto), 'schedule' (si quiere agendar).",
                },
              },
            },
          },
          required: ["text"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Error en API de Chat:", error);
    return NextResponse.json(
      {
        text: "Uh oh, estamos optimizando la conexión con el servidor. Pero sigo aquí para simular tu lead. Ingresa tu correo de prueba para ver el CRM en acción.",
        metadata: {
          name: null,
          email: "demo@test.com",
          company: "Acceso Rápido",
          needs: "Soporte Local",
          interestLevel: "medium",
          action: "qualify",
        },
      },
      { status: 200 } // Keep it 200 to prevent breaking the local UI demo
    );
  }
}
