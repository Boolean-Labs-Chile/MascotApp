const assert = require("node:assert/strict");
const { test } = require("node:test");
const { DatabaseSync } = require("node:sqlite");
const { readFileSync, mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const ts = require("typescript");

function cargar(nombre, externos = {}, cache = new Map()) {
  if (cache.has(nombre)) return cache.get(nombre);
  const codigo = ts.transpileModule(
    readFileSync(
      path.resolve(path.dirname(module.filename), "..", nombre + ".ts"),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const modulo = { exports: {} };
  new Function("require", "module", "exports", codigo)(
    (id) =>
      externos[id] ??
      (id.startsWith("@/")
        ? cargar(id.slice(2), externos, cache)
        : require(id)),
    modulo,
    modulo.exports,
  );
  cache.set(nombre, modulo.exports);
  return modulo.exports;
}
const { migrateDbIfNeeded } = cargar("db/schema");
const repo = cargar("db/mascotas");
const { crearServicioMascotas } = cargar("services/mascotas");
const datos = {
  nombre: "Luna",
  genero: "hembra",
  fecha_nacimiento: "2024-02-29",
  fecha_adopcion: "2024-04-01",
  color: "Blanca",
  raza: "Mestiza",
};
function adaptar(sqlite) {
  const parametros = (args) => (Array.isArray(args[0]) ? args[0] : args);
  return {
    async execAsync(sql) {
      sqlite.exec(sql);
    },
    async runAsync(sql, ...args) {
      const r = sqlite.prepare(sql).run(...parametros(args));
      return {
        changes: Number(r.changes),
        lastInsertRowId: Number(r.lastInsertRowid),
      };
    },
    async getFirstAsync(sql, ...args) {
      return sqlite.prepare(sql).get(...parametros(args)) ?? null;
    },
    async getAllAsync(sql, ...args) {
      return sqlite.prepare(sql).all(...parametros(args));
    },
    async withTransactionAsync(fn) {
      sqlite.exec("BEGIN");
      try {
        await fn();
        sqlite.exec("COMMIT");
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
async function preparar(t) {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  const db = adaptar(sqlite);
  await migrateDbIfNeeded(db);
  await db.runAsync("INSERT INTO usuario (nombre) VALUES ('Ana'), ('Luis')");
  const archivos = new Set();
  let secuencia = 0;
  const imagenes = {
    async guardar() {
      const uri = `file:///documents/mascotas/${++secuencia}.jpg`;
      archivos.add(uri);
      return uri;
    },
    async eliminar(uri) {
      archivos.delete(uri);
    },
  };
  return {
    db,
    archivos,
    imagenes,
    servicio: crearServicioMascotas(db, imagenes),
  };
}

test("CRUD conserva campos del formulario, comillas y separa usuarios", async (t) => {
  const { servicio } = await preparar(t);
  const nombre = " O'Malley'); DROP TABLE mascota; -- ";
  const id = await servicio.crear(1, { ...datos, nombre });
  const mascota = await servicio.obtener(1, id);
  assert.equal(mascota.nombre, nombre.trim());
  assert.equal(mascota.fecha_nacimiento, datos.fecha_nacimiento);
  assert.equal(mascota.fecha_adopcion, datos.fecha_adopcion);
  assert.equal(mascota.color, datos.color);
  assert.equal(mascota.raza, datos.raza);
  assert.equal((await servicio.listar(1)).length, 1);
  assert.deepEqual(await servicio.listar(2), []);
  assert.equal(await servicio.obtener(2, id), null);
  await servicio.actualizar(1, id, { ...mascota, nombre: "Sol", raza: "Otra" });
  assert.equal((await servicio.obtener(1, id)).raza, "Otra");
});

test("validación rechaza fechas imposibles, datos inválidos y usuarios inexistentes", async (t) => {
  const { servicio, archivos } = await preparar(t);
  for (const cambio of [
    { nombre: " " },
    { edad: -1 },
    { edad: 0.5 },
    { genero: "otro" },
    { estado_esterilizacion: 2 },
    { fecha_nacimiento: "2023-02-29" },
    { fecha_nacimiento: "29/02/2024" },
    { fecha_adopcion: "2020-01-01" },
  ]) {
    await assert.rejects(servicio.crear(1, { ...datos, ...cambio }));
  }
  await assert.rejects(servicio.crear(0, datos));
  await assert.rejects(
    servicio.crear(999, { ...datos, imagen_perfil: "file:///cache/a.jpg" }),
    /usuario no existe/,
  );
  assert.equal(archivos.size, 0);
  assert.deepEqual(await servicio.listar(1), []);
});

test("editar conserva, reemplaza y elimina la foto", async (t) => {
  const { servicio, archivos } = await preparar(t);
  const id = await servicio.crear(1, {
    ...datos,
    imagen_perfil: "file:///cache/a.jpg",
  });
  const anterior = await servicio.obtener(1, id);
  await servicio.actualizar(1, id, datos);
  assert.equal(
    (await servicio.obtener(1, id)).imagen_perfil,
    anterior.imagen_perfil,
  );
  await servicio.actualizar(1, id, {
    ...datos,
    imagen_perfil: "file:///cache/b.jpg",
  });
  assert.equal(archivos.has(anterior.imagen_perfil), false);
  assert.equal(archivos.size, 1);
  await servicio.actualizar(1, id, { ...datos, imagen_perfil: null });
  assert.equal((await servicio.obtener(1, id)).imagen_perfil, null);
  assert.equal(archivos.size, 0);
});

test("otro usuario no puede actualizar ni eliminar", async (t) => {
  const { servicio, db } = await preparar(t);
  const id = await servicio.crear(1, datos);
  await assert.rejects(servicio.actualizar(2, id, datos));
  await assert.rejects(servicio.eliminar(2, id));
  await assert.rejects(repo.actualizarMascota(db, 2, id, datos));
  await assert.rejects(repo.eliminarMascota(db, 2, id));
  assert.ok(await servicio.obtener(1, id));
});

test("UPDATE fallido conserva foto original y limpia copia nueva", async (t) => {
  const { servicio, db, archivos } = await preparar(t);
  const id = await servicio.crear(1, {
    ...datos,
    imagen_perfil: "file:///cache/a.jpg",
  });
  const anterior = await servicio.obtener(1, id);
  await db.execAsync(
    "CREATE TRIGGER impedir BEFORE UPDATE ON mascota BEGIN SELECT RAISE(ABORT, 'fallo simulado'); END;",
  );
  await assert.rejects(
    servicio.actualizar(1, id, {
      ...datos,
      imagen_perfil: "file:///cache/b.jpg",
    }),
    /fallo simulado/,
  );
  assert.deepEqual([...archivos], [anterior.imagen_perfil]);
  assert.equal(
    (await servicio.obtener(1, id)).imagen_perfil,
    anterior.imagen_perfil,
  );
});

test("fallo al guardar archivo no inserta datos y permite reintentar", async (t) => {
  const { servicio, imagenes } = await preparar(t);
  imagenes.guardar = async () => {
    throw new Error("sin espacio");
  };
  await assert.rejects(
    servicio.crear(1, { ...datos, imagen_perfil: "file:///cache/a.jpg" }),
    /sin espacio/,
  );
  assert.deepEqual(await servicio.listar(1), []);
  assert.ok(await servicio.crear(1, datos));
});

test("DELETE elimina foto y tratamientos propios, conservando los ajenos", async (t) => {
  const { servicio, db, archivos } = await preparar(t);
  const id = await servicio.crear(1, {
    ...datos,
    imagen_perfil: "file:///cache/a.jpg",
  });
  const otro = await servicio.crear(2, datos);
  for (const mascota of [id, otro])
    await db.runAsync(
      "INSERT INTO tratamiento (id_mascota, nombre_producto) VALUES (?, 'Producto')",
      mascota,
    );
  await servicio.eliminar(1, id);
  assert.equal(await servicio.obtener(1, id), null);
  assert.equal(archivos.size, 0);
  const tratamientos = await db.getAllAsync("SELECT * FROM tratamiento");
  assert.equal(tratamientos.length, 1);
  assert.equal(tratamientos[0].id_mascota, otro);
});

test("DELETE fallido conserva registro y foto", async (t) => {
  const { servicio, db, archivos } = await preparar(t);
  const id = await servicio.crear(1, {
    ...datos,
    imagen_perfil: "file:///cache/a.jpg",
  });
  await db.execAsync(
    "CREATE TRIGGER impedir BEFORE DELETE ON mascota BEGIN SELECT RAISE(ABORT, 'fallo simulado'); END;",
  );
  await assert.rejects(servicio.eliminar(1, id));
  assert.ok(await servicio.obtener(1, id));
  assert.equal(archivos.size, 1);
});

test("limpieza fallida devuelve advertencia sin fingir fallo de SQL", async (t) => {
  const { servicio, imagenes } = await preparar(t);
  const id = await servicio.crear(1, {
    ...datos,
    imagen_perfil: "file:///cache/a.jpg",
  });
  imagenes.eliminar = async () => {
    throw new Error("bloqueado");
  };
  assert.ok((await servicio.eliminar(1, id)).advertencia);
  assert.equal(await servicio.obtener(1, id), null);
});

test("actualizaciones concurrentes no dejan fotos sin uso", async (t) => {
  const { servicio, archivos } = await preparar(t);
  const id = await servicio.crear(1, datos);
  await Promise.all(
    ["a", "b"].map((foto) =>
      servicio.actualizar(1, id, {
        ...datos,
        imagen_perfil: `file:///cache/${foto}.jpg`,
      }),
    ),
  );
  assert.deepEqual(
    [...archivos],
    [(await servicio.obtener(1, id)).imagen_perfil],
  );
});

test("no borra foto compartida hasta eliminar su última referencia", async (t) => {
  const { servicio, db, archivos } = await preparar(t);
  const id = await servicio.crear(1, {
    ...datos,
    imagen_perfil: "file:///cache/a.jpg",
  });
  const foto = (await servicio.obtener(1, id)).imagen_perfil;
  const otro = await repo.crearMascota(db, 2, {
    ...datos,
    imagen_perfil: foto,
  });
  await servicio.eliminar(1, id);
  assert.equal(archivos.has(foto), true);
  await servicio.eliminar(2, otro);
  assert.equal(archivos.size, 0);
});

test("migrar v1 y reabrir v2 conserva registros y activa cascada", async () => {
  const directorio = mkdtempSync(path.join(tmpdir(), "mascotas-test-"));
  const archivo = path.join(directorio, "test.db");
  let sqlite;
  try {
    sqlite = new DatabaseSync(archivo);
    let db = adaptar(sqlite);
    const fuente = readFileSync(
      path.resolve(path.dirname(module.filename), "../db/schema.ts"),
      "utf8",
    );
    const ddl = fuente.match(
      /CREATE TABLE IF NOT EXISTS usuario[\s\S]*?CREATE TABLE IF NOT EXISTS tratamiento[\s\S]*?\);/,
    )[0];
    await db.execAsync(ddl + " PRAGMA user_version = 1;");
    await db.runAsync("INSERT INTO usuario (nombre) VALUES ('Ana')");
    await db.runAsync(
      "INSERT INTO mascota (id_usuario, nombre, genero, edad) VALUES (1, 'Luna', 'hembra', 2)",
    );
    await db.runAsync(
      "INSERT INTO tratamiento (id_mascota, nombre_producto) VALUES (1, 'Producto')",
    );
    await migrateDbIfNeeded(db);
    assert.equal(
      (await db.getFirstAsync("PRAGMA user_version")).user_version,
      2,
    );
    assert.equal((await repo.obtenerMascota(db, 1, 1)).nombre, "Luna");
    assert.equal((await repo.obtenerMascota(db, 1, 1)).fecha_nacimiento, null);
    sqlite.close();
    sqlite = new DatabaseSync(archivo, { enableForeignKeyConstraints: false });
    db = adaptar(sqlite);
    await migrateDbIfNeeded(db);
    assert.equal(
      (await db.getFirstAsync("PRAGMA foreign_keys")).foreign_keys,
      1,
    );
    await repo.eliminarMascota(db, 1, 1);
    assert.deepEqual(await db.getAllAsync("SELECT * FROM tratamiento"), []);
  } finally {
    sqlite?.close();
    const destino = path.resolve(directorio);
    assert.equal(path.dirname(destino), path.resolve(tmpdir()));
    assert.ok(path.basename(destino).startsWith("mascotas-test-"));
    rmSync(destino, { recursive: true, force: true });
  }
});

test("migración fallida revierte columnas y permite reintentar", async (t) => {
  const { db } = await preparar(t);
  for (const columna of ["fecha_nacimiento", "fecha_adopcion", "color", "raza"])
    await db.execAsync(`ALTER TABLE mascota DROP COLUMN ${columna}`);
  await db.execAsync("PRAGMA user_version = 1");
  const ejecutar = db.execAsync;
  db.execAsync = async (sql) => {
    if (sql.includes("ADD COLUMN")) {
      await ejecutar("ALTER TABLE mascota ADD COLUMN fecha_nacimiento TEXT");
      throw new Error("fallo de migración");
    }
    return ejecutar(sql);
  };
  await assert.rejects(migrateDbIfNeeded(db), /fallo de migración/);
  assert.equal((await db.getFirstAsync("PRAGMA user_version")).user_version, 1);
  assert.equal(
    (await db.getAllAsync("PRAGMA table_info(mascota)")).some(
      (c) => c.name === "fecha_nacimiento",
    ),
    false,
  );
  db.execAsync = ejecutar;
  await migrateDbIfNeeded(db);
  assert.equal((await db.getFirstAsync("PRAGMA user_version")).user_version, 2);
});

function prepararArchivos() {
  const archivos = new Map([
    ["file:///cache/original", new Uint8Array([255, 216, 255, 0])],
  ]);
  let falla = false;
  class Directory {
    constructor(...partes) {
      this.uri =
        partes
          .map((p) => (typeof p === "string" ? p : p.uri))
          .join("/")
          .replace(/\/+$/, "") + "/";
    }
    create() {}
  }
  class File {
    constructor(...partes) {
      this.uri = partes
        .map((p) => (typeof p === "string" ? p : p.uri.replace(/\/$/, "")))
        .join("/");
    }
    get exists() {
      return archivos.has(this.uri);
    }
    get size() {
      return archivos.get(this.uri)?.length ?? 0;
    }
    get parentDirectory() {
      return new Directory(this.uri.slice(0, this.uri.lastIndexOf("/")));
    }
    async bytes() {
      return archivos.get(this.uri);
    }
    delete() {
      archivos.delete(this.uri);
    }
    copy(destino) {
      assert.equal(destino.exists, false);
      archivos.set(destino.uri, archivos.get(this.uri));
      if (falla) throw new Error("copia incompleta");
    }
  }
  const externos = {
    "expo-file-system": {
      File,
      Directory,
      Paths: { document: "file:///document" },
    },
  };
  const cache = new Map();
  return {
    archivos,
    fallar: () => {
      falla = true;
    },
    validacion: cargar("utils/image_validacion", externos, cache),
    imagenes: cargar("services/imagenesMascota", externos, cache)
      .almacenamientoImagenes,
  };
}

test("firma reconoce JPEG, PNG y WebP, rechazando texto renombrado", async () => {
  const { validacion, archivos } = prepararArchivos();
  assert.equal(
    validacion.detectarFormato(new Uint8Array([255, 216, 255])),
    "jpg",
  );
  assert.equal(
    validacion.detectarFormato(
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    ),
    "png",
  );
  assert.equal(
    validacion.detectarFormato(
      new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]),
    ),
    "webp",
  );
  archivos.set("file:///cache/falso.jpg", new Uint8Array([65, 66, 67]));
  archivos.set("file:///cache/grande.jpg", new Uint8Array(5 * 1024 * 1024 + 1));
  archivos.set("file:///cache/vacio.jpg", new Uint8Array());
  for (const uri of [
    "https://example.com/a.jpg",
    "file:///cache/no.jpg",
    "file:///cache/falso.jpg",
    "file:///cache/grande.jpg",
    "file:///cache/vacio.jpg",
  ]) {
    assert.equal((await validacion.validarImagen(uri)).valido, false);
  }
});

test("copia persistente usa extensión detectada y nunca elimina originales", async () => {
  const { imagenes, archivos } = prepararArchivos();
  const uri = await imagenes.guardar("file:///cache/original");
  assert.match(uri, /^file:\/\/\/document\/mascotas\/.+\.jpg$/);
  assert.equal(archivos.has(uri), true);
  await imagenes.eliminar("file:///cache/original");
  assert.equal(archivos.has("file:///cache/original"), true);
  await imagenes.eliminar(uri);
  assert.equal(archivos.has(uri), false);
  await imagenes.eliminar(uri);
});

test("copia incompleta elimina solo destino parcial", async () => {
  const { imagenes, archivos, fallar } = prepararArchivos();
  fallar();
  await assert.rejects(
    imagenes.guardar("file:///cache/original"),
    /copia incompleta/,
  );
  assert.deepEqual([...archivos.keys()], ["file:///cache/original"]);
});

const { inicializarBaseDeDatos } = cargar("db/inicializar");
const { obtenerUsuarioLocal } = cargar("db/usuarioLocal");
const { crearServicioMascotasLocales } = cargar("services/mascotasLocales");
function adaptarLocal(sqlite) {
  const db = adaptar(sqlite);
  db.withExclusiveTransactionAsync = (fn) =>
    db.withTransactionAsync(() => fn(db));
  return db;
}

test("arranque crea un solo perfil local y CRUD no requiere ID de usuario", async (t) => {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  const db = adaptarLocal(sqlite);
  await inicializarBaseDeDatos(db);
  await inicializarBaseDeDatos(db);
  assert.equal((await db.getAllAsync("SELECT * FROM usuario")).length, 1);
  assert.equal((await obtenerUsuarioLocal(db)).nombre, "Mi perfil");
  const servicio = crearServicioMascotasLocales(db, {
    async guardar(uri) {
      return uri;
    },
    async eliminar() {},
  });
  const id = await servicio.crear(datos);
  assert.equal((await servicio.listar()).length, 1);
  assert.equal(
    (await servicio.obtener(id)).id_usuario,
    (await obtenerUsuarioLocal(db)).id_usuario,
  );
  await servicio.actualizar(id, { ...datos, nombre: "Sol" });
  assert.equal((await servicio.obtener(id)).nombre, "Sol");
  await servicio.eliminar(id);
  assert.deepEqual(await servicio.listar(), []);
  assert.equal((await db.getAllAsync("SELECT * FROM usuario")).length, 1);
});

test("perfil local reutiliza ID real y conserva otros usuarios y mascotas", async (t) => {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  const db = adaptarLocal(sqlite);
  await migrateDbIfNeeded(db);
  await db.runAsync(
    "INSERT INTO usuario (id_usuario, nombre) VALUES (8, 'Ana'), (20, 'Luis')",
  );
  const id = await repo.crearMascota(db, 8, datos);
  const ajena = await repo.crearMascota(db, 20, datos);
  await inicializarBaseDeDatos(db);
  assert.equal((await obtenerUsuarioLocal(db)).id_usuario, 8);
  assert.ok(await repo.obtenerMascota(db, 8, id));
  assert.ok(await repo.obtenerMascota(db, 20, ajena));
  assert.equal((await db.getAllAsync("SELECT * FROM usuario")).length, 2);
  await assert.rejects(db.runAsync("DELETE FROM usuario WHERE id_usuario = 8"));
});

test("perfil local permanece al reabrir y no depende del nombre", async () => {
  const directorio = mkdtempSync(path.join(tmpdir(), "mascotas-test-"));
  const archivo = path.join(directorio, "local.db");
  let sqlite;
  try {
    sqlite = new DatabaseSync(archivo);
    let db = adaptarLocal(sqlite);
    await inicializarBaseDeDatos(db);
    const usuario = await obtenerUsuarioLocal(db);
    const id = await repo.crearMascota(db, usuario.id_usuario, datos);
    await db.runAsync(
      "UPDATE usuario SET nombre = 'Mi casa' WHERE id_usuario = ?",
      usuario.id_usuario,
    );
    sqlite.close();
    sqlite = new DatabaseSync(archivo);
    db = adaptarLocal(sqlite);
    await inicializarBaseDeDatos(db);
    assert.equal(
      (await obtenerUsuarioLocal(db)).id_usuario,
      usuario.id_usuario,
    );
    assert.equal((await obtenerUsuarioLocal(db)).nombre, "Mi casa");
    assert.equal((await db.getAllAsync("SELECT * FROM usuario")).length, 1);
    assert.ok(await repo.obtenerMascota(db, usuario.id_usuario, id));
  } finally {
    sqlite?.close();
    const destino = path.resolve(directorio);
    assert.equal(path.dirname(destino), path.resolve(tmpdir()));
    assert.ok(path.basename(destino).startsWith("mascotas-test-"));
    rmSync(destino, { recursive: true, force: true });
  }
});

test("fallo al vincular perfil revierte usuario nuevo y permite reintentar", async (t) => {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  const db = adaptarLocal(sqlite);
  const ejecutar = db.runAsync;
  db.runAsync = async (sql, ...args) => {
    if (sql.includes("INSERT INTO perfil_local"))
      throw new Error("fallo de vínculo");
    return ejecutar(sql, ...args);
  };
  await assert.rejects(inicializarBaseDeDatos(db), /fallo de vínculo/);
  assert.deepEqual(await db.getAllAsync("SELECT * FROM usuario"), []);
  db.runAsync = ejecutar;
  await inicializarBaseDeDatos(db);
  assert.equal((await db.getAllAsync("SELECT * FROM usuario")).length, 1);
});
