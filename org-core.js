/* ORG Core — ORG OS 1.1
 * Shared browser-side services. This layer intentionally does not replace
 * existing desktop behavior until each service is migrated and tested.
 */
(function (global) {
  "use strict";
  if (global.ORGCore) return;

  const VERSION = "1.1.0";
  const listeners = new Map();
  const services = new Map();
  const errors = [];
  const migrations = new Map();
  const installedMigrations = new Set();
  let eventSequence = 0;

  function emit(type, detail) {
    const event = Object.freeze({
      type: String(type),
      detail: detail === undefined ? null : detail,
      sequence: ++eventSequence,
      timestamp: Date.now()
    });
    (listeners.get(event.type) || []).slice().forEach(function (handler) {
      try { handler(event); } catch (error) { reportError(error, "event:" + event.type); }
    });
    (listeners.get("*") || []).slice().forEach(function (handler) {
      try { handler(event); } catch (error) { reportError(error, "event:*"); }
    });
    return event;
  }

  function on(type, handler) {
    if (typeof handler !== "function") throw new TypeError("ORGCore.on expects a function");
    const key = String(type);
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(handler);
    return function unsubscribe() {
      const group = listeners.get(key);
      if (!group) return;
      const index = group.indexOf(handler);
      if (index >= 0) group.splice(index, 1);
      if (!group.length) listeners.delete(key);
    };
  }

  function registerService(name, service, metadata) {
    const key = String(name).trim();
    if (!key || !service) throw new TypeError("A service name and service object are required");
    if (services.has(key)) throw new Error("ORG Core service already registered: " + key);
    services.set(key, Object.freeze({
      name: key,
      service: service,
      version: metadata && metadata.version ? String(metadata.version) : "1.0.0",
      description: metadata && metadata.description ? String(metadata.description) : ""
    }));
    emit("core:service-registered", { name: key });
    return service;
  }

  function getService(name) {
    const entry = services.get(String(name));
    return entry ? entry.service : null;
  }

  function reportError(error, source) {
    const item = Object.freeze({
      message: error && error.message ? String(error.message) : String(error),
      source: source ? String(source) : "unknown",
      timestamp: Date.now()
    });
    errors.push(item);
    if (errors.length > 100) errors.shift();
    emit("core:error", item);
    return item;
  }

  function registerMigration(id, migration) {
    const key = String(id);
    if (!key || typeof migration !== "function") throw new TypeError("Migration requires an id and function");
    if (migrations.has(key)) throw new Error("Migration already registered: " + key);
    migrations.set(key, migration);
  }

  async function runMigration(id, context) {
    const key = String(id);
    if (installedMigrations.has(key)) return { id: key, status: "already-run" };
    const migration = migrations.get(key);
    if (!migration) throw new Error("Unknown ORG Core migration: " + key);
    emit("core:migration-start", { id: key });
    try {
      await migration(context || {});
      installedMigrations.add(key);
      emit("core:migration-complete", { id: key });
      return { id: key, status: "complete" };
    } catch (error) {
      reportError(error, "migration:" + key);
      emit("core:migration-failed", { id: key, message: error && error.message ? error.message : String(error) });
      throw error;
    }
  }

  const api = Object.freeze({
    version: VERSION,
    on: on,
    emit: emit,
    registerService: registerService,
    getService: getService,
    reportError: reportError,
    registerMigration: registerMigration,
    runMigration: runMigration,
    diagnostics: function () {
      return Object.freeze({
        version: VERSION,
        services: Array.from(services.values()).map(function (entry) {
          return { name: entry.name, version: entry.version, description: entry.description };
        }),
        registeredMigrations: Array.from(migrations.keys()),
        completedMigrations: Array.from(installedMigrations),
        recentErrors: errors.slice(-20)
      });
    }
  });

  Object.defineProperty(global, "ORGCore", {
    value: api,
    configurable: false,
    enumerable: true,
    writable: false
  });
  emit("core:ready", { version: VERSION });
})(window);
