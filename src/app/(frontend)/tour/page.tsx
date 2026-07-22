import type { Metadata } from 'next'
import React from 'react'

import { Screens } from './Screens'

// Podstrona-poradnik dla właściciela. Celowo poza menu i poza CMS-em
// (statyczny route — seed jej nie nadpisze). Link wysyłamy bezpośrednio.
export const metadata: Metadata = {
  title: 'Poradnik — obsługa strony',
  robots: { index: false, follow: false },
}

const SCREENS = [
  {
    src: '/images/tour/dashboard.jpeg',
    alt: 'Kokpit panelu — menu z Pages, Media i Site Settings',
    caption: 'Kokpit po zalogowaniu. Menu po lewej.',
  },
  {
    src: '/images/tour/lista-stron.jpeg',
    alt: 'Lista podstron w zakładce Pages',
    caption: 'Pages, czyli wszystkie podstrony serwisu.',
  },
  {
    src: '/images/tour/edycja-bloku.jpeg',
    alt: 'Edycja bloku hero z polem Headline i przyciskiem Publish changes',
    caption: 'Edycja sekcji. Po zmianie klikasz Publish changes.',
  },
]

export default function TourPage() {
  return (
    <div className="content-container py-16 md:py-24 max-w-4xl">
      <p className="tech-label mb-4">Poradnik dla właściciela</p>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Jak obsługiwać swoją stronę</h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
        Krótki film i ściąga. Dwie minuty i wiesz, gdzie co jest.
      </p>

      <video
        controls
        playsInline
        preload="metadata"
        poster="/tour/poster.jpg"
        className="w-full rounded border border-border mb-14"
      >
        <source src="/tour/poradnik.mp4" type="video/mp4" />
        Twoja przeglądarka nie odtwarza wideo. Pobierz plik:{' '}
        <a href="/tour/poradnik.mp4">poradnik.mp4</a>
      </video>

      <h2 className="text-2xl md:text-3xl font-bold mb-6">Ściąga</h2>
      <ul className="space-y-4 text-lg leading-relaxed mb-14">
        <li>
          Panel znajdziesz pod adresem <code className="text-primary">twoja-domena.pl/admin</code>.
          Logujesz się mailem i hasłem, które od nas dostałeś.
        </li>
        <li>
          Podstrony siedzą w zakładce <strong>Pages</strong>. Klikasz stronę, przechodzisz na
          zakładkę Content, poprawiasz tekst i na koniec klikasz{' '}
          <strong>Publish changes</strong>.
        </li>
        <li>Zmiana jest widoczna od razu. Wystarczy odświeżyć stronę.</li>
        <li>
          Zdjęcia wgrywasz w <strong>Media</strong>. Create New, wybierasz plik z komputera,
          gotowe.
        </li>
        <li>
          Telefon, mail, adres i linki social zmieniasz w <strong>Site Settings</strong>. Jedna
          poprawka i aktualizuje się cała strona, ze stopką włącznie.
        </li>
        <li>
          Boisz się, że coś zepsujesz? Spokojnie. Każda strona ma zakładkę Versions z historią
          zmian, więc da się wrócić do wcześniejszej wersji.
        </li>
      </ul>

      <h2 className="text-2xl md:text-3xl font-bold mb-6">Jak to wygląda w panelu</h2>
      <Screens screens={SCREENS} />

      <p className="text-muted-foreground">
        Utknąłeś albo coś nie działa tak, jak na filmie? Napisz do nas — pomożemy.
      </p>
    </div>
  )
}
