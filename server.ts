import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// System prompt for Mohammed Noor's executive workspace
const SYSTEM_INSTRUCTION = `You are the executive AI copilot for Mohammed Noor (Senior Lead at Tartibat / Saudi Experiential & Strategic Event Production).
Your purpose is to assist Mohammed in leading high-stakes projects, VIP journeys, cyber awareness events, brand campaigns, and client proposals (Tajrubah, Banking Clients, Government entities, etc.).

You have access to Mohammed Noor's live workspace projects context in every request.
Provide sharp, structured, executive-grade answers. Tone should be professional, astute, decisive, and proactive.

When the user asks you to take an action (such as adding a project, changing a status, filtering, or generating deliverables), you can provide:
1. A concise, polished executive narrative or guidance.
2. A structured JSON code block tagged \`\`\`json_action:
{
  "action": "CREATE_PROJECT" | "UPDATE_STATUS" | "UPDATE_PRIORITY" | "DELETE_PROJECT" | "SWITCH_VIEW" | "ADD_DELIVERABLE",
  "payload": { ... }
}
\`\`\`
Supported actions:
- CREATE_PROJECT: payload: { name, client, status ("Planning"|"In Progress"|"Review"|"Completed"|"On Hold"), priority ("High"|"Medium"|"Low"), date (YYYY-MM-DD), notes, deliverables?: string[] }
- UPDATE_STATUS: payload: { projectId?: string, nameQuery?: string, status: "Planning"|"In Progress"|"Review"|"Completed"|"On Hold" }
- UPDATE_PRIORITY: payload: { projectId?: string, nameQuery?: string, priority: "High"|"Medium"|"Low" }
- DELETE_PROJECT: payload: { projectId?: string, nameQuery?: string }
- SWITCH_VIEW: payload: { view: "dashboard" | "projects" | "board" | "pages" }
- ADD_DELIVERABLE: payload: { projectId?: string, nameQuery?: string, item: string }

If no workspace action is required, just provide the advisory analysis, executive brief, strategic risk evaluation, or response directly without json_action.`;

// AI Assistant Chat Route
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, workspaceContext, history } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing message parameter" });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Graceful intelligent fallback if API key is not present
      const fallbackResponse = generateLocalExecutiveResponse(message, workspaceContext);
      res.json({
        reply: fallbackResponse.text,
        action: fallbackResponse.action || null,
        source: "local-copilot",
      });
      return;
    }

    const contextSummary = workspaceContext
      ? `\nCURRENT WORKSPACE STATE:\n- Total Projects: ${workspaceContext.projects?.length || 0}\n- Active Projects: ${
          workspaceContext.projects?.filter((p: any) => p.status !== "Completed").length || 0
        }\n- Projects List:\n${(workspaceContext.projects || [])
          .map(
            (p: any) =>
              `  • [${p.id}] "${p.name}" | Client: ${p.client} | Status: ${p.status} | Priority: ${p.priority} | Deadline: ${p.date || "None"} | Notes: ${p.notes || "None"} | Deliverables: ${(p.deliverables || []).map((d: any) => typeof d === "string" ? d : d.text).join(", ")}`
          )
          .join("\n")}`
      : "";

    const userPrompt = `${contextSummary}\n\nUSER PROMPT: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "No response generated.";

    // Parse potential action block
    let parsedAction: any = null;
    let cleanReply = replyText;
    const actionMatch = replyText.match(/```json_action\s*([\s\S]*?)\s*```/);
    if (actionMatch && actionMatch[1]) {
      try {
        parsedAction = JSON.parse(actionMatch[1]);
        cleanReply = replyText.replace(/```json_action\s*[\s\S]*?\s*```/, "").trim();
      } catch (e) {
        console.error("Failed to parse json_action from Gemini output", e);
      }
    }

    res.json({
      reply: cleanReply,
      action: parsedAction,
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error);
    // Return friendly fallback rather than 500 error
    const fallbackResponse = generateLocalExecutiveResponse(
      req.body.message || "",
      req.body.workspaceContext
    );
    res.json({
      reply: fallbackResponse.text,
      action: fallbackResponse.action || null,
      source: "fallback-copilot",
    });
  }
});

// Strategic Plan / Deliverables Breakdown Route
app.post("/api/ai/generate-brief", async (req, res) => {
  try {
    const { projectName, client, notes, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        brief: `### Executive Brief: ${projectName || "Project"}\n\n**Client:** ${client || "Valued Partner"}\n\n**Key Strategic Objective:** Deliver an immersive, high-impact experiential touchpoint aligned with Saudi Vision 2030 and client leadership priorities.\n\n**Recommended Workstreams:**\n1. Concept narrative & spatial architecture\n2. Interactive technology & multimedia pipeline\n3. VIP guest protocol & bilingual digital journey\n4. Operational contingency & risk mitigation\n\n**Immediate Milestone:** Finalize stakeholder kickoff deck and asset delivery timetable.`,
      });
      return;
    }

    const prompt = `Draft a sharp, high-level executive project brief for Mohammed Noor (Tartibat Lead).
Project: "${projectName}"
Client: "${client}"
Key Scope & Notes: "${notes || "Experiential production and engagement"}"
Additional Context: "${context || "Saudi Kingdom market"}"

Include:
1. Strategic Objective & Experience Vision
2. Key Operational Pillars & Touchpoints
3. Critical Deliverables & Milestones
4. Risk Factors & Recommendations`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an executive strategic consultant for high-end events and brand experiences.",
        temperature: 0.6,
      },
    });

    res.json({ brief: response.text || "Brief generated." });
  } catch (err: any) {
    console.error("Error generating brief:", err);
    res.status(500).json({ error: "Failed to generate brief" });
  }
});

