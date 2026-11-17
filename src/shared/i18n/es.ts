import type { TranslationShape } from "./en";

export const es = {
  landing: {
    hero: {
      badge: "Análisis de Esquemas en Tiempo Real",
      title: "Diseña, Evalúa y Optimiza Esquemas NoSQL",
      subtitle:
        "Herramienta visual de diseño guiada por métricas para bases de datos NoSQL orientadas a documentos.",
      ctaPrimary: "Log In",
      ctaSecondary: "Explorar Métricas",
    },
    features: {
      tag: "Capacidades del Sistema",
      title: "Arquitectura Diseñada para Rendimiento y Precisión",
      canvas: {
        title: "Editor Visual en Grafo",
        desc: "Modela relaciones entre documentos, tablas anidadas y colecciones mediante un lienzo interactivo basado en React Flow.",
      },
      queries: {
        title: "Motor de Consultas en Lenguaje Natural",
        desc: "Escribe requerimientos en texto libre; nuestro algoritmo de coincidencia por prefijo de 3 caracteres vincula automáticamente tus tablas.",
      },
      versioning: {
        title: "Matriz de Comparación de Versiones",
        desc: "Ramifica estados del lienzo y compara el impacto de tus cambios en tiempo real mediante gráficos de barras y tablas de decisión.",
      },
    },
    metrics: {
      tag: "Métricas de Evaluación",
      title: "4 Pilares de Calidad de Esquema",
      accessPattern: {
        name: "Patrón de Acceso",
        subtitle: "Complejidad de Navegación",
        description:
          "Evalúa la profundidad de anidamiento y la conectividad del nodo más atado (40% profundidad, 60% relaciones).",
        formula: "accessPattern = (maxDepth × 0.4) + (maxRelations × 0.6)",
      },
      recoveryCost: {
        name: "Costo de Recuperación",
        subtitle: "Esfuerzo de Extracción",
        description:
          "Estima el costo de extraer información combinando campos simples, estructuras complejas y la complejidad de acceso.",
        formula:
          "recoveryCost = (totalAttributes × 0.51) + (totalNestedTables × 0.49) + accessPattern",
      },
      redundancy: {
        name: "Redundancia",
        subtitle: "Duplicación de Entidades",
        description:
          "Detecta colisiones exactas de nombres de tablas a lo largo del esquema para prevenir duplicaciones no deseadas.",
        formula: "redundancy = ∑(count - 1)",
      },
      completitud: {
        name: "Completitud",
        subtitle: "Cobertura de Consultas",
        description:
          "Utiliza Búsqueda en Anchura (BFS) en un grafo de adyacencia para verificar si el esquema resuelve todas tus consultas.",
        formula: "completude = (handledQueries / totalQueries) × 100",
      },
    },
    team: {
      tag: "Equipo de Desarrollo",
      title: "Creado por Ingenieros",
      subtitle:
        "El equipo detrás del motor de análisis y evaluación en tiempo real de Qolqa.",
    },
    donation: {
      tag: "Iniciativa Académica",
      title: "Apoya el Proyecto Qolqa",
      description:
        "Qolqa es una herramienta académica y de ingeniería de acceso libre. Si te ha sido útil para optimizar tus esquemas, considera apoyar su desarrollo continuo.",
      cta: "Donar con PayPal",
    },
  },
  // Common buttons
  common: {
    accept: "Aceptar",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    confirm: "Confirmar",
    close: "Cerrar",
    loading: "Cargando...",
    update: "Actualizar",
    next: "Siguiente",
    logOut: "Cerrar sesión",
    tryAgain: "Intentar de nuevo",
  },

  // Database Diagram
  databaseDiagram: {
    changingVersion: "Cambiando versión...",
    newCollection: "Nueva Colección",
    relationshipExists: "Ya existe una relación entre estas tablas",
  },

  // Modals
  modals: {
    unsavedChanges: {
      title: "Cambios sin guardar",
      description: "Guarda los cambios de la versión actual antes de continuar o sigue editando.",
      keepEditing: "Seguir editando",
      saveAndContinue: "Guardar y continuar",
      saving: "Guardando...",
    },
    createCollection: {
      title: "Crear colección",
      nameLabel: "Nombre",
      creating: "Creando colección...",
      nameTooShort: "El nombre debe tener al menos 4 caracteres.",
    },
    error: {
      accept: "Aceptar",
    },
    addProject: {
      title: "Nuevo proyecto",
      nameLabel: "Nombre del proyecto:",
      creating: "Creando proyecto...",
      nameTooShort: "El nombre debe tener al menos 4 caracteres.",
    },
    editProject: {
      title: "Editar proyecto",
      nameLabel: "Nombre del proyecto:",
      creating: "Actualizando proyecto...",
      updating: "Actualizando proyecto...",
    },
    deleteProject: {
      title: "Eliminar proyecto",
      description: "¿Estás seguro de que quieres eliminar este proyecto?",
      confirmMessage: "¿Estás seguro de que deseas eliminar",
      irreversibleAction: "Esta acción es irreversible.",
      defaultProjectName: "este proyecto",
      deleting: "Eliminando proyecto...",
    },
    deleteVersion: {
      title: "Eliminar versión",
      confirmMessage: "¿Estás seguro de que deseas eliminar",
      irreversibleAction: "Esta acción es irreversible.",
      defaultVersionName: "esta versión",
      deleting: "Eliminando versión...",
      cannotDeleteLast: "No se puede eliminar la única versión.",
    },
    deleteEdge: {
      title: "Eliminar Relación",
      confirmMessage: "¿Estás seguro de que deseas eliminar esta relación?",
      irreversibleAction:
        "Esta acción no se puede deshacer y eliminará la columna de clave foránea.",
      deleteButtonAriaLabel: "Eliminar relación",
    },
    newQuery: {
      title: "Nueva consulta",
      queryLabel: "Consulta:",
      queryPlaceholder: "Escribe tu consulta aquí...",
      error: "La consulta no puede estar vacía.",
    },
    document: {
      createTitle: "Crear documento",
      nameLabel: "Nombre",
      nameRequired: "El nombre es obligatorio.",
    },
    attributes: {
      addTitle: "Agregar atributo",
      editTitle: "Editar atributo",
      namePlaceholder: "Nombre del atributo",
    },
  },

  // Login
  login: {
    title: "¡Bienvenido de nuevo!",
    description:
      "Inicia sesión para continuar trabajando en tus proyectos de base de datos.",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    loginButton: "Iniciar sesión",
    registerPrompt: "¿No tienes una cuenta?",
    registerLink: "Regístrate aquí",
  },

  // Projects
  projects: {
    title: "Tus proyectos",
    newProjectButton: "Nuevo proyecto",
    lastModified: "Última modificación:",
  },

  // Other
  other: {
    involvedCollections: "Colecciones involucradas:",
    newProject: "Nuevo proyecto",
    yourProjects: "Tus proyectos",
    lastEdited: "Última edición:",
    noImage: "Sin imagen",
    newAttribute: "Nuevo atributo",
    addAttributes: "Agregar atributos",
    addDocuments: "Agregar documentos",
  },

  // Header
  header: {
    duplicateVersion: "Duplicar esta versión",
    saveChanges: "Guardar cambios",
    switchProject: "Cambiar de proyecto",
    noOtherProjects: "No tienes otros proyectos",
    addNewVersion: "Agregar nueva versión",
    editVersionName: "Editar nombre de la versión",
  },

  // Toasts
  toasts: {
    canvasSaved: "Canvas guardado correctamente.",
    errorSavingCanvas: "Error al guardar el canvas.",
    versionDuplicated: "Versión duplicada correctamente.",
    errorDuplicatingVersion: "Error al duplicar la versión.",
    versionDeleted: "Versión eliminada correctamente.",
    errorDeletingVersion: "Error al eliminar la versión.",
    versionCreated: "Nueva versión creada correctamente.",
    errorCreatingVersion: "Error al crear la versión.",
    versionRenamed: "Nombre de la versión actualizado correctamente.",
    errorRenamingVersion: "Error al actualizar el nombre de la versión.",
    versionNameEmpty: "El nombre de la versión no puede estar vacío.",
    versionNameTooLong:
      "El nombre de la versión es demasiado largo (máx. 500 caracteres).",
  },

  tour: {
    chapters: {
      collection: "Primera colección",
      attributes: "Atributos",
      nested: "Colección anidada",
      another: "Otra colección",
      query: "Consultas",
      metrics: "Métricas",
      version: "Versiones",
      experiment: "Experimenta en la copia",
      compare: "Comparación",
    },
    ui: {
      stepOf: "Paso {current} de {total}",
      start: "¡Empecemos!",
      notNow: "Ahora no",
      next: "Siguiente",
      back: "Atrás",
      skipStep: "Omitir este paso",
      minimize: "Minimizar tutorial",
      close: "Cerrar tutorial",
      resume: "Tutorial en pausa · Continuar",
      continueInProject: "Continuar el tutorial en tu proyecto",
      doIt: "Tu turno: hazlo en el elemento resaltado y continuaré automáticamente.",
      lost: "No encuentro ese elemento ahora. Verifica que el panel esté abierto o vuelve un paso atrás.",
      chapterDone: "¡Bien! \"{name}\" completado",
      restart: "Repetir tutorial",
      finish: "Seguir diseñando",
      launcher: "Tutorial guiado",
      continueTutorial: "Continuar tutorial",
      bannerTitle: "¿Nuevo en QOLQA?",
      bannerBody: "Crea un proyecto de práctica y aprende todo el flujo en unos 5 minutos: colecciones, consultas, métricas y versiones.",
      bannerCta: "Empezar tutorial",
      bannerDismiss: "Descartar",
      practiceProjectName: "Mi primer diseño (tutorial)",
    },
    verdict: {
      metrics: {
        accessPattern: {
          name: "Patrón de acceso",
          meaning: "menos significa que cada consulta visita menos colecciones: lecturas más simples y rápidas.",
        },
        recoveryCost: {
          name: "Costo de recuperación",
          meaning: "menos significa menos trabajo para armar los datos que pide una consulta.",
        },
        redundancy: {
          name: "Redundancia",
          meaning: "menos significa menos datos duplicados: actualizar es más barato y todo se mantiene consistente.",
        },
        completude: {
          name: "Consultas cubiertas",
          meaning: "más es mejor: el esquema puede responder más de tus consultas.",
        },
        total: {
          name: "Costo total",
        },
      },
      winner: "Ganador: {name}",
      reasonQueries: "Gana porque responde más de tus consultas: {winner} frente a {other}. Un esquema que no puede responder una consulta no sirve, por barato que sea.",
      reasonCost: "Ambas responden {queries} de tus consultas, así que desempata el costo: su total (acceso + recuperación + redundancia) es menor, {winner} frente a {other}.",
      metric: "Métrica",
      legend: "Verde: mejor que la otra versión. Rojo: el precio que se paga por esta estructura.",
      needVersions: "Crea al menos dos versiones para ver un ganador.",
    },
    steps: {
      welcome: {
        title: "¡Bienvenido a QOLQA!",
        body: "En unos minutos diseñarás el esquema de una pequeña tienda online: usuarios con su dirección embebida y sus pedidos.\n\nAprenderás a modelar colecciones, describir cómo tu app lee los datos con consultas, medir el diseño y comparar versiones.",
      },
      collectionOpen: {
        title: "Crea tu primera colección",
        body: "Una colección agrupa documentos del mismo tipo, como una tabla en SQL. Haz clic en \"New Collection\".",
      },
      collectionFill: {
        title: "Ponle un nombre",
        body: "Escribe el nombre de la colección y presiona \"Create\".",
        hint: "Prueba con \"usuarios\". El nombre necesita al menos 4 caracteres.",
      },
      collectionCreated: {
        title: "¡Tu primera colección!",
        body: "QOLQA agregó automáticamente una clave primaria (usuarios_id). El color del encabezado indica a qué submodelo pertenece.\n\nTip: puedes arrastrar la tarjeta por el lienzo.",
      },
      attributesMenu: {
        title: "Abre el menú de la colección",
        body: "Cada colección tiene un menú ⋯ con sus acciones. Ábrelo.",
      },
      attributesOption: {
        title: "Agrega atributos",
        body: "Elige \"Add attributes\".",
      },
      attributesFill: {
        title: "Describe tus datos",
        body: "Cada atributo tiene nombre y tipo (string, integer, double, boolean, date, array). Usa \"New attribute\" para agregar más filas y presiona \"Create\".",
        hint: "Prueba con nombre (string), email (string) y fecha_registro (date).",
      },
      nestedMenu: {
        title: "Ahora, un documento embebido",
        body: "En bases documentales puedes guardar datos relacionados dentro del documento padre en lugar de otra colección. Así evitas joins cuando siempre los lees juntos. Abre otra vez el menú ⋯.",
      },
      nestedOption: {
        title: "Agrega un documento",
        body: "Elige \"Add documents\" para crear una colección anidada.",
      },
      nestedFill: {
        title: "Nombra la colección anidada",
        body: "Escribe un nombre y presiona \"Create\". Aparecerá dentro de la colección padre.",
        hint: "Prueba con \"direccion\": la dirección de un usuario casi siempre se lee junto al usuario.",
      },
      nestedCardinality: {
        title: "Cardinalidad",
        body: "Este selector indica cuántos documentos embebidos tiene cada padre: uno (1...1) o muchos (1...n). Afecta a las métricas, así que elige el que refleje la realidad.",
      },
      secondOpen: {
        title: "Una colección más",
        body: "Los pedidos crecen sin límite, por eso es mejor tenerlos en su propia colección. Haz clic otra vez en \"New Collection\".",
      },
      secondFill: {
        title: "Ponle nombre",
        body: "Escribe el nombre y presiona \"Create\".",
        hint: "Prueba con \"pedidos\".",
      },
      connect: {
        title: "Conéctalas (opcional)",
        body: "Arrastra desde el punto del lado derecho de una colección hacia la otra para crear una referencia (clave foránea). Las colecciones conectadas comparten submodelo y color.",
      },
      queriesOpen: {
        title: "¿Cómo leerá tu app los datos?",
        body: "Un buen diseño NoSQL parte de sus consultas. Abre el panel \"Queries\".",
      },
      queryAdd: {
        title: "Agrega una consulta",
        body: "Haz clic en \"Add Query\".",
      },
      queryText: {
        title: "Escríbela en lenguaje natural",
        body: "Describe lo que tu app necesita leer y presiona \"Next\".",
        hint: "Prueba con \"Obtener los pedidos de un usuario\". Las palabras que coinciden con tus colecciones se detectan automáticamente.",
      },
      queryDocs: {
        title: "Elige las colecciones involucradas",
        body: "Selecciona las colecciones que toca esta consulta (las palabras detectadas aparecen como botones) y presiona \"Create\".",
      },
      metricsOpen: {
        title: "Mide tu diseño",
        body: "Abre el panel \"Statistics\" para ver qué tan bueno es este esquema.",
      },
      metricsQueries: {
        title: "Consultas cubiertas",
        body: "Este gráfico muestra cuántas de tus consultas puede responder el esquema. Apunta al 100%.",
      },
      metricsScores: {
        title: "Métricas del diseño",
        body: "Patrón de acceso: cuántas colecciones debe visitar una consulta.\nCosto de recuperación: qué tan caro es leer los datos.\nRedundancia: cuántos datos están duplicados.\n\nMenor suele ser mejor, pero hay un equilibrio: embeber baja el costo y sube la redundancia.",
      },
      versionDuplicate: {
        title: "Crea una versión",
        body: "Una versión es una foto de tu diseño para probar una alternativa sin perder esta. Haz clic en \"Duplicar versión\" (primero guarda).",
      },
      versionRenameOpen: {
        title: "Ahora estás en la copia",
        body: "La versión original está a salvo. Ponle a esta copia un nombre que diga qué vas a probar en ella: abre el selector de versiones.",
      },
      versionRenameEdit: {
        title: "Renombra la copia",
        body: "El check marca la versión que estás editando. Haz clic en el lápiz que está a su lado para renombrarla (si haces clic en el nombre, cambias de versión y se cierra esta lista).",
      },
      versionRenameFill: {
        title: "Ponle nombre",
        body: "Escribe el nuevo nombre y presiona Enter.",
        hint: "Prueba con \"project version 2\": en la comparación distinguirás ambas versiones de un vistazo.",
      },
      embedMenu: {
        title: "Experimento: embebe los pedidos",
        body: "En lugar de tener los pedidos en su propia colección, los guardaremos dentro de cada usuario. Abre el menú ⋯ de la primera colección.",
      },
      embedOption: {
        title: "Agrega un documento",
        body: "Elige \"Add documents\".",
      },
      embedFill: {
        title: "Embebe los pedidos",
        body: "Ponle nombre a la colección anidada y presiona \"Create\".",
        hint: "Usa el mismo nombre que tu segunda colección, por ejemplo \"pedidos\".",
      },
      embedDeleteMenu: {
        title: "Elimina la colección separada",
        body: "Los pedidos ahora viven dentro de usuarios, así que la colección separada sobra. Abre su menú ⋯.",
      },
      embedDeleteOption: {
        title: "Elimínala",
        body: "Elige \"Delete\".",
      },
      embedSave: {
        title: "Guarda esta versión",
        body: "La comparación usa las versiones guardadas. Haz clic en el botón de guardar para registrar los cambios de esta copia.",
      },
      compareOpen: {
        title: "Compara tus versiones",
        body: "Haz clic en \"Compare schemas\" para ver todas las versiones lado a lado.",
      },
      analysisCharts: {
        title: "Métricas por versión",
        body: "Compara tu original (pedidos referenciados) con la copia (pedidos embebidos). Embeber suele bajar el patrón de acceso y el costo de recuperación, pero sube la redundancia.\n\nA la izquierda, las métricas intrínsecas; a la derecha, qué tan bien atiende cada versión a tus consultas.",
      },
      analysisTable: {
        title: "Tabla comparativa",
        body: "Cada fila es una versión (despliégala para ver sus submodelos). Marca una fila para filtrar los gráficos y comparar solo las que te interesan.",
      },
      finish: {
        title: "¡Lo lograste! 🎉",
        body: "Modelaste colecciones, documentos embebidos y consultas, creaste una versión con otra estructura y comparaste ambas. Así se lee el resultado:",
      },
    },
  },

  errors: {
    somethingWentWrong: "Algo salió mal. Por favor, inténtalo de nuevo.",
  },
} as const satisfies TranslationShape;
