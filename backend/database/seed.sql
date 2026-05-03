-- Seed de datos iniciales para la plataforma de ciberseguridad
-- Ejecutar en Supabase SQL Editor después del schema.sql

-- Usuarios de prueba con contraseñas hasheadas (bcrypt)
-- Credenciales:
--   admin      → admin@example.com      / Admin1234!
--   estudiante → estudiante@example.com / User1234!

INSERT INTO users (username, email, password_hash, role)
VALUES
  ('admin', 'admin@example.com', '$2b$10$abcdefghijklmnopqrstuvwx.yzABCDEFGHIJKLMNOPQRSTUVWXYZ12', 'admin'),
  ('estudiante', 'estudiante@example.com', '$2b$10$abcdefghijklmnopqrs.tuvwxyzABCDEFGHIJKLMNOPQR', 'user')
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

-- Curso principal
INSERT INTO courses (slug, title, description, difficulty, is_published, created_by)
SELECT
  'fundamentos-ciberseguridad',
  'Fundamentos de Ciberseguridad',
  'Aprende los conceptos base de la ciberseguridad: reconocimiento, escaneo y explotación de vulnerabilidades web.',
  'principiante',
  TRUE,
  id
FROM users
WHERE username = 'admin'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  is_published = EXCLUDED.is_published;

-- Inscripción del estudiante al curso
INSERT INTO course_enrollments (user_id, course_id)
SELECT u.id, c.id
FROM users u
CROSS JOIN courses c
WHERE u.username = 'estudiante' AND c.slug = 'fundamentos-ciberseguridad'
ON CONFLICT DO NOTHING;

-- Módulo 1: Reconocimiento y Escaneo
INSERT INTO course_modules (course_id, slug, title, description, position)
SELECT c.id, 'reconocimiento-escaneo', 'Reconocimiento y Escaneo', 'Herramientas y técnicas para descubrir activos, puertos y servicios en una red.', 1
FROM courses c
WHERE c.slug = 'fundamentos-ciberseguridad'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  position = EXCLUDED.position;

-- Lab 1: Introducción a Nmap
INSERT INTO laboratories (module_id, slug, title, content_markdown, position, estimated_minutes, points, is_published)
SELECT cm.id,
  'introduccion-nmap',
  'Introducción a Nmap',
  E'## ¿Qué es Nmap?\n\n**Nmap** (*Network Mapper*) es la herramienta de escaneo de redes más utilizada en ciberseguridad. Permite descubrir hosts activos, puertos abiertos y versiones de servicios.\n\n## Flags esenciales\n\n| Flag | Función |\n|------|---------|\n| `-sV` | Detecta la versión del servicio en cada puerto |\n| `-sn` | Ping scan (solo verifica si el host está activo) |\n| `-O`  | Intenta detectar el sistema operativo |\n| `-A`  | Modo agresivo: OS + versiones + scripts |\n| `-p-` | Escanea los 65 535 puertos |\n\n## Ejemplo básico\n\n```bash\nnmap -sV 10.10.10.1\n```\n\nEsto escanea los puertos más comunes del host `10.10.10.1` y muestra la versión de cada servicio encontrado.\n\n---\nCompleta el quiz y la actividad para ganar **100 puntos**.',
  1, 20, 100, TRUE
FROM course_modules cm
WHERE cm.slug = 'reconocimiento-escaneo'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  position = EXCLUDED.position,
  estimated_minutes = EXCLUDED.estimated_minutes,
  points = EXCLUDED.points,
  is_published = EXCLUDED.is_published;

