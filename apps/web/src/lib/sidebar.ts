export const data = {
  versions: ["1.0.0"],

  navMain: [
    {
      title: "Overview",
      url: "/",
      pageTitle: "System Overview",
      items: [
        {
          title: "Dashboard",
          url: "/",
          pageTitle: "System Overview",
        },
      ],
    },

    // ======================
    // CUSTOMER MANAGEMENT
    // ======================
    {
      title: "Customers",
      url: "/customer",
      pageTitle: "Customer Management",
      items: [
        {
          title: "All Customers",
          url: "/customer",
          pageTitle: "All Customers",
        },
        {
          title: "Subscriptions",
          url: "/subscriptions",
          pageTitle: "Customer Subscriptions",
        },
        {
          title: "Expiring Soon",
          url: "/subscriptions/expiring",
          pageTitle: "Expiring Subscriptions",
        },
        {
          title: "Renewal Pipeline",
          url: "/subscriptions/pipeline",
          pageTitle: "Renewal Pipeline",
        },
      ],
    },

    // ======================
    // EMPLOYEE MANAGEMENT
    // ======================
    {
      title: "Employees",
      url: "/employee",
      pageTitle: "Employee Management",
      items: [
        {
          title: "Dashbaord",
          url: "/employee",
          pageTitle: "Employee Directory",
        },
        {
          title: "Sessions",
          url: "/employees/sessions",
          pageTitle: "Employee Sessions",
        },
        {
          title: "Activity Logs",
          url: "/employees/activity",
          pageTitle: "Employee Activity Logs",
        },
      ],
    },

    // ======================
    // EMAIL (Transactional)
    // ======================
    {
      title: "Email",
      url: "/email",
      pageTitle: "Email System",
      items: [
        {
          title: "Dashboard",
          url: "/email/dashboard",
          pageTitle: "Email Dashboard",
        },
        {
          title: "History",
          url: "/email/history",
          pageTitle: "Email History",
        },
        {
          title: "Templates",
          url: "/email/templates",
          pageTitle: "Email Templates",
        },
        {
          title: "Email Pools",
          url: "/email/pools",
          pageTitle: "Email Pools",
        },
      ],
    },

    // ======================
    // BULK EMAIL / CAMPAIGNS
    // ======================
    // {
    //   title: "Campaigns",
    //   url: "/campaigns",
    //   pageTitle: "Bulk Messaging",
    //   items: [
    //     {
    //       title: "All Campaigns",
    //       url: "/campaigns",
    //       pageTitle: "Bulk Email Campaigns",
    //     },
    //     {
    //       title: "New Campaign",
    //       url: "/campaigns/new",
    //       pageTitle: "Create Campaign",
    //     },
    //     {
    //       title: "Audience Segments",
    //       url: "/campaigns/audience",
    //       pageTitle: "Audience Segments",
    //     },
    //     {
    //       title: "Scheduled",
    //       url: "/campaigns/scheduled",
    //       pageTitle: "Scheduled Campaigns",
    //     },
    //     {
    //       title: "Analytics",
    //       url: "/campaigns/analytics",
    //       pageTitle: "Campaign Analytics",
    //     },
    //   ],
    // },

    // // ======================
    // // CONTENT / TEMPLATE SYSTEM
    // // ======================
    // {
    //   title: "Content",
    //   url: "/content",
    //   pageTitle: "Content Management",
    //   items: [
    //     {
    //       title: "Email Templates",
    //       url: "/content/email-templates",
    //       pageTitle: "Email Templates",
    //     },
    //     {
    //       title: "Greeting Templates",
    //       url: "/content/greetings",
    //       pageTitle: "Greeting Templates",
    //     },
    //     {
    //       title: "Magazine Templates",
    //       url: "/content/magazines",
    //       pageTitle: "Magazine Templates",
    //     },
    //   ],
    // },

    // // ======================
    // // SYSTEM LOGS
    // // ======================
    // {
    //   title: "Logs",
    //   url: "/logs",
    //   pageTitle: "System Logs",
    //   items: [
    //     {
    //       title: "Email Logs",
    //       url: "/logs/email",
    //       pageTitle: "Email Logs",
    //     },
    //     {
    //       title: "Employee Logs",
    //       url: "/logs/employees",
    //       pageTitle: "Employee Logs",
    //     },
    //     {
    //       title: "System Events",
    //       url: "/logs/system",
    //       pageTitle: "System Events",
    //     },
    //   ],
    // },

    // // ======================
    // // SETTINGS
    // // ======================
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   pageTitle: "System Settings",
    //   items: [
    //     {
    //       title: "General",
    //       url: "/settings/general",
    //       pageTitle: "General Settings",
    //     },
    //     {
    //       title: "Email Providers",
    //       url: "/settings/email-providers",
    //       pageTitle: "Email Provider Settings",
    //     },
    //     {
    //       title: "Subscription Plans",
    //       url: "/settings/plans",
    //       pageTitle: "Subscription Plans",
    //     },
    //   ],
    // },
  ],
};
