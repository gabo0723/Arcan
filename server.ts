import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to check if API key is provided
const isApiKeyAvailable = () => {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
};

// ==========================================
// API ENDPOINTS
// ==========================================

// Endpoint to generate automated project proposals
app.post("/api/quote", async (req, res) => {
  const { businessName, industry, goal, services, duration } = req.body;

  if (!businessName || !industry || !goal) {
    return res.status(400).json({ error: "Faltan datos obligatorios (Nombre de la empresa, Sector y Objetivo)." });
  }

  if (!isApiKeyAvailable()) {
    // Return mock premium proposal if API key is not ready
    return res.json({
      proposalName: `Ecosistema de Digitalización Integral para ${businessName}`,
      summary: `Propuesta técnica para la automatización e implantación digital de ${businessName} enfocada en el sector de ${industry}. Diseñado para alcanzar el objetivo: "${goal}". Esta propuesta incluye una solución digital modular de alta velocidad y un flujo de captación continua.`,
      specificServices: services && services.length > 0 ? services : ["Desarrollo Web & E-commerce", "Agentes de IA"],
      technicalStack: ["React (Vite)", "Tailwind CSS", "Node.js / Express", "PostgreSQL", "WhatsApp Cloud API"],
      estimatedDuration: duration || "4 semanas",
      estimatedCostRange: "$1,200 - $1,800 USD",
      payment1: "$360 USD (30% Inicio)",
      payment2: "$480 USD (40% Desarrollo)",
      payment3: "$360 USD (30% Entrega)",
      strategicValue: `Al digitalizar ${businessName}, eliminamos la fricción en ventas. Automatizando los flujos con Agentes de IA reduciremos el tiempo de respuesta un 90%, y con el diseño visual de Arcan Code se incrementará la conversión por visita en hasta un 3.5x.`,
      phasedTimeline: [
        {
          phaseTitle: "Fase 1: Wireframing y Arquitectura (30% de inversión)",
          duration: "1 semana",
          deliverables: [
            "Definición y diseño conceptual de la experiencia de usuario (UX/UI).",
            "Configuración del entorno de base de datos e infraestructura técnica inicial.",
            "Desglose y aprobación de guiones para flujos del Agente de IA."
          ]
        },
        {
          phaseTitle: "Fase 2: Desarrollo Core y Automatizaciones (40% de inversión)",
          duration: "2 semanas",
          deliverables: [
            "Desarrollo completo de la web responsive o tienda con Tailwind CSS.",
            "Integración e entrenamiento del modelo de Agente de IA para web/WhatsApp.",
            "Integraciones de pasarela de pago y bases de datos estructuradas."
          ]
        },
        {
          phaseTitle: "Fase 3: Optimización, Testeo y Entrega (30% de inversión)",
          duration: "1 semana",
          deliverables: [
            "Pruebas de carga, velocidad, SEO técnico y optimización UX.",
            "Capacitación de uso de herramientas de analítica y BI.",
            "Puesta en producción y lanzamiento oficial bajo dominio corporativo."
          ]
        }
      ]
    });
  }

  try {
    const selectedServicesText = services && services.length > 0 
      ? `Servicios seleccionados: ${services.join(", ")}.` 
      : "Determinar los mejores servicios entre: Desarrollo Web y E-commerce, Agentes de IA, Impacto Visual 360 y Business Intelligence.";

    const prompt = `Analiza los siguientes requerimientos de un cliente para la agencia "Arcan Code" y genera una propuesta detallada estructurada con un plan de trabajo por fases que encaje con nuestro modelo de pago de 3 fases (30% de inicio, 40% intermedio, 30% a la entrega):
    
    Nombre del Negocio: ${businessName}
    Sector: ${industry}
    Objetivo: ${goal}
    ${selectedServicesText}
    Duración Esperada: ${duration || "Por determinar"}
    
    Genera una propuesta hiper-profesional de aspecto muy tecnológico en español de acuerdo al esquema solicitado de salida JSON. Asegúrate de calcular montos razonables basados en el mercado premium de desarrollo (entre $1000 y $3000 USD dependiendo de la complejidad de lo que describe el cliente) y divídelos exactamente en 30%, 40% y 30% para de pago 1, pago 2 y pago 3 de forma que sea transparente.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres el Consultor Tecnológico Senior y Generador de Propuestas de Arcan Code. Tu trabajo es formular cotizaciones realistas, profesionales, innovadoras e hiper-estructuradas en formato JSON para asombrar a los clientes con una solución técnica insuperable.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "proposalName",
            "summary",
            "specificServices",
            "technicalStack",
            "estimatedDuration",
            "estimatedCostRange",
            "payment1",
            "payment2",
            "payment3",
            "phasedTimeline",
            "strategicValue"
          ],
          properties: {
            proposalName: { type: Type.STRING, description: "Nombre atractivo e innovador de la propuesta técnica" },
            summary: { type: Type.STRING, description: "Declaración del problema y solución estratégica" },
            specificServices: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de servicios de Arcan Code involucrados en la solución" 
            },
            technicalStack: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Tecnologías y herramientas sugeridas para el proyecto" 
            },
            estimatedDuration: { type: Type.STRING, description: "Duración estimada total, ej: '4 - 5 semanas'" },
            estimatedCostRange: { type: Type.STRING, description: "Costo total estimado en USD, ej: '$1,500 USD'" },
            payment1: { type: Type.STRING, description: "Desglose del Pago 1 (30% al inicio) con el monto sugerido en USD" },
            payment2: { type: Type.STRING, description: "Desglose del Pago 2 (40% de desarrollo) con el monto sugerido en USD" },
            payment3: { type: Type.STRING, description: "Desglose del Pago 3 (30% a la entrega) con el monto sugerido en USD" },
            strategicValue: { type: Type.STRING, description: "El impacto empresarial, retorno de inversión y ventajas competitivas de esta solución" },
            phasedTimeline: {
              type: Type.ARRAY,
              description: "Línea de tiempo detallada dividida estrictamente en 3 fases correspondientes a la metodología",
              items: {
                type: Type.OBJECT,
                required: ["phaseTitle", "duration", "deliverables"],
                properties: {
                  phaseTitle: { type: Type.STRING, description: "Título de la fase (ej: Fase 1: Arquitectura y Diseño)" },
                  duration: { type: Type.STRING, description: "Duración estimada para esta fase" },
                  deliverables: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Hitos y entregables clave de esta fase"
                  }
                }
              }
            }
          }
        }
      }
    });

    const responseText = response.text || "{}";
    res.json(JSON.parse(responseText.trim()));
  } catch (error: any) {
    console.error("Error generating quote:", error);
    res.status(500).json({ error: "No se pudo generar la propuesta técnica automatizada en este momento." });
  }
});

// Endpoint for conversational chat with Arcan AI Agent
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Debe proveer un historial válido de mensajes." });
  }

  // Get user query from the last message
  const userMessage = messages[messages.length - 1]?.text || "";

  if (!isApiKeyAvailable()) {
    // Elegant fallback response if API key is missing
    const queryLower = userMessage.toLowerCase();
    let responseText = "¡Hola! Soy Arcan AI, el asistente virtual de Arcan Code. Me complacería resolver tus dudas sobre desarrollo de software, automatizaciones o nuestra metodología de pago segura por fases. ¿En qué puedo ayudarte hoy?";

    if (queryLower.includes("precio") || queryLower.includes("costo") || queryLower.includes("cuánto") || queryLower.includes("pago")) {
      responseText = "Para garantizar tu tranquilidad, en Arcan Code trabajamos bajo una metodología estructurada de **pagos fraccionados**:\n\n1. **30% al inicio** (Planificación, prototipos e inicio de arquitectura).\n2. **40% a mitad de desarrollo** (Una vez validada la versión interna inicial).\n3. **30% final en la entrega** (Tras pruebas, SEO y puesta en producción oficial).\n\n¿Tienes algún proyecto en mente que te gustaría cotizar mediante nuestra sección 'Cotizar Proyecto'?";
    } else if (queryLower.includes("servicio") || queryLower.includes("desarrollo") || queryLower.includes("ia") || queryLower.includes("chat")) {
      responseText = "En Arcan Code nos especializamos en cuatro pilares tecnológicos de alto impacto para negocios digitales:\n\n- **Desarrollo Web y E-commerce**: Tiendas ágiles y robustas optimizadas para conversión.\n- **Agentes de IA**: Automatizaciones completas y chatbots listos para WhatsApp y web.\n- **Impacto Visual 360**: Renders 3D fotorrealistas y video branding disruptor.\n- **Business Intelligence**: Cuadros de mando y modelos predictivos para escalar tus decisiones.\n\n¿Cuál de estas áreas te genera mayor interés para tu negocio?";
    } else if (queryLower.includes("contacto") || queryLower.includes("teléfono") || queryLower.includes("whatsapp")) {
      responseText = "Puedes ponerte en contacto directamente con uno de nuestros directores técnicos a través del botón 'Hablar con un Experto', por WhatsApp al número **+593 987604450**, o bien rellenando el formulario de contacto al final de esta página. ¡Estamos listos para conversar!";
    }

    return res.json({ text: responseText });
  }

  try {
    // Prep system instruction for consistent corporate tech branding
    const systemInstruction = `Eres 'Arcan AI', el agente virtual inteligente de 'Arcan Code' (agencia premium de desarrollo de software, inteligencia artificial, renders 3D y business intelligence).
Tu propósito es atender dudas de los visitantes de la web con un tono corporativo altamente tecnológico, serio, sofisticado, dinámico e innovador. 
Reglas de conducta:
1. Habla español corporativo, moderno, sin rodeos, brindando información valiosa de negocio.
2. Si preguntan sobre Arcan Code, destaca su propuesta de valor: Transformar negocios tradicionales en ecosistemas digitales eficientes y escalables.
3. Arcan Code opera 100% online a nivel global con cobertura total, próximamente inaugurando oficina física.
4. Explica siempre que trabajamos de forma estructurada con PAGOS FRACCIONADOS (30% inicio, 40% medio de desarrollo, 30% entrega) para máxima seguridad del cliente.
5. El contacto directo es por WhatsApp al +593 987604450.
6. Invítalos diplomáticamente a usar la herramienta interactiva de cotización en directo en la barra superior o en la sección central si quieren recibir una propuesta desglosada y costo en menos de 5 segundos.
Manten tus respuestas en un formato ágil, usando negritas para destacar ideas clave, y responde de manera atractiva. No uses más de 2 o 3 párrafos cortos por respuesta.`;

    // Map historical client messages to contents parameter
    const contents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Error in Arcan AI chat agent:", error);
    res.status(500).json({ error: "Lo siento, mi procesador de lenguaje Arcan AI está experimentando latencia. Por favor contacta al soporte técnico." });
  }
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================

async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    // In development, hook Vance/Vite middleware Mode to the Express application
    console.log("Setting up Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve index.html and compiled static bundle files
    console.log("Running in Production Mode. Serving static assets...");
    const distPath = path.resolve(process.cwd(), "dist");
    
    // Serve static compiled assets
    app.use(express.static(distPath));
    
    // Serve SPA single page router fallback index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Arcan Code server running on port ${PORT}`);
    console.log(`Local Access: http://localhost:${PORT}`);
  });
}

serveApp().catch((err) => {
  console.error("Failed to initialize server application:", err);
});
