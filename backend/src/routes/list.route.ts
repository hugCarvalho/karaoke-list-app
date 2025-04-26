import { Router } from "express";
import { addOrUpdateSongHandler, deleteSongHandler, getSongListHandler, updateSongHandler } from "../controllers/songList.controller";

const listRoutes = Router()

// prefix: /user
listRoutes.get("/", getSongListHandler)
listRoutes.post("/add", addOrUpdateSongHandler)
listRoutes.patch("/update", updateSongHandler)
listRoutes.delete("/delete/:songId", deleteSongHandler)
export default listRoutes
