import { pool, query, queryOne } from '../db/pool.js';
import { ApiError } from './ApiError.js';
import { audit } from './audit.js';

const clampInt = (v, def, min, max) => {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return def;
  return Math.min(Math.max(n, min), max);
};

/**
 * Builds a tenant-scoped repository for a table. Every query is forced to
 * include `tenant_id = ?` and only whitelisted columns are ever written, so a
 * caller cannot read/write across tenants or set arbitrary columns.
 */
export function createRepository(config) {
  const {
    table,
    columns = [],
    searchable = [],
    filterable = [],
    sortable = ['id', 'created_at'],
    defaultSort = 'created_at',
    defaultOrder = 'DESC',
  } = config;

  const pickColumns = (body) => {
    const out = {};
    for (const col of columns) {
      if (body[col] !== undefined) out[col] = body[col] === '' ? null : body[col];
    }
    return out;
  };

  async function list(tenantId, params = {}) {
    const where = ['tenant_id = ?'];
    const args = [tenantId];

    if (params.search && searchable.length) {
      const like = `%${params.search}%`;
      where.push('(' + searchable.map((c) => `${c} LIKE ?`).join(' OR ') + ')');
      searchable.forEach(() => args.push(like));
    }

    for (const field of filterable) {
      const val = params[field];
      if (val !== undefined && val !== '' && val !== 'all') {
        where.push(`${field} = ?`);
        args.push(val);
      }
    }

    const sortCol = sortable.includes(params.sort) ? params.sort : defaultSort;
    const order = String(params.order).toUpperCase() === 'ASC' ? 'ASC' : defaultOrder;
    const page = clampInt(params.page, 1, 1, 100000);
    const pageSize = clampInt(params.pageSize, 20, 1, 200);
    const offset = (page - 1) * pageSize;
    const whereSql = `WHERE ${where.join(' AND ')}`;

    const countRow = await queryOne(`SELECT COUNT(*) AS total FROM ${table} ${whereSql}`, args);
    const total = Number(countRow.total);

    // LIMIT/OFFSET are clamped integers (not user strings) so inlining is safe.
    const rows = await query(
      `SELECT * FROM ${table} ${whereSql} ORDER BY ${sortCol} ${order} LIMIT ${pageSize} OFFSET ${offset}`,
      args
    );

    return { data: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 };
  }

  async function getById(tenantId, id) {
    const row = await queryOne(`SELECT * FROM ${table} WHERE id = ? AND tenant_id = ?`, [id, tenantId]);
    if (!row) throw ApiError.notFound(`${table} record not found`);
    return row;
  }

  async function create(tenantId, body) {
    const data = pickColumns(body);
    const keys = Object.keys(data);
    if (!keys.length) throw ApiError.badRequest('No valid fields provided');
    const cols = ['tenant_id', ...keys];
    const placeholders = cols.map(() => '?').join(', ');
    const values = [tenantId, ...keys.map((k) => data[k])];
    const [result] = await pool.execute(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return getById(tenantId, result.insertId);
  }

  async function update(tenantId, id, body) {
    await getById(tenantId, id); // ensures row belongs to tenant
    const data = pickColumns(body);
    const keys = Object.keys(data);
    if (!keys.length) return getById(tenantId, id);
    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const values = [...keys.map((k) => data[k]), id, tenantId];
    await pool.execute(`UPDATE ${table} SET ${setSql} WHERE id = ? AND tenant_id = ?`, values);
    return getById(tenantId, id);
  }

  async function remove(tenantId, id) {
    await getById(tenantId, id);
    await pool.execute(`DELETE FROM ${table} WHERE id = ? AND tenant_id = ?`, [id, tenantId]);
    return { id: Number(id), deleted: true };
  }

  return { table, list, getById, create, update, remove };
}

/**
 * Turns a repository into Express handlers. Returns the five standard REST
 * handlers; mount them in a module router alongside any custom routes.
 */
export function crudHandlers(repo, { entity } = {}) {
  const entityName = entity || repo.table;
  return {
    list: async (req, res) => {
      const result = await repo.list(req.user.tenantId, req.query);
      res.json(result);
    },
    getOne: async (req, res) => {
      const row = await repo.getById(req.user.tenantId, req.params.id);
      res.json({ data: row });
    },
    create: async (req, res) => {
      const row = await repo.create(req.user.tenantId, req.body);
      await audit(req, { action: `${entityName}.created`, entity: entityName, entityId: row.id });
      res.status(201).json({ data: row });
    },
    update: async (req, res) => {
      const row = await repo.update(req.user.tenantId, req.params.id, req.body);
      await audit(req, { action: `${entityName}.updated`, entity: entityName, entityId: row.id });
      res.json({ data: row });
    },
    remove: async (req, res) => {
      const out = await repo.remove(req.user.tenantId, req.params.id);
      await audit(req, { action: `${entityName}.deleted`, entity: entityName, entityId: out.id });
      res.json({ data: out });
    },
  };
}
