import { mapDomainActionToAuditAction, diffObjects } from '../src/modules/audit/logger';

describe('mapDomainActionToAuditAction', () => {
  it('mapea CREATE_* a CREATE', () => {
    expect(mapDomainActionToAuditAction('CREATE_DEPENDENT')).toBe('CREATE');
    expect(mapDomainActionToAuditAction('CREATE_EMPLOYEE')).toBe('CREATE');
  });

  it('mapea DELETE_* a DELETE', () => {
    expect(mapDomainActionToAuditAction('DELETE_DEPENDENT')).toBe('DELETE');
    expect(mapDomainActionToAuditAction('DELETE_EMPLOYEE')).toBe('DELETE');
  });

  it('por defecto mapea a UPDATE', () => {
    expect(mapDomainActionToAuditAction('UPDATE_DEPENDENT')).toBe('UPDATE');
    expect(mapDomainActionToAuditAction('UPDATE_EMPLOYEE')).toBe('UPDATE');
    expect(mapDomainActionToAuditAction('ALGUNA_OTRA_ACCION')).toBe('UPDATE');
  });

  it('diffObjects detecta cambios por campo', () => {
    const before = { a: 1, b: 'x', c: { d: 2 } };
    const after = { a: 1, b: 'y', c: { d: 3 }, e: 5 };
    const changes = diffObjects(before, after);
    const fields = changes.map(c => c.field).sort();
    expect(fields).toEqual(['b', 'c', 'e']);
  });
});


