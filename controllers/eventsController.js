const Events = require("../model/eventsModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { createEventSchema } = require("../utils/validation");

// Create Event
const createEvent = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(req.body, createEventSchema);
  if (error) {
    return next(new AppError(error, 400));
  }

  const {
    title,
    subTitle,
    shortDescription,
    longDescription,
    image,
    video,
    location,
    type,
    eventDate,
  } = validatedData;

  const event = await Events.create({
    title,
    subTitle,
    shortDescription,
    longDescription,
    image,
    video,
    location,
    type,
    eventDate,
  });

  successHandler(res, event, "Event created successfully", 201);
});

// Get All Events
const getAllEvents = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, type } = req.query;

  let filter = {};
  if (type) filter.type = type;

  const events = await Events.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Events.countDocuments(filter);

  successHandler(
    res,
    {
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Events retrieved successfully"
  );
});

// Get All Events Sorted by Type (upcoming_event and archive_event)
const getAllEventsSorted = catchAsync(async (req, res, next) => {
  const allEvents = await Events.find().sort({ createdAt: -1 });

  const upcoming_events = allEvents.filter(
    (event) => event.type === "upcoming_event"
  );
  const archive_events = allEvents.filter(
    (event) => event.type === "archive_event"
  );

  successHandler(
    res,
    {
      upcoming_event: upcoming_events,
      archive_event: archive_events,
    },
    "Events retrieved and sorted successfully"
  );
});

// Get Event by ID
const getEventById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Events.findById(id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  successHandler(res, event, "Event retrieved successfully");
});

// Get Upcoming Events (type === "upcoming_event")
const getUpcomingEvents = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const events = await Events.find({ type: "upcoming_event" })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Events.countDocuments({ type: "upcoming_event" });

  successHandler(
    res,
    {
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Upcoming events retrieved successfully"
  );
});

// Get Archive Events (type === "archive_event")
const getArchiveEvents = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const events = await Events.find({ type: "archive_event" })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Events.countDocuments({ type: "archive_event" });

  successHandler(
    res,
    {
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    },
    "Archive events retrieved successfully"
  );
});

// Update Event
const updateEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const event = await Events.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  successHandler(res, event, "Event updated successfully");
});

// Delete Event
const deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const event = await Events.findByIdAndDelete(id);

  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  successHandler(res, null, "Event deleted successfully");
});

module.exports = {
  createEvent,
  getAllEvents,
  getAllEventsSorted,
  getEventById,
  getUpcomingEvents,
  getArchiveEvents,
  updateEvent,
  deleteEvent,
};
