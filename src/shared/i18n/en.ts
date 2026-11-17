export const en = {
  landing: {
    hero: {
      badge: "Real-Time Schema Analytics",
      title: "Design, Evaluate, and Optimize NoSQL Schemas",
      subtitle:
        "A metrics-driven visual design tool for document-oriented NoSQL databases.",
      ctaPrimary: "Log In",
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
      tag: "Team",
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
    unsavedChanges: {
      title: "Unsaved changes",
      description: "Save your changes to the current version before continuing, or keep editing.",
      keepEditing: "Keep editing",
      saveAndContinue: "Save and continue",
      saving: "Saving...",
    },
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
    duplicateVersion: "Duplicate this version",
    saveChanges: "Save changes",
    switchProject: "Switch project",
    noOtherProjects: "You have no other projects",
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

  tour: {
    chapters: {
      collection: "First collection",
      attributes: "Attributes",
      nested: "Nested collection",
      another: "Another collection",
      query: "Queries",
      metrics: "Metrics",
      version: "Versions",
      experiment: "Experiment in the copy",
      compare: "Comparison",
    },
    ui: {
      stepOf: "Step {current} of {total}",
      start: "Let's go",
      notNow: "Not now",
      next: "Next",
      back: "Back",
      skipStep: "Skip this step",
      minimize: "Minimize tutorial",
      close: "Close tutorial",
      resume: "Tutorial paused · Continue",
      continueInProject: "Continue the tutorial in your project",
      doIt: "Your turn: do it on the highlighted element and I'll continue automatically.",
      lost: "I can't find that element right now. Make sure the panel is open or go back one step.",
      chapterDone: "Nice! \"{name}\" completed",
      restart: "Repeat tutorial",
      finish: "Keep designing",
      launcher: "Guided tutorial",
      bannerTitle: "New to QOLQA?",
      bannerBody: "Create a practice project and learn the whole flow in about 5 minutes: collections, queries, metrics and versions.",
      bannerCta: "Start tutorial",
      bannerDismiss: "Dismiss",
      practiceProjectName: "My first design (tutorial)",
    },
    verdict: {
      metrics: {
        accessPattern: {
          name: "Access pattern",
          meaning: "less means each query visits fewer collections, so reads are simpler and faster.",
        },
        recoveryCost: {
          name: "Recovery cost",
          meaning: "less means less work to assemble the data a query needs.",
        },
        redundancy: {
          name: "Redundancy",
          meaning: "less means less duplicated data, so updates are cheaper and stay consistent.",
        },
        completude: {
          name: "Queries covered",
          meaning: "more is better: the schema can answer more of your queries.",
        },
        total: {
          name: "Total cost",
        },
      },
      winner: "Winner: {name}",
      reasonQueries: "It wins because it answers more of your queries: {winner} vs {other}. A schema that can't answer a query is not useful, however cheap it is.",
      reasonCost: "Both answer {queries} of your queries, so the tie is broken by cost: its total (access + recovery + redundancy) is lower, {winner} vs {other}.",
      metric: "Metric",
      legend: "Green: better than the other version. Red: the price paid for this structure.",
      needVersions: "Create at least two versions to see a winner.",
    },
    steps: {
      welcome: {
        title: "Welcome to QOLQA!",
        body: "In a few minutes you'll design a small online store schema: users with an embedded address and their orders.\n\nYou'll learn to model collections, describe how your app reads data with queries, measure the design and compare versions.",
      },
      collectionOpen: {
        title: "Create your first collection",
        body: "A collection groups documents of the same kind, like a table in SQL. Click \"New Collection\".",
      },
      collectionFill: {
        title: "Give it a name",
        body: "Type the name of the collection and press \"Create\".",
        hint: "Try \"users\". Names need at least 4 characters.",
      },
      collectionCreated: {
        title: "Your first collection!",
        body: "QOLQA added a primary key (users_id) automatically. The header color shows which submodel it belongs to.\n\nTip: you can drag the card around the canvas.",
      },
      attributesMenu: {
        title: "Open the collection menu",
        body: "Every collection has a ⋯ menu with its actions. Open it.",
      },
      attributesOption: {
        title: "Add attributes",
        body: "Choose \"Add attributes\".",
      },
      attributesFill: {
        title: "Describe your data",
        body: "Each attribute has a name and a type (string, integer, double, boolean, date, array). Use \"New attribute\" to add more rows and press \"Create\".",
        hint: "Try name (string), email (string) and created_at (date).",
      },
      nestedMenu: {
        title: "Now, an embedded document",
        body: "In document databases you can store related data inside the parent document instead of another collection. This avoids joins when you always read them together. Open the ⋯ menu again.",
      },
      nestedOption: {
        title: "Add a document",
        body: "Choose \"Add documents\" to create a nested collection.",
      },
      nestedFill: {
        title: "Name the nested collection",
        body: "Type a name and press \"Create\". It will appear inside the parent collection.",
        hint: "Try \"address\": a user's address is almost always read together with the user.",
      },
      nestedCardinality: {
        title: "Cardinality",
        body: "This selector says how many embedded documents each parent has: one (1...1) or many (1...n). It affects the metrics, so pick the one that matches reality.",
      },
      secondOpen: {
        title: "One more collection",
        body: "Orders grow without limit, so they are better in their own collection. Click \"New Collection\" again.",
      },
      secondFill: {
        title: "Name it",
        body: "Type the name and press \"Create\".",
        hint: "Try \"orders\".",
      },
      connect: {
        title: "Connect them (optional)",
        body: "Drag from the dot on the right side of one collection to the other to create a reference (foreign key). Connected collections share a submodel and color.",
      },
      queriesOpen: {
        title: "How will your app read the data?",
        body: "A good NoSQL design starts from its queries. Open the \"Queries\" panel.",
      },
      queryAdd: {
        title: "Add a query",
        body: "Click \"Add Query\".",
      },
      queryText: {
        title: "Write it in plain language",
        body: "Describe what your app needs to read, then press \"Next\".",
        hint: "Try \"Get the orders of a user\". Words that match your collection names are detected automatically.",
      },
      queryDocs: {
        title: "Choose the collections involved",
        body: "Select the collections this query touches (detected words appear as buttons) and press \"Create\".",
      },
      metricsOpen: {
        title: "Measure your design",
        body: "Open the \"Statistics\" panel to see how good this schema is.",
      },
      metricsQueries: {
        title: "Queries covered",
        body: "This chart shows how many of your queries the schema can answer. Aim for 100%.",
      },
      metricsScores: {
        title: "Design metrics",
        body: "Access pattern: how many collections a query has to visit.\nRecovery cost: how expensive it is to read the data.\nRedundancy: how much data is duplicated.\n\nLower is usually better, but it's a trade-off: embedding lowers cost and raises redundancy.",
      },
      versionDuplicate: {
        title: "Create a version",
        body: "A version is a snapshot of your design, so you can try an alternative without losing this one. Click \"Duplicate version\" (it saves first).",
      },
      versionRenameOpen: {
        title: "You're now in the copy",
        body: "The original version is safe. Give this copy a name that says what you'll try in it: open the version selector.",
      },
      versionRenameEdit: {
        title: "Rename the copy",
        body: "The check marks the version you're editing. Click the pencil next to it to rename it (clicking the name switches versions and closes this list).",
      },
      versionRenameFill: {
        title: "Name it",
        body: "Type the new name and press Enter.",
        hint: "Try \"project version 2\": in the comparison you'll tell both versions apart at a glance.",
      },
      embedMenu: {
        title: "Experiment: embed the orders",
        body: "Instead of keeping orders in their own collection, we'll store them inside each user. Open the ⋯ menu of the first collection.",
      },
      embedOption: {
        title: "Add a document",
        body: "Choose \"Add documents\".",
      },
      embedFill: {
        title: "Embed the orders",
        body: "Name the nested collection and press \"Create\".",
        hint: "Use the same name as your second collection, e.g. \"orders\".",
      },
      embedDeleteMenu: {
        title: "Remove the separate collection",
        body: "The orders now live inside users, so the separate collection is redundant. Open its ⋯ menu.",
      },
      embedDeleteOption: {
        title: "Delete it",
        body: "Choose \"Delete\".",
      },
      embedSave: {
        title: "Save this version",
        body: "The comparison uses saved versions. Click the save button to store the changes of this copy.",
      },
      compareOpen: {
        title: "Compare your versions",
        body: "Click \"Compare schemas\" to see every version side by side.",
      },
      analysisCharts: {
        title: "Metrics per version",
        body: "Compare your original (referenced orders) with the copy (embedded orders). Embedding usually lowers the access pattern and recovery cost, but raises redundancy.\n\nOn the left, intrinsic metrics; on the right, how well each version serves your queries.",
      },
      analysisTable: {
        title: "Comparison table",
        body: "Each row is a version (expand it to see its submodels). Tick a row to filter the charts and compare only the ones you care about.",
      },
      finish: {
        title: "You did it! 🎉",
        body: "You modeled collections, embedded documents and queries, created a version with a different structure and compared both. This is how to read the result:",
      },
    },
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
