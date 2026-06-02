Traajo hecho por Santiago Castellanos Valderrama y Sebastián Villanueva Mosquera

Este proyecto es una aplicación web desarrollada con React y Firebase, cuyo objetivo es permitir a los usuarios reportar incidentes y a los administradores gestionarlos de forma eficiente.
El sistema incluye autenticación, almacenamiento de datos en Firestore, gestión de estados de reportes y un sistema de notificaciones en tiempo real.

Funcionalidades principales:
*Usuario
Registro de cuenta (email, Google y Facebook)
Inicio de sesión
Creación de reportes de incidentes
Visualización de sus reportes
Recepción de notificaciones cuando cambia el estado de un reporte
*Administrador
Visualización de todos los reportes
Filtrado por estado (Reportado, En Proceso, Resuelto)
Cambio de estado de reportes
Visualización detallada de cada incidente
Generación automática de notificaciones a usuarios

src/
│
├── Components/
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   └── CustomIcons/
│
├── Pages/
│   ├── Login/
│   ├── SignUp/
│   ├── Home/
│   └── Dashboard/
│       ├── DashboardUsuario.jsx
│       └── Admin/
│           ├── DashboardAdmin.jsx
│           ├── NuevoReporte.jsx
│           └── DetalleReporte.jsx
│
├── FireBase/
│   └── config.js
│
├── assets/
│
└── App.jsx
