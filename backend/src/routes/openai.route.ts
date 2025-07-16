// src/routes/openAi.route.ts
import { Router } from 'express';
import { getNameSuggestionHandler, getPopularSongsHandler, getSongNameSuggestionHandler, getSongSuggestionsHandler } from '../controllers/openai.controller';

const openaiRoutes = Router()

// prefix: /openai
openaiRoutes.post("/ai-songs", getPopularSongsHandler)
openaiRoutes.post("/ai-artistname-suggestions", getNameSuggestionHandler)
openaiRoutes.post("/ai-songname-suggestions", getSongNameSuggestionHandler)
openaiRoutes.post("/ai-songs-suggestions", getSongSuggestionsHandler)

export default openaiRoutes

