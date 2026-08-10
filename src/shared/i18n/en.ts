export const en = {
  landing: {
    hero: {
      badge: "Real-Time Schema Analytics",
      title: "Design, Evaluate, and Optimize NoSQL Schemas",
      subtitle:
        "Transform complex graph-based database architectures into quantifiable quality metrics in real time.",
      ctaPrimary: "Launch Canvas",
      ctaSecondary: "Explore Metrics",
    },
    features: {
      tag: "Capabilities",
      title: "Architected for Speed & Precision",
      canvas: {
        title: "Interactive React Flow Canvas",
        desc: "Model document relationships, nested tables, and fields seamlessly with custom PK/FK attributes.",
      },
      queries: {
        title: "Natural Language Queries",
        desc: "Write query scenarios in plain language; our 3-character prefix matching algorithm links them to your entities automatically.",
      },
      versioning: {
        title: "Version Comparison Matrix",
        desc: "Fork canvas states and compare metric outputs side-by-side with interactive bar charts and decision tables.",
      },
    },
    metrics: {
      tag: "Core Analytics",
      title: "4 Pillars of Schema Health",
      accessPattern: {
        name: "Access Pattern",
        subtitle: "Navigation Complexity",
        description:
          "Measures schema navigation cost based on nested table depth and connection density of the most linked node.",
        formula: "accessPattern = (maxDepth × 0.4) + (maxRelations × 0.6)",
      },
      recoveryCost: {
        name: "Recovery Cost",
        subtitle: "Extraction Effort",
        description:
          "Estimates total retrieval effort by combining simple field counts, complex structures, and access complexity.",
        formula:
          "recoveryCost = (totalAttributes × 0.51) + (totalNestedTables × 0.49) + accessPattern",
      },
      redundancy: {
        name: "Redundancy",
        subtitle: "Entity Duplication",
        description:
          "Tracks exact name collisions across all entities in the graph to prevent unintended data duplication.",
        formula: "redundancy = ∑(count - 1)",
      },
      completitud: {
        name: "Handled Queries",
        subtitle: "Schema Coverage",
        description:
          "Uses Breadth-First Search (BFS) graph pathfinding to verify if your current schema can answer all query paths.",
        formula: "completude = (handledQueries / totalQueries) × 100",
      },
    },
    team: {
      tag: "Development Team",
      title: "Built by Engineers",
      subtitle:
        "The engineering team behind the Qolqa real-time schema analysis engine.",
    },
    donation: {
      tag: "Academic Initiative",
      title: "Support the Qolqa Project",
      description:
        "Qolqa is an open academic & engineering project. If this tool helped you design better schemas, consider supporting our work.",
      cta: "Donate via PayPal",
    },
  },
  // Common buttons
  common: {
    accept: "Accept",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    confirm: "Confirm",
    close: "Close",
    loading: "Loading...",
    update: "Update",
    next: "Next",
    logOut: "Log out",
    tryAgain: "Try again",
  },

  // Database Diagram
  databaseDiagram: {
    changingVersion: "Changing version...",
    newCollection: "New Collection",
    relationshipExists: "A relationship already exists between these tables",
  },

  // Modals
  modals: {
    createCollection: {
      title: "Create collection",
      nameLabel: "Name",
      creating: "Creating collection...",
      nameTooShort: "Name must be at least 4 characters long.",
    },
    error: {
      accept: "Accept",
    },
    addProject: {
      title: "New project",
      nameLabel: "Project Name:",
      creating: "Creating project...",
      nameTooShort: "Name must be at least 4 characters long.",
    },
    editProject: {
      title: "Edit project",
      nameLabel: "Project Name:",
      creating: "Updating project...",
      updating: "Updating project...",
    },
    deleteProject: {
      title: "Delete project",
      description: "Are you sure you want to delete this project?",
      confirmMessage: "Are you sure you want to delete",
      irreversibleAction: "This action is irreversible.",
      defaultProjectName: "this project",
      deleting: "Deleting project...",
    },
    deleteVersion: {
      title: "Delete version",
      confirmMessage: "Are you sure you want to delete",
      irreversibleAction: "This action is irreversible.",
      defaultVersionName: "this version",
      deleting: "Deleting version...",
      cannotDeleteLast: "Cannot delete the only version.",
    },
    deleteEdge: {
      title: "Delete Relationship",
      confirmMessage: "Are you sure you want to delete this relationship?",
      irreversibleAction:
        "This action cannot be undone and will remove the foreign key column.",
      deleteButtonAriaLabel: "Delete relationship",
    },
    newQuery: {
      title: "New query",
      queryLabel: "Query:",
      queryPlaceholder: "Write your query here...",
      error: "The query cannot be empty.",
    },
    document: {
      createTitle: "Create document",
      nameLabel: "Name",
      nameRequired: "Name is required.",
    },
    attributes: {
      addTitle: "Add attribute",
      editTitle: "Edit attribute",
      namePlaceholder: "Attribute name",
    },
  },

  // Login
  login: {
    title: "Welcome back!",
    description: "Log in to continue working on your database projects.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: "Log in",
    registerPrompt: "Don't have an account?",
    registerLink: "Register here",
  },

  // Projects
  projects: {
    title: "Your projects",
    newProjectButton: "New project",
    lastModified: "Last modified:",
  },

  // Other
  other: {
    involvedCollections: "Involved collections:",
    newProject: "New project",
    yourProjects: "Your projects",
    lastEdited: "Last edited:",
    noImage: "No image",
    newAttribute: "New attribute",
    addAttributes: "Add attributes",
    addDocuments: "Add documents",
  },

  // Header
  header: {
    duplicateVersion: "Duplicate version",
    addNewVersion: "Add new version",
    editVersionName: "Edit version name",
  },

  // Toasts
  toasts: {
    canvasSaved: "Canvas saved successfully.",
    errorSavingCanvas: "Error saving canvas.",
    versionDuplicated: "Version duplicated successfully.",
    errorDuplicatingVersion: "Error duplicating version.",
    versionDeleted: "Version deleted successfully.",
    errorDeletingVersion: "Error deleting version.",
    versionCreated: "New version created successfully.",
    errorCreatingVersion: "Error creating version.",
    versionRenamed: "Version name updated successfully.",
    errorRenamingVersion: "Error updating version name.",
    versionNameEmpty: "Version name cannot be empty.",
    versionNameTooLong: "Version name is too long (max 500 characters).",
  },

  errors: {
    somethingWentWrong: "Something went wrong. Please try again.",
  },
} as const;

export type TranslationKeys = typeof en;

type DeepStringValues<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepStringValues<T[K]>
    : string;
};
export type TranslationShape = DeepStringValues<TranslationKeys>;
