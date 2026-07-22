import type { Block } from 'payload'

export const ProcessSteps: Block = {
  slug: 'processSteps',
  interfaceName: 'ProcessStepsBlock',
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
      name: 'steps',
      type: 'array',
      label: 'Steps',
      minRows: 2,
      maxRows: 6,
      fields: [
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
      ],
    },
  ],
  labels: {
    plural: 'Process Steps Sections',
    singular: 'Process Steps Section',
  },
}
