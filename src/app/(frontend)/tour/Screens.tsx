'use client'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

type Screen = { src: string; alt: string; caption: string }

/**
 * Grid screenów + lightbox na natywnym <dialog> (showModal = wyśrodkowanie,
 * Esc i focus-trap od przeglądarki; klik w tło zamyka).
 */
export function Screens({ screens }: { screens: Screen[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState<Screen | null>(null)

  const open = (s: Screen) => {
    setActive(s)
    dialogRef.current?.showModal()
  }
  const close = () => {
    dialogRef.current?.close()
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-14">
        {screens.map((s) => (
          <figure key={s.src} className="border border-border rounded overflow-hidden bg-card">
            <button
              type="button"
              onClick={() => open(s)}
              className="block w-full cursor-zoom-in"
              aria-label={`Powiększ: ${s.caption}`}
            >
              <Image src={s.src} alt={s.alt} width={1280} height={900} className="w-full h-auto" />
            </button>
            <figcaption className="p-3 text-sm text-muted-foreground">{s.caption}</figcaption>
          </figure>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(e) => {
          // klik w tło (sam element dialog, nie jego zawartość) zamyka
          if (e.target === dialogRef.current) close()
        }}
        className="m-auto max-w-[min(72rem,92vw)] bg-transparent p-0 backdrop:bg-black/80"
      >
        {active && (
          <figure className="border border-border rounded overflow-hidden bg-card">
            <Image
              src={active.src}
              alt={active.alt}
              width={1846}
              height={1300}
              className="w-full h-auto max-h-[82vh] object-contain bg-black"
            />
            <figcaption className="p-3 text-sm text-muted-foreground flex items-center justify-between gap-4">
              <span>{active.caption}</span>
              <button type="button" onClick={close} className="text-primary font-semibold shrink-0">
                Zamknij ✕
              </button>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  )
}
