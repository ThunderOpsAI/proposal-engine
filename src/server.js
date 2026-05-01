const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const path = require("path");
const { generateProposalPack, TONES } = require("./proposalEngine");
const { saveJobAndProposals } = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

const generateProposalSchema = z.object({
  job_description: z.string().min(20, "job_description must be at least 20 characters"),
  user_profile: z.string().optional(),
  tone: z.enum(TONES).optional(),
  include_pricing: z.boolean().optional(),
  user_id: z.number().int().positive().optional(),
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "proposal-engine" });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.post("/generate/proposal", (req, res) => {
  const parsed = generateProposalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request payload",
      details: parsed.error.flatten(),
    });
  }

  const payload = parsed.data;
  const result = generateProposalPack({
    jobDescription: payload.job_description,
    requestedTone: payload.tone,
    userProfile: payload.user_profile || "",
    includePricing: payload.include_pricing ?? true,
  });

  const proposalsForStorage = [result.primary, ...result.variants];
  const jobId = saveJobAndProposals({
    userId: payload.user_id ?? null,
    description: payload.job_description,
    proposals: proposalsForStorage,
  });

  return res.status(200).json({
    job_id: Number(jobId),
    analysis: result.analysis,
    short_pitch: result.primary.short_pitch,
    proposal: result.primary.proposal,
    pricing_suggestion: result.primary.pricing_suggestion,
    variants: result.variants,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Proposal Engine API listening on http://localhost:${port}`);
});
