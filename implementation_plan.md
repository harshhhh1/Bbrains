{
  "task": "Implement this changes",
  "objective": "Define and enforce clear role-based permissions for students, teachers, admins, and managers across all core modules without ambiguity.",
  
  "modules": {
    
    "announcements": {
      "student": ["view"],
      "teacher": ["view", "create", "update", "delete"],
      "manager": ["view", "create", "update", "delete"],
      "admin": ["view", "create", "update", "delete"]
    },

    "assignments": {
      "student": ["view", "submit"],
      "teacher": ["view", "create", "update", "delete"],
      "admin": ["view", "create", "update", "delete"]
    },

    "suggestions": {
      "student": ["create", "delete_own"],
      "teacher": ["view", "update (approve/reject)"],
      "admin": ["view", "update (approve/reject)"]
    },

    "products": {
      "student": ["view", "create", "delete_own"],
      "teacher": ["view", "approve/reject"],
      "admin": ["view", "approve/reject"],
      "manager": ["view", "approve/reject"]
    },

    "transactions": {
      "student": {
        "permissions": ["view", "create"],
        "view_format": "Card UI showing date, amount, status, course name, transaction ID, reference number",
        "features": [
          "Download fee receipt as PDF",
          "Pay fees using Razorpay",
          "Payment amount must not exceed remaining fees"
        ]
      },
      "admin": {
        "permissions": ["view"],
        "features": [
          "Filter by course, class, student, date range",
          "View remaining fees per student",
          "Download fee receipts",
          "View fee summary cards in dashboard"
        ]
      },
      "manager": {
        "permissions": ["view"],
        "features": [
          "Same capabilities as admin for transaction monitoring and filtering"
        ]
      }
    },

    "dashboard": {
      "student": {
        "description": "Keep existing student dashboard unchanged"
      },
      "teacher": {
        "features": [
          "View assigned class timetable",
          "View/manage assigned assignments",
          "View suggestions related to assigned classes",
          "View products related to assigned classes"
        ]
      },
      "manager": {
        "features": [
          "Manage classes (create, update, delete)",
          "Manage teachers",
          "View and manage college statistics",
          "Stats include: total students, teachers, classes, assignments, suggestions, products, transactions, gender distribution"
        ]
      },
      "admin": {
        "features": [
          "Full dashboard with system-wide stats",
          "Financial insights (profit/loss)",
          "Manage all entities: classes, teachers, assignments, suggestions, products, transactions"
        ]
      }
    }

  },

  "rules": [
    "Ensure strict role-based access control across all modules",
    "Students must never access admin/teacher/manager actions",
    "Only allow users to modify their own content where specified (e.g., delete_own)",
    "All UI and API interactions must respect these permissions"
  ],

  "expected_result": [
    "Clear separation of permissions per role",
    "Secure and predictable access control",
    "Consistent behavior across frontend and backend",
    "Scalable structure for adding more roles or modules in future"
  ]
}