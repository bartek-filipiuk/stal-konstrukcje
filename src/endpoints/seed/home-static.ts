import type { RequiredDataFromCollectionSlug } from 'payload'

// Static home page data for development before database seeding
// This will be used if no 'home' page exists in the database

const createRichText = (text: string) => ({
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
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  id: 0,
  title: 'Home',
  slug: 'home',
  hero: {
    type: 'none',
  },
  layout: [
    {
      blockType: 'glassHero',
      headline: 'PRECISION. POWER. TRUST.',
      subheadline: createRichText(
        'Professional Car Service in Wroclaw • 16 Years of Experience • 4.8/5 Google Rating',
      ),
      primaryCTA: {
        type: 'custom',
        label: 'BOOK APPOINTMENT',
        url: '/contact',
        appearance: 'default',
      },
      secondaryCTA: {
        type: 'custom',
        label: '24h EMERGENCY: 600 123 456',
        url: 'tel:+48600123456',
        appearance: 'outline',
      },
    },
    {
      blockType: 'features',
      sectionTitle: 'FULL RANGE OF SERVICES',
      sectionDescription: 'One workshop - all your car needs.',
      features: [
        {
          icon: 'code',
          title: 'Computer Diagnostics',
          description: 'Professional error reading and programming for all makes.',
        },
        {
          icon: 'lightning',
          title: 'Engine & Drivetrain',
          description: 'Complete engine repairs, timing belt replacement, gearbox service.',
        },
        {
          icon: 'star',
          title: 'Brakes & Suspension',
          description: 'Brake pad and disc replacement, shock absorbers, wheel alignment.',
        },
        {
          icon: 'globe',
          title: 'Air Conditioning',
          description: 'A/C inspection, refrigerant recharge, compressor repairs.',
        },
      ],
    },
    {
      blockType: 'contactCTA',
      headline: 'DOES YOUR CAR NEED HELP?',
      description: createRichText('Call now - free diagnostics with every repair.'),
      contactPhone: '+48 71 123 45 67',
      primaryCTA: {
        type: 'custom',
        label: 'CALL NOW',
        url: 'tel:+48711234567',
        appearance: 'default',
      },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _status: 'published',
}
