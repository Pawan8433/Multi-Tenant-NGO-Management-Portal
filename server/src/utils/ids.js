import { v4 as uuidv4 } from 'uuid';

export const newTenantId = () => uuidv4();
export const newWorkspaceId = () => uuidv4();
export const newToken = () => uuidv4().replace(/-/g, '');

// Human-friendly sequential-ish codes (e.g. receipts, member codes).
export const code = (prefix) =>
  `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
