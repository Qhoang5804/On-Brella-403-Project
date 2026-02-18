/**
 * Rental and session state. Open/closed: add new state/actions without breaking existing consumers.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api/client";
import { config } from "../config";

const RentalContext = createContext(null);

function loadStoredRental() {
  try {
    const raw = sessionStorage.getItem(config.rentalStorageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveRental(rental) {
  try {
    if (rental) {
      sessionStorage.setItem(config.rentalStorageKey, JSON.stringify(rental));
    } else {
      sessionStorage.removeItem(config.rentalStorageKey);
    }
  } catch (_) {}
}

function loadLastReturnSummary() {
  try {
    const raw = sessionStorage.getItem(config.lastReturnStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLastReturn(summary) {
  try {
    if (summary) {
      sessionStorage.setItem(config.lastReturnStorageKey, JSON.stringify(summary));
    } else {
      sessionStorage.removeItem(config.lastReturnStorageKey);
    }
  } catch (_) {}
}

export function RentalProvider({ children }) {
  const [activeRental, setActiveRental] = useState(() => loadStoredRental());
  const [lastReturnSummary, setLastReturnSummary] = useState(() => loadLastReturnSummary());

  const startRental = useCallback(async (stationId, slotNumber) => {
    const result = await api.startRental(stationId, slotNumber);
    const rental = {
      rentalId: result.rentalId,
      umbrellaId: result.umbrellaId,
      startTime: result.startTime,
      stationId,
      slotNumber,
    };
    setActiveRental(rental);
    saveRental(rental);
    return result;
  }, []);

  const endRental = useCallback(
    async (stationId, slotNumber) => {
      if (!activeRental) throw new Error("No active rental");
      const result = await api.endRental(
        activeRental.rentalId,
        stationId,
        slotNumber,
        activeRental.umbrellaId
      );
      const start = new Date(activeRental.startTime).getTime();
      const end = new Date(result.endTime).getTime();
      const durationMs = end - start;
      const summary = {
        rentalId: activeRental.rentalId,
        endTime: result.endTime,
        durationMs,
        pickUpStationId: activeRental.stationId,
        returnStationId: stationId,
      };
      setActiveRental(null);
      setLastReturnSummary(summary);
      saveRental(null);
      saveLastReturn(summary);
      return { ...result, summary };
    },
    [activeRental]
  );

  useEffect(() => {
    const stored = loadStoredRental();
    setActiveRental(stored);
  }, []);

  const value = useMemo(
    () => ({
      activeRental,
      lastReturnSummary,
      clearLastReturnSummary: () => {
        setLastReturnSummary(null);
        saveLastReturn(null);
      },
      startRental,
      endRental,
    }),
    [activeRental, lastReturnSummary, startRental, endRental]
  );

  return <RentalContext.Provider value={value}>{children}</RentalContext.Provider>;
}

export function useRental() {
  const ctx = useContext(RentalContext);
  if (!ctx) throw new Error("useRental must be used within RentalProvider");
  return ctx;
}
