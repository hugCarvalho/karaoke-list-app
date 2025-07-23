import { Router } from "express";
import { addEventsHandler, closeEventsHandler, getEventsListHandler, getLocationsHandler } from "../controllers/events.controller";

const eventsRoutes = Router()

// prefix: /events
eventsRoutes.get("/events", getEventsListHandler)
eventsRoutes.post("/add-event", addEventsHandler)
eventsRoutes.post("/close-event", closeEventsHandler)
eventsRoutes.get("/locations", getLocationsHandler)
export default eventsRoutes
