import { InMemoryCheckInsRepository } from '../repositories/in-memory/in-memory-check-ins-repository.js'
import { expect, describe, it, vi, afterEach, beforeEach } from 'vitest'
import { CheckInUseCase } from './check-in.js'
import { InMemoryGymsRepository } from '../repositories/in-memory/in-memory-gyms-repository.js'
import { Decimal } from 'generated/prisma/runtime/library.js'
import { MaxDistanceError } from './errors/max-distance-error.js'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error.js'


let gymsRepository: InMemoryGymsRepository
let checkInsRepository: InMemoryCheckInsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    gymsRepository.create({
      id: 'gym-01',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-27.2092052),
      longitude: new Decimal(-49.6401091),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {

    await gymsRepository.create({
      id: 'gym-02-not-checkin',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-27.6172563),
      longitude: new Decimal(-48.6283952),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-02-not-checkin',
        userId: 'user-01',
        userLatitude: -27.6187563,
        userLongitude: -48.6286382,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError);
  })

  it('should be able to check in on close gym', async () => {

    await gymsRepository.create({
      id: 'gym-02-checkin',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-27.6240077),
      longitude: new Decimal(-48.6800893),
    })
    const { checkIn } = await sut.execute({
      gymId: 'gym-02-checkin',
      userId: 'user-01',
      userLatitude: -27.6235333,
      userLongitude: -48.680021,
    });
    expect(checkIn.id).toBeTruthy();
  })
})