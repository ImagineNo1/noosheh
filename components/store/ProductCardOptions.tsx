'use client';

import type { ReactNode } from 'react';
import type { Product } from '@/app/admin/types';
import { colorMatchesVariant, colorValue, normalizeColors, normalizeList, optionMatchesVariant, variantAvailable } from '@/components/product/product-utils';

type ProductVariant = NonNullable<Product['variants']>[number];

export type ProductCardColorOption = {
  key: string;
  name: string;
  value: string;
  hex?: string;
};

export type ProductCardSelection = {
  color?: string;
  size?: string;
  cup?: string;
};

export type ProductCardOptionGroups = {
  colors: ProductCardColorOption[];
  sizes: string[];
  cups: string[];
};

type ProductCardOptionsProps = {
  product: Product;
  selection: ProductCardSelection;
  onSelectionChange: (selection: ProductCardSelection) => void;
  showError?: boolean;
  compact?: boolean;
};

const visibleOptionCount = 5;

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

export function getProductCardOptions(product: Product): ProductCardOptionGroups {
  const colors = normalizeColors(product)
    .filter((color) => color.active !== false && color.is_active !== false)
    .map((color) => ({
      key: color.slug || color.value || color.name,
      name: color.name,
      value: colorValue(color),
      hex: color.hex || (color.value?.startsWith('#') ? color.value : undefined)
    }));

  const sizes = unique([...(normalizeList(product.sizes) || []), ...(product.variants?.map((variant) => variant.size) || [])]);
  const variantCups = product.variants?.map((variant) => variant.cup) || [];
  const cups = unique([...(normalizeList(product.cups) || []), product.cup_size, ...variantCups]);

  return { colors, sizes, cups };
}

export function hasProductCardOptions(options: ProductCardOptionGroups) {
  return Boolean(options.colors.length || options.sizes.length || options.cups.length);
}

export function isProductCardSelectionComplete(options: ProductCardOptionGroups, selection: ProductCardSelection) {
  return (!options.colors.length || Boolean(selection.color)) && (!options.sizes.length || Boolean(selection.size)) && (!options.cups.length || Boolean(selection.cup));
}

function selectedColorOption(product: Product, colorValueOption?: string) {
  if (!colorValueOption) return null;
  return normalizeColors(product).find((color) => colorValue(color) === colorValueOption || color.name === colorValueOption || color.slug === colorValueOption || color.value === colorValueOption) || { name: colorValueOption, value: colorValueOption, slug: colorValueOption };
}

function optionAvailability(product: Product, selection: ProductCardSelection, candidate: ProductCardSelection) {
  if (!product.variants?.length) return true;
  const nextSelection = { ...selection, ...candidate };
  return product.variants.some((variant) => {
    return colorMatchesVariant(selectedColorOption(product, nextSelection.color), variant.color) && optionMatchesVariant(nextSelection.size, variant.size) && optionMatchesVariant(nextSelection.cup, variant.cup) && variantAvailable(variant);
  });
}

export function findProductCardVariant(product: Product, selection: ProductCardSelection): ProductVariant | undefined {
  if (!product.variants?.length) return undefined;
  return product.variants.find((variant) => {
    return colorMatchesVariant(selectedColorOption(product, selection.color), variant.color) && optionMatchesVariant(selection.size, variant.size) && optionMatchesVariant(selection.cup, variant.cup);
  });
}

export function isProductCardSelectionAvailable(product: Product, selection: ProductCardSelection) {
  const variant = findProductCardVariant(product, selection);
  return !product.variants?.length || Boolean(variant && variantAvailable(variant));
}

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function OptionSelect({ label, placeholder, value, options, onChange }: { label: string; placeholder: string; value?: string; options: SelectOption[]; onChange: (value: string) => void }) {
  if (!options.length) return null;
  const hasSelectedValue = Boolean(value && options.some((option) => option.value === value));
  return (
    <select
      className={`store-card-option-select ${hasSelectedValue ? 'active' : ''}`}
      value={hasSelectedValue ? value : ''}
      onChange={(event) => event.target.value && onChange(event.target.value)}
      aria-label={label}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
  );
}

function OptionRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="store-card-option-row">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

export default function ProductCardOptions({ product, selection, onSelectionChange, showError = false, compact = false }: ProductCardOptionsProps) {
  const options = getProductCardOptions(product);
  if (!hasProductCardOptions(options)) return null;

  const setSelection = (patch: ProductCardSelection) => onSelectionChange({ ...selection, ...patch });

  const shouldCollapseColors = options.colors.length > visibleOptionCount;
  const shouldCollapseSizes = options.sizes.length > visibleOptionCount;
  const shouldCollapseCups = options.cups.length > visibleOptionCount;
  const visibleColors = shouldCollapseColors ? [] : options.colors;
  const visibleSizes = shouldCollapseSizes ? [] : options.sizes;
  const visibleCups = shouldCollapseCups ? [] : options.cups;

  return (
    <div className={`store-card-options ${compact ? 'compact' : ''} ${showError ? 'has-error' : ''}`}>
      {options.colors.length ? (
        <OptionRow label="رنگ">
          {visibleColors.map((color) => {
            const disabled = !optionAvailability(product, selection, { color: color.value, size: '', cup: '' });
            return (
              <button
                key={color.key}
                type="button"
                className={`store-card-color-option ${selection.color === color.value ? 'active' : ''}`}
                style={{ backgroundColor: color.hex || color.value }}
                title={color.name}
                disabled={disabled}
                onClick={() => setSelection({ color: color.value, size: '', cup: '' })}
                aria-label={`انتخاب رنگ ${color.name}`}
              />
            );
          })}
          {shouldCollapseColors ? (
            <OptionSelect
              label="انتخاب رنگ"
              placeholder="انتخاب رنگ"
              value={selection.color}
              options={options.colors.map((color) => ({
                value: color.value,
                label: color.name,
                disabled: !optionAvailability(product, selection, { color: color.value, size: '', cup: '' })
              }))}
              onChange={(color) => setSelection({ color, size: '', cup: '' })}
            />
          ) : null}
        </OptionRow>
      ) : null}

      {options.sizes.length ? (
        <OptionRow label="سایز">
          {visibleSizes.map((size) => {
            const disabled = !optionAvailability(product, selection, { size, cup: '' });
            return <button key={size} type="button" className={selection.size === size ? 'active' : ''} disabled={disabled} onClick={() => setSelection({ size, cup: '' })}>{size}</button>;
          })}
          {shouldCollapseSizes ? (
            <OptionSelect
              label="انتخاب سایز"
              placeholder="انتخاب سایز"
              value={selection.size}
              options={options.sizes.map((size) => ({
                value: size,
                label: size,
                disabled: !optionAvailability(product, selection, { size, cup: '' })
              }))}
              onChange={(size) => setSelection({ size, cup: '' })}
            />
          ) : null}
        </OptionRow>
      ) : null}

      {options.cups.length ? (
        <OptionRow label="کاپ">
          {visibleCups.map((cup) => {
            const disabled = !optionAvailability(product, selection, { cup });
            return <button key={cup} type="button" className={selection.cup === cup ? 'active' : ''} disabled={disabled} onClick={() => setSelection({ cup })}>{cup}</button>;
          })}
          {shouldCollapseCups ? (
            <OptionSelect
              label="انتخاب کاپ"
              placeholder="انتخاب کاپ"
              value={selection.cup}
              options={options.cups.map((cup) => ({
                value: cup,
                label: cup,
                disabled: !optionAvailability(product, selection, { cup })
              }))}
              onChange={(cup) => setSelection({ cup })}
            />
          ) : null}
        </OptionRow>
      ) : null}
      {showError ? <small>گزینه‌های محصول را انتخاب کنید.</small> : null}
    </div>
  );
}