// Fallback heuristic interpreter for offline or key-less scenarios
function generateLocalExecutiveResponse(q: string, context: any) {
  const l = q.toLowerCase().trim();
  const projects = context?.projects || [];

  if (l.includes("help") || l.includes("what can you do")) {
    return {
      text: `**Mohammed Noor Lead AI Copilot Commands:**\n\n• **Executive Search:** *"Find Tajrubah"*, *"Where is cyber awareness?"*\n• **Status Queries:** *"Show review projects"*, *"What is in progress?"*\n• **Priority Filtering:** *"List high priority tasks"*\n• **Pipeline Stats:** *"How many active projects?"*\n• **Quick Actions:** *"Add project Saudi Tourism Pavilion"*, *"Change Brand Experience to completed"*\n• **Navigation:** *"Show board"*, *"Show projects table"*, *"Open pages"*`,
    };
  }

  if (l.includes("how many") || l.includes("count") || l.includes("summary") || l.includes("stats")) {
    const total = projects.length;
    const completed = projects.filter((p: any) => p.status === "Completed").length;
    const active = total - completed;
    const high = projects.filter((p: any) => p.priority === "High").length;
    return {
      text: `**Executive Portfolio Status:**\n• **Total Leads & Projects:** ${total}\n• **Active Pipeline:** ${active}\n• **Completed:** ${completed}\n• **High Priority Criticals:** ${high}\n\nAll deliverables are indexed in your local workspace.`,
    };
  }

  if (l.includes("show board") || l === "board") {
    return {
      text: `Navigating to your **Kanban Board** view.`,
      action: { action: "SWITCH_VIEW", payload: { view: "board" } },
    };
  }

  if (l.includes("show projects") || l.includes("table") || l === "projects") {
    return {
      text: `Opening the **Projects Database** view.`,
      action: { action: "SWITCH_VIEW", payload: { view: "projects" } },
    };
  }

  if (l.includes("add project") || l.includes("create project") || l.includes("new project")) {
    // Attempt simple extraction
    const rawName = l.replace(/(add project|create project|new project)/g, "").trim();
    const cleanName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "Strategic Client Initiative";
    return {
      text: `Prepared new project initiative: **${cleanName}**. You can review and finalize details in the editor.`,
      action: {
        action: "CREATE_PROJECT",
        payload: {
          name: cleanName,
          client: "Tartibat Partner",
          status: "Planning",
          priority: "High",
          date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          notes: "Initiated via Mohammed Noor Lead AI Assistant.",
          deliverables: ["Scope Definition", "Client Kickoff", "Production Timeline"],
        },
      },
    };
  }

  const changeMatch = l.match(/change (.+?) to (planning|in progress|review|completed|on hold)/i);
  if (changeMatch) {
    const name = changeMatch[1].trim();
    const targetStatus = changeMatch[2]
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      text: `Updating status for **"${name}"** to **${targetStatus}**.`,
      action: {
        action: "UPDATE_STATUS",
        payload: { nameQuery: name, status: targetStatus },
      },
    };
  }

  // Filter or search queries
  const matched = projects.filter((p: any) =>
    [p.name, p.client, p.status, p.priority, p.notes].some((val: any) =>
      String(val || "").toLowerCase().includes(l)
    )
  );

  if (matched.length > 0) {
    return {
      text: `Found **${matched.length}** matching project(s):\n${matched
        .map((p: any) => `• **${p.name}** (${p.client}) — Status: *${p.status}*, Priority: *${p.priority}*`)
        .join("\n")}`,
    };
  }

  return {
    text: `Understood Mohammed. I have logged your advisory note. Try asking to summarize your pipeline, update project milestones, or generate client briefs for Tartibat deliverables.`,
  };
}

// Vite and static file serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mohammed Noor Lead server running on http://0.0.0.0:${PORT}`);
  });
}

start();
