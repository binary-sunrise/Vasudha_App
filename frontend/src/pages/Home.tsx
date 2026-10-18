import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { db } from '@/db/database'
import ObservationCard from '@/components/ObservationCard'

function Home() {
  const [started, setStarted] = useState(false)
  const [speciesName, setSpeciesName] = useState('')
  const [scientificName, setScientificName] = useState('')

  const [identificationStatus, setIdentificationStatus] = useState<
    '' | 'Identified' | 'Unknown' | 'Needs verification'
  >('')

  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const [photos, setPhotos] = useState<Blob[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [photoCapturedAt, setPhotoCapturedAt] = useState<string | null>(null)
  useEffect(() => {
    if (photos.length === 0) {
      setPhotoPreviews([])
      return
    }

    const urls = photos.map((p) => URL.createObjectURL(p))
    setPhotoPreviews(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photos])
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [observations, setObservations] = useState<{
    id?: number
    speciesName: string
    scientificName: string
    identificationStatus?: 'Identified' | 'Unknown' | 'Needs verification'
    notes: string
    observationAt: string
    recordedAt: string
    latitude: number | null
    longitude: number | null
    photo?: Blob | null
    photos?: Blob[]
  }[]>([])

  const [notes, setNotes] = useState('')


  useEffect(() => {
    const loadObservations = async () => {
      const savedObservations = await db.observations.toArray()

      setObservations([...savedObservations].reverse())
    }

    loadObservations()
  }, [])

  const getLocation = () => {
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })

        setLocationAccuracy(position.coords.accuracy)
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        alert(`Unable to get location: ${error.message}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }


  const resetForm = () => {
    setSpeciesName('')
    setScientificName('')
    setIdentificationStatus('')
    setNotes('')
    setLocation(null)
    setLocationAccuracy(null)
    setPhotos([])
    setPhotoCapturedAt(null)
    setIsGettingLocation(false)
    setIsSaving(false)
    setSaved(false)
  }

  const handleAddPhotos = (fileList: FileList | null) => {
    if (saved || !fileList || fileList.length === 0) return
    const newFiles = Array.from(fileList)
    setPhotos((prev) => [...prev, ...newFiles])
    if (!photoCapturedAt) {
      setPhotoCapturedAt(new Date().toISOString())
    }
  }

  const handleRemovePhoto = (indexToRemove: number) => {
    if (saved) return
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove)
      if (updated.length === 0) {
        setPhotoCapturedAt(null)
      }
      return updated
    })
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <section className="text-center">
        <h2 className="text-2xl font-bold">
          Welcome to Vasudha
        </h2>

        <p className="mt-2 text-gray-600">
          Biodiversity Field Data Collection
        </p>

        <Button
          className="mt-6 w-full"
          onClick={() => {
            setStarted(true)
            resetForm()
          }}
        >
          Start Observation
        </Button>
      </section>

      {started && (
        <section className="mt-8 rounded-xl border p-5">
          <h3 className="text-lg font-semibold">
            New Observation
          </h3>

          <div className="mt-5">
            <label
              htmlFor="speciesName"
              className="text-sm font-medium"
            >
              Species / Common Name
            </label>

            <input
              id="speciesName"
              type="text"
              value={speciesName}
              disabled={saved || identificationStatus === 'Unknown'}
              onChange={(event) => setSpeciesName(event.target.value)}
              placeholder="Example: Indian Peafowl"
              className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>


          <div>
            <label htmlFor="identificationStatus" className="mb-1 block text-sm font-medium">
              Identification Status
            </label>
            <select
              id="identificationStatus"
              value={identificationStatus}
              disabled={saved}


              onChange={(e) => {
                const status = e.target.value as
                  | ''
                  | 'Identified'
                  | 'Unknown'
                  | 'Needs verification'

                setIdentificationStatus(status)

                if (status === 'Unknown') {
                  setSpeciesName('')
                  setScientificName('')
                }
              }}

              className={`mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${!identificationStatus ? 'text-gray-500' : 'text-gray-900'
                }`}
            >
              <option value="" disabled>
                Select identification status...
              </option>
              <option value="Identified" className="text-gray-900">
                Identified
              </option>
              <option value="Unknown" className="text-gray-900">
                Unknown
              </option>
              <option value="Needs verification" className="text-gray-900">
                Needs verification
              </option>
            </select>
          </div>


          <div className="mt-5">
            <label
              htmlFor="scientificName"
              className="text-sm font-medium"
            >
              Scientific Name (optional)
            </label>

            <input
              id="scientificName"
              type="text"
              value={scientificName}
              disabled={saved || identificationStatus === 'Unknown'}
              onChange={(event) => setScientificName(event.target.value)}
              placeholder="e.g. Elephas maximus"
              className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="notes"
              className="text-sm font-medium" >
              Notes
            </label>

            <textarea
              id="notes"
              value={notes}
              disabled={saved}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any details about the observation..."
              rows={4}
              className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium">
              Location
            </label>

            <Button
              type="button"
              className="mt-2 w-full"
              disabled={saved || isGettingLocation}
              onClick={getLocation}
            >
              {isGettingLocation
                ? 'Acquiring GPS location...'
                : location
                  ? 'Update GPS Location'
                  : 'Get My Location'}
            </Button>

            {location && locationAccuracy !== null && (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                <p>
                  <strong>Coordinates:</strong> {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
                <p className="mt-1">
                  <strong>Accuracy:</strong> ±{Math.round(locationAccuracy)} metres
                </p>
              </div>
            )}
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Photographs
              </label>
              {photos.length > 0 && (
                <span className="text-xs text-gray-500">
                  {photos.length} {photos.length === 1 ? 'photo' : 'photos'} attached
                </span>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <label
                htmlFor={saved ? undefined : "camera-photo-input"}
                className={`flex items-center justify-center rounded-lg border border-dashed p-3 text-center text-sm font-medium ${
                  saved
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-60'
                    : 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                📷 Take Photo
              </label>

              <label
                htmlFor={saved ? undefined : "gallery-photo-input"}
                className={`flex items-center justify-center rounded-lg border border-dashed p-3 text-center text-sm font-medium ${
                  saved
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-60'
                    : 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                🖼️ Upload from Gallery
              </label>
            </div>

            <input
              id="camera-photo-input"
              type="file"
              accept="image/*"
              capture="environment"
              disabled={saved}
              className="hidden"
              onChange={(event) => {
                handleAddPhotos(event.target.files)
                event.target.value = ''
              }}
            />

            <input
              id="gallery-photo-input"
              type="file"
              accept="image/*"
              multiple
              disabled={saved}
              className="hidden"
              onChange={(event) => {
                handleAddPhotos(event.target.files)
                event.target.value = ''
              }}
            />

            {photoPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photoPreviews.map((url, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-lg border bg-gray-50">
                    <img
                      src={url}
                      alt={`Photo preview ${idx + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    {!saved && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700 active:scale-95"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            className="mt-6 w-full"
            disabled={saved || isSaving}
            onClick={async () => {
              if (saved || isSaving) return

              if (!identificationStatus) {
                alert('Please select an identification status.')
                return
              }


              if (
                identificationStatus !== 'Unknown' &&
                !speciesName.trim()
              ) {
                alert('Please enter a species or common name.')
                return
              }


              if (identificationStatus === 'Unknown' && photos.length === 0) {
                alert('Please add a photograph for an unknown species.')
                return
              }



              if (
                !location ||
                typeof location.latitude !== 'number' ||
                typeof location.longitude !== 'number' ||
                Number.isNaN(location.latitude) ||
                Number.isNaN(location.longitude) ||
                location.latitude < -90 ||
                location.latitude > 90 ||
                location.longitude < -180 ||
                location.longitude > 180
              ) {
                alert('Valid GPS coordinates are required. Please tap "Get My Location" before saving.')
                return
              }

              const recordedAt = new Date().toISOString()
              // observationAt uses the photo-selection time as a proxy when available, or recordedAt when no photo is attached.
              // Note: Selecting a photo records selection time, not verified camera capture time.
              const observationAt = photoCapturedAt ?? recordedAt

              const isValidTimestamp = (val: unknown): boolean =>
                typeof val === 'string' && !Number.isNaN(new Date(val).getTime())

              if (!isValidTimestamp(recordedAt) || !isValidTimestamp(observationAt)) {
                alert('Valid observation and recorded timestamps are required.')
                return
              }

              setIsSaving(true)

              try {
                const id = await db.observations.add({
                  speciesName,
                  scientificName,
                  identificationStatus,
                  notes,
                  observationAt,
                  recordedAt,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  photo: photos[0] ?? null,
                  photos,
                })

                setObservations((current) => [
                  {
                    id,
                    speciesName,
                    scientificName,
                    identificationStatus,
                    notes,
                    observationAt,
                    recordedAt,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    photo: photos[0] ?? null,
                    photos,
                  },
                  ...current,
                ])

                setSaved(true)
              } catch (error) {
                alert(`Failed to save observation: ${error instanceof Error ? error.message : 'Unknown error'}`)
              } finally {
                setIsSaving(false)
              }
            }}
          >
            {isSaving ? 'Saving observation...' : 'Save Observation'}
          </Button>

          {saved && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-800">
                ✓ Observation saved successfully!
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Form is locked to prevent accidental changes.
              </p>
              <Button
                type="button"
                className="mt-3 w-full"
                onClick={resetForm}
              >
                + New Observation
              </Button>
            </div>
          )}

        </section>
      )}

      <section className="mt-8 rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            My Observations
          </h3>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {observations.length} {observations.length === 1 ? 'observation' : 'observations'}
          </span>
        </div>

        {observations.length > 0 ? (
          <div className="mt-4 space-y-6">
            {observations.map((observation) => (
              <ObservationCard
                key={observation.id}
                observation={observation}
              />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            No observations recorded yet.
          </p>
        )}
      </section>
    </main>
  )
}

export default Home