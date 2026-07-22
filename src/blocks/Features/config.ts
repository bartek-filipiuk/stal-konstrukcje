import type { Block } from 'payload'

export const Features: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
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
      name: 'features',
      type: 'array',
      label: 'Features',
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Calendar', value: 'calendar' },
            { label: 'Book', value: 'book' },
            { label: 'Users', value: 'users' },
            { label: 'Star', value: 'star' },
            { label: 'Code', value: 'code' },
            { label: 'Globe', value: 'globe' },
            { label: 'Heart', value: 'heart' },
            { label: 'Lightning', value: 'lightning' },
            // Industry icons (lucide-react)
            { label: 'Fence', value: 'fence' },
            { label: 'Hammer', value: 'hammer' },
            { label: 'Warehouse', value: 'warehouse' },
            { label: 'Shield Check', value: 'shield' },
            { label: 'Ruler', value: 'ruler' },
            { label: 'Cog', value: 'cog' },
            { label: 'Flame (welding)', value: 'flame' },
            { label: 'Truck', value: 'truck' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'Link URL (optional)',
        },
        {
          name: 'linkLabel',
          type: 'text',
          label: 'Link Label',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.linkUrl),
          },
        },
      ],
    },
  ],
  labels: {
    plural: 'Features Sections',
    singular: 'Features Section',
  },
}
