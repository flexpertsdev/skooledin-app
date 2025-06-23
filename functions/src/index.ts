import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Anthropic from "@anthropic-ai/sdk";
import * as pdfParse from "pdf-parse";
import * as sharp from "sharp";
import Tesseract from "tesseract.js";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: functions.config().anthropic.api_key,
});

// Generate Notebook Entry with Anthropic
export const generateNotebookEntry = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to generate notebook entries"
    );
  }

  const { prompt, subjectId, type = "concept", context: noteContext } = data;

  try {
    // Call Anthropic API
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.7,
      system: `You are an educational AI assistant helping students create well-structured notebook entries. 
        Format your response as a markdown document suitable for studying.
        Include clear headings, bullet points, examples, and summaries where appropriate.`,
      messages: [
        {
          role: "user",
          content: `Create a ${type} notebook entry for the subject ${subjectId}. 
            Context: ${noteContext}
            Prompt: ${prompt}`,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract title from content (first heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${type} - ${new Date().toLocaleDateString()}`;

    // Create notebook entry in Firestore
    const notebookEntry = {
      userId: context.auth.uid,
      title,
      content,
      type,
      format: "markdown",
      subjectId,
      metadata: {
        isAIGenerated: true,
        sourceType: "chat",
        gradeLevel: data.gradeLevel || null,
        wordCount: content.split(" ").length,
        studyCount: 0,
        isFavorite: false,
        isArchived: false,
      },
      tags: data.tags || [],
      attachments: [],
      annotations: [],
      status: "complete",
      visibility: "private",
      version: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("notebooks").add(notebookEntry);

    return {
      id: docRef.id,
      ...notebookEntry,
      content, // Include full content in response
    };
  } catch (error) {
    console.error("Error generating notebook entry:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate notebook entry"
    );
  }
});

// Convert PDF to Markdown
export const convertPdfToMarkdown = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { filePath } = data;

  try {
    // Get file from Firebase Storage
    const file = storage.bucket().file(filePath);
    const [buffer] = await file.download();

    // Parse PDF
    const pdfData = await pdfParse(buffer);

    // Convert to markdown using Anthropic
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.3,
      system: "Convert the following PDF text content into well-formatted markdown. Preserve structure, headings, lists, and important formatting.",
      messages: [
        {
          role: "user",
          content: pdfData.text,
        },
      ],
    });

    const markdown = message.content[0].type === "text" ? message.content[0].text : "";

    return {
      markdown,
      metadata: {
        pages: pdfData.numpages,
        info: pdfData.info,
      },
    };
  } catch (error) {
    console.error("Error converting PDF:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to convert PDF to markdown"
    );
  }
});

// Convert Image to Markdown (using OCR)
export const convertImageToMarkdown = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { filePath } = data;

  try {
    // Get file from Firebase Storage
    const file = storage.bucket().file(filePath);
    const [buffer] = await file.download();

    // Process image with sharp if needed (resize for OCR)
    const processedImage = await sharp(buffer)
      .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
      .toBuffer();

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(processedImage, "eng");

    // Convert extracted text to markdown using Anthropic
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.3,
      system: "Convert the following OCR text into well-formatted markdown. Fix any OCR errors, improve formatting, and structure the content logically.",
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    });

    const markdown = message.content[0].type === "text" ? message.content[0].text : "";

    return {
      markdown,
      ocrText: text,
    };
  } catch (error) {
    console.error("Error converting image:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to convert image to markdown"
    );
  }
});

// AI Chat with Context
export const aiChatWithContext = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { message, attachments, sessionId } = data;

  try {
    // Fetch context from attachments
    const contextData: string[] = [];
    
    for (const attachment of attachments || []) {
      if (attachment.type === "notebook") {
        const notebook = await db.collection("notebooks").doc(attachment.resourceId).get();
        if (notebook.exists) {
          contextData.push(`Notebook Entry: ${notebook.data()?.title}\n${notebook.data()?.content}`);
        }
      }
    }

    // Create system prompt with context
    const systemPrompt = `You are an AI tutor helping students learn. You have access to the following context:
${contextData.join("\n\n")}

Use this context to provide relevant, helpful responses. Always relate your answers back to the provided materials when applicable.`;

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // Save message to Firestore
    const chatMessage = {
      sessionId,
      role: "assistant",
      content: responseText,
      attachments: [],
      metadata: {
        thinking: {
          approach: "Context-aware response",
          complexity: "moderate",
          confidence: 0.85,
        },
        contextUsed: attachments?.map((a: any) => a.id),
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("chatMessages").add(chatMessage);

    return {
      content: responseText,
      metadata: chatMessage.metadata,
    };
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to process chat message"
    );
  }
});

// Create Study Materials from Notebook
export const createStudyMaterials = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { notebookIds, type = "flashcards" } = data;

  try {
    // Fetch notebook entries
    const notebooks = await Promise.all(
      notebookIds.map((id: string) => 
        db.collection("notebooks").doc(id).get()
      )
    );

    const content = notebooks
      .filter(doc => doc.exists)
      .map(doc => doc.data()?.content)
      .join("\n\n");

    // Generate study materials using Anthropic
    const prompt = type === "flashcards" 
      ? "Create flashcards from this content. Format as JSON array with 'front' and 'back' properties."
      : type === "quiz"
      ? "Create a quiz from this content. Format as JSON array with 'question', 'options' (array), and 'correct' (index) properties."
      : "Create a study guide from this content. Use markdown formatting.";

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.5,
      system: `You are creating ${type} for students. ${prompt}`,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    const result = message.content[0].type === "text" ? message.content[0].text : "";

    return {
      type,
      content: result,
      sourceNotebooks: notebookIds,
    };
  } catch (error) {
    console.error("Error creating study materials:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create study materials"
    );
  }
});