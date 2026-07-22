import type {
  CollectionSlug,
  Payload,
  PayloadRequest,
  File,
  RequiredDataFromCollectionSlug,
} from 'payload'
import type { Page } from '@/payload-types'
import fs from 'node:fs'
import path from 'node:path'

// Obrazy seedu z repo-root (cwd) — działa w dev i w standalone (Dockerfile COPY seed-images),
// gdzie import.meta.url wskazywałby wnętrze bundla .next.
const seedImagesDir = path.resolve(process.cwd(), 'seed-images')

// Pojedynczy blok layoutu strony — typ z wygenerowanych typów Payload.
// Anotowanie wspólnych bloków tym typem naprawia inferencję unii w payload.create().
type LayoutBlock = NonNullable<Page['layout']>[number]

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

// Next.js revalidation errors are normal when seeding the database without a server running
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database... (STALMET Konstrukcje Stalowe)')

  // Clear collections (globals are fully overwritten below, no separate clear needed).
  // SEKWENCYJNIE, nie Promise.all — pages referencują media (backgroundMedia, galeria),
  // więc równoległe delete na obu tabelach kończy się deadlockiem Postgresa.
  payload.logger.info(`— Clearing collections...`)
  for (const collection of collections) {
    await payload.db.deleteMany({ collection, req, where: {} })
    if (payload.collections[collection].config.versions) {
      await payload.db.deleteVersions({ collection, req, where: {} })
    }
  }

  payload.logger.info(`— Creating demo admin user...`)
  await payload.delete({
    collection: 'users',
    depth: 0,
    where: { email: { equals: 'admin@example.com' } },
  })
  await payload.create({
    collection: 'users',
    data: { name: 'Admin', email: 'admin@example.com', password: 'admin123' },
  })

  payload.logger.info(`— Creating pages...`)

  // Typowany helper. Nasze strony budujemy blokami w `layout`, więc kolekcyjny `hero`
  // (HighImpact) ustawiamy domyślnie na 'none' — typ Page wymaga go, runtime i tak dawał default.
  const createPage = (data: Omit<RequiredDataFromCollectionSlug<'pages'>, 'hero'>) =>
    payload.create({
      collection: 'pages',
      data: { hero: { type: 'none' }, ...data },
    })

  // Obrazy hero — jeśli wygenerowane (scripts/generate-images.mjs), wgraj do media.
  // Brak pliku → hero zostaje na tle CSS (odporne na brak tokenu Replicate).
  const uploadImage = async (file: string, alt: string): Promise<number | null> => {
    const filePath = path.resolve(seedImagesDir, file)
    if (!fs.existsSync(filePath)) return null
    const media = await payload.create({ collection: 'media', data: { alt }, filePath })
    return media.id as number
  }
  const heroHomeImg = await uploadImage('hero-home.jpg', 'Spawacz przy konstrukcji stalowej w hali — iskry spawalnicze')
  const steelDetailImg = await uploadImage('steel-detail.jpg', 'Spoina TIG na surowym profilu stalowym — makro')

  // ---- Wspólne bloki / dane ----
  const EMAIL = 'biuro@stalmet-konstrukcje.pl'
  const PHONE = '+48 600 700 800'
  const TEL_HREF = 'tel:+48600700800'

  // Skrót oferty (karty) — używany na Home
  const ofertaKrotka: LayoutBlock = {
    blockType: 'features' as const,
    sectionTitle: 'Co robimy',
    sectionDescription:
      'Od ogrodzenia przy domu po konstrukcję pod halę. Projektujemy, spawamy, zabezpieczamy antykorozyjnie i montujemy — wszystko u nas.',
    features: [
      {
        icon: 'fence' as const,
        title: 'Ogrodzenia i bramy',
        description:
          'Ogrodzenia panelowe i nowoczesne, bramy przesuwne i skrzydłowe, furtki. Ocynk + malowanie proszkowe w standardzie.',
        linkUrl: '/oferta',
        linkLabel: 'Zobacz ofertę',
      },
      {
        icon: 'ruler' as const,
        title: 'Balustrady',
        description:
          'Balustrady zewnętrzne i wewnętrzne ze stali nierdzewnej lub czarnej — taras, schody, balkon. Wypełnienia szkło / pręt / linka.',
        linkUrl: '/oferta',
        linkLabel: 'Zobacz ofertę',
      },
      {
        icon: 'warehouse' as const,
        title: 'Zadaszenia i wiaty',
        description:
          'Wiaty garażowe i na auta, zadaszenia wejść i tarasów, wiaty gospodarcze. Konstrukcja stalowa + blacha lub poliwęglan.',
        linkUrl: '/oferta',
        linkLabel: 'Zobacz ofertę',
      },
      {
        icon: 'flame' as const,
        title: 'Konstrukcje stalowe',
        description:
          'Konstrukcje pod hale i wiaty, antresole, schody stalowe, elementy spawane na zamówienie. Atesty i dokumentacja na życzenie.',
        linkUrl: '/oferta',
        linkLabel: 'Zobacz ofertę',
      },
    ],
  }

  // Proces pracy — używany na Home
  const procesPracy: LayoutBlock = {
    blockType: 'processSteps' as const,
    sectionTitle: 'Jak pracujemy',
    sectionDescription:
      'Cztery kroki od telefonu do zamontowanej konstrukcji. Bez niespodzianek na żadnym etapie.',
    steps: [
      {
        title: 'Pomiar w terenie',
        description:
          'Przyjeżdżamy na miejsce, mierzymy i doradzamy. Bezpłatnie, do 60 km od Swarzędza.',
      },
      {
        title: 'Projekt i wycena',
        description:
          'Konkretna wycena przed rozpoczęciem prac. Wiesz, ile płacisz i za co — bez ukrytych kosztów.',
      },
      {
        title: 'Wykonanie w hali',
        description:
          'Cięcie, spawanie, cynkowanie i malowanie proszkowe — wszystko u nas, pod jedną kontrolą jakości.',
      },
      {
        title: 'Transport i montaż',
        description:
          'Dowozimy własnym transportem i montujemy naszą ekipą. Sprzątamy po sobie plac.',
      },
    ],
  }

  // Blok kontaktowy — używany na kilku stronach
  const kontaktCTA = (headline: string, opis: string): LayoutBlock => ({
    blockType: 'contactCTA' as const,
    headline,
    description: createRichText(opis),
    contactEmail: EMAIL,
    contactPhone: PHONE,
    primaryCTA: {
      type: 'custom' as const,
      reference: null,
      url: '/kontakt',
      label: 'Wyceń realizację',
      appearance: 'default' as const,
    },
  })

  // ---- HOME ----
  const homePage = await createPage({
      title: 'Strona główna',
      slug: 'home',
      layout: [
        {
          blockType: 'glassHero',
          backgroundMedia: heroHomeImg,
          eyebrow: 'STALMET · Swarzędz / Poznań · od 2011',
          headline: 'Konstrukcje stalowe, które się nie ugną',
          accentWord: 'nie ugną',
          align: 'left',
          stats: [
            { value: '15', label: 'lat doświadczenia' },
            { value: '60 km', label: 'obszar dojazdu' },
            { value: '100%', label: 'spawy z uprawnieniami' },
          ],
          subheadline: createRichText(
            'STALMET — spawane konstrukcje stalowe, bramy, ogrodzenia, balustrady i zadaszenia. Swarzędz, Poznań i okolice (do 60 km). Wycena po bezpłatnym pomiarze.',
          ),
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: '/kontakt',
            label: 'Wyceń realizację',
            appearance: 'default',
          },
          secondaryCTA: {
            type: 'custom',
            reference: null,
            url: TEL_HREF,
            label: 'Zadzwoń: 600 700 800',
            appearance: 'outline',
          },
        },
        ofertaKrotka,
        procesPracy,
        {
          blockType: 'testimonials',
          sectionTitle: 'Co mówią klienci',
          sectionDescription: 'Opinie osób i firm, dla których realizowaliśmy konstrukcje.',
          testimonials: [
            {
              quote:
                'Ogrodzenie panelowe z bramą przesuwną i furtką na automatykę. Pomiar następnego dnia, wycena jasna, terminy dotrzymane co do dnia. Spawy równe, wszystko ocynkowane i malowane proszkowo — po zimie ani śladu rdzy.',
              author: 'Grzegorz P.',
              role: 'Klient indywidualny',
              rating: 5,
            },
            {
              quote:
                'Balustrady na taras i schody ze stali nierdzewnej. Precyzyjnie, czysto, zamontowane bez uszkodzenia elewacji. Wyglądają jak z katalogu.',
              author: 'Anna K.',
              role: 'Klient indywidualny',
              rating: 5,
            },
            {
              quote:
                'Współpracujemy przy konstrukcjach pod hale i wiaty. Dokumentacja, atesty, spawacz z uprawnieniami. Konstrukcja przyjechała gotowa do montażu, wszystko pasowało bez poprawek.',
              author: 'MJ-BUD',
              role: 'Firma budowlana',
              rating: 5,
            },
          ],
        },
        kontaktCTA(
          'Masz projekt albo pomysł? Wyceńmy go.',
          'Wyślij zapytanie z opisem lub zdjęciem — oddzwonimy i umówimy bezpłatny pomiar. Telefon odbiera właściciel.',
        ),
      ],
      _status: 'published',
    })

  // ---- OFERTA ----
  const ofertaPage = await createPage({
      title: 'Oferta',
      slug: 'oferta',
      layout: [
        {
          blockType: 'glassHero',
          backgroundMedia: steelDetailImg,
          eyebrow: 'Pełen zakres prac ze stali',
          headline: 'Oferta',
          align: 'left',
          subheadline: createRichText(
            'Pełen zakres prac ze stali — dla domów i dla firm. Ceny orientacyjne; każda realizacja wyceniana indywidualnie po pomiarze.',
          ),
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: '/kontakt',
            label: 'Wyceń realizację',
            appearance: 'default',
          },
        },
        {
          blockType: 'features',
          sectionTitle: 'Zakres usług',
          sectionDescription: 'Pięć obszarów, w których się specjalizujemy.',
          features: [
            {
              icon: 'fence',
              title: 'Ogrodzenia i bramy',
              description:
                'Ogrodzenia panelowe (200–450 zł/mb z montażem) i nowoczesne, bramy przesuwne (od 3 500 zł), skrzydłowe i furtki, automatyka bram. Wjazdy nietypowe i na spadku.',
              linkUrl: '/kontakt',
              linkLabel: 'Zapytaj o wycenę',
            },
            {
              icon: 'ruler',
              title: 'Balustrady',
              description:
                'Zewnętrzne (taras, balkon, schody) i wewnętrzne — stal nierdzewna lub czarna, wypełnienia szkło / pręt / linka. Pochwyty i poręcze zgodne z normami.',
              linkUrl: '/kontakt',
              linkLabel: 'Zapytaj o wycenę',
            },
            {
              icon: 'warehouse',
              title: 'Zadaszenia i wiaty',
              description:
                'Wiaty garażowe i na auta, zadaszenia wejść i tarasów (stal + poliwęglan lub szkło), wiaty gospodarcze i śmietnikowe.',
              linkUrl: '/kontakt',
              linkLabel: 'Zapytaj o wycenę',
            },
            {
              icon: 'flame',
              title: 'Konstrukcje stalowe',
              description:
                'Konstrukcje pod hale i wiaty, antresole i podesty, schody stalowe, elementy spawane na zamówienie. Atesty na materiał i dokumentacja na życzenie.',
              linkUrl: '/kontakt',
              linkLabel: 'Zapytaj o wycenę',
            },
            {
              icon: 'shield',
              title: 'Wykończenie i antykorozja',
              description:
                'Cynkowanie i malowanie proszkowe w kolorach RAL — w cenie usługi. Transport i montaż własną ekipą. Bezpłatny pomiar i wycena w terenie (do 60 km).',
              linkUrl: '/kontakt',
              linkLabel: 'Zapytaj o wycenę',
            },
          ],
        },
        kontaktCTA(
          'Nie znalazłeś swojej pozycji?',
          'Robimy też rzeczy nietypowe i na wymiar. Opisz, czego potrzebujesz — wycenimy.',
        ),
      ],
      _status: 'published',
    })

  // ---- REALIZACJE ----
  const realizacjePage = await createPage({
      title: 'Realizacje',
      slug: 'realizacje',
      layout: [
        {
          blockType: 'glassHero',
          backgroundMedia: steelDetailImg,
          eyebrow: 'Portfolio · zdjęcia z placu i hali',
          headline: 'Realizacje',
          align: 'left',
          subheadline: createRichText(
            'Wybrane prace: ogrodzenia, bramy, balustrady, zadaszenia i konstrukcje. Galeria zostanie uzupełniona zdjęciami z realizacji.',
          ),
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: '/kontakt',
            label: 'Chcę podobną realizację',
            appearance: 'default',
          },
        },
        {
          blockType: 'gallery',
          sectionTitle: 'Wybrane realizacje',
          sectionDescription:
            'Placeholder do podmiany na zdjęcia klienta — każda pozycja: zdjęcie + typ + lokalizacja.',
          items: [
            { title: 'Brama przesuwna z furtką', category: 'Bramy · Swarzędz' },
            { title: 'Balustrada nierdzewna, taras', category: 'Balustrady · Poznań' },
            { title: 'Ogrodzenie panelowe 120 mb', category: 'Ogrodzenia · Kórnik' },
            { title: 'Wiata na dwa auta', category: 'Zadaszenia · Kostrzyn' },
            { title: 'Konstrukcja hali 12×30 m', category: 'Konstrukcje · Wielkopolska' },
            { title: 'Schody stalowe zewnętrzne', category: 'Konstrukcje · Poznań' },
          ],
        },
        kontaktCTA(
          'Podobał Ci się któryś projekt?',
          'Wyślij zdjęcie lub opis inspiracji — zrobimy podobne u Ciebie i wycenimy.',
        ),
      ],
      _status: 'published',
    })

  // ---- O FIRMIE ----
  const oFirmiePage = await createPage({
      title: 'O firmie',
      slug: 'o-firmie',
      layout: [
        {
          blockType: 'glassHero',
          backgroundMedia: steelDetailImg,
          eyebrow: 'Marek Wojtczak · spawacz z uprawnieniami',
          headline: 'O firmie',
          align: 'left',
          subheadline: createRichText(
            'STALMET prowadzi Marek Wojtczak, spawacz z 15-letnim stażem. Własna hala w Swarzędzu, pełen proces pod jednym dachem: pomiar, spawanie, antykorozja, montaż.',
          ),
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: '/kontakt',
            label: 'Skontaktuj się',
            appearance: 'default',
          },
        },
        {
          blockType: 'features',
          sectionTitle: 'Dlaczego STALMET',
          sectionDescription: 'Konkretnie, co nas wyróżnia.',
          features: [
            {
              icon: 'users',
              title: 'Telefon odbiera właściciel',
              description:
                'Bez infolinii i konsultantów. Dzwonisz — odbiera Marek i prowadzi zlecenie od pomiaru do montażu.',
            },
            {
              icon: 'warehouse',
              title: 'Pełen proces u nas',
              description:
                'Projekt, spawanie, cynkowanie i malowanie proszkowe, montaż — wszystko w jednej hali. Trzymamy jakość i terminy w swoich rękach.',
            },
            {
              icon: 'shield',
              title: 'Spawacz z uprawnieniami',
              description:
                'Konstrukcje zgodne z projektem i normami, z atestowanego materiału. Dokumentacja i protokoły na życzenie.',
            },
            {
              icon: 'flame',
              title: 'Antykorozja w standardzie',
              description:
                'Cynkowanie i malowanie proszkowe to u nas norma, nie dopłata — ogrodzenie i balustrada wyglądają dobrze po sezonach.',
            },
            {
              icon: 'cog',
              title: 'Realizacje nietypowe',
              description:
                'Wjazd na skarpie, nierówny teren, niestandardowy wymiar? Każdy element i tak powstaje na wymiar.',
            },
            {
              icon: 'book',
              title: 'Uczciwa wycena',
              description:
                'Wycena przed pracami, bez ukrytych kosztów. Zmiana zakresu? Informujemy, zanim zaczniemy.',
            },
          ],
        },
        kontaktCTA(
          'Porozmawiajmy o Twojej realizacji',
          'Najlepiej zacząć od bezpłatnego pomiaru. Zadzwoń albo wyślij zapytanie.',
        ),
      ],
      _status: 'published',
    })

  // ---- KONTAKT ----
  const kontaktPage = await createPage({
      title: 'Kontakt',
      slug: 'kontakt',
      layout: [
        {
          blockType: 'glassHero',
          backgroundMedia: steelDetailImg,
          eyebrow: 'Pon–pt 7:00–16:00 · dojazd do 60 km',
          headline: 'Kontakt',
          align: 'left',
          subheadline: createRichText(
            'Swarzędz (Jasin), obsługujemy Poznań i okolice do 60 km. Zadzwoń lub wyślij zapytanie — najlepiej z opisem i zdjęciem.',
          ),
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: TEL_HREF,
            label: 'Zadzwoń: 600 700 800',
            appearance: 'default',
          },
        },
        {
          blockType: 'contactCTA',
          headline: 'Wyceń realizację',
          description: createRichText(
            'Pon–pt 7:00–16:00 (pt do 15:00). Pomiary i wyceny w terenie także popołudniami i w soboty po umówieniu. Adres hali: ul. Rabowicka 12, 62-020 Swarzędz.',
          ),
          contactEmail: EMAIL,
          contactPhone: PHONE,
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com/stalmet.konstrukcje' },
            { platform: 'instagram', url: 'https://instagram.com/stalmet_konstrukcje' },
          ],
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: TEL_HREF,
            label: 'Zadzwoń teraz',
            appearance: 'default',
          },
        },
      ],
      _status: 'published',
    })

  payload.logger.info(`— Setting up navigation...`)

  const navRef = (id: number, label: string) => ({
    link: {
      type: 'reference' as const,
      reference: { relationTo: 'pages' as const, value: id },
      label,
    },
  })

  const navItems = [
    navRef(homePage.id, 'Strona główna'),
    navRef(ofertaPage.id, 'Oferta'),
    navRef(realizacjePage.id, 'Realizacje'),
    navRef(oFirmiePage.id, 'O firmie'),
    navRef(kontaktPage.id, 'Kontakt'),
  ]

  await payload.updateGlobal({ slug: 'header', data: { navItems } })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems,
      showSocialLinks: true,
      showContactInfo: true,
      showNewsletter: false,
    },
  })

  payload.logger.info(`— Setting up site settings...`)
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'STALMET Konstrukcje Stalowe',
      contact: {
        email: EMAIL,
        phone: PHONE,
        address: {
          street: 'ul. Rabowicka 12',
          city: 'Swarzędz',
          postalCode: '62-020',
          country: 'Polska',
        },
      },
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com/stalmet.konstrukcje' },
        { platform: 'instagram', url: 'https://instagram.com/stalmet_konstrukcje' },
      ],
    },
  })

  payload.logger.info('Seeded database successfully! (STALMET)')
  payload.logger.info('Admin: admin@example.com / admin123')
  payload.logger.info('Strony: Strona główna · Oferta · Realizacje · O firmie · Kontakt')
}

// Utility: fetch a file by URL (for future image seeding)
export async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, { credentials: 'include', method: 'GET' })
  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }
  const data = await res.arrayBuffer()
  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}

// Utility: create Lexical rich text from plain text
export const createRichText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
