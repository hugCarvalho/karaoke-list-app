// src/routes/openAi.route.ts
import { Router } from 'express';
import { getPopularSongsHandler } from '../controllers/openai.controller';

const openaiRoutes = Router()

// prefix: /openai
openaiRoutes.post("/ai-songs", getPopularSongsHandler)

export default openaiRoutes

