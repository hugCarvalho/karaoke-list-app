import { Router } from "express";
import { addOrUpdateSongHandler, addSangSongHandler, deleteSongFromCurrentEventHandler, deleteSongHandler, getArtistsListHandler, getSongListHandler, updateSongHandler, updateSongPlayCountHandler } from "../controllers/songList.controller";

const listRoutes = Router()

// prefix: /list
listRoutes.get("/", getSongListHandler)
listRoutes.get("/artists", getArtistsListHandler)
listRoutes.post("/add", addOrUpdateSongHandler)
listRoutes.post("/add-sang-song", addSangSongHandler)
listRoutes.patch("/update", updateSongHandler)
listRoutes.patch("/update/songs/update-play/:songId", updateSongPlayCountHandler)
listRoutes.delete("/delete/:songId", deleteSongHandler)
listRoutes.delete("/events/current/songs/:songId", deleteSongFromCurrentEventHandler)
export default listRoutes
