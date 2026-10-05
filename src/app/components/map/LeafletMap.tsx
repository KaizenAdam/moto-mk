"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { DARKEN_TILES, MK_CENTER, MK_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map/tiles";

export type Pin = { id: string; lat: number; lng: number; label: string };

// Leaflet's default marker loads PNGs by a path bundlers break, so draw
// pins in CSS instead (see .j5-pin in globals.css).
const icon = (active: boolean) =>
  L.divIcon({
    className: "",
    html: `<span class="j5-pin${active ? " j5-pin--active" : ""}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });

/** Frames the pins whenever the set changes; flies to the selected one. */
function Viewport({ pins, selectedId }: { pins: Pin[]; selectedId: string | null }) {
  const map = useMap();
  const key = pins.map((p) => p.id).join(",");

  useEffect(() => {
    if (pins.length === 0) map.setView(MK_CENTER, MK_ZOOM);
    else if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], 15);
    else map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 15 });
    // Only when the set of pins changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  useEffect(() => {
    const pin = pins.find((p) => p.id === selectedId);
    if (pin) map.flyTo([pin.lat, pin.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, map]);

  return null;
}

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/**
 * The one Leaflet map on the site. Browser-only — import it through
 * next/dynamic with { ssr: false } (Leaflet touches `window` on load).
 * With `onPick`, clicking the map or dragging a pin reports a position
 * (the admin's single-pin placer). With `onPinDrag`, every pin can be
 * dragged and reports which one moved (the admin's bulk review). Without
 * either, it's a read-only map of pins.
 */
export default function LeafletMap({
  pins,
  selectedId = null,
  onSelect,
  onPick,
  onPinDrag,
  className = "h-[420px]",
}: {
  pins: Pin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onPick?: (lat: number, lng: number) => void;
  onPinDrag?: (id: string, lat: number, lng: number) => void;
  className?: string;
}) {
  return (
    <MapContainer
      center={MK_CENTER}
      zoom={MK_ZOOM}
      scrollWheelZoom={false}
      className={`${className} w-full rounded-[10px] border border-line ${DARKEN_TILES ? "j5-dark-tiles" : ""}`}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <Viewport pins={pins} selectedId={selectedId} />
      {onPick && <ClickToPlace onPick={onPick} />}
      {pins.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icon(p.id === selectedId)}
          draggable={!!onPick || !!onPinDrag}
          eventHandlers={{
            click: () => onSelect?.(p.id),
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              if (onPinDrag) onPinDrag(p.id, lat, lng);
              else onPick?.(lat, lng);
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -20]}>
            {p.label}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
