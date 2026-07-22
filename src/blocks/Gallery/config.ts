import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
    },
    {
      name: 'sectionDescription',
      type: 'textarea',
      label: 'Section Description',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Gallery Items',
      minRows: 1,
      maxRows: 24,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image (optional — placeholder shown when empty)',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
          label: 'Category / location (mono caption)',
        },
      ],
    },
  ],
  labels: {
    plural: 'Galleries',
    singular: 'Gallery',
  },
}
