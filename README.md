## FinTrack

FinTrack es una plataforma web full-stack para la gestión de finanzas personales.

El proyecto permite registrar ingresos y gastos, administrar presupuestos, crear metas de ahorro, realizar aportes y visualizar información financiera mediante un dashboard con métricas y gráficas.

Actualmente se encuentra en desarrollo y hace parte de mi portafolio como proyecto práctico de desarrollo de software.


## Tecnologías utilizadas

### Frontend
- React
- TypeScript
- Vite
- CSS
- Recharts

### Backend
- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- BCrypt
- Maven

### Base de datos
- PostgreSQL
- Hibernate / JPA

### Herramientas
- Git
- GitHub
- Postman
- pgAdmin
- VS Code

---

## Funcionalidades actuales

### Autenticación y seguridad
- Registro de usuarios.
- Inicio de sesión.
- Autenticación mediante JWT.
- Contraseñas cifradas con BCrypt.
- Protección de endpoints con Spring Security.
- Aislamiento de información por usuario.

### Gestión de transacciones
- Registrar ingresos.
- Registrar gastos.
- Editar transacciones.
- Eliminar transacciones.
- Consultar movimientos.
- Persistencia de información en PostgreSQL.

### Presupuestos
- Creación de presupuestos mensuales por categoría.
- Edición y eliminación de presupuestos.
- Cálculo automático del gasto utilizado.
- Visualización del monto disponible.
- Indicadores de porcentaje de uso.
- Alertas visuales cuando se supera un presupuesto.

### Metas de ahorro
- Creación de metas financieras.
- Definición de monto objetivo.
- Fecha objetivo.
- Registro de aportes.
- Eliminación de aportes.
- Cálculo automático del monto ahorrado.
- Barra de progreso.
- Porcentaje de cumplimiento.
- Monto restante para alcanzar la meta.

### Dashboard financiero
- Total de ingresos.
- Total de gastos.
- Balance disponible.
- Movimientos recientes.
- Distribución de gastos por categoría.
- Comparación mensual de ingresos y gastos.
- Visualizaciones mediante Recharts.

---

## Arquitectura

El backend utiliza una arquitectura por capas:

Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL


El frontend consume la API REST del backend mediante peticiones HTTP autenticadas con JWT.

React + TypeScript
        ↓
     REST API
        ↓
Spring Boot
        ↓
PostgreSQL
Seguridad

FinTrack implementa autenticación basada en JWT.


Cada usuario solamente puede consultar, modificar o eliminar sus propios recursos, incluyendo:

- Transacciones.
- Presupuestos.
- Metas de ahorro.
- Aportes a metas.

Las contraseñas se almacenan cifradas mediante BCrypt y los secretos de configuración se manejan mediante variables de entorno.


## Endpoints principales

## Autenticación
- POST /api/auth/register
- POST /api/auth/login

## Transacciones
- GET    /api/transactions
- POST   /api/transactions
- PUT    /api/transactions/{id}
- DELETE /api/transactions/{id}

## Presupuestos
- GET    /api/budgets
- POST   /api/budgets
- PUT    /api/budgets/{id}
- DELETE /api/budgets/{id}

## Metas de ahorro
- GET    /api/savings-goals
- POST   /api/savings-goals
- PUT    /api/savings-goals/{id}
- DELETE /api/savings-goals/{id}

## Aportes a metas
- GET    /api/savings-goals/{goalId}/contributions
- POST   /api/savings-goals/{goalId}/contributions
- DELETE /api/savings-goals/{goalId}/contributions/{contributionId}

## Roadmap

FinTrack continúa en desarrollo. Entre las funcionalidades y mejoras planeadas se encuentran:

- Gastos recurrentes.
- Proyecciones financieras.
- Documentación de API con Swagger / OpenAPI.
- Pruebas automatizadas.
- Docker.
- GitHub Actions.
- Integración y despliegue continuo (CI/CD).
- Despliegue del frontend, backend y base de datos en la nube.
  
## Estado del proyecto

🟡 En desarrollo

El proyecto se encuentra actualmente en construcción y se actualiza progresivamente con nuevas funcionalidades y mejoras técnicas.

## Autor

Proyecto desarrollado como parte de mi portafolio de desarrollo de software.
