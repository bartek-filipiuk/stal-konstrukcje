import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '../../fields/link'

export const GlassHero: Block = {
  slug: 'glassHero',
  interfaceName: 'GlassHeroBlock',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow (mono label above headline)',
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
      label: 'Headline',
    },
    {
      name: 'accentWord',
      type: 'text',
      label: 'Accent fragment (part of headline rendered in accent color)',
    },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
      label: 'Content alignment',
    },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      label: 'Stats row (value + label)',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'subheadline',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Subheadline',
    },
    {
      type: 'row',
      fields: [
        link({
          appearances: ['default', 'outline'],
          overrides: {
            name: 'primaryCTA',
            label: 'Primary CTA',
            admin: {
              width: '50%',
            },
          },
        }),
        link({
          appearances: ['default', 'outline'],
          overrides: {
            name: 'secondaryCTA',
            label: 'Secondary CTA',
            admin: {
              width: '50%',
            },
          },
        }),
      ],
    },
    {
      name: 'backgroundMedia',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Media (optional)',
    },
  ],
  labels: {
    plural: 'Glass Heroes',
    singular: 'Glass Hero',
  },
}
