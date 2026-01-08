# Jumanji Theater Kirchbünt - Reservierungssystem

Eine Frontpage mit Reservierungsfunktion für das Jumanji Theater Kirchbünt.

## Installation

1. Node.js installieren (falls noch nicht vorhanden)
2. Dependencies installieren:
```bash
npm install
```

## Server starten

```bash
npm start
```

Der Server läuft dann unter `http://localhost:3000`

## Features

✅ Schöne Frontpage mit Theater-Design  
✅ Reservierungsformular mit:
  - Tag-Auswahl (Dienstag, Mittwoch, Donnerstag, Freitag)
  - Personenanzahl (1-20)
  - E-Mail-Eingabe
✅ Zähler für verfügbare Plätze (max. 200)  
✅ Reservierungen werden in `reservations.json` gespeichert  
✅ Status-Meldungen  
✅ Responsive Design (Mobile & Desktop)  
✅ Express API Backend  

## API Endpoints

### GET /api/reservations/status
Gibt den aktuellen Status der Reservierungen zurück.

**Response:**
```json
{
  "totalPersons": 45,
  "count": 10
}
```

### POST /api/reservations/add
Fügt eine neue Reservierung hinzu.

**Request Body:**
```json
{
  "day": "Mittwoch",
  "personCount": 3,
  "email": "user@example.com"
}
```

**Response (Erfolg):**
```json
{
  "success": true,
  "message": "Reservierung erfolgreich erstellt",
  "totalPersons": 48,
  "reservation": {
    "id": 1234567890,
    "day": "Mittwoch",
    "personCount": 3,
    "email": "user@example.com",
    "timestamp": "2026-01-08T12:30:45.000Z"
  }
}
```

**Response (Fehler - Max. Limit erreicht):**
```json
{
  "success": false,
  "message": "Maximale Anzahl von 200 Reservierungen erreicht"
}
```

### GET /api/reservations/count (deprecated)
Gibt die Reservierungsanzahl zurück (unterstützt für Kompatibilität).

### GET /api/reservations/all
Gibt alle Reservierungen zurück (für Admin-Zwecke).

## Reservierungen-Dateiformat

Die Reservierungen werden in `reservations.json` gespeichert:

```json
{
  "reservations": [
    {
      "id": 1234567890,
      "day": "Mittwoch",
      "personCount": 3,
      "email": "user@example.com",
      "timestamp": "2026-01-08T12:30:45.000Z"
    }
  ],
  "totalPersons": 3
}
```

## Entwicklung

Zum Entwickeln mit Auto-Reload:
```bash
npm run dev
```

## Limits

- Maximale Personen pro Reservierung: 20
- Maximale Personen **pro Tag**: 200
- Verfügbare Tage: Dienstag, Mittwoch, Donnerstag, Freitag
  - Jeder Tag hat sein eigenes Limit von 200 Plätzen
