export type ActorType = 'user' | 'system';

export interface AuditActor {
  readonly type: ActorType;
  readonly id: string;
  readonly name: string;
}

export interface AuditEvent {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: string;
  readonly actor: AuditActor;
  readonly previousState?: string;
  readonly nextState?: string;
  readonly timestamp: string;
  readonly propertyId: string;
  readonly sourceModule: string;
  readonly reason?: string;
  readonly bookingVersion?: number;
  readonly operationId: string;
  readonly metadata?: Record<string, unknown>;
}
