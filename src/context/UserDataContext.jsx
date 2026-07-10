import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const UserDataContext = createContext(null)

export function useUserData() {
  const context = useContext(UserDataContext)
  if (!context) throw new Error('useUserData must be used within UserDataProvider')
  return context
}

export function UserDataProvider({ children }) {
  const [userData, setUserDataState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cardiUserHealthData') || '{}')
    } catch {
      return {}
    }
  })

  const [measurementHistory, setMeasurementHistoryState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cardiHistory') || '[]')
    } catch {
      return []
    }
  })

  const setUserData = useCallback((data) => {
    setUserDataState((prev) => {
      const merged = typeof data === 'function' ? data(prev) : { ...prev, ...data }
      localStorage.setItem('cardiUserHealthData', JSON.stringify(merged))
      return merged
    })
  }, [])

  const setMeasurementHistory = useCallback((history) => {
    setMeasurementHistoryState((prev) => {
      const updated = typeof history === 'function' ? history(prev) : history
      localStorage.setItem('cardiHistory', JSON.stringify(updated))
      return updated
    })
  }, [])

  const addMeasurement = useCallback(
    (entry) => {
      setMeasurementHistory((prev) => {
        const updated = [entry, ...prev]
        if (updated.length > 50) updated.length = 50
        return updated
      })
    },
    [setMeasurementHistory]
  )

  const value = useMemo(
    () => ({
      userData,
      setUserData,
      measurementHistory,
      setMeasurementHistory,
      addMeasurement,
    }),
    [userData, setUserData, measurementHistory, setMeasurementHistory, addMeasurement]
  )

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  )
}
