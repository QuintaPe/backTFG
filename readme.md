# ScoutCamp - Sistema de gestión de reservas de en centros Scouts (TFG)

Este repositorio contiene el código fuente y la documentación relacionada con el BackEnd de mi Trabajo de Fin de Grado (TFG) titulado "ScoutCamp: Sistema de gestión de reservas de en centros Scouts", desarrollado en el marco de **Ingenieria Informatica** en la **Universidad de Málaga**.

## Descripción

El proyecto **ScoutCamp** es una aplicación web desarrollada en Angular que tiene como objetivo simplificar la gestión de reservas para campamentos scouts. Proporciona una interfaz intuitiva tanto para los usuarios que desean realizar reservas como para los administradores encargados de administrar y supervisar el sistema.

## Características

- [x] Autenticación segura de usuarios y gestión de roles.
- [x] Exploración de campamentos disponibles con información detallada.
- [x] Proceso de reserva intuitivo con selección de fechas y opciones.
- [x] Panel de administración para gestionar campamentos y reservas.
- [x] Notificaciones por correo electrónico para usuarios y administradores.
- [x] Interfaz amigable y adaptada a dispositivos móviles.
- [x] Soporte multilingüe (Español, Ingles, Francés, Alemán).
- [x] Comentarios y Calificaciones de los campametos reservados.
- [x] Correo interno entre usuarios, campamentos y administradores.

## Instalación y Uso

1. Asegúrate de tener Node.js.
2. Clona este repositorio: `git clone https://github.com/QuintaPe/backTFG.git`
3. Instala las dependencias: `npm install`
4. Ejecuta la aplicación: `npm start`
5. Ya tienes el servido abierto en `http://localhost:3000/`


## Estructura del Proyecto

- **src:**
  - **controllers:** Controladores de la aplicación, que manejan la lógica y la interacción con la base de datos.
  - **errors:** Archivos relacionados con el manejo de errores, como clases de excepción personalizadas.
  - **helpers:** Funciones auxiliares y utilidades utilizadas en varios lugares del proyecto.
  - **i18n:** Traducciones en diferentes idiomas para los correos.
  - **models:** Modelos de datos de la aplicación, que representan las estructuras de los objetos de mongoDB.
  - **routes:** Rutas de la API, que especifican cómo manejar las solicitudes entrantes.
  - **validators:** Validadores utilizados para validar datos de entrada.

- **index.js:** Carga y configuracion del servidor
- **database.js:** Conexión con la base de datos
- **mailer.js:** Conexión con el servicio de correo.
- **middlewares.js:** Middlewares de la aplicación.


## Futuras lineas
- [ ] Implementación de sistema de pago en línea para las reservas.
- [ ] Integración de notificaciones push para mantener a los usuarios informados en tiempo real.
- [ ] Mejoras en la interfaz de administración para una gestión más eficiente.
- [ ] Ampliación de opciones de personalización de campamentos.
- [ ] Integración con plataformas de redes sociales para compartir experiencias


## Contacto
- [Alejandro Quintana Pérez](mailto:alexquintape@gmail.com)
- [GitHub](https://github.com/QuintaPe/)
- [LinkedIn](https://www.linkedin.com/in/alejandroqp/)

