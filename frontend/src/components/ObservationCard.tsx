import { useEffect, useState } from 'react'
const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const formatCoordinate = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') {
    return 'Not recorded'
  }
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) {
    return 'Not recorded'
  }
  return num.toFixed(5)
}

interface Observation {
  id?: number
  speciesName?: string
  scientificName?: string
  identificationStatus?: 'Identified' | 'Unknown' | 'Needs verification'
  notes?: string
  observationAt?: string
  recordedAt?: string
  latitude?: number | null
  longitude?: number | null
  photo?: Blob | null
  photos?: Blob[]
}

interface ObservationCardProps {
  observation: Observation
}

function ObservationCard({ observation }: ObservationCardProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  useEffect(() => {
    const blobs: Blob[] = []
    if (Array.isArray(observation.photos) && observation.photos.length > 0) {
      for (const p of observation.photos) {
        if (p instanceof Blob) blobs.push(p)
      }
    } else if (observation.photo instanceof Blob) {
      blobs.push(observation.photo)
    }

    if (blobs.length === 0) {
      setPhotoUrls([])
      return
    }

    const urls = blobs.map((blob) => URL.createObjectURL(blob))
    setPhotoUrls(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [observation.photos, observation.photo])

  return (
    <div className="rounded-lg border p-4">
      {observation.identificationStatus && (
        <div className="mb-2">
          {observation.identificationStatus === 'Identified' && (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Identified
            </span>
          )}
          {observation.identificationStatus === 'Unknown' && (
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              Unknown
            </span>
          )}
          {observation.identificationStatus === 'Needs verification' && (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Needs verification
            </span>
          )}
        </div>
      )}

      {observation.identificationStatus === 'Unknown' ? (
        <p>
          <strong>Species:</strong> Unknown species
        </p>
      ) : observation.speciesName?.trim() ? (
        <p>
          <strong>Species:</strong> {observation.speciesName}
        </p>
      ) : null}


      {observation.scientificName?.trim() && (
        <p className="text-sm text-gray-600">
          <strong>Scientific Name:</strong>{' '}
          <span className="italic">{observation.scientificName}</span>
        </p>
      )}


      {observation.notes?.trim() && (
        <p>
          <strong>Notes:</strong> {observation.notes}
        </p>
      )}


      <p>
        <strong>Observed:</strong> {formatDateTime(observation.observationAt)}
      </p>

      <p>
        <strong>Recorded:</strong> {formatDateTime(observation.recordedAt)}
      </p>

      <p>
        <strong>Latitude:</strong> {formatCoordinate(observation.latitude)}
      </p>

      <p>
        <strong>Longitude:</strong> {formatCoordinate(observation.longitude)}
      </p>

      {photoUrls.length > 0 && (
        <div className="mt-4">
          {photoUrls.length === 1 ? (
            <img
              src={photoUrls[0]}
              alt="Observation"
              className="w-full rounded-lg object-cover"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photoUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Observation ${idx + 1}`}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ObservationCard