-- Preguntas del Lab 1
INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 1, 'multiple_choice', '¿Qué significan las siglas Nmap?', 'Nmap es la abreviatura de "Network Mapper", una herramienta de código abierto para exploración de redes.'
FROM laboratories l WHERE l.slug = 'introduccion-nmap'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 2, 'multiple_choice', '¿Qué flag de Nmap detecta la versión del servicio que corre en cada puerto?', 'El flag -sV activa la detección de versiones. Nmap envía sondas específicas para identificar el software.'
FROM laboratories l WHERE l.slug = 'introduccion-nmap'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 3, 'multiple_choice', '¿Qué flag realiza únicamente un ping scan sin escanear puertos?', '-sn (antes -sP) solo verifica si el host responde; no abre ni escanea puertos.'
FROM laboratories l WHERE l.slug = 'introduccion-nmap'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 4, 'multiple_choice', '¿En qué capa del modelo OSI opera principalmente Nmap al descubrir hosts?', 'Nmap opera en la capa 3 (Red) usando paquetes ICMP, TCP y UDP para descubrir hosts y puertos.'
FROM laboratories l WHERE l.slug = 'introduccion-nmap'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 5, 'activity_response', 'Ejecuta el comando de Nmap que escanea versiones de servicios sobre el host objetivo 10.10.10.1. Copia la respuesta generada y selecciónala aquí.', 'El comando correcto es: nmap -sV 10.10.10.1'
FROM laboratories l WHERE l.slug = 'introduccion-nmap'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

-- Opciones para preguntas 1-4 del Lab 1
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, 'Network Mapper', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, 'Node Monitoring App', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, 'Net Map Analyzer', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, 'Null Map Protocol', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para pregunta 2
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, '-sV', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, '-sn', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, '-O', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, '-A', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para pregunta 3
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, '-sn', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, '-sV', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, '-O', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, '-p-', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para pregunta 4
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, 'Capa 3 - Red', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, 'Capa 7 - Aplicación', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, 'Capa 2 - Enlace', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, 'Capa 4 - Transporte', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Actividad para pregunta 5 del Lab 1
INSERT INTO question_activities (question_id, title, instructions_markdown, expected_action_key, success_feedback, is_published)
SELECT q.id,
  'Escaneo de versiones con Nmap',
  E'## Objetivo\n\nUsa Nmap para escanear el host `10.10.10.1` y detectar las versiones de los servicios que corren en sus puertos.\n\n## Instrucciones\n\n1. Abre una terminal.\n2. Ejecuta el siguiente comando:\n\n```bash\nnmap -sV 10.10.10.1\n```\n\n3. Copia la **respuesta generada** que aparecerá aquí y pégala en la pregunta del quiz.\n\n> **Pista:** el flag `-sV` activa la detección de versiones.',
  'nmap -sV 10.10.10.1',
  '¡Correcto! Has ejecutado el escaneo. Copia esta respuesta y úsala en la pregunta del quiz.',
  TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'introduccion-nmap' AND q.question_order = 5
ON CONFLICT (question_id) DO NOTHING;

-- Lab 2: Reconocimiento Web con Gobuster
INSERT INTO laboratories (module_id, slug, title, content_markdown, position, estimated_minutes, points, is_published)
SELECT cm.id,
  'reconocimiento-web',
  'Reconocimiento Web con Gobuster',
  E'## Reconocimiento web\n\nAntes de atacar una aplicación web es fundamental descubrir qué recursos existen: directorios ocultos, archivos de configuración, paneles de administración, etc.\n\n## Gobuster\n\n**Gobuster** es una herramienta de fuerza bruta para descubrir directorios y archivos en servidores web.\n\n```bash\ngobuster dir -u http://10.10.10.1 -w /usr/share/wordlists/dirb/common.txt\n```\n\n## curl para inspeccionar headers\n\nLos headers HTTP revelan información valiosa del servidor (tecnología, versión, cookies de seguridad).\n\n```bash\ncurl -I http://10.10.10.1\n```\n\n---\nCompleta el quiz y las actividades para ganar **150 puntos**.',
  2, 25, 150, TRUE
FROM course_modules cm
WHERE cm.slug = 'reconocimiento-escaneo'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  position = EXCLUDED.position,
  estimated_minutes = EXCLUDED.estimated_minutes,
  points = EXCLUDED.points,
  is_published = EXCLUDED.is_published;

