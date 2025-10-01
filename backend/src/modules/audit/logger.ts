import { PrismaClient, AuditAction } from '@prisma/client';

type LogArgs = {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues: unknown;
  newValues: unknown;
  context?: { userRole?: 'EMPLOYEE' | 'HR_ADMIN' | 'SUPER_ADMIN'; actorEmail?: string; companyId?: string };
};

export function mapDomainActionToAuditAction(domainAction: string): AuditAction {
  if (domainAction.startsWith('CREATE_')) return 'CREATE';
  if (domainAction.startsWith('DELETE_')) return 'DELETE';
  return 'UPDATE';
}

export function diffObjects(before: any, after: any): Array<{ field: string; before: any; after: any }> {
  const changes: Array<{ field: string; before: any; after: any }> = [];
  if (!before || !after) return changes;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  keys.forEach((k) => {
    const b = (before as any)[k];
    const a = (after as any)[k];
    const same = (b instanceof Date && a instanceof Date) ? b.getTime() === a.getTime() : JSON.stringify(b) === JSON.stringify(a);
    if (!same) changes.push({ field: k, before: b, after: a });
  });
  return changes;
}

export function getPrismaAuditLogger(prisma: PrismaClient) {
  return {
    async log({ userId, action, entity, entityId, oldValues, newValues, context }: LogArgs): Promise<void> {
      try {
        const mapped: AuditAction = mapDomainActionToAuditAction(action);
        const changes = diffObjects(oldValues, newValues);
        await prisma.auditLog.create({
          data: {
            user_id: userId,
            user_role: (context?.userRole ?? 'EMPLOYEE') as any,
            action: mapped,
            table_name: entity,
            record_id: entityId,
            old_values: oldValues as any,
            new_values: { after: newValues as any, changes } as any,
            ip_address: '0.0.0.0',
            user_agent: context?.actorEmail ? `web (${context.actorEmail})` : 'web',
          },
        });
      } catch (e) {
        // no-op: auditoría no debe romper flujo
      }
    },
  };
}



