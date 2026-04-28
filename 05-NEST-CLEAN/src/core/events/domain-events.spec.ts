import { type DomainEvent } from '../events/domain-event.js'
import { UniqueEntityID } from '../entities/unique-entity-id.js'
import { AggregateRoot } from '../entities/aggregate-root.js'
import { DomainEvents } from '@/core/events/domain-events.js'
import { vi } from 'vitest'

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date
  private aggregate: CustomAggregate

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate
    this.ocurredAt = new Date()
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))

    return aggregate
  }
}

describe('domain events', () => {
    it('should be abble to dispatch and listen to events', () => {
        const callbackSpy = vi.fn()
        DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

        const aggregate = CustomAggregate.create()

        expect(aggregate.domainEvents).toHaveLength(1)

        DomainEvents.dispatchEventsForAggregate(aggregate.id)

        expect(callbackSpy).toHaveBeenCalled()
        expect(aggregate.domainEvents).toHaveLength(0)

    })
});