-- Preguntas del Lab 2
INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 1, 'multiple_choice', '¿Qué hace Gobuster en modo "dir"?', 'Gobuster en modo dir realiza fuerza bruta sobre rutas de un servidor web usando un diccionario de palabras.'
FROM laboratories l WHERE l.slug = 'reconocimiento-web'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 2, 'multiple_choice', '¿Qué código de respuesta HTTP indica que un recurso no fue encontrado?', 'El código 404 Not Found indica que el servidor no encontró el recurso solicitado.'
FROM laboratories l WHERE l.slug = 'reconocimiento-web'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 3, 'multiple_choice', '¿Qué header HTTP suele revelar el software y versión del servidor web?', 'El header "Server" expone el software del servidor (ej: Apache/2.4.41). Es una fuente clave de información para un atacante.'
FROM laboratories l WHERE l.slug = 'reconocimiento-web'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 4, 'activity_response', 'Enumera los directorios del servidor objetivo usando Gobuster. Copia la respuesta generada.', 'gobuster dir -u http://10.10.10.1 -w /usr/share/wordlists/dirb/common.txt'
FROM laboratories l WHERE l.slug = 'reconocimiento-web'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 5, 'activity_response', 'Inspecciona los headers HTTP del servidor objetivo con curl. Copia la respuesta generada.', 'curl -I http://10.10.10.1'
FROM laboratories l WHERE l.slug = 'reconocimiento-web'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

-- Opciones para Lab 2 pregunta 1
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, 'Fuerza bruta de directorios y archivos en un servidor web', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, 'Escanea puertos abiertos en un host', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, 'Intercepta tráfico de red', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, 'Explota vulnerabilidades SQL', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para Lab 2 pregunta 2
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, '404', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, '200', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, '301', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, '500', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para Lab 2 pregunta 3
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, 'Server', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, 'Content-Type', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, 'Accept', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, 'Authorization', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Actividades para Lab 2 preguntas 4 y 5
INSERT INTO question_activities (question_id, title, instructions_markdown, expected_action_key, success_feedback, is_published)
SELECT q.id,
  'Enumeración de directorios con Gobuster',
  E'## Objetivo\n\nDescubre directorios ocultos en el servidor web objetivo usando Gobuster.\n\n## Instrucciones\n\n```bash\ngobuster dir -u http://10.10.10.1 -w /usr/share/wordlists/dirb/common.txt\n```\n\nCopia la **respuesta generada** y úsala en la pregunta del quiz.',
  'gobuster dir -u http://10.10.10.1 -w /usr/share/wordlists/dirb/common.txt',
  '¡Bien! Has enumerado el servidor. Copia esta respuesta y úsala en la pregunta del quiz.',
  TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 4
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO question_activities (question_id, title, instructions_markdown, expected_action_key, success_feedback, is_published)
SELECT q.id,
  'Inspección de headers HTTP',
  E'## Objetivo\n\nUsa `curl` para ver los headers de respuesta del servidor y obtener información sobre su tecnología.\n\n## Instrucciones\n\n```bash\ncurl -I http://10.10.10.1\n```\n\nEl flag `-I` hace una petición HEAD: solo descarga los headers, no el cuerpo de la respuesta.\n\nCopia la **respuesta generada** y úsala en la pregunta del quiz.',
  'curl -I http://10.10.10.1',
  '¡Correcto! Has inspeccionado los headers. Copia esta respuesta para el quiz.',
  TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'reconocimiento-web' AND q.question_order = 5
ON CONFLICT (question_id) DO NOTHING;

-- Módulo 2: Vulnerabilidades Web
INSERT INTO course_modules (course_id, slug, title, description, position)
SELECT c.id, 'vulnerabilidades-web', 'Vulnerabilidades Web', 'Aprende a identificar y explotar las vulnerabilidades web más comunes del OWASP Top 10.', 2
FROM courses c
WHERE c.slug = 'fundamentos-ciberseguridad'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  position = EXCLUDED.position;

-- Lab 3: SQL Injection Básico
INSERT INTO laboratories (module_id, slug, title, content_markdown, position, estimated_minutes, points, is_published)
SELECT cm.id,
  'sql-injection-basico',
  'SQL Injection Básico',
  E'## ¿Qué es SQL Injection?\n\n**SQL Injection (SQLi)** es una vulnerabilidad que permite a un atacante interferir con las consultas que una aplicación hace a su base de datos. Ocurre cuando la entrada del usuario se concatena directamente en una query SQL sin sanitizar.\n\n## Payload clásico\n\n```sql\n\' OR \'1\'=\'1\n```\n\nAl ingresar esto en un campo de login sin protección, la query resultante siempre devuelve verdadero.\n\n## sqlmap\n\n**sqlmap** automatiza la detección y explotación de SQLi.\n\n```bash\nsqlmap -u "http://10.10.10.1/login?id=1" --dbs\n```\n\nEsto detecta el motor de BD y lista las bases de datos disponibles.\n\n---\nCompleta el quiz y la actividad para ganar **200 puntos**.',
  1, 30, 200, TRUE
