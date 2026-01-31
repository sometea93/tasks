# Resumen de Stack Tecnológico

**SvelteKit** — Framework frontend. Maneja la interfaz de usuario, routing, y la reactividad en tiempo real mientras el usuario escribe.

**Supabase** — Backend completo. Proporciona la base de datos PostgreSQL, autenticación de usuarios, APIs automáticas, y sincronización en tiempo real entre dispositivos.

**OpenAI API** — Procesamiento de lenguaje natural. Interpreta los comandos del usuario para extraer tareas, fechas, prioridades y recurrencia.

**Vercel** — Hosting y despliegue. Publica la aplicación web con deploys automáticos desde GitHub.

## Análisis de Requisitos Críticos

Los requisitos que más condicionan la arquitectura son:

**Sincronización tiempo real (RNF-005, RNF-006)**: Exige una solución con suscripciones nativas. Esto descarta arquitecturas REST puras y APIs convencionales.

**Clasificación mientras escribe (RF-011) + latencia ≤0.5s (RNF-001)**: Requiere frontend altamente reactivo y estrategia inteligente para llamadas al LLM (debouncing, posiblemente streaming).

**Integración LLM (RT-001)**: El procesamiento de lenguaje natural se delega a servicio externo, simplificando la arquitectura.

El modelo de datos es simple: tareas con prioridad, fecha, recurrencia y estado. Esto favorece soluciones ligeras sobre frameworks empresariales.

---

## Frontend

**Recomendación: SvelteKit**

Para tu énfasis en ligereza y simplicidad, SvelteKit es superior a Next.js. Svelte compila a JavaScript vanilla sin runtime de framework, produciendo bundles significativamente más pequeños y mejor rendimiento. La sintaxis es más intuitiva: la reactividad es automática con asignaciones simples (`count = count + 1` actualiza la UI), eliminando el boilerplate de `useState` y `useEffect`.

Para la clasificación en tiempo real mientras el usuario escribe, Svelte maneja esto de forma nativa y elegante. Un simple `$:` crea derivaciones reactivas sin configuración adicional.

La principal desventaja es que el soporte de herramientas IA es menor que React, aunque está mejorando rápidamente. Sin embargo, la sintaxis más simple de Svelte hace que el código generado por IA requiera menos correcciones.

Si prefieres maximizar la compatibilidad con vibe coding y acceso al mayor ecosistema de componentes, **Next.js con React** sigue siendo válido, pero añade complejidad que tu ERS no requiere.

---

## Backend y Base de Datos

**Recomendación: Supabase**

Supabase resuelve RNF-005 y RNF-006 de forma nativa con su sistema Realtime sobre PostgreSQL. Cuando un usuario modifica una tarea, todos los dispositivos suscritos reciben el cambio instantáneamente sin código adicional.

El modelo relacional es ideal para tu estructura de datos: tareas con campos tipados, consultas como "tareas de alta prioridad para esta semana" son triviales en SQL. Supabase genera APIs REST y cliente TypeScript automáticamente, eliminando la necesidad de escribir endpoints CRUD.

Para la integración LLM, las Edge Functions permiten crear un endpoint serverless que procesa el lenguaje natural. Alternativamente, puedes hacer las llamadas directamente desde el frontend con tu API key en variables de entorno (Supabase soporta Row Level Security para proteger datos).

**Firebase** sería más rápido de configurar inicialmente, pero su modelo NoSQL complica consultas relacionales y el pricing escala peor. **Convex** tiene excelente DX pero adopción industrial limitada todavía.

---

## Integración LLM

**Recomendación: OpenAI API con structured outputs**

Para interpretar comandos como "reunión con Pedro mañana a las 3, urgente", necesitas extraer: acción (crear tarea), título, fecha, prioridad. Los structured outputs de OpenAI garantizan respuestas en JSON válido con el schema exacto que definas, eliminando parsing manual y errores de formato.

Usa `gpt-4o-mini` para balance costo/calidad. La latencia típica es 200-400ms, compatible con RNF-001 si implementas debouncing de 300ms en el input.

**Claude API** es alternativa viable con calidad similar. **Modelos locales** (Ollama) eliminarían latencia de red pero añaden complejidad de deployment que contradice tu objetivo de simplicidad.

---

## Infraestructura

**Recomendación: Vercel + Supabase (ambos en free tier inicialmente)**

Vercel despliega SvelteKit con zero configuración: conectas el repo de GitHub y cada push despliega automáticamente. Supabase se gestiona completamente en su dashboard. No necesitas Docker, Kubernetes, ni configuración de servidores.

Esta combinación te da: hosting global con edge functions, base de datos PostgreSQL con backups automáticos, autenticación lista para usar, y tiempo real. Todo sin gestionar infraestructura.

---

## Stack Final

El stack completo sería: **SvelteKit + Supabase + OpenAI API + Vercel**. Cuatro servicios, mínima configuración, máxima productividad. Cumple tus tres prioridades: mantenibilidad (tecnologías maduras con convenciones claras), rapidez de implementación (puedes tener un MVP funcional en un fin de semana), y relevancia industrial (Supabase y Vercel tienen adopción creciente, Svelte está en auge aunque React domina).
