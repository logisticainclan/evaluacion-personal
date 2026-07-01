import { useEffect, useState } from 'react'

export function useFetch(service, initialData = []) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = async () => {
    setLoading(true)
    setError(null)

    const response = await service()

    if (response.error) {
      setError(response.error)
      setData(initialData)
    } else {
      setData(response.data || initialData)
    }

    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return {
    data,
    setData,
    loading,
    error,
    reload
  }
}