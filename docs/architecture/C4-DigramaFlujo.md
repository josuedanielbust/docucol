# Diagrama de Flujo para la inicialización de sesión

1. **Inicio**: El usuario accede a la página de inicio de sesión.
2. **Ingreso de credenciales**:
   - El usuario ingresa su correo y contraseña.
   - Si las credenciales son inválidas (por ejemplo, campos vacíos o formato incorrecto), se muestra un mensaje de error.
3. **Validación de seguridad**:
   - Se verifica el uso de captcha o autenticación de dos factores si está habilitado.
   - Se aplican restricciones de intentos fallidos para prevenir ataques de fuerza bruta.
4. **Envío de credenciales**:
   - Si las credenciales son válidas, se envían al API de inicio de sesión.
   - Si el inicio de sesión es exitoso, se redirige al usuario a la página principal y se almacena el token de sesión.
   - Si ocurre un error en el servidor (por ejemplo, credenciales incorrectas), se muestra un mensaje de error.
5. **Fin**: El flujo termina con el usuario autenticado y redirigido a la página principal, o con un mensaje de error mostrado al usuario.

```mermaid
graph TD
    A[Inicio: Página de Inicio de Sesión] --> B[Usuario ingresa correo y contraseña]
    B -->|Credenciales con formato válido| C1[Verificar medidas de seguridad]
    B -->|Credenciales inválidas| D[Mostrar mensaje de error de formato]
    
    C1 -->|Captcha/2FA requerido| C2[Validar factores adicionales]
    C1 -->|Sin verificación adicional| C3[Enviar credenciales al API de Inicio de Sesión]
    C2 -->|Validación exitosa| C3
    C2 -->|Validación fallida| D2[Mostrar error de verificación]
    
    C3 -->|Éxito| E[Redirigir a la página principal y almacenar token]
    C3 -->|Error| F[Mostrar mensaje de error del servidor]
    C3 -->|Bloqueo por intentos| F2[Mostrar mensaje de bloqueo temporal]
    
    E --> G[Fin: Usuario autenticado y redirigido]
    F --> G
    F2 --> G
    D --> G
    D2 --> G
```

# Diagrama de Flujo de Transferencia

Este diagrama describe el flujo de transferencia de Usuario en el sistema. Representa las interacciones principales entre el usuario, la interfaz de usuario y las APIs involucradas en la gestión de operadores y la transferencia de documentos. A continuación, se detalla cada paso del flujo:

1. **Inicio**: La página `OperadoresPage` se renderiza y se ejecuta el `useEffect` para cargar los datos iniciales desde la API.
2. **Carga de datos iniciales**:
    - Se verifica el estado de autenticación del usuario antes de solicitar datos.
    - Si la carga es exitosa, se actualiza el estado con la lista de operadores obtenida.
    - Si ocurre un error, se muestra un mensaje de error al usuario.
3. **Interacción del usuario**:
    - El usuario puede buscar un operador ingresando un término de búsqueda, que se envía a la API para filtrar los resultados.
    - Los resultados se validan para mostrar solo operadores activos y autorizados.
    - Si la búsqueda es exitosa, se actualiza el estado con los resultados obtenidos.
    - Si ocurre un error durante la búsqueda, se muestra un mensaje de error.
4. **Selección y transferencia**:
    - El usuario selecciona un operador específico de la lista.
    - El sistema valida la elegibilidad del operador para recibir la transferencia.
    - El usuario selecciona los documentos que desea transferir.
    - Se muestra un resumen de la transferencia para confirmación.
5. **Proceso de transferencia**:
    - Se solicita confirmación al usuario antes de proceder.
    - Si se confirma, se prepara un payload con los datos necesarios y se envía a la API para iniciar la transferencia.
    - El sistema registra el intento de transferencia para auditoría.
    - Dependiendo del resultado de la API, se muestra un mensaje de éxito o error.
    - En caso de éxito, se notifica al operador receptor sobre la transferencia pendiente.

```mermaid
graph TD
    A[Inicio: Renderizar OperadoresPage] --> AA[Verificar autenticación del usuario]
    AA -->|No autenticado| AB[Redirigir a login]
    AA -->|Autenticado| B[Cargar datos iniciales con useEffect]
    
    B -->|Éxito| C[Actualizar estado con operadores]
    B -->|Error| D[Mostrar mensaje de error]
    B -->|Sin permisos| D2[Mostrar error de autorización]

    C --> E[Renderizar lista de operadores]
    E --> F[Usuario interactúa con la lista]
    
    F -->|Buscar operador| G[Enviar término de búsqueda a la API]
    G -->|Procesando| G2[Mostrar indicador de carga]
    G2 --> G3[Filtrar resultados por criterios]
    G3 -->|Éxito| H[Actualizar estado con resultados filtrados]
    G3 -->|Sin resultados| H2[Mostrar mensaje 'No hay resultados']
    G3 -->|Error| I[Mostrar mensaje de error]

    F -->|Seleccionar operador| J0[Verificar elegibilidad del operador]
    J0 -->|Elegible| J1[Seleccionar documentos a transferir]
    J0 -->|No elegible| J0E[Mostrar mensaje de inelegibilidad]
    
    J1 --> J2[Mostrar resumen de transferencia]
    J2 --> J[Confirmar transferencia]
    
    J -->|Confirmado| K[Preparar payload para API]
    J -->|Cancelado| K0[Volver a lista de operadores]
    
    K --> K1[Registrar intento de transferencia]
    K1 --> L[Llamar a initiateTransfer]
    
    L -->|Éxito| M[Mostrar mensaje de éxito]
    L -->|Error| N[Mostrar mensaje de error]
    
    M --> M1[Notificar al operador receptor]
    M1 --> O[Actualizar lista de documentos]
    N --> O
    
    O --> P[Fin del proceso]
```

