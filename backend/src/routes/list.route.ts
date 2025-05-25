import { Router } from "express";
import { addEventsHandler, addOrUpdateSongHandler, addSangSongHandler, closeEventsHandler, deleteSongHandler, getArtistsListHandler, getEventsListHandler, getSongListHandler, updateSongHandler, updateSongPlayCountHandler } from "../controllers/songList.controller";

const listRoutes = Router()

// prefix: /list
listRoutes.get("/", getSongListHandler)
listRoutes.get("/artists", getArtistsListHandler)
listRoutes.get("/events", getEventsListHandler)
listRoutes.post("/add", addOrUpdateSongHandler)
listRoutes.post("/add-sang-song", addSangSongHandler)
listRoutes.post("/add-event", addEventsHandler)
listRoutes.post("/close-event", closeEventsHandler)
listRoutes.patch("/update", updateSongHandler)
listRoutes.delete("/delete/:songId", deleteSongHandler)
listRoutes.patch("/update/songs/update-play/:songId", updateSongPlayCountHandler)
export default listRoutes
