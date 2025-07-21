import { Router } from "express";
import { addEventsHandler, closeEventsHandler, getEventsListHandler } from "../controllers/events.controller";

const eventsRoutes = Router()

// prefix: /event
eventsRoutes.get("/events", getEventsListHandler)
eventsRoutes.post("/add-event", addEventsHandler)
eventsRoutes.post("/close-event", closeEventsHandler)
export default eventsRoutes
