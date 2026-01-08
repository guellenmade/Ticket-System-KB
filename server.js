const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const RESERVATIONS_FILE = path.join(__dirname, 'reservations.json');
const MAX_PERSONS_PER_DAY = 200;
const VALID_DAYS = ['Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Reservierungsdaten laden
function loadReservations() {
    try {
        if (fs.existsSync(RESERVATIONS_FILE)) {
            const data = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Fehler beim Laden der Reservierungsdatei:', error);
    }
    return { 
        reservations: [],
        personsByDay: {
            'Dienstag': 0,
            'Mittwoch': 0,
            'Donnerstag': 0,
            'Freitag': 0
        }
    };
}

// Reservierungsdaten speichern
function saveReservations(data) {
    try {
        fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Fehler beim Speichern der Reservierungsdatei:', error);
    }
}

// Personenanzahl pro Tag neu berechnen
function recalculatePersonsByDay(data) {
    const personsByDay = {
        'Dienstag': 0,
        'Mittwoch': 0,
        'Donnerstag': 0,
        'Freitag': 0
    };

    data.reservations.forEach(reservation => {
        if (personsByDay.hasOwnProperty(reservation.day)) {
            personsByDay[reservation.day] += reservation.personCount;
        }
    });

    data.personsByDay = personsByDay;
    return data;
}

// GET: Reservierungsstatus abrufen
app.get('/api/reservations/status', (req, res) => {
    const day = req.query.day;
    const data = loadReservations();
    
    if (day && VALID_DAYS.includes(day)) {
        const personsForDay = data.personsByDay[day] || 0;
        res.json({ 
            day: day,
            personsForDay: personsForDay,
            maxPersons: MAX_PERSONS_PER_DAY,
            availablePersons: MAX_PERSONS_PER_DAY - personsForDay,
            isFull: personsForDay >= MAX_PERSONS_PER_DAY
        });
    } else {
        res.json(data);
    }
});

// GET: Reservierungsanzahl abrufen (deprecated, aber noch unterstützt)
app.get('/api/reservations/count', (req, res) => {
    const data = loadReservations();
    res.json({ count: data.personsByDay });
});

// POST: Reservierung hinzufügen
app.post('/api/reservations/add', (req, res) => {
    try {
        const { day, personCount, email } = req.body;

        // Validierung
        if (!day || !personCount || !email) {
            return res.status(400).json({ 
                success: false,
                message: 'Tag, Personenanzahl und E-Mail sind erforderlich' 
            });
        }

        if (personCount < 1 || personCount > 20) {
            return res.status(400).json({ 
                success: false,
                message: 'Personenanzahl muss zwischen 1 und 20 liegen' 
            });
        }

        if (!VALID_DAYS.includes(day)) {
            return res.status(400).json({ 
                success: false,
                message: 'Ungültiger Tag ausgewählt' 
            });
        }

        // Daten laden
        let data = loadReservations();
        data = recalculatePersonsByDay(data);

        // Aktuelle Anzahl für diesen Tag
        const currentPersonsForDay = data.personsByDay[day] || 0;

        // Prüfen ob Maximum für diesen Tag erreicht ist
        if (currentPersonsForDay >= MAX_PERSONS_PER_DAY) {
            return res.status(400).json({ 
                success: false,
                message: `Alle Plätze für ${day} sind bereits reserviert` 
            });
        }

        // Prüfen ob die Reservierung das Maximum für diesen Tag überschreiten würde
        if (currentPersonsForDay + personCount > MAX_PERSONS_PER_DAY) {
            const availablePersons = MAX_PERSONS_PER_DAY - currentPersonsForDay;
            return res.status(400).json({ 
                success: false,
                message: `Nur noch ${availablePersons} Plätze für ${day} verfügbar` 
            });
        }

        // Neue Reservierung erstellen
        const reservation = {
            id: Date.now(),
            day: day,
            personCount: personCount,
            email: email,
            timestamp: new Date().toISOString()
        };

        // Daten aktualisieren
        data.reservations.push(reservation);
        data.personsByDay[day] += personCount;

        // Speichern
        saveReservations(data);

        res.json({ 
            success: true,
            message: 'Reservierung erfolgreich erstellt',
            personsForDay: data.personsByDay[day],
            availablePersons: MAX_PERSONS_PER_DAY - data.personsByDay[day],
            reservation: reservation
        });

    } catch (error) {
        console.error('Fehler beim Verarbeiten der Reservierung:', error);
        res.status(500).json({ 
            success: false,
            message: 'Fehler beim Verarbeiten der Reservierung' 
        });
    }
});

// GET: Alle Reservierungen (für Admin)
app.get('/api/reservations/all', (req, res) => {
    const data = loadReservations();
    res.json(data);
});

// Server starten
app.listen(PORT, () => {
    console.log(`🎭 Jumanji Theater Server läuft auf http://localhost:${PORT}`);
    const data = loadReservations();
    console.log(`Reservierungen pro Tag:`, data.personsByDay);
});
