import { useEffect, useState } from 'react'
const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

interface Observation {
  id?: number
  speciesName: string
  scientificName: string
  notes: string
  observationAt: string
  recordedAt: string
  latitude: number | null
  longitude: number | null
  photo: Blob | null
}

interface ObservationCardProps {
  observation: Observation
}

function ObservationCard({ observation }: ObservationCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!(observation.photo instanceof Blob)) {
      setPhotoUrl(null)
      return
    }

    const url = URL.createObjectURL(observation.photo)
    setPhotoUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [observation.photo])

  return (
    <div className="rounded-lg border p-4">
      <p>
        <strong>Species:</strong> {observation.speciesName}
      </p>
      {observation.scientificName && (
        <p className="text-sm text-gray-600">
          <strong>Scientific Name:</strong>{' '}
          <span className="italic">{observation.scientificName}</span>
        </p>
      )}

      <p>
        <strong>Notes:</strong> {observation.notes}
      </p>

      <p>
        <strong>Observed:</strong> {formatDateTime(observation.observationAt)}
      </p>

      <p>
        <strong>Recorded:</strong> {formatDateTime(observation.recordedAt)}
      </p>

      <p>
        <strong>Latitude:</strong> {observation.latitude}
      </p>

      <p>
        <strong>Longitude:</strong> {observation.longitude}
      </p>

      {photoUrl && (
        <img
          src={photoUrl}
          alt="Observation"
          className="mt-4 w-full rounded-lg"
        />
      )}
    </div>
  )
}

export default ObservationCard