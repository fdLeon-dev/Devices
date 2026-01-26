# TGSIT - Reparación de BIOS (Tentativo)

Diplomado práctico sobre diagnóstico y reparación de BIOS y firmware de equipos.

---

## Introducción a BIOS y UEFI

**Duración estimada:** 25 minutos

**Objetivos:**

- Entender qué es el BIOS/UEFI
- Diferenciar BIOS clásico y UEFI

**Descripción (extracto del PDF):**


> ordenador,   es   el   encargado   de   verificar   que   todos   los   componentes   estén   funcionando   de   manera   correcta,   en   el   caso   de   que   hubiese   un   error,   el   chip   de   Bios   nos   avisará   mediante   un   código   de   pitidos   cual   es   el   error.   Su   función   luego   de   la   verificación   de   errores,   es   la   de   ubicar   el   sistema   operativo   y   cargarlo   en   la   memoria   RAM.     No   es   lo   mismo   que   driver,   Firmware   es   código   instalado   en   el   dispositivo,   el   driver   es   un   software   instalado   en   el   sistema   operativo     UEFI   (Unified   Extensible   Firmware   Interface)   Lo   mismo   que   Legacy   pero   mejorado   Mejoras   que   aporta   el   modo   UEFI:   -Interfaz   visual   

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=1-4

---

## Herramientas y seguridad

**Duración estimada:** 20 minutos

**Objetivos:**

- Conocer herramientas comunes
- Aplicar medidas de seguridad ESD

**Descripción (extracto del PDF):**


> permite   revertir   los   cambios   realizados   y   volver   a   un   estado   anterior   donde   el   sistema   funcionaba   correctamente.   Pero   cuidado,   NO   incluye   otros   contenidos,   como   cualquier   archivo   que   tengamos   almacenado   en   el   disco   duro.   Los   archivos,   fotos,   vídeos,   documentos,   etc.   deberán   guardarse   mediante   copias   de   seguridad   en   otros   elementos   como   pendrives   o   discos   duros   externos.     Como   crear   punto   de   restauración:       Inicio   -   Equipo   -   Click   derecho   Propiedades   -   Protección   del   sistema     (Si   no   está   activado   la   creación   de   puntos   de   restauración   de   manera   automática,   activarla   en   “configuración”)     Administrador   de   Equipos:   c

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=5-8

---

## Diagnóstico del arranque y códigos POST

**Duración estimada:** 30 minutos

**Objetivos:**

- Interpretar códigos POST
- Localizar fallos de arranque comunes

**Descripción (extracto del PDF):**


> Chip   de   Bios   (Post   -   CMOS)   BIOS   (Basic   Input/Output   System):     Es   un   chip   integrado   a   la   placa   madre   que   se   encarga   de   chequear   que   todos   los   dispositivos   estén   funcionando   de   manera   correcta.     Se   compone   de   2   partes:     POST   (Power   On   Self   Test):   Es   el   encargado   de   testear   que   todos   los   componentes   estén   en   condiciones   y   conectados   en   forma   adecuada,   al   igual   que   el   estado   de   la   Bios   misma.   Al   haber   algún   error   será   comunicado   por   una   señal   sonora   o   visual.   Algunas   de   sus   funciones   es:       -Mostrar   información   sobre   el   tipo   y   versión   del   Bios     -Frecuencia   de   trabajo   de   la   CPU     -Cuánta   mem

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=9-12

---

## CMOS, baterías y configuración

**Duración estimada:** 20 minutos

**Objetivos:**

- Detectar fallos de CMOS
- Restaurar configuraciones

**Descripción (extracto del PDF):**


> “Nombredelvalor”=-       Clase   7:     Gpedit.msc   “ Es   el   Editor   de   directivas   de   grupo   de   Windows,   desde   el   cual   se   puede   configurar   ajustes   y   configuraciones   a   los   usuarios,   las   configuraciones   que   se   apliquen   en   el   editor ,   se   aplicarán   para   TODOS   los   usuarios   sin   excepción   (incluido   el   Administrador)”     Crear   usuario,   desde   el   Administrador:   - Bloquear   barra   de   tareas:     -Configuración   de   usuario   -   Plantillas   Administrativas   -   Menú   Inicio   y   barra   de   tareas   -   Bloquear   la   barra   de   tareas   Desactivar   consola   CMD:   Configuración   de   usuario   -Plantillas   Administrativas   -Sistema   -Establecer   fondo   fijo:   Configuración   de   usuario   -

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=13-16

---

## Recuperación de BIOS: métodos software

**Duración estimada:** 35 minutos

**Objetivos:**

- Aplicar métodos de recuperación en software
- Crear medios de recuperación

**Descripción (extracto del PDF):**


