import { Router } from "express";
import { addEventsHandler, addOrUpdateSongHandler, deleteSongHandler, getArtistsListHandler, getSongListHandler, updateSongHandler, updateSongPlayCountHandler } from "../controllers/songList.controller";

const listRoutes = Router()

// prefix: /list
listRoutes.get("/", getSongListHandler)
listRoutes.get("/artists", getArtistsListHandler)
listRoutes.post("/add", addOrUpdateSongHandler)
listRoutes.post("/add-event", addEventsHandler)
listRoutes.patch("/update", updateSongHandler)
listRoutes.delete("/delete/:songId", deleteSongHandler)
listRoutes.patch("/update/songs/update-play/:songId", updateSongPlayCountHandler)
export default listRoutes
