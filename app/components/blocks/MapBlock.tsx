"use client";

import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import styles from "./MapBlock.module.css";
import { MapContent } from "@/app/lib/types";

interface MapBlockProps {
  data: MapContent;
}

export function MapBlock({ data }: MapBlockProps) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );

  // Geocode location to get coordinates
  useEffect(() => {
    if (!data.location) return;

    // Try to geocode the location
    const geocode = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            data.location
          )}&limit=1`,
          { headers: { "User-Agent": "BentoFolio/1.0" } }
        );
        const results = await response.json();
        if (results && results.length > 0) {
          setCoords({
            lat: parseFloat(results[0].lat),
            lon: parseFloat(results[0].lon),
          });
        }
      } catch (error) {
        console.error("Failed to geocode location:", error);
      }
    };

    geocode();
  }, [data.location]);

  // Empty state
  if (!data.location) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <MapPin size={14} />
          <span>Location</span>
        </div>
        <div className={styles.map}>
          <div className={styles.mapVisual}>
            <div className={styles.pin}>
              <div className={styles.pinDot} />
            </div>
          </div>
        </div>
        <span className={styles.emptyText}>Add your location...</span>
      </div>
    );
  }

  // Generate OpenStreetMap static map URL
  const getMapUrl = () => {
    if (coords) {
      // Using OpenStreetMap tiles
      return `https://www.openstreetmap.org/export/embed.html?bbox=${
        coords.lon - 0.05
      },${coords.lat - 0.03},${coords.lon + 0.05},${
        coords.lat + 0.03
      }&layer=mapnik&marker=${coords.lat},${coords.lon}`;
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <MapPin size={14} />
        <span>Location</span>
      </div>
      <div className={styles.map}>
        {coords ? (
          <iframe
            src={getMapUrl() || ""}
            className={styles.mapFrame}
            title={`Map of ${data.location}`}
            loading="lazy"
          />
        ) : (
          <div className={styles.mapVisual}>
            <div className={styles.pin}>
              <div className={styles.pinDot} />
            </div>
          </div>
        )}
      </div>
      <span className={styles.location}>{data.location}</span>
    </div>
  );
}
