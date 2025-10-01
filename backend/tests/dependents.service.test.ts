import { DependentsService } from '../src/modules/dependents/service';
import { AuditLogger, DependentRepository, RelationshipTypeRepository, SystemRules } from '../src/modules/dependents/domain';

const baseNow = new Date('2024-01-01');

const makeRepo = (store: any[]): DependentRepository => ({
  async findById(id) { return store.find(d => d.id === id) || null; },
  async listActiveByEmployee(emp) { return store.filter(d => d.employee_id === emp && d.status === 'ACTIVE'); },
  async listInactiveByEmployee(emp) { return store.filter(d => d.employee_id === emp && d.status === 'INACTIVE'); },
  async create(data: any) { const d = { id: `d${store.length+1}`, dependent_seq: data.dependent_seq ?? store.length+1, created_at: baseNow, updated_at: baseNow, status: 'ACTIVE', ...data }; store.push(d); return d; },
  async update(id, data) { 
    const idx = store.findIndex(d => d.id === id); 
    const updated = { ...store[idx], ...data, updated_at: new Date() };
    // Si data.deleted_at es explícitamente null, establecerlo como null
    if ('deleted_at' in data && data.deleted_at === null) {
      updated.deleted_at = null;
    }
    store[idx] = updated;
    return store[idx]; 
  },
  async getMaxSeq(emp: string) { return store.filter(d=>d.employee_id===emp).reduce((m,d)=>Math.max(m, d.dependent_seq||0),0); },
});

const makeRelRepo = (exist = true): RelationshipTypeRepository => ({
  async exists() { return exist; },
});

const makeRules = (max = 10): SystemRules => ({
  async getMaxDependentsPerEmployee() { return max; },
});

const makeAudit = (events: any[]): AuditLogger => ({
  async log(evt) { events.push(evt); },
});

describe('DependentsService', () => {
  it('crea dependiente respetando maximo y relationship valido', async () => {
    const store: any[] = [];
    const events: any[] = [];
    const service = new DependentsService(makeRepo(store), makeRelRepo(true), makeRules(2), makeAudit(events));
    const created = await service.create({
      employee_id: 'e1', first_name: 'Ana', paternal_last_name: 'P', birth_date: baseNow, gender: 'F', relationship_type_id: 1, policy_start_date: baseNow,
    } as any, 'u1');
    expect(created.id).toBeDefined();
    expect(events[0].action).toBe('CREATE_DEPENDENT');
  });

  it('soft delete mueve a INACTIVE y audita', async () => {
    const store: any[] = [{ id: 'd1', employee_id: 'e1', first_name: 'Ana', paternal_last_name: 'P', birth_date: baseNow, gender: 'F', relationship_type_id: 1, policy_start_date: baseNow, status: 'ACTIVE', created_at: baseNow, updated_at: baseNow }];
    const events: any[] = [];
    const service = new DependentsService(makeRepo(store), makeRelRepo(true), makeRules(10), makeAudit(events));
    const removed = await service.softDelete('d1', 'u1');
    expect(removed.status).toBe('INACTIVE');
    expect(removed.policy_end_date).toBeTruthy();
    expect(events[0].action).toBe('DELETE_DEPENDENT');
  });

  it('restore revierte deleted_at y re-activa', async () => {
    const store: any[] = [{ id: 'd1', employee_id: 'e1', first_name: 'Ana', paternal_last_name: 'P', birth_date: baseNow, gender: 'F', relationship_type_id: 1, policy_start_date: baseNow, status: 'INACTIVE', deleted_at: baseNow, created_at: baseNow, updated_at: baseNow }];
    const events: any[] = [];
    const service = new DependentsService(makeRepo(store), makeRelRepo(true), makeRules(10), makeAudit(events));
    const restored = await service.restore('d1', 'u1');
    expect(restored.status).toBe('ACTIVE');
    expect(restored.deleted_at).toBeNull();
    expect(events[0].action).toBe('UPDATE_DEPENDENT');
  });
});


