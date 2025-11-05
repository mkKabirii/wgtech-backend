const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const path = require("path");

const errorMiddleware = require("./middleware/errorMiddleware");
const AppError = require("./utils/appError");

// Routes
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const subServiceRoutes = require("./routes/subServiceRoutes");
const userRoleRoutes = require("./routes/userRoleRoutes");
const aboutUsRoutes = require("./routes/aboutUsRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");
const faqRoutes = require("./routes/faqRoutes");
const opportunitiesRoutes = require("./routes/opportunitiesRoutes");
const ourStoryRoutes = require("./routes/ourStoryRoutes");
const ourTeamRoutes = require("./routes/ourTeamRoutes");
const teamRoleRoutes = require("./routes/teamRoleRoutes");
const workRoutes = require("./routes/workRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection and XSS attacks
app.use(mongoSanitize());
app.use(xss());

// Compression middleware
app.use(compression());

// Set view engine and views folder if using views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/subservices", subServiceRoutes);
app.use("/api/v1/userroles", userRoleRoutes);
app.use("/api/v1/aboutus", aboutUsRoutes);
app.use("/api/v1/advertisements", advertisementRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/opportunities", opportunitiesRoutes);
app.use("/api/v1/ourstory", ourStoryRoutes);
app.use("/api/v1/team", ourTeamRoutes);
app.use("/api/v1/teamroles", teamRoleRoutes);
app.use("/api/v1/works", workRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/upload", uploadRoutes);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorMiddleware);

module.exports = app;
