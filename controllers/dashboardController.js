const Proposal = require("../model/proposalsModel");
const Service = require("../model/serviceModel");
const Events = require("../model/eventsModel");
const { successHandler } = require("../utils/helper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { schemaValidator } = require("../utils/schemaValidator");
const { dashboardDateRangeSchema } = require("../utils/validation");

// Get Dashboard Analytics
const getDashboardAnalytics = catchAsync(async (req, res, next) => {
  const [error, validatedData] = schemaValidator(
    req.query,
    dashboardDateRangeSchema
  );
  if (error) {
    return next(new AppError(error, 400));
  }

  const { startDate, endDate } = validatedData;

  // Build date filter for proposals
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) {
      dateFilter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set end date to end of day
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = endDateTime;
    }
  }

  // Build date filter for events
  const eventDateFilter = {};
  if (startDate || endDate) {
    eventDateFilter.eventDate = {};
    if (startDate) {
      eventDateFilter.eventDate.$gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      eventDateFilter.eventDate.$lte = endDateTime;
    }
  }

  // 1. Chart data according to proposal budget
  const proposals = await Proposal.find({
    ...dateFilter,
    isActive: true,
    budget: { $ne: null, $ne: "" },
  });

  const budgetChartData = {};
  proposals.forEach((proposal) => {
    const budget = proposal.budget || "Not Specified";
    budgetChartData[budget] = (budgetChartData[budget] || 0) + 1;
  });

  const budgetChart = Object.keys(budgetChartData).map((budget) => ({
    budget,
    count: budgetChartData[budget],
  }));

  // Helper function to parse budget and get numeric value
  const parseBudgetValue = (budget) => {
    if (!budget || budget === "" || budget === "Not Specified") {
      return 0;
    }
    
    // Remove commas and spaces
    const cleanBudget = budget.replace(/,/g, "").trim();
    
    // Check for range format like "10000-50000"
    if (cleanBudget.includes("-")) {
      const parts = cleanBudget.split("-");
      const maxValue = parts[parts.length - 1].trim();
      return parseInt(maxValue) || 0;
    }
    
    // Check for "+" format like "100000+"
    if (cleanBudget.includes("+")) {
      const value = cleanBudget.replace("+", "").trim();
      return parseInt(value) || 0;
    }
    
    // Try to extract number from string
    const numbers = cleanBudget.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      // Take the largest number found
      return Math.max(...numbers.map(n => parseInt(n)));
    }
    
    return 0;
  };

  // 2. Time-based proposal data (daily breakdown) with count and total budget
  const allProposals = await Proposal.find({
    ...dateFilter,
    isActive: true,
  }).sort({ createdAt: 1 });

  const proposalsByDate = {};
  allProposals.forEach((proposal) => {
    const dateKey = proposal.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD format
    
    if (!proposalsByDate[dateKey]) {
      proposalsByDate[dateKey] = {
        count: 0,
        totalBudget: 0,
      };
    }
    
    proposalsByDate[dateKey].count += 1;
    
    // Add budget value to total
    const budgetValue = parseBudgetValue(proposal.budget);
    proposalsByDate[dateKey].totalBudget += budgetValue;
  });

  const proposalsOverTime = Object.keys(proposalsByDate)
    .sort()
    .map((date) => ({
      date,
      count: proposalsByDate[date].count,
      totalBudget: proposalsByDate[date].totalBudget,
    }));

  // 3. Top 5 proposals according to budget
  const allProposalsForTop = await Proposal.find({
    ...dateFilter,
    isActive: true,
    budget: { $ne: null, $ne: "" },
  })
    .populate("services", "title")
    .populate("subServices", "title")
    .sort({ createdAt: -1 });

  // Map proposals with budget values for sorting
  const proposalsWithBudgetValue = allProposalsForTop.map((proposal) => ({
    proposal: {
      _id: proposal._id,
      proposalId: proposal.proposalId,
      fullname: proposal.fullname,
      email: proposal.email,
      phone: proposal.phone,
      company: proposal.company,
      budget: proposal.budget,
      status: proposal.status,
      messages: proposal.messages,
      services: proposal.services,
      subServices: proposal.subServices,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
    },
    budgetValue: parseBudgetValue(proposal.budget),
  }));

  // Sort by budget value (highest first) and get top 5
  const topProposals = proposalsWithBudgetValue
    .sort((a, b) => b.budgetValue - a.budgetValue)
    .slice(0, 5)
    .map((item) => item.proposal);

  // 4. Top 5 services according to proposal count
  const proposalsWithServices = await Proposal.find({
    ...dateFilter,
    isActive: true,
    services: { $exists: true, $ne: [] },
  }).populate("services", "title");

  const serviceCountMap = {};
  proposalsWithServices.forEach((proposal) => {
    if (proposal.services && Array.isArray(proposal.services)) {
      proposal.services.forEach((service) => {
        if (service && service._id) {
          const serviceId = service._id.toString();
          const serviceTitle = service.title || "Unknown Service";
          if (!serviceCountMap[serviceId]) {
            serviceCountMap[serviceId] = {
              serviceId,
              title: serviceTitle,
              count: 0,
            };
          }
          serviceCountMap[serviceId].count += 1;
        }
      });
    }
  });

  const topServices = Object.values(serviceCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((service) => ({
      serviceId: service.serviceId,
      title: service.title,
      proposalCount: service.count,
    }));

  // 5. Top 5 upcoming events
  const eventQuery = {
    type: "upcoming_event",
  };

  // Apply date filter if provided, otherwise only get future events
  if (startDate || endDate) {
    eventQuery.eventDate = eventDateFilter.eventDate;
  } else {
    // If no date range is provided, only get future events
    eventQuery.eventDate = { $gte: new Date() };
  }

  const upcomingEvents = await Events.find(eventQuery)
    .sort({ eventDate: 1 }) // Sort by event date ascending (earliest first)
    .limit(5);

  const topUpcomingEvents = upcomingEvents.map((event) => ({
    _id: event._id,
    title: event.title,
    subTitle: event.subTitle,
    eventDate: event.eventDate,
    location: event.location,
    shortDescription: event.shortDescription,
  }));

  // Summary statistics
  const totalProposals = await Proposal.countDocuments({
    ...dateFilter,
    isActive: true,
  });

  const pendingProposals = await Proposal.countDocuments({
    ...dateFilter,
    isActive: true,
    status: "Pending",
  });

  const acceptedProposals = await Proposal.countDocuments({
    ...dateFilter,
    isActive: true,
    status: "Accepted",
  });

  const inProgressProposals = await Proposal.countDocuments({
    ...dateFilter,
    isActive: true,
    status: "In Progress",
  });

  const completedProposals = await Proposal.countDocuments({
    ...dateFilter,
    isActive: true,
    status: "Completed",
  });

  successHandler(
    res,
    {
      budgetChart,
      proposalsOverTime,
      topProposals,
      topServices,
      topUpcomingEvents,
      summary: {
        totalProposals,
        pendingProposals,
        acceptedProposals,
        inProgressProposals,
        completedProposals,
      },
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    },
    "Dashboard analytics retrieved successfully"
  );
});

module.exports = {
  getDashboardAnalytics,
};

