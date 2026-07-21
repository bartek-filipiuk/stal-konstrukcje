import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // Clear collections and globals
  payload.logger.info(`— Clearing collections and globals...`)

  // Clear globals
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  // Clear collections
  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Creating demo admin user...`)

  // Delete existing demo user if exists
  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'admin@example.com',
      },
    },
  })

  // Create demo admin user
  await payload.create({
    collection: 'users',
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
    },
  })

  payload.logger.info(`— Creating pages...`)

  // Create Home page
  const homePage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      layout: [
        // Hero Section
        {
          blockType: 'glassHero',
          headline: 'Welcome to Your Website',
          subheadline: createRichText(
            'Replace this with your compelling value proposition. Describe what makes your business unique.',
          ),
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: '/contact',
            label: 'Get Started',
            appearance: 'default',
          },
          secondaryCTA: {
            type: 'custom',
            reference: null,
            url: '/about',
            label: 'Learn More',
            appearance: 'outline',
          },
        },
        // Features Section
        {
          blockType: 'features',
          sectionTitle: 'Our Services',
          sectionDescription: 'Replace with a brief description of what you offer.',
          features: [
            {
              icon: 'star',
              title: 'Feature One',
              description: 'Describe your first key feature or service. What value does it provide to your customers?',
            },
            {
              icon: 'lightning',
              title: 'Feature Two',
              description: 'Describe your second key feature or service. Highlight the benefits for your audience.',
            },
            {
              icon: 'heart',
              title: 'Feature Three',
              description: 'Describe your third key feature or service. Focus on what sets you apart.',
            },
          ],
        },
        // Testimonials Section
        {
          blockType: 'testimonials',
          sectionTitle: 'What People Say',
          sectionDescription: 'Real feedback from satisfied customers.',
          testimonials: [
            {
              quote: 'Replace this with a real customer testimonial. Include specific details about their experience with your product or service.',
              author: 'Customer Name',
              role: 'Role or Company',
              rating: 5,
            },
            {
              quote: 'Add another testimonial here. Authentic reviews build trust with potential customers.',
              author: 'Another Customer',
              role: 'Their Title',
              rating: 5,
            },
          ],
        },
        // Contact CTA Section
        {
          blockType: 'contactCTA',
          headline: 'Ready to Get Started?',
          description: createRichText(
            'Contact us today to learn more about how we can help you.',
          ),
          contactEmail: 'hello@example.com',
          contactPhone: '+1 (555) 123-4567',
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: '/contact',
            label: 'Contact Us',
            appearance: 'default',
          },
        },
      ],
      _status: 'published',
    },
  })

  // Create About page
  await payload.create({
    collection: 'pages',
    data: {
      title: 'About',
      slug: 'about',
      layout: [
        {
          blockType: 'glassHero',
          headline: 'About Us',
          subheadline: createRichText(
            'Tell your story here. Share your mission, values, and what drives your business.',
          ),
        },
        {
          blockType: 'features',
          sectionTitle: 'Why Choose Us',
          features: [
            {
              icon: 'users',
              title: 'Our Team',
              description: 'Introduce your team or highlight your expertise and experience.',
            },
            {
              icon: 'star',
              title: 'Our Mission',
              description: 'Share your mission and what you aim to achieve for your customers.',
            },
            {
              icon: 'heart',
              title: 'Our Values',
              description: 'Describe the core values that guide your business decisions.',
            },
          ],
        },
      ],
      _status: 'published',
    },
  })

  // Create Contact page
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Contact',
      slug: 'contact',
      layout: [
        {
          blockType: 'glassHero',
          headline: 'Contact Us',
          subheadline: createRichText(
            'We\'d love to hear from you. Reach out using the information below.',
          ),
        },
        {
          blockType: 'contactCTA',
          headline: 'Get In Touch',
          description: createRichText(
            'Fill in your contact details and business hours here.',
          ),
          contactEmail: 'hello@example.com',
          contactPhone: '+1 (555) 123-4567',
          primaryCTA: {
            type: 'custom',
            reference: null,
            url: 'mailto:hello@example.com',
            label: 'Send Email',
            appearance: 'default',
          },
        },
      ],
      _status: 'published',
    },
  })

  payload.logger.info(`— Setting up navigation...`)

  // Setup Header navigation
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: homePage.id,
            },
            label: 'Home',
          },
        },
        {
          link: {
            type: 'custom',
            reference: null,
            url: '/about',
            label: 'About',
          },
        },
        {
          link: {
            type: 'custom',
            reference: null,
            url: '/contact',
            label: 'Contact',
          },
        },
      ],
    },
  })

  // Setup Footer navigation
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: homePage.id,
            },
            label: 'Home',
          },
        },
        {
          link: {
            type: 'custom',
            reference: null,
            url: '/about',
            label: 'About',
          },
        },
        {
          link: {
            type: 'custom',
            reference: null,
            url: '/contact',
            label: 'Contact',
          },
        },
      ],
      showSocialLinks: false,
      showContactInfo: true,
      showNewsletter: false,
    },
  })

  payload.logger.info(`— Setting up site settings...`)

  // Setup Site Settings
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'My Website',
      contact: {
        email: 'hello@example.com',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Main Street',
          city: 'Your City',
          postalCode: '12345',
          country: 'Country',
        },
      },
      socialLinks: [],
    },
  })

  payload.logger.info('Seeded database successfully!')
  payload.logger.info('')
  payload.logger.info('=== BOILERPLATE READY ===')
  payload.logger.info('Admin login: admin@example.com / admin123')
  payload.logger.info('')
  payload.logger.info('Pages created:')
  payload.logger.info('  - Home (Hero, Features, Testimonials, CTA)')
  payload.logger.info('  - About')
  payload.logger.info('  - Contact')
  payload.logger.info('')
  payload.logger.info('Next steps:')
  payload.logger.info('  1. Fill out PAGE_DESCRIPTION.md with your business info')
  payload.logger.info('  2. Fill out PAGE_DESIGN.md with your design specs')
  payload.logger.info('  3. Run the customization prompt from SETUP_PROMPT.md')
  payload.logger.info('=========================')
}

// Utility function for fetching files - keep for future use in content generation
export async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

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

// Utility function for creating Lexical rich text - keep for content generation
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
