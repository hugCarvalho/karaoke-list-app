// src/routes/openAi.route.ts
import { Router } from 'express';
import { getArtistsForSongHandler, getNameSuggestionHandler, getPopularSongsHandler, getSongNameSuggestionHandler, getSongSuggestionsHandler } from '../controllers/ai.controller';

const aiRoutes = Router()

// prefix: /openai
aiRoutes.post("/ai-songs", getPopularSongsHandler)
aiRoutes.post("/ai-artistname-suggestions", getNameSuggestionHandler)
aiRoutes.post("/ai-songname-suggestions", getSongNameSuggestionHandler)
aiRoutes.post("/ai-songs-suggestions", getSongSuggestionsHandler)
aiRoutes.post("/ai-artists", getArtistsForSongHandler);

export default aiRoutes

