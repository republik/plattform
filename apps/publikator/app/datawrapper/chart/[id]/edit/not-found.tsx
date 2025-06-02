'use client'

export default function ChartNotFound() {
  return (
    <div>
      <p>
        Diese Grafik kann nicht bearbeitet werden. Entweder:
        <ul>
          <li>Existiert die Grafik nicht (mehr),</li>
          <li>fehlt die Berechtigung, die Grafik zu bearbeiten,</li>
          <li>sie wurde ausserhalb des Republik-Teams erstellt,</li>
          <li>oder irgend sonstwas ging schief.</li>
        </ul>
      </p>
      <button
        onClick={() => {
          window.close()
        }}
      >
        Fenster schliessen
      </button>
    </div>
  )
}
