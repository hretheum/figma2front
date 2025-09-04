import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import tokens from '@hretheum/tokenz/tokens.json';

const meta: Meta = {
  title: 'Design Tokens/Brand',
};

export default meta;

type Story = StoryObj;

export const BrandColor: Story = {
  render: () => {
    const brand = (tokens as any)?.values?.color?.brand?.value || '#1D4ED8';
    const boxStyle: CSSProperties = {
      width: 120,
      height: 60,
      backgroundColor: brand,
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#111827',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      fontSize: 12,
    };
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={boxStyle}>brand</div>
        <code>{brand}</code>
      </div>
    );
  },
};