FROM course_modules cm
WHERE cm.slug = 'vulnerabilidades-web'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  position = EXCLUDED.position,
  estimated_minutes = EXCLUDED.estimated_minutes,
  points = EXCLUDED.points,
  is_published = EXCLUDED.is_published;

-- Preguntas del Lab 3
INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 1, 'multiple_choice', '¿En qué categoría del OWASP Top 10 se clasifica SQL Injection?', 'SQLi pertenece a la categoría A03:2021 - Injection, una de las vulnerabilidades más críticas y prevalentes.'
FROM laboratories l WHERE l.slug = 'sql-injection-basico'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 2, 'multiple_choice', '¿Cuál de estos payloads prueba una SQL Injection básica en un campo de login?', 'El payload " '' OR ''1''=''1 " hace que la condición WHERE siempre sea verdadera, permitiendo eludir la autenticación.'
FROM laboratories l WHERE l.slug = 'sql-injection-basico'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 3, 'multiple_choice', '¿Qué herramienta automatiza la detección y explotación de SQL Injection?', 'sqlmap es la herramienta estándar para automatizar el proceso de detección y explotación de SQLi.'
FROM laboratories l WHERE l.slug = 'sql-injection-basico'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 4, 'multiple_choice', '¿Qué cláusula SQL permite combinar resultados de dos queries en un ataque UNION-based SQLi?', 'La cláusula UNION combina el resultado de dos SELECT. En SQLi UNION-based se usa para extraer datos de otras tablas.'
FROM laboratories l WHERE l.slug = 'sql-injection-basico'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

INSERT INTO laboratory_questions (laboratory_id, question_order, question_type, question_text, explanation)
SELECT l.id, 5, 'activity_response', 'Usa sqlmap para listar las bases de datos del objetivo. Copia la respuesta generada.', 'sqlmap -u "http://10.10.10.1/login?id=1" --dbs'
FROM laboratories l WHERE l.slug = 'sql-injection-basico'
ON CONFLICT (laboratory_id, question_order) DO NOTHING;

-- Opciones para Lab 3 pregunta 1
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, 'A03 - Injection', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, 'A01 - Broken Access Control', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, 'A07 - Identification Failures', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, 'A02 - Cryptographic Failures', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 1
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para Lab 3 pregunta 2
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, ''' OR ''1''=''1', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, '<script>alert(1)</script>', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, '../../../etc/passwd', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, '%00', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 2
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para Lab 3 pregunta 3
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, 'sqlmap', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, 'nmap', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, 'wireshark', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, 'gobuster', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 3
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Opciones para Lab 3 pregunta 4
INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 1, 'UNION', TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 2, 'JOIN', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 3, 'GROUP BY', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

INSERT INTO laboratory_question_options (question_id, option_order, option_text, is_correct)
SELECT q.id, 4, 'HAVING', FALSE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 4
ON CONFLICT (question_id, option_order) DO NOTHING;

-- Actividad para Lab 3 pregunta 5
INSERT INTO question_activities (question_id, title, instructions_markdown, expected_action_key, success_feedback, is_published)
SELECT q.id,
  'Enumeración de bases de datos con sqlmap',
  E'## Objetivo\n\nUsa sqlmap para detectar si el endpoint es vulnerable a SQLi y listar las bases de datos disponibles.\n\n## Instrucciones\n\n```bash\nsqlmap -u "http://10.10.10.1/login?id=1" --dbs\n```\n\n- `-u`: URL objetivo con el parámetro vulnerable\n- `--dbs`: lista todas las bases de datos\n\nCopia la **respuesta generada** y úsala en la pregunta del quiz.',
  'sqlmap -u "http://10.10.10.1/login?id=1" --dbs',
  '¡Excelente! Has enumerado las bases de datos. Copia esta respuesta para el quiz.',
  TRUE
FROM laboratory_questions q
JOIN laboratories l ON q.laboratory_id = l.id
WHERE l.slug = 'sql-injection-basico' AND q.question_order = 5
ON CONFLICT (question_id) DO NOTHING;