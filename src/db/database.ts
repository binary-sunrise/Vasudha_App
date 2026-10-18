import Dexie, { type Table } from 'dexie'

export interface Observation {
  id?: number
  speciesName: string
  scientificName: string
  speciesGroups?: string
  otherSpeciesGroup?: string
  identificationStatus?: 'Identified' | 'Unknown' | 'Needs verification'
  notes: string
  observationAt: string
  recordedAt: string
  latitude: number | null
  longitude: number | null
  photo?: Blob | null
  photos?: Blob[]
}

export class VasudhaDatabase extends Dexie {
  observations!: Table<Observation, number>

  constructor() {
    super('VasudhaDatabase')

    this.version(1).stores({
      observations: '++id, speciesName',
    })
  }
}

export const db = new VasudhaDatabase()