> El   Regedit   lo   que   nos   permite   es   interactuar   con   esos   archivos,   ya   que   no   se   puede   interactuar   directamente   con   ellos   de   manera   cotidiana,   funciona   como   un   intérprete   entre   el   usuario   y   los   archivos.     Las   siguientes   herramientas   permiten   bloquear   o   controlar   el   uso   de   software   usuario   por   usuario,   no   a   nivel   de   grupo   como   en   gpedit.msc   o   a   nivel   general   como   en   directivas.   (mostrar   las   directivas)     HKEY_CURRENT_USER/Software/Microsoft/Windows/CurrentVersion/Policies/Explorer     -   Restrictrun:   Es   una   clave   que   va   a   denegar   el   acceso   a   todos   los   programas,   excepto   aquellos   que   dejo   como   permitidos   *CUIDADO*   En   el   

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=17-24

---

## Recuperación de BIOS: métodos hardware

**Duración estimada:** 40 minutos

**Objetivos:**

- Conectar y usar programadores SPI
- Realizar flash seguro de firmware

**Descripción (extracto del PDF):**


> Chip   de   Bios   (Post   -   CMOS)   BIOS   (Basic   Input/Output   System):     Es   un   chip   integrado   a   la   placa   madre   que   se   encarga   de   chequear   que   todos   los   dispositivos   estén   funcionando   de   manera   correcta.     Se   compone   de   2   partes:     POST   (Power   On   Self   Test):   Es   el   encargado   de   testear   que   todos   los   componentes   estén   en   condiciones   y   conectados   en   forma   adecuada,   al   igual   que   el   estado   de   la   Bios   misma.   Al   haber   algún   error   será   comunicado   por   una   señal   sonora   o   visual.   Algunas   de   sus   funciones   es:       -Mostrar   información   sobre   el   tipo   y   versión   del   Bios     -Frecuencia   de   trabajo   de   la   CPU     -Cuánta   mem

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=25-34

---

## Firmware malicioso y mitigaciones

**Duración estimada:** 25 minutos

**Objetivos:**

- Identificar señales de firmware comprometido
- Aplicar mitigaciones básicas

**Descripción (extracto del PDF):**


> ordenador,   es   el   encargado   de   verificar   que   todos   los   componentes   estén   funcionando   de   manera   correcta,   en   el   caso   de   que   hubiese   un   error,   el   chip   de   Bios   nos   avisará   mediante   un   código   de   pitidos   cual   es   el   error.   Su   función   luego   de   la   verificación   de   errores,   es   la   de   ubicar   el   sistema   operativo   y   cargarlo   en   la   memoria   RAM.     No   es   lo   mismo   que   driver,   Firmware   es   código   instalado   en   el   dispositivo,   el   driver   es   un   software   instalado   en   el   sistema   operativo     UEFI   (Unified   Extensible   Firmware   Interface)   Lo   mismo   que   Legacy   pero   mejorado   Mejoras   que   aporta   el   modo   UEFI:   -Interfaz   visual   

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=35-38

---

## Laboratorio práctico: casos reales

**Duración estimada:** 90 minutos

**Objetivos:**

- Aplicar todas las técnicas aprendidas
- Resolver casos reales de reparación

**Descripción (extracto del PDF):**


> Imagen   del   sistema:   Una   imagen   del   sistema   es   un   proceso   en   el   cual   creamos   una   copia   de   TODO,   en   un   solo   archivo   o   fichero,   y   puede   servirnos   para   devolver   el   estado   de   un   ordenador   a   un   momento   concreto   del   pasado.   Clonación:   La   clonación   de   una   unidad   de   disco   duro   hace   una   copia   exacta   de   todo   el   contenido   de   una   unidad   de   disco   duro   a   otra   unidad   de   igual   o   mayor   capacidad.     “Clonar   es   hacer   una   copia   exacta   directamente   en   otro   disco,   con   lo   que   al   hacerla   borraras   todo   lo   del   disco   de   destino;   hacer   una   imagen   del   sistema   es   hacer   esa   misma   copia   pero   guardandola   en   un   fi

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf#page=39-60

---

## Proyecto final y evaluación

**Duración estimada:** 120 minutos

**Objetivos:**

- Planificar la reparación
- Documentar y presentar la solución

**Descripción (extracto del PDF):**


> Programa:   Conjunto   de   instrucciones   que   tiene   una   finalidad   y   está   escrito   en   un   lenguaje   de   programación   (nombrar   algunos   por   si   les   interesa   a   futuro)     Clase   2:   Unidades   de   medida:      bit   -   BInary   ditigT   -   Es   la   unidad   mínima   de   información   que   puede   contener   2   valores.   byte   -   proviene   de   “bite”   -   cuantos   datos   puede   “morder”   el   equipo   por   seg.   Almacenamiento:     bit   (b)   →   (0,   1)   →   “código   binario”   Byte   (B)→   8   bits   KiloByte   (kB)   →   1024   Byte   MegaByte   (MB)   →   1024   KiloByte   GigaByte   (GB)   →   1024   MegaByte   TeraByte   (TB)   →   1024   GigaByte   Peta   (PB)   →   1024   TeraByte   Exa   (EB)   →   1024   PetaByte   Zetta   

**Recursos:**
- /public/Reparacion Bios Tentativo.pdf

---
